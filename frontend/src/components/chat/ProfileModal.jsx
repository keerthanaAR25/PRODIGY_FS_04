import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Edit2, Mail, Calendar, MessageSquare } from 'lucide-react'
import Modal from '../ui/Modal'
import Avatar from '../ui/Avatar'
import { setShowProfile, setShowEditProfile } from '../../store/slices/uiSlice'
import { format } from 'date-fns'

export default function ProfileModal({ isOpen }) {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)

  const statusColors = {
    online: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    away: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    busy: 'text-red-400 bg-red-400/10 border-red-400/20',
    offline: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  }

  return (
    <Modal isOpen={isOpen} onClose={() => dispatch(setShowProfile(false))} title="My Profile">
      <div className="space-y-5">
        {/* Avatar section */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar user={user} size="2xl" showStatus />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-white">{user?.username}</h3>
            <span className={`inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full text-xs font-medium border capitalize ${statusColors[user?.status] || statusColors.offline}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {user?.status || 'Offline'}
            </span>
          </div>
        </div>

        {/* Bio */}
        {user?.bio && (
          <div className="p-3 glass rounded-xl border border-white/8 text-center">
            <p className="text-slate-300 text-sm italic">"{user.bio}"</p>
          </div>
        )}

        {/* Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 glass rounded-xl border border-white/8">
            <Mail size={16} className="text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="text-sm text-white">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 glass rounded-xl border border-white/8">
            <Calendar size={16} className="text-violet-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Member since</p>
              <p className="text-sm text-white">{user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : 'Unknown'}</p>
            </div>
          </div>
          {user?.isAdmin && (
            <div className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <MessageSquare size={16} className="text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-amber-400 font-medium">Administrator</p>
                <p className="text-sm text-amber-300/70">Full platform access</p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => { dispatch(setShowProfile(false)); dispatch(setShowEditProfile(true)) }}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Edit2 size={16} /> Edit Profile
        </button>
      </div>
    </Modal>
  )
}