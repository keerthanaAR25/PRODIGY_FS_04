import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarTab: 'chats', // 'chats' | 'rooms' | 'users'
    showRightPanel: true,
    showCreateRoom: false,
    showJoinRoom: false,
    showProfile: false,
    showEditProfile: false,
    mobileSidebarOpen: false,
    theme: 'dark',
    showEmojiPicker: false,
    replyingTo: null,
    editingMessage: null,
  },
  reducers: {
    setSidebarTab: (state, action) => { state.sidebarTab = action.payload },
    toggleRightPanel: (state) => { state.showRightPanel = !state.showRightPanel },
    setShowCreateRoom: (state, action) => { state.showCreateRoom = action.payload },
    setShowJoinRoom: (state, action) => { state.showJoinRoom = action.payload },
    setShowProfile: (state, action) => { state.showProfile = action.payload },
    setShowEditProfile: (state, action) => { state.showEditProfile = action.payload },
    setMobileSidebar: (state, action) => { state.mobileSidebarOpen = action.payload },
    setShowEmojiPicker: (state, action) => { state.showEmojiPicker = action.payload },
    setReplyingTo: (state, action) => { state.replyingTo = action.payload },
    setEditingMessage: (state, action) => { state.editingMessage = action.payload },
  },
})

export const {
  setSidebarTab, toggleRightPanel, setShowCreateRoom, setShowJoinRoom,
  setShowProfile, setShowEditProfile, setMobileSidebar,
  setShowEmojiPicker, setReplyingTo, setEditingMessage,
} = uiSlice.actions
export default uiSlice.reducer