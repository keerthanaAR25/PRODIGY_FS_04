const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Room = require('../models/Room');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc Get messages for a conversation
exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({
      conversation: conversationId,
      isDeleted: false,
    })
      .populate('sender', 'username avatar status')
      .populate('replyTo', 'content sender messageType media')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Message.countDocuments({ conversation: conversationId, isDeleted: false });

    // Mark messages as read
    await Message.updateMany(
      { conversation: conversationId, 'readBy.user': { $ne: req.user._id }, sender: { $ne: req.user._id } },
      { $addToSet: { readBy: { user: req.user._id, readAt: new Date() } } }
    );

    // Reset unread count
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { 'unreadCount.$[elem].count': 0 },
    }, { arrayFilters: [{ 'elem.user': req.user._id }] });

    res.json({ success: true, messages: messages.reverse(), total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Get room messages
exports.getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ room: roomId, isDeleted: false })
      .populate('sender', 'username avatar status')
      .populate('replyTo', 'content sender messageType media')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Message.countDocuments({ room: roomId, isDeleted: false });
    res.json({ success: true, messages: messages.reverse(), total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { content, conversationId, roomId, messageType = 'text', replyTo } = req.body;
    if (!content && !req.file) return res.status(400).json({ error: 'Message content required' });

    const messageData = {
      sender: req.user._id,
      content: content || '',
      messageType,
    };

    if (req.file) {
      messageData.media = {
        url: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      };
      if (req.file.mimetype.startsWith('image/')) messageData.messageType = 'image';
      else if (req.file.mimetype.startsWith('video/')) messageData.messageType = 'video';
      else messageData.messageType = 'file';
    }

    if (conversationId) messageData.conversation = conversationId;
    if (roomId) messageData.room = roomId;
    if (replyTo) messageData.replyTo = replyTo;

    const message = await Message.create(messageData);
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username avatar status')
      .populate('replyTo', 'content sender messageType media');

    // Update conversation/room last message
    if (conversationId) {
      const conv = await Conversation.findById(conversationId).populate('participants');
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
        lastMessageAt: new Date(),
        $inc: { 'unreadCount.$[elem].count': 1 },
      }, { arrayFilters: [{ 'elem.user': { $ne: req.user._id } }] });

      // Create notification for other participant
      if (conv) {
        const otherParticipant = conv.participants.find(p => p._id.toString() !== req.user._id.toString());
        if (otherParticipant) {
          await Notification.create({
            recipient: otherParticipant._id,
            sender: req.user._id,
            type: 'message',
            title: `New message from ${req.user.username}`,
            body: content ? content.substring(0, 100) : 'Sent a file',
            data: { conversationId, messageId: message._id },
          });
        }
      }
    }

    if (roomId) {
      await Room.findByIdAndUpdate(roomId, {
        lastMessage: message._id,
        lastMessageAt: new Date(),
        $inc: { messageCount: 1 },
      });
    }

    // Broadcast via socket ONLY to other users (sender already gets message from HTTP response)
    const io = req.app.get('io');
    if (io) {
      // Ensure conversation/room id is a plain string in the emitted message
      const msgToEmit = populatedMessage.toObject ? populatedMessage.toObject() : { ...populatedMessage._doc || populatedMessage };

      if (roomId) {
        // For rooms: emit to all EXCEPT the sender's own socket
        const senderSocketId = req.user.socketId;
        if (senderSocketId) {
          socket_emit_except(io, `room:${roomId}`, senderSocketId, 'receive-message', msgToEmit);
        } else {
          // Fallback: emit to all in room, frontend dedup handles sender's copy
          io.to(`room:${roomId}`).emit('receive-message', msgToEmit);
        }
      } else if (conversationId) {
        // For DMs: ONLY emit to the other participant, not sender
        const conv2 = await Conversation.findById(conversationId);
        if (conv2) {
          conv2.participants.forEach((pid) => {
            if (pid.toString() !== req.user._id.toString()) {
              io.to(`user:${pid.toString()}`).emit('receive-message', msgToEmit);
            }
          });
        }
      }
    }

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Edit a message
exports.editMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    message.editHistory.push({ content: message.content, editedAt: new Date() });
    message.content = content;
    message.isEdited = true;
    await message.save();

    const updated = await Message.findById(message._id).populate('sender', 'username avatar status');
    res.json({ success: true, message: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (message.sender.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = 'This message was deleted';
    await message.save();

    res.json({ success: true, messageId: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Add reaction
exports.addReaction = async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    // Remove existing reaction by this user if same emoji
    const existingIndex = message.reactions.findIndex(
      r => r.user.toString() === req.user._id.toString() && r.emoji === emoji
    );

    if (existingIndex > -1) {
      message.reactions.splice(existingIndex, 1);
    } else {
      // Remove any existing reaction by user then add new
      message.reactions = message.reactions.filter(r => r.user.toString() !== req.user._id.toString());
      message.reactions.push({ emoji, user: req.user._id, username: req.user.username });
    }

    await message.save();
    const updated = await Message.findById(message._id).populate('sender', 'username avatar status');
    res.json({ success: true, message: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.body;
    await Message.updateMany(
      { conversation: conversationId, 'readBy.user': { $ne: req.user._id } },
      { $addToSet: { readBy: { user: req.user._id, readAt: new Date() } } }
    );
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { 'unreadCount.$[elem].count': 0 },
    }, { arrayFilters: [{ 'elem.user': req.user._id }] });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper: emit to a socket.io room excluding a specific socket
function socket_emit_except(io, room, exceptSocketId, event, data) {
  io.to(room).except(exceptSocketId).emit(event, data);
}