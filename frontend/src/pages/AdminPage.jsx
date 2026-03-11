import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Users, MessageSquare, Hash, Activity, Shield, LogOut,
  TrendingUp, UserX, UserCheck, Trash2, Search, RefreshCw,
  BarChart2, ChevronRight, AlertTriangle, Eye
} from 'lucide-react'
import { logout } from '../store/slices/authSlice'
import { disconnectSocket } from '../services/socket'
import api from '../services/api'
import Avatar from '../components/ui/Avatar'
import ParticleCanvas from '../components/ui/ParticleCanvas'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

// Mini bar chart
function MiniChart({ data }) {
  if (!data?.length) return null
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="flex items-end gap-1 h-12">
      {data.slice(-14).map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-sm bg-blue-500/60 transition-all"
            style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? 4 : 0 }}
            title={`${d._id}: ${d.count} messages`}
          />
        </div>
      ))}
    </div>
  )
}

function StatCard({ icon, label, value, sub, color = 'blue', change }) {
  const colorMap = {
    blue: 'from-blue-500/20 to-indigo-500/20 border-blue-500/20 text-blue-400',
    green: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/20 text-emerald-400',
    violet: 'from-violet-500/20 to-purple-500/20 border-violet-500/20 text-violet-400',
    amber: 'from-amber-500/20 to-orange-500/20 border-amber-500/20 text-amber-400',
    red: 'from-red-500/20 to-pink-500/20 border-red-500/20 text-red-400',
  }
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`glass rounded-xl p-5 border bg-gradient-to-br ${colorMap[color]}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg bg-current/10`}>{icon}</div>
        {change !== undefined && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${change >= 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
            {change >= 0 ? '+' : ''}{change}
          </span>
        )}
      </div>
      <p className="text-3xl font-black text-white mb-1">{value?.toLocaleString() ?? '—'}</p>
      <p className="text-sm text-slate-400">{label}</p>
      {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
    </motion.div>
  )
}

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart2 size={16} /> },
  { id: 'users', label: 'Users', icon: <Users size={16} /> },
  { id: 'rooms', label: 'Rooms', icon: <Hash size={16} /> },
]

