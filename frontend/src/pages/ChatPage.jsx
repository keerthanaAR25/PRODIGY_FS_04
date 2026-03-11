import React, { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { fetchConversations, fetchRooms, fetchUsers } from '../store/slices/chatSlice'
import { fetchNotifications } from '../store/slices/notificationSlice'
import Sidebar from '../components/chat/Sidebar'
import ChatWindow from '../components/chat/ChatWindow'
import RightPanel from '../components/chat/RightPanel'
import WelcomeScreen from '../components/chat/WelcomeScreen'
import CreateRoomModal from '../components/chat/CreateRoomModal'
import JoinRoomModal from '../components/chat/JoinRoomModal'
import ProfileModal from '../components/chat/ProfileModal'
import EditProfileModal from '../components/chat/EditProfileModal'
import ParticleCanvas from '../components/ui/ParticleCanvas'

export default function ChatPage() {
  const dispatch = useDispatch()
  const { activeChat } = useSelector(s => s.chat)
  const { showRightPanel, showCreateRoom, showJoinRoom, showProfile, showEditProfile } = useSelector(s => s.ui)

  useEffect(() => {
    dispatch(fetchConversations())
    dispatch(fetchRooms())
    dispatch(fetchUsers())
    dispatch(fetchNotifications())
  }, [])

  return (
    <div className="h-screen flex overflow-hidden relative animated-bg">
      <ParticleCanvas />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex w-full h-full relative z-10"
      >
        {/* Left sidebar */}
        <Sidebar />

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeChat ? <ChatWindow /> : <WelcomeScreen />}
        </div>

        {/* Right panel */}
        {showRightPanel && activeChat && <RightPanel />}
      </motion.div>

      {/* Modals */}
      <CreateRoomModal isOpen={showCreateRoom} />
      <JoinRoomModal isOpen={showJoinRoom} />
      <ProfileModal isOpen={showProfile} />
      <EditProfileModal isOpen={showEditProfile} />
    </div>
  )
}