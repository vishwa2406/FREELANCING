// Force re-transform to fix MIME type error
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { freelancerAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import BackButton from '../../components/ui/BackButton'
import { io } from 'socket.io-client'

export default function FreelanceChat() {
  const { orderId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast: showToast } = useToast()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)
  const socketRef = useRef(null)

  const load = async () => {
    try {
      const { data } = await freelancerAPI.getMessages(orderId)
      setMessages(data.messages)
    } catch {
      showToast('Failed to load messages', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    
    // Socket initialization
    const SERVER_URL = (import.meta.env && import.meta.env.VITE_SERVER_URL) || 'http://localhost:5000'
    const socket = io(SERVER_URL)
    socketRef.current = socket

    socket.emit('join_order', orderId)

    socket.on('new_message', (msg) => {
      setMessages(prev => {
        // Avoid duplicates if user is the sender
        if (prev.some(m => m._id === msg._id)) return prev
        return [...prev, msg]
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [orderId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    try {
      await freelancerAPI.sendMessage(orderId, { content: text.trim() })
      setText('')
      load()
    } catch {
      showToast('Failed to send message', 'error')
    } finally {
      setSending(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('content', '') // empty text search

    setSending(true)
    try {
      await freelancerAPI.sendMessage(orderId, formData)
      load()
      showToast('File uploaded', 'success')
    } catch (err) {
      showToast('Failed to upload file', 'error')
    } finally {
      setSending(false)
      e.target.value = ''
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 mt-2">
        <BackButton fallbackPath="/freelancer/messages" label="" />
        <div className="-mt-6">
          <h1 className="text-xl font-bold text-white">Messages</h1>
          <p className="text-surface-500 text-xs">Order #{String(orderId).slice(-8).toUpperCase()}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-surface-900 border border-surface-700/50 rounded-2xl p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-surface-500 text-sm">No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.sender?._id === user?._id
          return (
            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md ${isMe ? 'order-2' : 'order-1'}`}>
                {!isMe && (
                  <p className="text-xs text-surface-500 mb-1 px-1">{msg.sender?.name}</p>
                )}
                <div className={`px-4 py-2.5 rounded-2xl ${isMe
                  ? 'bg-brand-500 text-white rounded-br-sm'
                  : 'bg-surface-800 text-surface-100 rounded-bl-sm'
                }`}>
                  {msg.fileUrl && msg.fileType?.startsWith('image/') && (
                    <img src={msg.fileUrl} alt={msg.fileName} className="rounded-lg max-w-full mb-1 max-h-48 object-contain" />
                  )}
                  {msg.fileUrl && !msg.fileType?.startsWith('image/') && (
                    <a href={msg.fileUrl} download={msg.fileName}
                      className="flex items-center gap-2 text-sm underline mb-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                      {msg.fileName}
                    </a>
                  )}
                  {msg.content && <p className="text-sm">{msg.content}</p>}
                </div>
                <p className={`text-xs text-surface-600 mt-0.5 px-1 ${isMe ? 'text-right' : ''}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 mt-3">
        <label className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-surface-900 border border-surface-700/50 rounded-xl text-surface-400 hover:text-white cursor-pointer transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
          <input type="file" className="hidden" onChange={handleFileUpload} />
        </label>
        <input
          className="flex-1 bg-surface-900 border border-surface-700/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-surface-500 focus:outline-none focus:border-brand-500 transition-colors"
          placeholder="Type a message..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="w-10 h-10 flex items-center justify-center bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl transition-colors flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
      </form>
    </div>
  )
}
