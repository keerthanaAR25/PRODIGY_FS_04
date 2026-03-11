import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Paperclip, Smile, X, Image, File, Video } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'
import { sendMessageHTTP, editMessageAction } from '../../store/slices/chatSlice'
import { setReplyingTo, setEditingMessage } from '../../store/slices/uiSlice'
import { emitTyping, emitStopTyping, sendSocketMessage, emitMessageEdited } from '../../services/socket'
import toast from 'react-hot-toast'
import Avatar from '../ui/Avatar'

export default function MessageInput() {
  const dispatch = useDispatch()
  const { activeChat } = useSelector(s => s.chat)
  const { user } = useSelector(s => s.auth)
  const { replyingTo, editingMessage } = useSelector(s => s.ui)
  const [content, setContent] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [showAttach, setShowAttach] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [sending, setSending] = useState(false)
  const inputRef = useRef(null)
  const fileRef = useRef(null)
  const typingTimer = useRef(null)
  const isTypingRef = useRef(false)

  // Pre-fill content when editing
  useEffect(() => {
    if (editingMessage) {
      setContent(editingMessage.content)
      inputRef.current?.focus()
    }
  }, [editingMessage])

  const handleTyping = useCallback(() => {
    if (!activeChat) return
    if (!isTypingRef.current) {
      isTypingRef.current = true
      emitTyping({
        conversationId: activeChat.type === 'conversation' ? activeChat.id : undefined,
        roomId: activeChat.type === 'room' ? activeChat.id : undefined,
      })
    }
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      isTypingRef.current = false
      emitStopTyping({
        conversationId: activeChat.type === 'conversation' ? activeChat.id : undefined,
        roomId: activeChat.type === 'room' ? activeChat.id : undefined,
      })
    }, 2000)
  }, [activeChat])

  const stopTyping = useCallback(() => {
    if (isTypingRef.current) {
      isTypingRef.current = false
      clearTimeout(typingTimer.current)
      emitStopTyping({
        conversationId: activeChat?.type === 'conversation' ? activeChat.id : undefined,
        roomId: activeChat?.type === 'room' ? activeChat.id : undefined,
      })
    }
  }, [activeChat])

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) { toast.error('File too large (max 50MB)'); return }
    setSelectedFile(file)
    setShowAttach(false)
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setFilePreview(url)
    } else {
      setFilePreview(null)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
    if (fileRef.current) fileRef.current.value = ''
    if (filePreview) URL.revokeObjectURL(filePreview)
  }

  const handleSend = async () => {
    if (sending) return
    if (!content.trim() && !selectedFile) return
    if (!activeChat) return

    setSending(true)
    stopTyping()

    try {
      // Handle edit mode
      if (editingMessage) {
        const res = await dispatch(editMessageAction({ id: editingMessage._id, content }))
        if (!res.error) {
          emitMessageEdited({
            message: res.payload,
            conversationId: activeChat.type === 'conversation' ? activeChat.id : undefined,
            roomId: activeChat.type === 'room' ? activeChat.id : undefined,
          })
          dispatch(setEditingMessage(null))
          setContent('')
        } else {
          toast.error(res.payload || 'Edit failed')
        }
        return
      }

      // Build form data or JSON
      let payload
      if (selectedFile) {
        const fd = new FormData()
        fd.append('media', selectedFile)
        if (content.trim()) fd.append('content', content.trim())
        if (activeChat.type === 'conversation') fd.append('conversationId', activeChat.id)
        if (activeChat.type === 'room') fd.append('roomId', activeChat.id)
        if (replyingTo) fd.append('replyTo', replyingTo._id)
        payload = fd
      } else {
        payload = {
          content: content.trim(),
          ...(activeChat.type === 'conversation' ? { conversationId: activeChat.id } : { roomId: activeChat.id }),
          ...(replyingTo ? { replyTo: replyingTo._id } : {}),
        }
      }

      const res = await dispatch(sendMessageHTTP(payload))
      if (!res.error) {
        // Emit via socket for real-time delivery to OTHER users only
        // We do NOT call sendSocketMessage here because the HTTP route
        // already broadcasts via socket in the backend - preventing duplicates
        // The socket 'send-message' event saves to DB again, so we only use HTTP
        setContent('')
        removeFile()
        dispatch(setReplyingTo(null))
      } else {
        toast.error(res.payload || 'Failed to send message')
      }
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Escape') {
      dispatch(setEditingMessage(null))
      dispatch(setReplyingTo(null))
      setContent('')
    }
  }

  const onEmojiClick = (emojiData) => {
    setContent(prev => prev + emojiData.emoji)
    inputRef.current?.focus()
    setShowEmoji(false)
  }

  return (
    <div className="flex-shrink-0 p-3 glass border-t border-white/8">
      {/* Reply Preview */}
      <AnimatePresence>
        {replyingTo && !editingMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-blue-500/10 border border-blue-500/20"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs text-blue-400 font-medium">Replying to {replyingTo.sender?.username}</p>
              <p className="text-xs text-slate-400 truncate">{replyingTo.content || '📎 Media'}</p>
            </div>
            <button onClick={() => dispatch(setReplyingTo(null))} className="text-slate-400 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </motion.div>
        )}

        {editingMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-amber-500/10 border border-amber-500/20"
          >
            <p className="text-xs text-amber-400 font-medium flex-1">✏️ Editing message</p>
            <button onClick={() => { dispatch(setEditingMessage(null)); setContent('') }} className="text-slate-400 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Preview */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 p-2 mb-2 rounded-xl bg-white/5 border border-white/10"
          >
            {filePreview ? (
              <img src={filePreview} alt="preview" className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                <File size={18} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{selectedFile.name}</p>
              <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={removeFile} className="text-slate-400 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input row */}
      <div className="flex items-end gap-2">
        {/* Attach button */}
        <div className="relative">
          <button
            onClick={() => setShowAttach(!showAttach)}
            className="p-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <Paperclip size={18} />
          </button>
          <AnimatePresence>
            {showAttach && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 mb-2 glass border border-white/10 rounded-xl overflow-hidden shadow-xl"
              >
                {[
                  { icon: <Image size={14} />, label: 'Image', accept: 'image/*' },
                  { icon: <Video size={14} />, label: 'Video', accept: 'video/*' },
                  { icon: <File size={14} />, label: 'File', accept: '*' },
                ].map(item => (
                  <button key={item.label}
                    onClick={() => { if (fileRef.current) { fileRef.current.accept = item.accept; fileRef.current.click() }; setShowAttach(false) }}
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/5 text-sm text-slate-300 hover:text-white w-full text-left transition-colors"
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Text area */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={content}
            onChange={e => { setContent(e.target.value); handleTyping() }}
            onKeyDown={handleKeyDown}
            placeholder={editingMessage ? 'Edit message...' : 'Type a message... (Enter to send, Shift+Enter for newline)'}
            rows={1}
            className="w-full resize-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-colors max-h-40 overflow-y-auto"
            style={{ minHeight: '44px' }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
            }}
          />
        </div>

        {/* Emoji */}
        <div className="relative">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className={`p-2.5 rounded-xl transition-colors ${showEmoji ? 'bg-white/10 text-yellow-400' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
          >
            <Smile size={18} />
          </button>
          <AnimatePresence>
            {showEmoji && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full right-0 mb-2 z-50"
              >
                <EmojiPicker onEmojiClick={onEmojiClick} height={350} width={300} theme="dark" lazyLoadEmojis />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={(!content.trim() && !selectedFile) || sending}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all duration-200 active:scale-95 shadow-glow"
        >
          {sending ? (
            <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>

      <input ref={fileRef} type="file" className="hidden" onChange={handleFileSelect} />
    </div>
  )
}