const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

// Track online users: userId -> socketId
const onlineUsers = new Map();
// Track typing users: roomId/conversationId -> Set of userIds
const typingUsers = new Map();

const initializeSocket = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user || !user.isActive) return next(new Error('User not found or inactive'));

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    logger.info(`Socket connected: ${socket.userId} (${socket.id})`);

    // Register user as online
    onlineUsers.set(socket.userId, socket.id);
    await User.findByIdAndUpdate(socket.userId, {
      status: 'online',
      socketId: socket.id,
      lastSeen: new Date(),
    });

    // Notify others that user is online
    socket.broadcast.emit('user-online', {
      userId: socket.userId,
      username: socket.user.username,
      avatar: socket.user.avatar,
    });

    // Send current online users to newly connected client
    const onlineUserIds = Array.from(onlineUsers.keys());
    socket.emit('online-users', onlineUserIds);

    // ============ ROOM EVENTS ============
    socket.on('join-room', (roomId) => {
      socket.join(`room:${roomId}`);
      socket.to(`room:${roomId}`).emit('user-joined-room', {
        userId: socket.userId,
        username: socket.user.username,
        roomId,
      });
      logger.info(`${socket.user.username} joined room ${roomId}`);
    });

    socket.on('leave-room', (roomId) => {
      socket.leave(`room:${roomId}`);
      socket.to(`room:${roomId}`).emit('user-left-room', {
        userId: socket.userId,
        username: socket.user.username,
        roomId,
      });
    });

    // Join personal room for direct messages
    socket.join(`user:${socket.userId}`);

    // ============ MESSAGING EVENTS ============
    // NOTE: send-message via socket is DISABLED - messages are sent via HTTP POST /api/messages
    // The HTTP controller handles saving to DB AND broadcasting via socket to other participants
    // This prevents duplicate messages
    socket.on('send-message', (data) => {
      logger.info(`Socket send-message received from ${socket.user.username} - ignored (use HTTP API)`);
    });

    // ============ TYPING EVENTS ============
    socket.on('typing', async ({ conversationId, roomId }) => {
      const channelId = conversationId || roomId;
      if (!typingUsers.has(channelId)) typingUsers.set(channelId, new Set());
      typingUsers.get(channelId).add(socket.userId);

      if (roomId) {
        // Emit to everyone in the room except sender
        socket.to(`room:${roomId}`).emit('user-typing', {
          userId: socket.userId,
          username: socket.user.username,
          roomId,
        });
      } else if (conversationId) {
        // Find the other participant and emit only to them
        try {
          const Conversation = require('../models/Conversation');
          const conv = await Conversation.findById(conversationId);
          if (conv) {
            conv.participants.forEach((pid) => {
              if (pid.toString() !== socket.userId) {
                io.to(`user:${pid.toString()}`).emit('user-typing', {
                  userId: socket.userId,
                  username: socket.user.username,
                  conversationId,
                });
              }
            });
          }
        } catch (e) { logger.error('Typing error:', e); }
      }
    });

    socket.on('stop-typing', async ({ conversationId, roomId }) => {
      const channelId = conversationId || roomId;
      if (typingUsers.has(channelId)) typingUsers.get(channelId).delete(socket.userId);

      if (roomId) {
        socket.to(`room:${roomId}`).emit('user-stop-typing', {
          userId: socket.userId,
          username: socket.user.username,
          roomId,
        });
      } else if (conversationId) {
        try {
          const Conversation = require('../models/Conversation');
          const conv = await Conversation.findById(conversationId);
          if (conv) {
            conv.participants.forEach((pid) => {
              if (pid.toString() !== socket.userId) {
                io.to(`user:${pid.toString()}`).emit('user-stop-typing', {
                  userId: socket.userId,
                  username: socket.user.username,
                  conversationId,
                });
              }
            });
          }
        } catch (e) { logger.error('Stop-typing error:', e); }
      }
    });

    // ============ MESSAGE ACTIONS ============
    socket.on('message-reaction', async ({ messageId, emoji, conversationId, roomId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;

        const existingIndex = message.reactions.findIndex(
          r => r.user.toString() === socket.userId && r.emoji === emoji
        );

        if (existingIndex > -1) {
          message.reactions.splice(existingIndex, 1);
        } else {
          message.reactions = message.reactions.filter(r => r.user.toString() !== socket.userId);
          message.reactions.push({ emoji, user: socket.userId, username: socket.user.username });
        }

        await message.save();
        const updated = await Message.findById(message._id).populate('sender', 'username avatar status');

        if (roomId) io.to(`room:${roomId}`).emit('message-updated', updated);
        if (conversationId) io.emit('message-updated', updated);
      } catch (err) {
        logger.error('Socket reaction error:', err);
      }
    });

    socket.on('message-deleted', ({ messageId, conversationId, roomId }) => {
      if (roomId) socket.to(`room:${roomId}`).emit('message-removed', { messageId, roomId });
      if (conversationId) socket.broadcast.emit('message-removed', { messageId, conversationId });
    });

    socket.on('message-edited', ({ message, conversationId, roomId }) => {
      if (roomId) socket.to(`room:${roomId}`).emit('message-updated', message);
      if (conversationId) socket.broadcast.emit('message-updated', message);
    });

    // ============ READ RECEIPTS ============
    socket.on('mark-read', ({ conversationId, userId }) => {
      const targetSocketId = onlineUsers.get(userId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('messages-read', {
          conversationId,
          readBy: socket.userId,
          readAt: new Date(),
        });
      }
    });

    // ============ DIRECT MESSAGE NOTIFICATION ============
    socket.on('new-conversation', ({ recipientId, conversation }) => {
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('conversation-started', conversation);
      }
    });

    // ============ CALL SIGNALING (bonus) ============
    socket.on('call-offer', ({ recipientId, offer, callType }) => {
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('call-incoming', {
          callerId: socket.userId,
          callerName: socket.user.username,
          callerAvatar: socket.user.avatar,
          offer,
          callType,
        });
      }
    });

    socket.on('call-answer', ({ callerId, answer }) => {
      const callerSocketId = onlineUsers.get(callerId);
      if (callerSocketId) io.to(callerSocketId).emit('call-answered', { answer });
    });

    socket.on('call-rejected', ({ callerId }) => {
      const callerSocketId = onlineUsers.get(callerId);
      if (callerSocketId) io.to(callerSocketId).emit('call-rejected');
    });

    socket.on('ice-candidate', ({ recipientId, candidate }) => {
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) io.to(recipientSocketId).emit('ice-candidate', { candidate });
    });

    // ============ DISCONNECT ============
    socket.on('disconnect', async () => {
      logger.info(`Socket disconnected: ${socket.userId}`);
      onlineUsers.delete(socket.userId);

      await User.findByIdAndUpdate(socket.userId, {
        status: 'offline',
        socketId: '',
        lastSeen: new Date(),
      });

      socket.broadcast.emit('user-offline', {
        userId: socket.userId,
        lastSeen: new Date(),
      });
    });
  });

  // Make io accessible
  global.io = io;
  global.onlineUsers = onlineUsers;
};

module.exports = { initializeSocket, onlineUsers };