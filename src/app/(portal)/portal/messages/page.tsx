import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { MessageSquare, Plus } from 'lucide-react'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get user's internal ID
  const { data: userData } = await supabase
    .from('lwp_users')
    .select('id')
    .eq('supabase_id', user?.id)
    .single()

  const userId = userData?.id

  // Fetch conversations where user is a participant
  const { data: conversations } = await supabase
    .from('lwp_conversations')
    .select(`
      id, subject, last_message_at, unread_by_customer,
      property:lwp_properties!property_id(id, name)
    `)
    .eq('customer_id', userId || 0)
    .order('last_message_at', { ascending: false })

  // Get the last message for each conversation
  const conversationIds = conversations?.map(c => c.id) || []
  const { data: lastMessages } = await supabase
    .from('lwp_messages')
    .select('id, conversation_id, content, created_at')
    .in('conversation_id', conversationIds.length > 0 ? conversationIds : [0])
    .order('created_at', { ascending: false })

  // Create a map of conversation_id -> last message
  const lastMessageMap = new Map<number, string>()
  lastMessages?.forEach(msg => {
    if (!lastMessageMap.has(msg.conversation_id)) {
      // Strip HTML and truncate
      const text = msg.content?.replace(/<[^>]*>/g, '').slice(0, 100) || ''
      lastMessageMap.set(msg.conversation_id, text)
    }
  })

  // Transform conversations
  const transformedConversations = (conversations || []).map(convo => {
    const propData = convo.property as unknown
    const property = Array.isArray(propData) ? propData[0] : propData
    return {
      id: String(convo.id),
      subject: convo.subject || 'New Conversation',
      property: property?.name || null,
      lastMessage: lastMessageMap.get(convo.id) || 'No messages yet',
      lastMessageAt: convo.last_message_at
        ? new Date(convo.last_message_at).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
          })
        : '',
      unread: convo.unread_by_customer || false,
    }
  })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Messages</h1>
          <p className="text-[#a1a1aa]">
            Communicate with the Lake Watch Pros team
          </p>
        </div>
        <Link
          href="/portal/messages/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Message
        </Link>
      </div>

      {/* Conversations list */}
      {transformedConversations.length > 0 ? (
        <div className="space-y-2">
          {transformedConversations.map((convo) => (
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
                  {convo.property && (
                    <p className="text-xs text-[#4cbb17] mb-1">{convo.property}</p>
                  )}
                  <p className="text-sm text-[#a1a1aa] line-clamp-1">{convo.lastMessage}</p>
                  <p className="text-xs text-[#71717a] mt-1">{convo.lastMessageAt}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#0f0f0f] border border-[#27272a] rounded-xl">
          <MessageSquare className="w-16 h-16 text-[#71717a] mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No messages yet</h2>
          <p className="text-[#a1a1aa] mb-6">
            Start a conversation with our team
          </p>
          <Link
            href="/portal/messages/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Message
          </Link>
        </div>
      )}
    </div>
  )
}
