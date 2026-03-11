import { useEffect, useRef, useCallback } from 'react';
import { getSocket, initSocket, disconnectSocket } from '../services/socket';
import useAuthStore from '../store/authStore';
import useChatStore from '../store/chatStore';

const useSocket = () => {
  const { accessToken, user } = useAuthStore();
  const {
    addMessage, addNotification,
    setUserOnline, setUserOffline, setOnlineUsers,
    addTypingUser, removeTypingUser,
  } = useChatStore();

  const socketRef = useRef(null);

  useEffect(() => {
    if (!accessToken || !user) return;

    const socket = initSocket(accessToken);
    socketRef.current = socket;

    // ── Online presence ──────────────────────────────────────────
    socket.on('users:online', (userIds) => setOnlineUsers(userIds));
    socket.on('user:online', ({ userId }) => setUserOnline(userId));
    socket.on('user:offline', ({ userId }) => setUserOffline(userId));

    // ── New message ──────────────────────────────────────────────
    // Backend sends { message, chatKey, chatType }
    // chatKey = roomId (for rooms) OR the other person's userId (for private)
    socket.on('message:new', ({ message, chatKey, chatType }) => {
      addMessage(message, chatKey, chatType);
    });

    // ── Message edited ───────────────────────────────────────────
    socket.on('message:edited', ({ message }) => {
      useChatStore.getState().patchMessage(message._id, {
        content: message.content,
        isEdited: true,
        editedAt: message.editedAt,
      });
    });

    // ── Message deleted ──────────────────────────────────────────
    socket.on('message:deleted', ({ messageId }) => {
      useChatStore.getState().patchMessage(messageId, {
        isDeleted: true,
        content: 'This message was deleted',
      });
    });

    // ── Reactions ────────────────────────────────────────────────
    socket.on('message:reacted', ({ messageId, reactions }) => {
      useChatStore.getState().patchMessage(messageId, { reactions });
    });

    // ── Typing ───────────────────────────────────────────────────
    socket.on('typing:start', ({ userId: uid, username, roomId, recipientId }) => {
      const key = roomId || uid; // for private: uid IS the other person
      addTypingUser(key, uid, username);
    });
    socket.on('typing:stop', ({ userId: uid, roomId }) => {
      const key = roomId || uid;
      removeTypingUser(key, uid);
    });

    // ── Notifications ────────────────────────────────────────────
    socket.on('notification:new', ({ notification }) => addNotification(notification));

    // ── Read receipts ─────────────────────────────────────────────
    socket.on('message:read_receipt', ({ messageIds, readBy }) => {
      useChatStore.setState(state => {
        const patch = (msgs) => msgs.map(m =>
          messageIds.includes(m._id)
            ? { ...m, readBy: [...(m.readBy || []), { user: readBy, readAt: new Date() }] }
            : m
        );
        const roomMessages = {};
        for (const [k, v] of Object.entries(state.roomMessages)) roomMessages[k] = patch(v);
        const privateChats = {};
        for (const [k, v] of Object.entries(state.privateChats)) privateChats[k] = patch(v);
        return { roomMessages, privateChats };
      });
    });

    socket.on('connect_error', (err) => console.error('Socket error:', err.message));

    return () => {
      ['users:online','user:online','user:offline','message:new','message:edited',
       'message:deleted','message:reacted','typing:start','typing:stop',
       'notification:new','message:read_receipt','connect_error'
      ].forEach(e => socket.off(e));
    };
  }, [accessToken, user?._id]);

  // ── Emit helpers ─────────────────────────────────────────────────

  const getConn = () => getSocket();

  const sendMessage   = useCallback((data) => { const s = getConn(); if (s?.connected) s.emit('message:send', data); }, []);
  const emitTypingStart = useCallback((data) => { const s = getConn(); if (s?.connected) s.emit('typing:start', data); }, []);
  const emitTypingStop  = useCallback((data) => { const s = getConn(); if (s?.connected) s.emit('typing:stop', data); }, []);
  const joinRoom      = useCallback((roomId) => { const s = getConn(); if (s?.connected) s.emit('room:join', { roomId }); }, []);
  const leaveRoom     = useCallback((roomId) => { const s = getConn(); if (s?.connected) s.emit('room:leave', { roomId }); }, []);
  const editMessage   = useCallback((messageId, content) => { const s = getConn(); if (s?.connected) s.emit('message:edit', { messageId, content }); }, []);
  const deleteMsg     = useCallback((messageId) => { const s = getConn(); if (s?.connected) s.emit('message:delete', { messageId }); }, []);
  const reactToMessage = useCallback((messageId, emoji) => { const s = getConn(); if (s?.connected) s.emit('message:react', { messageId, emoji }); }, []);
  const markRead      = useCallback((messageIds, roomId, senderId) => { const s = getConn(); if (s?.connected) s.emit('message:read', { messageIds, roomId, senderId }); }, []);

  return { sendMessage, emitTypingStart, emitTypingStop, joinRoom, leaveRoom, editMessage, deleteMsg, reactToMessage, markRead };
};

export default useSocket;