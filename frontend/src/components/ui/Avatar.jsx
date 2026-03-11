import React from 'react'

const statusColors = {
  online: 'bg-emerald-400',
  away: 'bg-amber-400',
  busy: 'bg-red-400',
  offline: 'bg-slate-500',
}

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-2xl',
  '2xl': 'w-20 h-20 text-3xl',
}

const statusSizeMap = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-3.5 h-3.5',
  '2xl': 'w-4 h-4',
}

export default function Avatar({ user, size = 'md', showStatus = false, className = '' }) {
  const initials = user?.username?.slice(0, 2).toUpperCase() || '??'
  const gradients = [
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-pink-500 to-rose-600',
    'from-cyan-500 to-blue-600',
  ]
  const gradientIdx = user?.username ? user.username.charCodeAt(0) % gradients.length : 0

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.username}
          className={`${sizeMap[size]} rounded-full object-cover ring-2 ring-white/10`}
        />
      ) : (
        <div className={`${sizeMap[size]} rounded-full bg-gradient-to-br ${gradients[gradientIdx]} flex items-center justify-center font-bold text-white ring-2 ring-white/10`}>
          {initials}
        </div>
      )}
      {showStatus && (
        <span className={`absolute bottom-0 right-0 ${statusSizeMap[size]} rounded-full border-2 border-[#0a0e1a] ${statusColors[user?.status] || 'bg-slate-500'}`} />
      )}
    </div>
  )
}