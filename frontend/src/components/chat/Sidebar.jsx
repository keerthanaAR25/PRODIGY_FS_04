import React, { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Users, Hash, Plus, Search, Settings, LogOut, Bell, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../store/slices/authSlice'
import { setSidebarTab, setShowCreateRoom, setShowJoinRoom, setShowProfile, setShowEditProfile } from '../../store/slices/uiSlice'
import { setActiveChat, fetchUsers, fetchPublicRooms, getOrCreateConversation, joinRoom } from '../../store/slices/chatSlice'
import { joinRoom as socketJoinRoom } from '../../services/socket'
import Avatar from '../ui/Avatar'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import NotificationPanel from './NotificationPanel'
import { disconnectSocket } from '../../services/socket'

export default function Sidebar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)
  const { conversations, rooms, users, onlineUsers, activeChat } = useSelector(s => s.chat)
  const { sidebarTab } = useSelector(s => s.ui)
  const { unreadCount } = useSelector(s => s.notifications)
  const [search, setSearch] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = () => {
    disconnectSocket()
    dispatch(logout())
    navigate('/')
    toast.success('Logged out')
  }

  const handleSearch = (e) => {
    const val = e.target.value
    setSearch(val)
    if (sidebarTab === 'users') dispatch(fetchUsers(val))
    else if (sidebarTab === 'rooms') dispatch(fetchPublicRooms(val))
  }

  const openConversation = async (userId) => {
    const result = await dispatch(getOrCreateConversation(userId))
    if (!result.error) {
      dispatch(setActiveChat({ type: 'conversation', id: result.payload._id, data: result.payload }))
    }
  }

  const openRoom = (room) => {
    socketJoinRoom(room._id)
    dispatch(setActiveChat({ type: 'room', id: room._id, data: room }))
  }

  const handleJoinRoom = async (roomId) => {
    const result = await dispatch(joinRoom(roomId))
    if (!result.error) {
      toast.success('Joined room!')
      socketJoinRoom(roomId)
      dispatch(setActiveChat({ type: 'room', id: roomId, data: result.payload }))
    } else {
      toast.error(result.payload || 'Failed to join room')
    }
  }

  const tabs = [
    { id: 'chats', icon: <MessageSquare size={18} />, label: 'Chats' },
    { id: 'rooms', icon: <Hash size={18} />, label: 'Rooms' },
    { id: 'users', icon: <Users size={18} />, label: 'Users' },
  ]

  const filteredConversations = conversations.filter(c => {
    const other = c.participants?.find(p => p._id !== user?._id)
    return other?.username?.toLowerCase().includes(search.toLowerCase())
  })

  const filteredRooms = rooms.filter(r => r.name?.toLowerCase().includes(search.toLowerCase()))
  const filteredUsers = users.filter(u => u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))

  const getUnreadForConv = (conv) => {
    const unread = conv.unreadCount?.find(u => u.user === user?._id || u.user?._id === user?._id)
    return unread?.count || 0
  }

  return (
    <div className="w-72 flex-shrink-0 flex flex-col glass border-r border-white/8 relative z-20">
      {/* Header */}
      <div className="p-4 border-b border-white/8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-glow">
              <MessageSquare size={14} className="text-white" />
            </div>
            <span className="font-bold text-white">NexusChat</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {user?.isAdmin && (
              <button onClick={() => navigate('/admin')} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-amber-400" data-tooltip="Admin Panel">
                <Shield size={16} />
              </button>
            )}
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-red-400" data-tooltip="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* User info */}
        <div
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
          onClick={() => dispatch(setShowProfile(true))}
        >
          <Avatar user={user} size="sm" showStatus />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{user?.username}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); dispatch(setShowEditProfile(true)) }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/10 transition-all text-slate-400"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* Notifications panel */}
      <AnimatePresence>
        {showNotifications && (
          <NotificationPanel onClose={() => setShowNotifications(false)} />
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-1 p-3 border-b border-white/8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { dispatch(setSidebarTab(tab.id)); setSearch('') }}
            className={`tab-btn flex-1 flex items-center justify-center gap-1.5 ${sidebarTab === tab.id ? 'active' : ''}`}
          >
            {tab.icon}
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder={`Search ${sidebarTab}...`}
            className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/8 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Action buttons for rooms tab */}
      {sidebarTab === 'rooms' && (
        <div className="px-3 pb-2 flex gap-2">
          <button onClick={() => dispatch(setShowCreateRoom(true))} className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-1.5">
            <Plus size={14} /> Create
          </button>
          <button onClick={() => dispatch(setShowJoinRoom(true))} className="flex-1 py-2 text-sm rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors flex items-center justify-center gap-1.5">
            <Hash size={14} /> Browse
          </button>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <AnimatePresence mode="wait">
          {/* CHATS TAB */}
          {sidebarTab === 'chats' && (
            <motion.div key="chats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {filteredConversations.length === 0 ? (
                <div className="py-8 text-center text-slate-600 text-sm">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No conversations yet</p>
                  <p className="text-xs mt-1">Go to Users to start chatting</p>
                </div>
              ) : (
                filteredConversations.map(conv => {
                  const other = conv.participants?.find(p => (p._id || p) !== user?._id)
                  const unread = getUnreadForConv(conv)
                  const isActive = activeChat?.id === conv._id
                  return (
                    <motion.div
                      key={conv._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => dispatch(setActiveChat({ type: 'conversation', id: conv._id, data: conv }))}
                      className={`sidebar-item ${isActive ? 'active' : ''}`}
                    >
                      <Avatar user={other} size="sm" showStatus />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm truncate ${isActive ? 'text-blue-300' : 'text-white'} font-medium`}>
                            {other?.username || 'Unknown'}
                          </p>
                          <span className="text-[10px] text-slate-600 flex-shrink-0">
                            {conv.lastMessageAt ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false }).replace('about ', '') : ''}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs text-slate-500 truncate">
                            {conv.lastMessage?.isDeleted ? '🗑 Deleted' : conv.lastMessage?.content || conv.lastMessage?.messageType === 'image' ? '📷 Image' : 'Start chatting...'}
                          </p>
                          {unread > 0 && <span className="unread-badge flex-shrink-0">{unread > 9 ? '9+' : unread}</span>}
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </motion.div>
          )}

          {/* ROOMS TAB */}
          {sidebarTab === 'rooms' && (
            <motion.div key="rooms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {filteredRooms.length === 0 ? (
                <div className="py-8 text-center text-slate-600 text-sm">
                  <Hash size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No rooms joined yet</p>
                  <p className="text-xs mt-1">Browse or create a room</p>
                </div>
              ) : (
                filteredRooms.map(room => {
                  const isActive = activeChat?.id === room._id
                  return (
                    <motion.div
                      key={room._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => openRoom(room)}
                      className={`sidebar-item ${isActive ? 'active' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border border-violet-500/20 text-violet-400`}>
                        <Hash size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium truncate ${isActive ? 'text-blue-300' : 'text-white'}`}>
                          {room.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {room.members?.length || 0} members
                        </p>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </motion.div>
          )}

          {/* USERS TAB */}
          {sidebarTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {filteredUsers.length === 0 ? (
                <div className="py-8 text-center text-slate-600 text-sm">
                  <Users size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No users found</p>
                </div>
              ) : (
                filteredUsers.map(u => (
                  <motion.div
                    key={u._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => openConversation(u._id)}
                    className="sidebar-item"
                  >
                    <Avatar user={u} size="sm" showStatus />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{u.username}</p>
                      <p className="text-xs text-slate-500 truncate">{u.status === 'online' ? '🟢 Online' : u.email}</p>
                    </div>
                    {onlineUsers.includes(u._id) && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    )}
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}