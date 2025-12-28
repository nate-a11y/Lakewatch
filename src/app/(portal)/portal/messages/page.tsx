import Link from 'next/link'
import { MessageSquare, Plus } from 'lucide-react'

interface Conversation {
  id: string
  subject: string
  property: string | null
  lastMessage: string
  lastMessageAt: string
  unread: boolean
}

export default function MessagesPage() {
  // Mock data
  const conversations: Conversation[] = [
    {
      id: '1',
      subject: 'Lake House - Water heater question',
      property: 'Lake House',
      lastMessage: 'The water heater has been serviced and is working properly now.',
      lastMessageAt: 'December 20, 2025',
      unread: false,
    },
    {
      id: '2',
      subject: 'Scheduling for January',
      property: null,
      lastMessage: 'We can accommodate your request for a pre-arrival visit on January 10th.',
      lastMessageAt: 'December 22, 2025',
      unread: true,
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Messages</h1>
          <p className="text-[#a1a1aa]">
            Communicate with the Lake Watch Pros team
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors">
          <Plus className="w-5 h-5" />
          New Message
        </button>
      </div>

      {/* Conversations list */}
      <div className="space-y-2">
        {conversations.map((convo) => (
          <Link
            key={convo.id}
            href={`/portal/messages/${convo.id}`}
            className={`block bg-[#0f0f0f] border rounded-xl p-4 hover:border-[#4cbb17]/50 transition-colors ${
              convo.unread ? 'border-[#4cbb17]' : 'border-[#27272a]'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#4cbb17]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-[#4cbb17]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{convo.subject}</h3>
                  {convo.unread && (
                    <span className="w-2 h-2 bg-[#4cbb17] rounded-full flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-[#a1a1aa] line-clamp-1">{convo.lastMessage}</p>
                <p className="text-xs text-[#71717a] mt-1">{convo.lastMessageAt}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {conversations.length === 0 && (
        <div className="text-center py-16 bg-[#0f0f0f] border border-[#27272a] rounded-xl">
          <MessageSquare className="w-16 h-16 text-[#71717a] mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No messages yet</h2>
          <p className="text-[#a1a1aa] mb-6">
            Start a conversation with our team
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors">
            <Plus className="w-5 h-5" />
            New Message
          </button>
        </div>
      )}
    </div>
  )
}
