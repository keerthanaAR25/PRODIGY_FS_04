import React, { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Camera, User, FileText, Activity } from 'lucide-react'
import Modal from '../ui/Modal'
import Avatar from '../ui/Avatar'
import { setShowEditProfile } from '../../store/slices/uiSlice'
import { updateProfile, uploadAvatar } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function EditProfileModal({ isOpen }) {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const [form, setForm] = useState({ username: user?.username || '', bio: user?.bio || '', status: user?.status || 'online' })
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)

  const onClose = () => dispatch(setShowEditProfile(false))

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }

    setAvatarLoading(true)
    const fd = new FormData()
    fd.append('avatar', file)
    const res = await dispatch(uploadAvatar(fd))
    setAvatarLoading(false)

    if (!res.error) toast.success('Avatar updated!')
    else toast.error(res.payload || 'Upload failed')
  }

  const handleStatusUpdate = async (status) => {
    try {
      await api.put('/users/status', { status })
      setForm(p => ({ ...p, status }))
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const res = await dispatch(updateProfile({ username: form.username, bio: form.bio }))
    setSaving(false)
    if (!res.error) { toast.success('Profile updated!'); onClose() }
    else toast.error(res.payload || 'Update failed')
  }

  const statuses = [
    { value: 'online', label: 'Online', color: 'bg-emerald-400' },
    { value: 'away', label: 'Away', color: 'bg-amber-400' },
    { value: 'busy', label: 'Busy', color: 'bg-red-400' },
    { value: 'offline', label: 'Offline', color: 'bg-slate-500' },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSave} className="space-y-5">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar user={user} size="xl" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={avatarLoading}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-blue-600 border-2 border-[#0a0e1a] flex items-center justify-center hover:bg-blue-500 transition-colors"
            >
              {avatarLoading ? (
                <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera size={14} className="text-white" />
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500">Click camera to change avatar</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        {/* Username */}
        <div>
          <label className="text-sm text-slate-400 block mb-1.5 flex items-center gap-1.5">
            <User size={14} /> Username
          </label>
          <input
            type="text"
            value={form.username}
            onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
            className="input-field"
            placeholder="Username"
            minLength={3} maxLength={30}
            pattern="[a-zA-Z0-9_]+"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="text-sm text-slate-400 block mb-1.5 flex items-center gap-1.5">
            <FileText size={14} /> Bio
          </label>
          <textarea
            value={form.bio}
            onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
            className="input-field resize-none h-20"
            placeholder="Tell others about yourself..."
            maxLength={200}
          />
          <p className="text-xs text-slate-600 mt-1">{form.bio.length}/200</p>
        </div>

        {/* Status */}
        <div>
          <label className="text-sm text-slate-400 block mb-2 flex items-center gap-1.5">
            <Activity size={14} /> Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {statuses.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => handleStatusUpdate(s.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all border ${
                  form.status === s.value
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-white/3 border-white/8 text-slate-400 hover:bg-white/8'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${s.color}`} />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}