import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Video, Info, ArrowLeft, Hash, User } from 'lucide-react'
import { fetchMessages } from '../../store/slices/chatSlice'
import { toggleRightPanel } from '../../store/slices/uiSlice'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import Avatar from '../ui/Avatar'

export default function ChatWindow() {
  const dispatch = useDispatch()
  const { activeChat, messagesLoading } = useSelector(s => s.chat)
  const { user } = useSelector(s => s.auth)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!activeChat) return
    setPage(1)
    dispatch(fetchMessages({ type: activeChat.type, id: activeChat.id, page: 1 }))
  }, [activeChat?.id])

  const getHeaderInfo = () => {
    if (!activeChat?.data) return { name: 'Chat', subtitle: '', avatar: null, isOnline: false }
    if (activeChat.type === 'conversation') {
      const other = activeChat.data.participants?.find(p => (p._id || p) !== user?._id)
      return {
        name: other?.username || 'Chat',
        subtitle: other?.status === 'online' ? '🟢 Online' : other?.bio || `Last seen ${other?.lastSeen ? new Date(other.lastSeen).toLocaleDateString() : 'recently'}`,
        avatar: other,
        isOnline: other?.status === 'online',
      }
    } else {
      const room = activeChat.data
      return {
        name: `#${room.name}`,
        subtitle: `${room.members?.length || 0} members`,
        avatar: null,
        isRoom: true,
      }
    }
  }

  const header = getHeaderInfo()

  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 glass border-b border-white/8">
        <div className="flex items-center gap-3">
          {activeChat.type === 'room' ? (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Hash size={18} />
            </div>
          ) : (
            <Avatar user={header.avatar} size="sm" showStatus />
          )}
          <div>
            <h2 className="font-semibold text-white text-sm leading-tight">{header.name}</h2>
            <p className="text-xs text-slate-500">{header.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors" data-tooltip="Voice Call">
            <Phone size={16} />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors" data-tooltip="Video Call">
            <Video size={16} />
          </button>
          <button
            onClick={() => dispatch(toggleRightPanel())}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            data-tooltip="Info Panel"
          >
            <Info size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList />
      </div>

      {/* Input */}
      <MessageInput />
    </div>
  )
}