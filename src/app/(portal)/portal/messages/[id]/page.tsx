'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Send,
  Paperclip,
  Image as ImageIcon,
  Phone,
  Building2,
  Check,
  CheckCheck,
} from 'lucide-react'
import { useParams } from 'next/navigation'

interface Message {
  id: string
  senderId: string
  senderName: string
  senderRole: 'customer' | 'admin' | 'technician'
  content: string
  timestamp: string
  read: boolean
  attachments?: { type: 'image' | 'file'; url: string; name: string }[]
}

export default function ConversationPage() {
  const params = useParams()
  const id = params.id as string
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUserId = '5' // Mock current user ID

  // Mock conversation data
  const conversation = {
    id,
    subject: 'Question about inspection report',
    property: { id: '1', name: 'Lake House' },
    participants: [
      { id: '5', name: 'John Smith', role: 'customer' as const },
      { id: '2', name: 'Admin User', role: 'admin' as const },
    ],
    lastActivity: '2 hours ago',
  }

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: '5',
      senderName: 'John Smith',
      senderRole: 'customer',
      content: 'Hi, I had a question about the latest inspection report for my Lake House property.',
      timestamp: 'Dec 26, 2025 10:30 AM',
      read: true,
    },
    {
      id: '2',
      senderId: '2',
      senderName: 'Admin User',
      senderRole: 'admin',
      content: 'Hello John! Of course, I\'d be happy to help. What questions do you have about the report?',
      timestamp: 'Dec 26, 2025 10:45 AM',
      read: true,
    },
    {
      id: '3',
      senderId: '5',
      senderName: 'John Smith',
      senderRole: 'customer',
      content: 'The report mentioned some moisture in the basement. How concerned should I be about this? Is it something that needs immediate attention?',
      timestamp: 'Dec 26, 2025 11:00 AM',
      read: true,
    },
    {
      id: '4',
      senderId: '2',
      senderName: 'Admin User',
      senderRole: 'admin',
      content: 'Good question. The moisture level we detected was minor - not at a level that requires immediate action. However, I\'d recommend installing a dehumidifier to prevent any long-term issues. We can help arrange this if you\'d like.',
      timestamp: 'Dec 26, 2025 11:15 AM',
      read: true,
    },
    {
      id: '5',
      senderId: '5',
      senderName: 'John Smith',
      senderRole: 'customer',
      content: 'That would be great. Can you send me some options with pricing?',
      timestamp: 'Dec 26, 2025 2:30 PM',
      read: true,
    },
    {
      id: '6',
      senderId: '2',
      senderName: 'Admin User',
      senderRole: 'admin',
      content: 'Absolutely! I\'ll put together a few options and send them over by end of day tomorrow. In the meantime, our technician will keep an eye on the moisture levels during the next inspection.',
      timestamp: 'Dec 26, 2025 3:00 PM',
      read: false,
    },
  ])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: String(messages.length + 1),
      senderId: currentUserId,
      senderName: 'John Smith',
      senderRole: 'customer',
      content: newMessage,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      read: false,
    }

    setMessages([...messages, message])
    setNewMessage('')
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
            <div className="flex items-center gap-2 text-sm text-[#71717a]">
              <Building2 className="w-4 h-4" />
              <span>{conversation.property.name}</span>
              <span>•</span>
              <span>{conversation.lastActivity}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-[#27272a] rounded-lg transition-colors">
            <Phone className="w-5 h-5 text-[#71717a]" />
          </button>
          <button className="p-2 hover:bg-[#27272a] rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-[#71717a]" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.senderId === currentUserId
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${isOwn ? 'order-2' : ''}`}>
                {!isOwn && (
                  <p className="text-xs text-[#71717a] mb-1 ml-1">
                    {message.senderName}
                  </p>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    isOwn
                      ? 'bg-[#4cbb17] text-black rounded-br-md'
                      : 'bg-[#27272a] rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                  <p className="text-xs text-[#71717a]">{message.timestamp}</p>
                  {isOwn && (
                    message.read ? (
                      <CheckCheck className="w-3 h-3 text-[#4cbb17]" />
                    ) : (
                      <Check className="w-3 h-3 text-[#71717a]" />
                    )
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-[#27272a]">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-[#0f0f0f] border border-[#27272a] rounded-xl p-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full bg-transparent resize-none focus:outline-none text-sm"
              style={{ minHeight: '24px', maxHeight: '120px' }}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                <button className="p-1.5 hover:bg-[#27272a] rounded-lg transition-colors">
                  <Paperclip className="w-4 h-4 text-[#71717a]" />
                </button>
                <button className="p-1.5 hover:bg-[#27272a] rounded-lg transition-colors">
                  <ImageIcon className="w-4 h-4 text-[#71717a]" />
                </button>
              </div>
              <button
                onClick={handleSend}
                disabled={!newMessage.trim()}
                className="p-2 bg-[#4cbb17] text-black rounded-lg hover:bg-[#60e421] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
