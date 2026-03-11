import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Hash, Search, Users, Lock } from 'lucide-react'
import Modal from '../ui/Modal'
import { setShowJoinRoom } from '../../store/slices/uiSlice'
import { fetchPublicRooms, joinRoom, setActiveChat } from '../../store/slices/chatSlice'
import { joinRoom as socketJoinRoom } from '../../services/socket'
import toast from 'react-hot-toast'

export default function JoinRoomModal({ isOpen }) {
  const dispatch = useDispatch()
  const { publicRooms, rooms } = useSelector(s => s.chat)
  const [search, setSearch] = useState('')
  const [joining, setJoining] = useState(null)

  useEffect(() => {
    if (isOpen) dispatch(fetchPublicRooms())
  }, [isOpen])

  const handleSearch = (e) => {
    setSearch(e.target.value)
    dispatch(fetchPublicRooms(e.target.value))
  }

  const handleJoin = async (room) => {
    const alreadyMember = rooms.find(r => r._id === room._id)
    if (alreadyMember) {
      socketJoinRoom(room._id)
      dispatch(setActiveChat({ type: 'room', id: room._id, data: room }))
      dispatch(setShowJoinRoom(false))
      return
    }
    setJoining(room._id)
    const res = await dispatch(joinRoom(room._id))
    setJoining(null)
    if (!res.error) {
      toast.success(`Joined #${room.name}!`)
      socketJoinRoom(room._id)
      dispatch(setActiveChat({ type: 'room', id: room._id, data: res.payload }))
      dispatch(setShowJoinRoom(false))
    } else {
      toast.error(res.payload || 'Failed to join room')
    }
  }

  const onClose = () => dispatch(setShowJoinRoom(false))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Browse Public Rooms" size="lg">
      <div className="space-y-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            className="input-field pl-8"
            placeholder="Search rooms..."
          />
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {publicRooms.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Hash size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No public rooms found</p>
            </div>
          ) : (
            publicRooms.map(room => {
              const isMember = rooms.find(r => r._id === room._id)
              return (
                <div key={room._id}
                  className="flex items-center gap-3 p-3 rounded-xl glass border border-white/8 hover:border-white/15 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border border-violet-500/20 flex items-center justify-center text-violet-400 flex-shrink-0">
                    <Hash size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white truncate">#{room.name}</p>
                      {room.isPrivate && <Lock size={12} className="text-slate-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{room.description || 'No description'}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Users size={10} className="text-slate-600" />
                      <span className="text-[10px] text-slate-600">{room.members?.length || 0} members</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoin(room)}
                    disabled={joining === room._id}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isMember
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                        : 'btn-primary text-xs py-1.5 px-4'
                    }`}
                  >
                    {joining === room._id ? (
                      <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                    ) : isMember ? 'Open' : 'Join'}
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </Modal>
  )
}