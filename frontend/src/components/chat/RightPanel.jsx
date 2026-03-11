import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { X, Hash, Crown, Shield, Users } from 'lucide-react'
import { toggleRightPanel } from '../../store/slices/uiSlice'
import Avatar from '../ui/Avatar'
import { formatDistanceToNow } from 'date-fns'

function OnlineUsersList() {
  const { users, onlineUsers } = useSelector(s => s.chat)
  const online = users.filter(u => onlineUsers.includes(u._id))

  return (
    <div>
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Online Now — {online.length}</h4>
      <div className="space-y-1">
        {online.length === 0 ? (
          <p className="text-xs text-slate-600">No other users online</p>
        ) : (
          online.map(u => (
            <div key={u._id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <Avatar user={u} size="xs" showStatus />
              <span className="text-sm text-slate-300 truncate">{u.username}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function RoomInfo({ room }) {
  const members = room.members || []

  return (
    <div className="space-y-5">
      {/* Room Avatar */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border border-violet-500/20 flex items-center justify-center text-violet-400 mx-auto mb-3">
          <Hash size={28} />
        </div>
        <h3 className="font-bold text-white text-lg">#{room.name}</h3>
        {room.description && <p className="text-slate-400 text-sm mt-1">{room.description}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="glass rounded-xl p-3 text-center border border-white/8">
          <p className="text-xl font-bold text-white">{members.length}</p>
          <p className="text-xs text-slate-500">Members</p>
        </div>
        <div className="glass rounded-xl p-3 text-center border border-white/8">
          <p className="text-xl font-bold text-white">{room.messageCount || 0}</p>
          <p className="text-xs text-slate-500">Messages</p>
        </div>
      </div>

      {/* Members */}
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Members — {members.length}</h4>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {members.map(m => {
            const u = m.user || m
            return (
              <div key={u._id || u} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <Avatar user={u} size="xs" showStatus />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{u.username || 'Member'}</p>
                </div>
                {m.role === 'admin' && <Crown size={12} className="text-amber-400 flex-shrink-0" />}
                {m.role === 'moderator' && <Shield size={12} className="text-blue-400 flex-shrink-0" />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ConversationInfo({ conversation, currentUserId }) {
  const other = conversation?.participants?.find(p => (p._id || p) !== currentUserId)

  if (!other || !other._id) return null

  return (
    <div className="space-y-5">
      <div className="text-center">
        <Avatar user={other} size="xl" showStatus className="mx-auto mb-3" />
        <h3 className="font-bold text-white text-lg">{other.username}</h3>
        <p className={`text-sm ${other.status === 'online' ? 'text-emerald-400' : 'text-slate-500'}`}>
          {other.status === 'online' ? '🟢 Online' : other.status === 'away' ? '🟡 Away' : other.status === 'busy' ? '🔴 Busy' : `Last seen ${other.lastSeen ? formatDistanceToNow(new Date(other.lastSeen), { addSuffix: true }) : 'recently'}`}
        </p>
        {other.bio && <p className="text-slate-400 text-sm mt-2">{other.bio}</p>}
      </div>

      <div className="space-y-2">
        <div className="glass rounded-xl p-3 border border-white/8">
          <p className="text-xs text-slate-500 mb-1">Email</p>
          <p className="text-sm text-white">{other.email || 'Hidden'}</p>
        </div>
        <div className="glass rounded-xl p-3 border border-white/8">
          <p className="text-xs text-slate-500 mb-1">Member since</p>
          <p className="text-sm text-white">{other.createdAt ? new Date(other.createdAt).toLocaleDateString() : 'Unknown'}</p>
        </div>
      </div>
    </div>
  )
}

export default function RightPanel() {
  const dispatch = useDispatch()
  const { activeChat } = useSelector(s => s.chat)
  const { user } = useSelector(s => s.auth)

  return (
    <motion.div
      initial={{ x: 280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 280, opacity: 0 }}
      transition={{ type: 'spring', damping: 20 }}
      className="w-64 flex-shrink-0 glass border-l border-white/8 flex flex-col"
    >
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/8">
        <span className="text-sm font-semibold text-slate-300">
          {activeChat?.type === 'room' ? 'Room Info' : 'User Info'}
        </span>
        <button
          onClick={() => dispatch(toggleRightPanel())}
          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {activeChat?.type === 'room' ? (
          <RoomInfo room={activeChat.data} />
        ) : (
          <ConversationInfo conversation={activeChat?.data} currentUserId={user?._id} />
        )}
        <div className="border-t border-white/8 pt-4">
          <OnlineUsersList />
        </div>
      </div>
    </motion.div>
  )
}