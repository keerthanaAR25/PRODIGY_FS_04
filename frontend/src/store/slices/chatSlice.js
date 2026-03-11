import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const fetchConversations = createAsyncThunk('chat/fetchConversations', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/conversations')
    return res.data.conversations
  } catch (err) { return rejectWithValue(err.response?.data?.error) }
})

export const fetchRooms = createAsyncThunk('chat/fetchRooms', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/rooms/my')
    return res.data.rooms
  } catch (err) { return rejectWithValue(err.response?.data?.error) }
})

export const fetchPublicRooms = createAsyncThunk('chat/fetchPublicRooms', async (search, { rejectWithValue }) => {
  try {
    const res = await api.get(`/rooms${search ? `?search=${search}` : ''}`)
    return res.data.rooms
  } catch (err) { return rejectWithValue(err.response?.data?.error) }
})

export const fetchUsers = createAsyncThunk('chat/fetchUsers', async (search, { rejectWithValue }) => {
  try {
    const res = await api.get(`/users${search ? `?search=${search}` : ''}`)
    return res.data.users
  } catch (err) { return rejectWithValue(err.response?.data?.error) }
})

export const getOrCreateConversation = createAsyncThunk('chat/getOrCreateConversation', async (userId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/conversations/${userId}`)
    return res.data.conversation
  } catch (err) { return rejectWithValue(err.response?.data?.error) }
})

export const fetchMessages = createAsyncThunk('chat/fetchMessages', async ({ type, id, page = 1 }, { rejectWithValue }) => {
  try {
    const url = type === 'conversation' ? `/messages/conversation/${id}?page=${page}&limit=50` : `/messages/room/${id}?page=${page}&limit=50`
    const res = await api.get(url)
    return { messages: res.data.messages, total: res.data.total, id, type, page }
  } catch (err) { return rejectWithValue(err.response?.data?.error) }
})

export const sendMessageHTTP = createAsyncThunk('chat/sendMessage', async (formData, { rejectWithValue }) => {
  try {
    const res = await api.post('/messages', formData, {
      headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
    })
    return res.data.message
  } catch (err) { return rejectWithValue(err.response?.data?.error) }
})

export const editMessageAction = createAsyncThunk('chat/editMessage', async ({ id, content }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/messages/${id}`, { content })
    return res.data.message
  } catch (err) { return rejectWithValue(err.response?.data?.error) }
})

export const deleteMessageAction = createAsyncThunk('chat/deleteMessage', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/messages/${id}`)
    return id
  } catch (err) { return rejectWithValue(err.response?.data?.error) }
})

export const addReactionAction = createAsyncThunk('chat/addReaction', async ({ messageId, emoji }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/messages/${messageId}/reactions`, { emoji })
    return res.data.message
  } catch (err) { return rejectWithValue(err.response?.data?.error) }
})

export const createRoom = createAsyncThunk('chat/createRoom', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/rooms', data)
    return res.data.room
  } catch (err) { return rejectWithValue(err.response?.data?.error) }
})

export const joinRoom = createAsyncThunk('chat/joinRoom', async (roomId, { rejectWithValue }) => {
  try {
    const res = await api.post(`/rooms/${roomId}/join`)
    return res.data.room
  } catch (err) { return rejectWithValue(err.response?.data?.error) }
})

