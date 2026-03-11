import { io } from 'socket.io-client'
import { store } from '../store'
import {
  addMessage, updateMessage, removeMessage, setTyping,
  setOnlineUsers, setUserOnline, setUserOffline, addConversation,
} from '../store/slices/chatSlice'
import { addNotification } from '../store/slices/notificationSlice'
import toast from 'react-hot-toast'

let socket = null

export const initSocket = (token) => {
  if (socket?.connected) return socket

  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  })

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id)
  })

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason)
  })

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message)
  })

  // Online users
  socket.on('online-users', (userIds) => {
    store.dispatch(setOnlineUsers(userIds))
  })

  socket.on('user-online', ({ userId, username, avatar }) => {
    store.dispatch(setUserOnline({ userId }))
  })

  socket.on('user-offline', ({ userId }) => {
    store.dispatch(setUserOffline({ userId }))
  })

  // Messages
  socket.on('receive-message', (message) => {
    const state = store.getState()
    const currentUserId = state.auth.user?._id

    // SKIP if the message was sent by ME — I already have it from HTTP response
    // This prevents duplicates for the sender
    if (message.sender?._id === currentUserId || message.sender === currentUserId) {
      return
    }

    // Add to messages store
    store.dispatch(addMessage(message))

    // Show notification if not in active chat
    const activeChat = state.chat.activeChat
    const msgChannelId = message.conversation?._id || message.conversation || message.room?._id || message.room || message.conversationId
    const isActiveChat = activeChat && (activeChat.id === msgChannelId)

    if (!isActiveChat && message.sender?._id !== currentUserId) {
      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification(`${message.sender?.username}`, {
          body: message.isDeleted ? 'Deleted message' : (message.content || '📎 Media'),
          icon: message.sender?.avatar || '/favicon.svg',
        })
      }

      store.dispatch(addNotification({
        _id: Date.now().toString(),
        type: 'message',
        title: `New message from ${message.sender?.username}`,
        body: message.content || '📎 Media',
        sender: message.sender,
        isRead: false,
        createdAt: new Date().toISOString(),
      }))

      toast(`💬 ${message.sender?.username}: ${message.content?.slice(0, 40) || 'Sent a file'}`, {
        icon: null,
        style: {
          background: '#1e293b',
          color: '#e2e8f0',
          border: '1px solid rgba(59,130,246,0.3)',
        },
      })
    }
  })

  socket.on('message-updated', (message) => {
    store.dispatch(updateMessage(message))
  })

  socket.on('message-removed', ({ messageId, conversationId, roomId }) => {
    store.dispatch(removeMessage({ messageId, conversationId, roomId }))
  })

  // Typing
  socket.on('user-typing', ({ userId, username, conversationId, roomId }) => {
    const state = store.getState()
    const currentUserId = state.auth.user?._id
    if (userId === currentUserId) return
    const channelId = conversationId || roomId
    store.dispatch(setTyping({ channelId, username, isTyping: true }))
  })

  socket.on('user-stop-typing', ({ userId, username, conversationId, roomId }) => {
    const state = store.getState()
    if (userId === state.auth.user?._id) return
    const channelId = conversationId || roomId
    // Find username from users list
    const users = state.chat.users
    const user = users.find(u => u._id === userId)
    store.dispatch(setTyping({ channelId, username: user?.username || 'Someone', isTyping: false }))
  })

  // Conversation started
  socket.on('conversation-started', (conversation) => {
    store.dispatch(addConversation(conversation))
  })

  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const joinRoom = (roomId) => socket?.emit('join-room', roomId)
export const leaveRoom = (roomId) => socket?.emit('leave-room', roomId)

export const sendSocketMessage = (data) => socket?.emit('send-message', data)

export const emitTyping = (data) => socket?.emit('typing', data)
export const emitStopTyping = (data) => socket?.emit('stop-typing', data)

export const emitReaction = (data) => socket?.emit('message-reaction', data)
export const emitMessageDeleted = (data) => socket?.emit('message-deleted', data)
export const emitMessageEdited = (data) => socket?.emit('message-edited', data)
export const emitMarkRead = (data) => socket?.emit('mark-read', data)
export const emitNewConversation = (data) => socket?.emit('new-conversation', data)

export default { initSocket, getSocket, disconnectSocket, joinRoom, leaveRoom, sendSocketMessage, emitTyping, emitStopTyping, emitReaction }