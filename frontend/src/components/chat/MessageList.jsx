import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { format, isToday, isYesterday } from 'date-fns'
import { Check, CheckCheck, Edit2, Trash2, Reply, MoreHorizontal, SmilePlus } from 'lucide-react'
import { deleteMessageAction, addReactionAction } from '../../store/slices/chatSlice'
import { setReplyingTo, setEditingMessage } from '../../store/slices/uiSlice'
import { emitMessageDeleted, emitReaction } from '../../services/socket'
import Avatar from '../ui/Avatar'
import EmojiPicker from 'emoji-picker-react'
import toast from 'react-hot-toast'

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥']

function DateDivider({ date }) {
  const d = new Date(date)
  const label = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'MMMM d, yyyy')
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex-1 h-px bg-white/8" />
      <span className="text-xs text-slate-600 px-2 glass rounded-full py-1">{label}</span>
      <div className="flex-1 h-px bg-white/8" />
    </div>
  )
}

function TypingIndicator({ names }) {
  if (!names?.length) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-2 px-4 py-2"
    >
      <div className="flex gap-1 items-center">
        {[0, 1, 2].map(i => (
          <motion.span key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            className="w-1.5 h-1.5 rounded-full bg-blue-400" />
        ))}
      </div>
      <span className="text-xs text-slate-500">{names.join(', ')} {names.length === 1 ? 'is' : 'are'} typing...</span>
    </motion.div>
  )
}

function MessageReactions({ reactions, messageId, channelId, isRoom }) {
  if (!reactions?.length) return null
  const grouped = reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || [])
    acc[r.emoji].push(r.username || 'User')
    return acc
  }, {})

  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {Object.entries(grouped).map(([emoji, users]) => (
        <span key={emoji} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/8 border border-white/10 text-xs cursor-pointer hover:bg-white/15 transition-colors"
          title={users.join(', ')}>
          {emoji} <span className="text-slate-400">{users.length}</span>
        </span>
      ))}
    </div>
  )
}

