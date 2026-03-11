import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Hash, Users, Zap } from 'lucide-react'
import { useSelector } from 'react-redux'

export default function WelcomeScreen() {
  const { user } = useSelector(s => s.auth)

  const tips = [
    { icon: <MessageSquare size={16} />, text: 'Click on a user to start a direct message', color: 'text-blue-400' },
    { icon: <Hash size={16} />, text: 'Join or create rooms for group chats', color: 'text-violet-400' },
    { icon: <Users size={16} />, text: 'Browse the Users tab to find people', color: 'text-emerald-400' },
    { icon: <Zap size={16} />, text: 'Messages are delivered in real-time', color: 'text-orange-400' },
  ]

  return (
    <div className="flex-1 flex items-center justify-center h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-sm px-6"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center mx-auto mb-6"
        >
          <MessageSquare size={36} className="text-blue-400" />
        </motion.div>

        <h2 className="text-2xl font-bold text-white mb-2">
          Welcome, {user?.username}! 👋
        </h2>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Select a conversation from the sidebar or start a new one to begin chatting.
        </p>

        <div className="space-y-3 text-left">
          {tips.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className="flex items-center gap-3 p-3 glass rounded-xl border border-white/8"
            >
              <span className={tip.color}>{tip.icon}</span>
              <span className="text-sm text-slate-400">{tip.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}