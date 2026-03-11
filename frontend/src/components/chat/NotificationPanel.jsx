import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Bell, Check, Trash2, X, MessageSquare, Hash } from 'lucide-react'
import { markNotificationRead, markAllRead, clearAllNotifications } from '../../store/slices/notificationSlice'
import { formatDistanceToNow } from 'date-fns'
import Avatar from '../ui/Avatar'

export default function NotificationPanel({ onClose }) {
  const dispatch = useDispatch()
  const { items, unreadCount } = useSelector(s => s.notifications)

  const typeIcon = (type) => {
    if (type === 'message') return <MessageSquare size={12} />
    if (type === 'room_invite') return <Hash size={12} />
    return <Bell size={12} />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-full left-0 right-0 z-50 glass border border-white/10 rounded-xl shadow-2xl overflow-hidden"
      style={{ maxHeight: '380px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-blue-400" />
          <span className="text-sm font-semibold text-white">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold">{unreadCount}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={() => dispatch(markAllRead())}
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors text-xs"
              title="Mark all read"
            >
              <Check size={12} />
            </button>
          )}
          {items.length > 0 && (
            <button
              onClick={() => dispatch(clearAllNotifications())}
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-red-400 transition-colors"
              title="Clear all"
            >
              <Trash2 size={12} />
            </button>
          )}
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors">
            <X size={12} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
        {items.length === 0 ? (
          <div className="py-8 text-center">
            <Bell size={24} className="mx-auto mb-2 text-slate-700" />
            <p className="text-xs text-slate-600">No notifications</p>
          </div>
        ) : (
          items.map(n => (
            <div
              key={n._id}
              onClick={() => dispatch(markNotificationRead(n._id))}
              className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 cursor-pointer transition-colors ${
                !n.isRead ? 'bg-blue-500/5 hover:bg-blue-500/8' : 'hover:bg-white/3'
              }`}
            >
              <div className="relative flex-shrink-0">
                <Avatar user={n.sender} size="xs" />
                <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${
                  n.type === 'message' ? 'bg-blue-500' : 'bg-violet-500'
                } text-white`}>
                  {typeIcon(n.type)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white leading-tight">{n.title}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{n.body}</p>
                <p className="text-[10px] text-slate-600 mt-1">
                  {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ''}
                </p>
              </div>
              {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />}
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}