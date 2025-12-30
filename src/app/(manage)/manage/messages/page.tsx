import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, MessageSquare, Clock } from 'lucide-react'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch conversations
  const { data: conversations } = await supabase
    .from('lwp_conversations')
    .select(`
      *,
      customer:lwp_users!customer_id(id, first_name, last_name, email),
      property:lwp_properties!property_id(id, name)
    `)
    .order('last_message_at', { ascending: false })
    .limit(50)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Messages</h1>
          <p className="text-[#a1a1aa]">Customer conversations</p>
        </div>
        <Link
          href="/manage/messages/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Message
        </Link>
      </div>

      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl overflow-hidden">
        {(conversations || []).length > 0 ? (
          <div className="divide-y divide-[#27272a]">
            {(conversations || []).map((conversation) => {
              const customerData = conversation.customer as { id: number; first_name: string; last_name: string; email: string } | { id: number; first_name: string; last_name: string; email: string }[] | null
              const customer = Array.isArray(customerData) ? customerData[0] : customerData

              const propertyData = conversation.property as { id: number; name: string } | { id: number; name: string }[] | null
              const property = Array.isArray(propertyData) ? propertyData[0] : propertyData

              return (
                <Link
                  key={conversation.id}
                  href={`/manage/messages/${conversation.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-[#171717] transition-colors"
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold ${
                    conversation.unread_by_staff
                      ? 'bg-[#4cbb17]/10 text-[#4cbb17]'
                      : 'bg-[#27272a] text-[#71717a]'
                  }`}>
                    {customer?.first_name?.[0]}{customer?.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">
                        {customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown'}
                      </span>
                      {conversation.unread_by_staff && (
                        <span className="w-2 h-2 bg-[#4cbb17] rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-[#a1a1aa] truncate">{conversation.subject}</p>
                    {property && (
                      <p className="text-xs text-[#71717a] truncate">{property.name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#71717a]">
                    <Clock className="w-3 h-3" />
                    {conversation.last_message_at ? formatDate(conversation.last_message_at) : 'No messages'}
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-[#27272a]" />
            <p className="text-[#71717a]">No conversations yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
