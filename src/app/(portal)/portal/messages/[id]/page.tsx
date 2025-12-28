import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ConversationView from './ConversationView'

export interface MessageData {
  id: number
  senderId: number
  senderName: string
  senderRole: 'customer' | 'admin' | 'technician' | 'owner' | 'staff'
  content: string
  timestamp: string
  isOwn: boolean
}

export interface ConversationData {
  id: number
  subject: string
  propertyName: string | null
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const conversationId = parseInt(id)

  if (isNaN(conversationId)) {
    notFound()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get user's internal ID
  const { data: userData } = await supabase
    .from('lwp_users')
    .select('id, first_name, last_name')
    .eq('supabase_id', user?.id)
    .single()

  const userId = userData?.id

  // Fetch conversation
  const { data: conversation } = await supabase
    .from('lwp_conversations')
    .select(`
      id, subject, customer_id,
      property:lwp_properties!property_id(id, name)
    `)
    .eq('id', conversationId)
    .single()

  if (!conversation || conversation.customer_id !== userId) {
    notFound()
  }

  // Mark as read
  await supabase
    .from('lwp_conversations')
    .update({ unread_by_customer: false })
    .eq('id', conversationId)

  // Fetch messages
  const { data: messages } = await supabase
    .from('lwp_messages')
    .select(`
      id, content, created_at, sender_id,
      sender:lwp_users!sender_id(id, first_name, last_name, role)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  // Transform messages
  const transformedMessages: MessageData[] = (messages || []).map(msg => {
    const senderData = msg.sender as unknown
    const sender = Array.isArray(senderData) ? senderData[0] : senderData
    return {
      id: msg.id,
      senderId: msg.sender_id,
      senderName: sender ? `${sender.first_name} ${sender.last_name}` : 'Unknown',
      senderRole: sender?.role || 'customer',
      content: msg.content?.replace(/<[^>]*>/g, '') || '',
      timestamp: new Date(msg.created_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      isOwn: msg.sender_id === userId,
    }
  })

  const propData = conversation.property as unknown
  const property = Array.isArray(propData) ? propData[0] : propData

  const conversationData: ConversationData = {
    id: conversation.id,
    subject: conversation.subject || 'Conversation',
    propertyName: property?.name || null,
  }

  return (
    <ConversationView
      conversation={conversationData}
      initialMessages={transformedMessages}
      currentUserId={userId || 0}
      currentUserName={userData ? `${userData.first_name} ${userData.last_name}` : 'You'}
    />
  )
}
