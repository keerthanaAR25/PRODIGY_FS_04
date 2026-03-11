import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Hash } from 'lucide-react'
import Modal from '../ui/Modal'
import { setShowCreateRoom } from '../../store/slices/uiSlice'
import { createRoom, setActiveChat } from '../../store/slices/chatSlice'
import { joinRoom as socketJoinRoom } from '../../services/socket'
import toast from 'react-hot-toast'

export default function CreateRoomModal({ isOpen }) {
  const dispatch = useDispatch()
  const [form, setForm] = useState({ name: '', description: '', isPrivate: false })
  const [loading, setLoading] = useState(false)

  const onClose = () => dispatch(setShowCreateRoom(false))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const res = await dispatch(createRoom(form))
    setLoading(false)
    if (!res.error) {
      toast.success(`Room #${form.name} created!`)
      socketJoinRoom(res.payload._id)
      dispatch(setActiveChat({ type: 'room', id: res.payload._id, data: res.payload }))
      setForm({ name: '', description: '', isPrivate: false })
      onClose()
    } else {
      toast.error(res.payload || 'Failed to create room')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Chat Room">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-slate-400 block mb-1.5">Room Name *</label>
          <div className="relative">
            <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value.toLowerCase().replace(/\s/g, '-') }))}
              className="input-field pl-8"
              placeholder="general"
              required minLength={3} maxLength={50}
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-slate-400 block mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            className="input-field resize-none h-20"
            placeholder="What is this room about?"
            maxLength={300}
          />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input type="checkbox" checked={form.isPrivate} onChange={e => setForm(p => ({ ...p, isPrivate: e.target.checked }))} className="sr-only" />
            <div className={`w-10 h-5 rounded-full transition-colors ${form.isPrivate ? 'bg-blue-600' : 'bg-white/10'}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.isPrivate ? 'translate-x-5' : ''}`} />
            </div>
          </div>
          <div>
            <p className="text-sm text-white font-medium">Private Room</p>
            <p className="text-xs text-slate-500">Only invited members can join</p>
          </div>
        </label>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Create Room'}
          </button>
        </div>
      </form>
    </Modal>
  )
}