export const leaveRoom = createAsyncThunk('chat/leaveRoom', async (roomId, { rejectWithValue }) => {
  try {
    await api.post(`/rooms/${roomId}/leave`)
    return roomId
  } catch (err) { return rejectWithValue(err.response?.data?.error) }
})

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: [],
    rooms: [],
    publicRooms: [],
    users: [],
    onlineUsers: [],
    messages: {},
    activeChat: null, // { type: 'conversation'|'room', id, data }
    typingUsers: {}, // channelId -> [usernames]
    loading: false,
    messagesLoading: false,
    error: null,
  },
  reducers: {
    setActiveChat: (state, action) => { state.activeChat = action.payload },
    clearActiveChat: (state) => { state.activeChat = null },
    addMessage: (state, action) => {
      const msg = action.payload
      const channelId = msg.conversation || msg.room || (msg.conversationId)
      if (!channelId) return
      const id = channelId._id || channelId
      if (!state.messages[id]) state.messages[id] = []
      const exists = state.messages[id].find(m => m._id === msg._id)
      if (!exists) state.messages[id].push(msg)
      // Update last message in conversations
      const conv = state.conversations.find(c => c._id === id)
      if (conv) { conv.lastMessage = msg; conv.lastMessageAt = msg.createdAt }
      const room = state.rooms.find(r => r._id === id)
      if (room) { room.lastMessage = msg; room.lastMessageAt = msg.createdAt }
    },
    updateMessage: (state, action) => {
      const msg = action.payload
      const channelId = msg.conversation || msg.room
      if (!channelId) return
      const id = channelId._id || channelId
      if (state.messages[id]) {
        const idx = state.messages[id].findIndex(m => m._id === msg._id)
        if (idx > -1) state.messages[id][idx] = msg
      }
    },
    removeMessage: (state, action) => {
      const { messageId, conversationId, roomId } = action.payload
      const id = conversationId || roomId
      if (id && state.messages[id]) {
        const idx = state.messages[id].findIndex(m => m._id === messageId)
        if (idx > -1) state.messages[id][idx].isDeleted = true
      }
    },
    setTyping: (state, action) => {
      const { channelId, username, isTyping } = action.payload
      if (!state.typingUsers[channelId]) state.typingUsers[channelId] = []
      if (isTyping) {
        if (!state.typingUsers[channelId].includes(username)) {
          state.typingUsers[channelId].push(username)
        }
      } else {
        state.typingUsers[channelId] = state.typingUsers[channelId].filter(u => u !== username)
      }
    },
    setOnlineUsers: (state, action) => { state.onlineUsers = action.payload },
    setUserOnline: (state, action) => {
      const { userId } = action.payload
      if (!state.onlineUsers.includes(userId)) state.onlineUsers.push(userId)
      // Update in users list
      const user = state.users.find(u => u._id === userId)
      if (user) user.status = 'online'
    },
    setUserOffline: (state, action) => {
      const { userId } = action.payload
      state.onlineUsers = state.onlineUsers.filter(id => id !== userId)
      const user = state.users.find(u => u._id === userId)
      if (user) user.status = 'offline'
    },
    addConversation: (state, action) => {
      const exists = state.conversations.find(c => c._id === action.payload._id)
      if (!exists) state.conversations.unshift(action.payload)
    },
    incrementUnread: (state, action) => {
      const { conversationId } = action.payload
      const conv = state.conversations.find(c => c._id === conversationId)
      if (conv) {
        const unread = conv.unreadCount?.find(u => u.user === action.payload.userId)
        if (unread) unread.count += 1
      }
    },
    clearMessages: (state, action) => { state.messages[action.payload] = [] },
    updateConversationLastMsg: (state, action) => {
      const { conversationId, message } = action.payload
      const conv = state.conversations.find(c => c._id === conversationId)
      if (conv) { conv.lastMessage = message; conv.lastMessageAt = message.createdAt }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => { state.conversations = action.payload })
      .addCase(fetchRooms.fulfilled, (state, action) => { state.rooms = action.payload })
      .addCase(fetchPublicRooms.fulfilled, (state, action) => { state.publicRooms = action.payload })
      .addCase(fetchUsers.fulfilled, (state, action) => { state.users = action.payload })
      .addCase(getOrCreateConversation.fulfilled, (state, action) => {
        const exists = state.conversations.find(c => c._id === action.payload._id)
        if (!exists) state.conversations.unshift(action.payload)
        else {
          const idx = state.conversations.findIndex(c => c._id === action.payload._id)
          state.conversations[idx] = action.payload
        }
      })
      .addCase(fetchMessages.pending, (state) => { state.messagesLoading = true })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesLoading = false
        const { messages, id, page } = action.payload
        if (page === 1) state.messages[id] = messages
        else state.messages[id] = [...messages, ...(state.messages[id] || [])]
      })
      .addCase(fetchMessages.rejected, (state) => { state.messagesLoading = false })
      .addCase(sendMessageHTTP.fulfilled, (state, action) => {
        const msg = action.payload
        const channelId = msg.conversation || msg.room
        if (channelId) {
          const id = channelId._id || channelId
          if (!state.messages[id]) state.messages[id] = []
          const exists = state.messages[id].find(m => m._id === msg._id)
          if (!exists) state.messages[id].push(msg)
        }
      })
      .addCase(editMessageAction.fulfilled, (state, action) => {
        const msg = action.payload
        const channelId = msg.conversation || msg.room
        if (channelId) {
          const id = channelId._id || channelId
          if (state.messages[id]) {
            const idx = state.messages[id].findIndex(m => m._id === msg._id)
            if (idx > -1) state.messages[id][idx] = msg
          }
        }
      })
      .addCase(deleteMessageAction.fulfilled, (state, action) => {
        const messageId = action.payload
        Object.keys(state.messages).forEach(channelId => {
          const idx = state.messages[channelId].findIndex(m => m._id === messageId)
          if (idx > -1) {
            state.messages[channelId][idx].isDeleted = true
            state.messages[channelId][idx].content = 'This message was deleted'
          }
        })
      })
      .addCase(addReactionAction.fulfilled, (state, action) => {
        const msg = action.payload
        const channelId = msg.conversation || msg.room
        if (channelId) {
          const id = channelId._id || channelId
          if (state.messages[id]) {
            const idx = state.messages[id].findIndex(m => m._id === msg._id)
            if (idx > -1) state.messages[id][idx] = msg
          }
        }
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.rooms.unshift(action.payload)
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
        const exists = state.rooms.find(r => r._id === action.payload._id)
        if (!exists) state.rooms.unshift(action.payload)
      })
      .addCase(leaveRoom.fulfilled, (state, action) => {
        state.rooms = state.rooms.filter(r => r._id !== action.payload)
      })
  },
})

export const {
  setActiveChat, clearActiveChat, addMessage, updateMessage, removeMessage,
  setTyping, setOnlineUsers, setUserOnline, setUserOffline, addConversation,
  incrementUnread, clearMessages, updateConversationLastMsg,
} = chatSlice.actions

export default chatSlice.reducer