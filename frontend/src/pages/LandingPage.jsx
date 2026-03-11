import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MessageCircle, Users, Zap, Shield, Image, Bell, ChevronRight, Star, Globe, Lock } from 'lucide-react'
import ParticleCanvas from '../components/ui/ParticleCanvas'

const steps = [
  {
    step: '01',
    icon: <Users size={28} />,
    title: 'Create Account',
    description: 'Sign up in seconds with your email. Personalize your profile with a photo and bio to let others know who you are.',
    color: 'from-blue-500 to-indigo-600',
    accent: 'blue',
  },
  {
    step: '02',
    icon: <Globe size={28} />,
    title: 'Join Chat Rooms',
    description: 'Discover and join public chat rooms by topic, or create your own private space for your team or community.',
    color: 'from-violet-500 to-purple-600',
    accent: 'violet',
  },
  {
    step: '03',
    icon: <Zap size={28} />,
    title: 'Send Real-Time Messages',
    description: 'Chat instantly with WebSocket technology. See typing indicators, read receipts, and message reactions live.',
    color: 'from-emerald-500 to-teal-600',
    accent: 'emerald',
  },
  {
    step: '04',
    icon: <Image size={28} />,
    title: 'Share Media',
    description: 'Send images, videos, and files up to 50MB. Preview media directly in chat with a beautiful gallery view.',
    color: 'from-orange-500 to-pink-600',
    accent: 'orange',
  },
]

const features = [
  { icon: <Zap size={20} />, title: 'Real-Time Messaging', desc: 'Instant delivery via WebSockets', color: 'text-blue-400' },
  { icon: <Shield size={20} />, title: 'End-to-End Security', desc: 'JWT auth + bcrypt encryption', color: 'text-emerald-400' },
  { icon: <Users size={20} />, title: 'Chat Rooms', desc: 'Create and join public rooms', color: 'text-violet-400' },
  { icon: <Bell size={20} />, title: 'Smart Notifications', desc: 'Browser + in-app alerts', color: 'text-orange-400' },
  { icon: <Image size={20} />, title: 'Media Sharing', desc: 'Images, videos and files', color: 'text-pink-400' },
  { icon: <MessageCircle size={20} />, title: 'Message Reactions', desc: 'React with any emoji', color: 'text-cyan-400' },
  { icon: <Lock size={20} />, title: 'Private Chats', desc: 'One-on-one conversations', color: 'text-indigo-400' },
  { icon: <Star size={20} />, title: 'Admin Panel', desc: 'Full user & analytics control', color: 'text-amber-400' },
]

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState(0)
  const [hovered, setHovered] = useState(null)

  return (
    <div className="min-h-screen animated-bg relative overflow-x-hidden">
      <ParticleCanvas />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-glow">
            <MessageCircle size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">NexusChat</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Link to="/login" className="btn-ghost text-sm hidden sm:block">Sign in</Link>
          <Link to="/register" className="btn-primary text-sm">Get Started Free</Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pt-16 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-blue-500/30 text-blue-400 text-sm font-medium mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Enterprise-Grade Real-Time Chat Platform
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight"
        >
          Connect, Collaborate
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
            Chat in Real-Time
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          A powerful, secure messaging platform with rooms, direct messages, file sharing, 
          emoji reactions, typing indicators, and an admin dashboard.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold text-base transition-all duration-200 shadow-glow hover:shadow-glow-lg active:scale-95"
          >
            Start Chatting Free <ChevronRight size={18} />
          </Link>
          <Link to="/admin/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 glass border border-white/10 hover:border-white/20 text-slate-300 hover:text-white rounded-xl font-semibold text-base transition-all duration-200"
          >
            <Shield size={18} /> Admin Panel
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto"
        >
          {[['<10ms', 'Latency'], ['99.9%', 'Uptime'], ['50MB', 'File Limit']].map(([val, label]) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-black text-white">{val}</div>
              <div className="text-xs text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">How It Works</h2>
          <p className="text-slate-400">Get started in 4 simple steps</p>
        </motion.div>

        {/* Step selector tabs */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${activeStep === i ? `bg-gradient-to-r ${s.color} text-white shadow-lg` : 'glass text-slate-400 hover:text-white border border-white/10'}`}
            >
              {s.step} {s.title}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-2xl p-8 md:p-12 border border-white/8 max-w-2xl mx-auto text-center"
          >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${steps[activeStep].color} flex items-center justify-center text-white mx-auto mb-6 shadow-lg`}>
              {steps[activeStep].icon}
            </div>
            <div className="text-sm font-mono text-slate-500 mb-3">Step {steps[activeStep].step}</div>
            <h3 className="text-2xl font-bold text-white mb-4">{steps[activeStep].title}</h3>
            <p className="text-slate-400 text-lg leading-relaxed">{steps[activeStep].description}</p>
          </motion.div>
        </AnimatePresence>

        {/* Progress */}
        <div className="flex justify-center gap-2 mt-6">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className={`rounded-full transition-all duration-300 ${i === activeStep ? 'w-8 h-2 bg-blue-500' : 'w-2 h-2 bg-white/20'}`}
            />
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Everything You Need</h2>
          <p className="text-slate-400">Packed with features for modern communication</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="glass rounded-xl p-5 border border-white/8 cursor-default"
            >
              <div className={`mb-3 ${f.color}`}>{f.icon}</div>
              <div className="font-semibold text-white text-sm mb-1">{f.title}</div>
              <div className="text-xs text-slate-500">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-12 border border-blue-500/20"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-glow">
            <MessageCircle size={28} className="text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to Connect?</h2>
          <p className="text-slate-400 mb-8 text-lg">Join NexusChat today and experience real-time communication at its finest.</p>
          <Link to="/register"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-glow hover:shadow-glow-lg"
          >
            Create Free Account <ChevronRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-slate-600 text-sm">
        <p>© 2025 NexusChat. Enterprise Real-Time Chat Platform.</p>
      </footer>
    </div>
  )
}