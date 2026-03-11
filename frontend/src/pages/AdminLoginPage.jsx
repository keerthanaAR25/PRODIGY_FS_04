import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { Shield, Mail, Lock, Key, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { adminLogin, clearError } from '../store/slices/authSlice'
import ParticleCanvas from '../components/ui/ParticleCanvas'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, user } = useSelector(s => s.auth)
  const [form, setForm] = useState({ email: '', password: '', adminSecret: '' })
  const [showPass, setShowPass] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  useEffect(() => {
    if (user?.isAdmin) navigate('/admin')
  }, [user])

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()) }
  }, [error])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await dispatch(adminLogin(form))
    if (!res.error) {
      toast.success('Admin access granted')
      navigate('/admin')
    }
  }

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center p-4 relative">
      <ParticleCanvas />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 border border-amber-500/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              <Shield size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-slate-400 text-sm mt-1">Restricted access — authorized personnel only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="input-field pl-10" placeholder="admin@nexuschat.com" required />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input-field pl-10 pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1.5">Admin Secret Key</label>
              <div className="relative">
                <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type={showSecret ? 'text' : 'password'} value={form.adminSecret}
                  onChange={e => setForm(p => ({ ...p, adminSecret: e.target.value }))}
                  className="input-field pl-10 pr-10" placeholder="Enter admin secret key" required />
                <button type="button" onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 px-5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Access Admin Panel</span><ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/8 text-center">
            <Link to="/login" className="text-slate-500 hover:text-white text-sm transition-colors">
              ← Back to regular login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}