export default function AdminPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)

  const [tab, setTab] = useState('dashboard')
  const [analytics, setAnalytics] = useState(null)
  const [users, setUsers] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [userPage, setUserPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/admin/analytics')
      setAnalytics(res.data.analytics)
    } catch (e) {
      toast.error('Failed to load analytics')
    }
  }

  const fetchUsers = async (search = '', page = 1) => {
    setLoading(true)
    try {
      const res = await api.get(`/admin/users?search=${search}&page=${page}&limit=15`)
      setUsers(res.data.users)
      setTotalUsers(res.data.total)
    } catch (e) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const fetchRooms = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/rooms')
      setRooms(res.data.rooms)
    } catch (e) {
      toast.error('Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  useEffect(() => {
    if (tab === 'users') fetchUsers(userSearch, userPage)
    if (tab === 'rooms') fetchRooms()
  }, [tab])

  const handleToggleUser = async (userId) => {
    setActionLoading(userId)
    try {
      const res = await api.put(`/admin/users/${userId}/toggle`)
      setUsers(prev => prev.map(u => u._id === userId ? res.data.user : u))
      toast.success(res.data.user.isActive ? 'User activated' : 'User deactivated')
      fetchAnalytics()
    } catch {
      toast.error('Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (userId, username) => {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return
    setActionLoading(userId + '-del')
    try {
      await api.delete(`/admin/users/${userId}`)
      setUsers(prev => prev.filter(u => u._id !== userId))
      toast.success('User deleted')
      fetchAnalytics()
    } catch {
      toast.error('Delete failed')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteRoom = async (roomId, name) => {
    if (!confirm(`Delete room "#${name}"?`)) return
    try {
      await api.delete(`/admin/rooms/${roomId}`)
      setRooms(prev => prev.filter(r => r._id !== roomId))
      toast.success('Room deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  const handleMakeAdmin = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/admin`)
      setUsers(prev => prev.map(u => u._id === userId ? res.data.user : u))
      toast.success('User promoted to admin')
    } catch {
      toast.error('Action failed')
    }
  }

  const handleLogout = () => {
    disconnectSocket()
    dispatch(logout())
    navigate('/')
    toast.success('Logged out')
  }

  return (
    <div className="min-h-screen animated-bg relative">
      <ParticleCanvas />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top nav */}
        <nav className="glass border-b border-white/8 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <span className="font-bold text-white">NexusChat</span>
            <span className="text-slate-600">/</span>
            <span className="text-amber-400 font-medium text-sm">Admin Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 glass rounded-xl px-3 py-1.5 border border-white/8">
              <Avatar user={user} size="xs" showStatus />
              <span className="text-sm text-white font-medium">{user?.username}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold">ADMIN</span>
            </div>
            <button onClick={() => navigate('/chat')} className="btn-ghost text-sm flex items-center gap-1.5">
              <MessageSquare size={14} /> Chat
            </button>
            <button onClick={handleLogout} className="btn-ghost text-sm flex items-center gap-1.5 text-red-400 hover:text-red-300">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </nav>

        <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">
          {/* Tab navigation */}
          <div className="flex gap-2 mb-6">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  tab === t.id
                    ? 'bg-gradient-to-r from-amber-600/30 to-orange-600/30 text-amber-400 border border-amber-500/30'
                    : 'glass border border-white/8 text-slate-400 hover:text-white'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
            <button
              onClick={() => { fetchAnalytics(); if (tab === 'users') fetchUsers(); if (tab === 'rooms') fetchRooms() }}
              className="ml-auto p-2.5 glass rounded-xl border border-white/8 text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {/* DASHBOARD TAB */}
          <AnimatePresence mode="wait">
            {tab === 'dashboard' && (
              <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                  <StatCard icon={<Users size={20} />} label="Total Users" value={analytics?.totalUsers} color="blue"
                    sub={`${analytics?.newUsers || 0} new this week`} />
                  <StatCard icon={<UserCheck size={20} />} label="Active Users" value={analytics?.activeUsers} color="green" />
                  <StatCard icon={<Activity size={20} />} label="Online Now" value={analytics?.onlineUsers} color="emerald"
                    change={analytics?.onlineUsers} />
                  <StatCard icon={<MessageSquare size={20} />} label="Total Messages" value={analytics?.totalMessages} color="violet"
                    sub={`${analytics?.recentMessages || 0} this week`} />
                  <StatCard icon={<Hash size={20} />} label="Chat Rooms" value={analytics?.totalRooms} color="amber" />
                </div>

                {/* Charts */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="glass rounded-2xl p-5 border border-white/8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        <TrendingUp size={16} className="text-blue-400" /> Message Trends
                      </h3>
                      <span className="text-xs text-slate-500">Last 14 days</span>
                    </div>
                    <MiniChart data={analytics?.messageTrends} />
                    {analytics?.messageTrends?.length > 0 && (
                      <div className="flex justify-between mt-2">
                        <span className="text-[10px] text-slate-600">{analytics.messageTrends[0]?._id}</span>
                        <span className="text-[10px] text-slate-600">{analytics.messageTrends[analytics.messageTrends.length - 1]?._id}</span>
                      </div>
                    )}
                  </div>

                  <div className="glass rounded-2xl p-5 border border-white/8">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Activity size={16} className="text-emerald-400" /> Platform Overview
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: 'User Activation Rate', value: analytics ? Math.round((analytics.activeUsers / analytics.totalUsers) * 100) || 0 : 0, color: 'bg-blue-500' },
                        { label: 'Online Rate', value: analytics ? Math.round((analytics.onlineUsers / analytics.activeUsers) * 100) || 0 : 0, color: 'bg-emerald-500' },
                        { label: 'Messages / User', value: analytics ? Math.round(analytics.totalMessages / (analytics.totalUsers || 1)) : 0, isCount: true, color: 'bg-violet-500' },
                      ].map(m => (
                        <div key={m.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">{m.label}</span>
                            <span className="text-white font-medium">{m.isCount ? m.value : `${m.value}%`}</span>
                          </div>
                          {!m.isCount && (
                            <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                              <div className={`h-full ${m.color} rounded-full transition-all duration-1000`}
                                style={{ width: `${Math.min(m.value, 100)}%` }} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* USERS TAB */}
            {tab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="glass rounded-2xl border border-white/8 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                    <h3 className="font-semibold text-white">User Management</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{totalUsers} total users</span>
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={userSearch}
                          onChange={e => { setUserSearch(e.target.value); fetchUsers(e.target.value, 1) }}
                          placeholder="Search users..."
                          className="pl-8 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 w-48"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          {['User', 'Email', 'Status', 'Role', 'Joined', 'Actions'].map(h => (
                            <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr><td colSpan={6} className="py-12 text-center text-slate-600">
                            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
                          </td></tr>
                        ) : users.map(u => (
                          <tr key={u._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <Avatar user={u} size="sm" showStatus />
                                <div>
                                  <p className="text-sm font-medium text-white">{u.username}</p>
                                  {u.isAdmin && <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">ADMIN</span>}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-sm text-slate-400">{u.email}</td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${
                                u.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                {u.isActive ? 'Active' : 'Deactivated'}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-sm text-slate-400">
                              {u.isAdmin ? <span className="text-amber-400">Admin</span> : 'User'}
                            </td>
                            <td className="px-5 py-3 text-sm text-slate-500">
                              {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleToggleUser(u._id)}
                                  disabled={actionLoading === u._id || u.isAdmin}
                                  title={u.isActive ? 'Deactivate' : 'Activate'}
                                  className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${
                                    u.isActive
                                      ? 'hover:bg-amber-500/10 text-amber-400'
                                      : 'hover:bg-emerald-500/10 text-emerald-400'
                                  }`}
                                >
                                  {actionLoading === u._id ? (
                                    <div className="w-3 h-3 border border-current/30 border-t-current rounded-full animate-spin" />
                                  ) : u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                                </button>
                                {!u.isAdmin && (
                                  <button
                                    onClick={() => handleMakeAdmin(u._id)}
                                    title="Make Admin"
                                    className="p-1.5 rounded-lg hover:bg-amber-500/10 text-slate-500 hover:text-amber-400 transition-colors"
                                  >
                                    <Shield size={14} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteUser(u._id, u.username)}
                                  disabled={u.isAdmin || actionLoading === u._id + '-del'}
                                  title="Delete user"
                                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors disabled:opacity-30"
                                >
                                  {actionLoading === u._id + '-del' ? (
                                    <div className="w-3 h-3 border border-current/30 border-t-current rounded-full animate-spin" />
                                  ) : <Trash2 size={14} />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalUsers > 15 && (
                    <div className="px-5 py-3 border-t border-white/8 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Showing {((userPage - 1) * 15) + 1}–{Math.min(userPage * 15, totalUsers)} of {totalUsers}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { const p = userPage - 1; setUserPage(p); fetchUsers(userSearch, p) }}
                          disabled={userPage === 1}
                          className="px-3 py-1.5 text-xs rounded-lg glass border border-white/8 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                        >Previous</button>
                        <button
                          onClick={() => { const p = userPage + 1; setUserPage(p); fetchUsers(userSearch, p) }}
                          disabled={userPage * 15 >= totalUsers}
                          className="px-3 py-1.5 text-xs rounded-lg glass border border-white/8 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                        >Next</button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ROOMS TAB */}
            {tab === 'rooms' && (
              <motion.div key="rooms-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="glass rounded-2xl border border-white/8 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                    <h3 className="font-semibold text-white">Room Management</h3>
                    <span className="text-xs text-slate-500">{rooms.length} rooms</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          {['Room', 'Creator', 'Members', 'Messages', 'Privacy', 'Status', 'Actions'].map(h => (
                            <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr><td colSpan={7} className="py-12 text-center">
                            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
                          </td></tr>
                        ) : rooms.map(room => (
                          <tr key={room._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                  <Hash size={14} />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white">#{room.name}</p>
                                  <p className="text-[11px] text-slate-500 truncate max-w-[120px]">{room.description || 'No description'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <Avatar user={room.creator} size="xs" />
                                <span className="text-sm text-slate-400">{room.creator?.username || 'Unknown'}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-sm text-slate-400">{room.members?.length || 0}</td>
                            <td className="px-5 py-3 text-sm text-slate-400">{room.messageCount || 0}</td>
                            <td className="px-5 py-3">
                              <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                                room.isPrivate ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                              }`}>
                                {room.isPrivate ? '🔒 Private' : '🌐 Public'}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                                room.isActive !== false ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                              }`}>
                                {room.isActive !== false ? 'Active' : 'Deleted'}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <button
                                onClick={() => handleDeleteRoom(room._id, room.name)}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}