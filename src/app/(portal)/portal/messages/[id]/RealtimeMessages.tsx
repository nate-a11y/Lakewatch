'use client'

import { useEffect, useState, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Send, Paperclip } from 'lucide-react'

interface Message {
  id: number
  content: string
  created_at: string
  sender: {
    id: number
    first_name: string
    last_name: string
    role: string
  }
}

interface RealtimeMessagesProps {
  conversationId: string
  currentUserId: number
  initialMessages: Message[]
}

export default function RealtimeMessages({
  conversationId,
  currentUserId,
  initialMessages,
}: RealtimeMessagesProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lwp_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch the full message with sender info
          const { data: newMsg } = await supabase
            .from('lwp_messages')
            .select(`
              id, content, created_at,
              sender:lwp_users!sender_id(id, first_name, last_name, role)
            `)
            .eq('id', payload.new.id)
            .single()

          if (newMsg) {
            const sender = Array.isArray(newMsg.sender) ? newMsg.sender[0] : newMsg.sender
            setMessages((prev) => [
              ...prev,
              {
                id: newMsg.id,
                content: newMsg.content,
                created_at: newMsg.created_at,
                sender,
              },
            ])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, supabase])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: parseInt(conversationId),
          content: newMessage.trim(),
        }),
      })

      if (response.ok) {
        setNewMessage('')
      } else {
        const error = await response.json()
        console.error('Failed to send message:', error)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (diffDays === 1) {
      return `Yesterday ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[400px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-[#71717a] py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender?.id === currentUserId
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? 'bg-[#4cbb17] text-black rounded-br-md'
                      : 'bg-[#27272a] text-white rounded-bl-md'
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs font-medium mb-1 opacity-70">
                      {message.sender?.first_name} {message.sender?.last_name}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-black/60' : 'text-[#71717a]'}`}>
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-[#27272a]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 text-[#71717a] hover:text-white transition-colors"
            title="Attach file (coming soon)"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#0a0a0a] border border-[#27272a] rounded-full px-4 py-2 text-white placeholder:text-[#71717a] focus:outline-none focus:border-[#4cbb17]"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2 bg-[#4cbb17] text-black rounded-full hover:bg-[#60e421] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