function Message({ message, isOwn, showAvatar, onReply }) {
  const dispatch = useDispatch()
  const { activeChat } = useSelector(s => s.chat)
  const { user } = useSelector(s => s.auth)
  const [showActions, setShowActions] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  if (message.isDeleted) {
    return (
      <div className={`flex items-center gap-2 px-4 py-1 ${isOwn ? 'justify-end' : ''}`}>
        <span className="text-xs text-slate-600 italic px-3 py-1.5 rounded-lg bg-white/3 border border-white/5">
          🗑 This message was deleted
        </span>
      </div>
    )
  }

  if (message.messageType === 'system') {
    return (
      <div className="flex justify-center py-1.5">
        <span className="text-xs text-slate-600 px-3 py-1 rounded-full bg-white/3">{message.content}</span>
      </div>
    )
  }

  const handleDelete = async () => {
    const res = await dispatch(deleteMessageAction(message._id))
    if (!res.error) {
      emitMessageDeleted({
        messageId: message._id,
        conversationId: activeChat.type === 'conversation' ? activeChat.id : undefined,
        roomId: activeChat.type === 'room' ? activeChat.id : undefined,
      })
      toast.success('Message deleted')
    }
  }

  const handleReaction = (emoji) => {
    dispatch(addReactionAction({ messageId: message._id, emoji }))
    emitReaction({
      messageId: message._id,
      emoji,
      conversationId: activeChat.type === 'conversation' ? activeChat.id : undefined,
      roomId: activeChat.type === 'room' ? activeChat.id : undefined,
    })
    setShowReactionPicker(false)
    setShowEmojiPicker(false)
  }

  const renderContent = () => {
    if (message.messageType === 'image' && message.media?.url) {
      return (
        <div>
          {message.content && <p className="text-sm mb-2">{message.content}</p>}
          <img
            src={message.media.url}
            alt="image"
            className="rounded-xl max-w-xs max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(message.media.url, '_blank')}
          />
        </div>
      )
    }
    if (message.messageType === 'video' && message.media?.url) {
      return (
        <video src={message.media.url} controls className="rounded-xl max-w-xs max-h-64 w-full" />
      )
    }
    if (message.messageType === 'file' && message.media?.url) {
      return (
        <div>
          {message.content && <p className="text-sm mb-2">{message.content}</p>}
          <a href={message.media.url} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors border border-white/10">
            <div className="w-8 h-8 rounded-lg bg-blue-500/30 flex items-center justify-center text-blue-300 text-sm">📄</div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate max-w-[150px]">{message.media.originalName || 'File'}</p>
              <p className="text-xs text-slate-400">{message.media.size ? `${(message.media.size / 1024).toFixed(1)} KB` : 'Download'}</p>
            </div>
          </a>
        </div>
      )
    }
    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
        {message.content}
        {message.isEdited && <span className="text-[10px] text-slate-400 ml-1">(edited)</span>}
      </p>
    )
  }

  return (
    <div
      className={`group flex gap-2.5 px-4 py-1 hover:bg-white/2 transition-colors relative ${isOwn ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowReactionPicker(false) }}
    >
      {showAvatar ? (
        <Avatar user={message.sender} size="sm" className="flex-shrink-0 mt-0.5" />
      ) : (
        <div className="w-8 flex-shrink-0" />
      )}

      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {showAvatar && !isOwn && (
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-300">{message.sender?.username}</span>
            <span className="text-[10px] text-slate-600">{format(new Date(message.createdAt), 'h:mm a')}</span>
          </div>
        )}

        {/* Reply preview */}
        {message.replyTo && (
          <div className={`px-3 py-1.5 mb-1.5 rounded-lg border-l-2 border-blue-500 bg-white/5 text-xs text-slate-400 max-w-full ${isOwn ? 'border-r-2 border-l-0' : ''}`}>
            <span className="font-medium text-blue-400">{message.replyTo.sender?.username}</span>
            <p className="truncate">{message.replyTo.content || '📎 Media'}</p>
          </div>
        )}

        <div className={`relative group ${isOwn ? 'message-bubble-own' : 'message-bubble-other'}`}>
          {renderContent()}
          {isOwn && (
            <span className="absolute -bottom-4 right-0 flex items-center gap-0.5 text-[10px] text-slate-600">
              {message.readBy?.length > 0 ? (
                <CheckCheck size={10} className="text-blue-400" />
              ) : (
                <Check size={10} />
              )}
            </span>
          )}
        </div>

        <MessageReactions reactions={message.reactions} messageId={message._id} />

        {!isOwn && showAvatar && (
          <span className="text-[10px] text-slate-600 mt-0.5">{format(new Date(message.createdAt), 'h:mm a')}</span>
        )}
        {isOwn && (
          <span className="text-[10px] text-slate-600 mt-1">{format(new Date(message.createdAt), 'h:mm a')}</span>
        )}
      </div>

      {/* Actions */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute top-0 flex items-center gap-1 glass border border-white/10 rounded-xl px-2 py-1.5 shadow-xl z-10 ${isOwn ? 'right-16' : 'left-16'}`}
          >
            {/* Quick reactions */}
            {QUICK_REACTIONS.map(emoji => (
              <button key={emoji} onClick={() => handleReaction(emoji)}
                className="text-base hover:scale-125 transition-transform">
                {emoji}
              </button>
            ))}
            <div className="w-px h-4 bg-white/10 mx-0.5" />
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <SmilePlus size={14} />
            </button>
            <button onClick={() => onReply(message)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <Reply size={14} />
            </button>
            {isOwn && (
              <>
                <button onClick={() => dispatch(setEditingMessage(message))}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                  <Edit2 size={14} />
                </button>
                <button onClick={handleDelete}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full emoji picker */}
      {showEmojiPicker && (
        <div className={`absolute z-50 ${isOwn ? 'right-0' : 'left-0'} bottom-full mb-2`}>
          <EmojiPicker
            onEmojiClick={(e) => handleReaction(e.emoji)}
            height={350}
            width={300}
            theme="dark"
            lazyLoadEmojis
          />
        </div>
      )}
    </div>
  )
}

export default function MessageList() {
  const dispatch = useDispatch()
  const bottomRef = useRef(null)
  const { activeChat, messages, typingUsers, messagesLoading } = useSelector(s => s.chat)
  const { user } = useSelector(s => s.auth)

  const channelMessages = messages[activeChat?.id] || []
  const typing = Object.entries(typingUsers)
    .filter(([id]) => id === activeChat?.id)
    .flatMap(([, names]) => names)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [channelMessages.length, activeChat?.id])

  const shouldShowAvatar = (msg, prev) => {
    if (!prev) return true
    if (prev.sender?._id !== msg.sender?._id) return true
    const timeDiff = new Date(msg.createdAt) - new Date(prev.createdAt)
    return timeDiff > 5 * 60 * 1000
  }

  const shouldShowDateDivider = (msg, prev) => {
    if (!prev) return true
    return format(new Date(msg.createdAt), 'yyyy-MM-dd') !== format(new Date(prev.createdAt), 'yyyy-MM-dd')
  }

  const handleReply = (message) => {
    dispatch(setReplyingTo(message))
  }

  if (messagesLoading && channelMessages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto messages-container px-0 py-2">
      {channelMessages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-3xl">💬</div>
          <h3 className="text-white font-semibold mb-1">Start the conversation</h3>
          <p className="text-slate-500 text-sm">Send your first message!</p>
        </div>
      )}

      {channelMessages.map((msg, i) => {
        const prev = channelMessages[i - 1]
        const showDate = shouldShowDateDivider(msg, prev)
        const showAvatar = shouldShowAvatar(msg, prev)
        const isOwn = msg.sender?._id === user?._id

        return (
          <React.Fragment key={msg._id}>
            {showDate && <DateDivider date={msg.createdAt} />}
            <Message
              message={msg}
              isOwn={isOwn}
              showAvatar={showAvatar}
              onReply={handleReply}
            />
          </React.Fragment>
        )
      })}

      <AnimatePresence>
        {typing.length > 0 && <TypingIndicator names={typing} />}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  )
}