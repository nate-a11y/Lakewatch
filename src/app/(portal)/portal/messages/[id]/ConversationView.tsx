'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Send,
  Building2,
} from 'lucide-react'
import { sendMessage } from '@/actions/messages'

interface MessageData {
  id: number
  senderId: number
  senderName: string
  senderRole: string
  content: string
  timestamp: string
  isOwn: boolean
}

interface ConversationData {
  id: number
  subject: string
  propertyName: string | null
}

interface ConversationViewProps {
  conversation: ConversationData
  initialMessages: MessageData[]
  currentUserId: number
  currentUserName: string
}

export default function ConversationView({
  conversation,
  initialMessages,
  currentUserId,
  currentUserName,
}: ConversationViewProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    const content = newMessage
    setNewMessage('')

    // Optimistically add message
    const tempId = Date.now()
    const optimisticMessage: MessageData = {
      id: tempId,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: 'customer',
      content,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      isOwn: true,
    }
    setMessages(prev => [...prev, optimisticMessage])

    try {
      const result = await sendMessage({
        conversationId: conversation.id,
        content,
      })

      if (result.success && result.data) {
        // Update with real message data
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempId
              ? { ...optimisticMessage, id: result.data!.id }
              : msg
          )
        )
      } else {
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== tempId))
        setNewMessage(content) // Restore the message
      }
    } catch {
      setMessages(prev => prev.filter(msg => msg.id !== tempId))
      setNewMessage(content)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#27272a]">
        <div className="flex items-center gap-4">
          <Link
            href="/portal/messages"
            className="p-2 hover:bg-[#27272a] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-semibold">{conversation.subject}</h1>
            {conversation.propertyName && (
              <div className="flex items-center gap-2 text-sm text-[#71717a]">
                <Building2 className="w-4 h-4" />
                <span>{conversation.propertyName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-[#71717a] py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${message.isOwn ? 'order-2' : ''}`}>
                {!message.isOwn && (
                  <p className="text-xs text-[#71717a] mb-1 ml-1">
                    {message.senderName}
                    <span className="ml-2 text-[#4cbb17]">
                      {message.senderRole === 'admin' || message.senderRole === 'owner'
                        ? 'Lake Watch Pros'
                        : message.senderRole === 'technician'
                        ? 'Technician'
                        : ''}
                    </span>
                  </p>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    message.isOwn
                      ? 'bg-[#4cbb17] text-black rounded-br-md'
                      : 'bg-[#27272a] rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <div className={`flex items-center gap-1 mt-1 ${message.isOwn ? 'justify-end' : ''}`}>
                  <p className="text-xs text-[#71717a]">{message.timestamp}</p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-[#27272a]">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-[#0f0f0f] border border-[#27272a] rounded-xl p-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full bg-transparent resize-none focus:outline-none text-sm"
              style={{ minHeight: '24px', maxHeight: '120px' }}
              disabled={isSending}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="p-3 bg-[#4cbb17] text-black rounded-xl hover:bg-[#60e421] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
