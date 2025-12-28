import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendNewMessageEmail } from '@/lib/resend'

// GET /api/messages - List messages (requires conversation_id)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('lwp_users')
      .select('id, role')
      .eq('supabase_id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const searchParams = request.nextUrl.searchParams
    const conversationId = searchParams.get('conversation_id')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversation_id is required' },
        { status: 400 }
      )
    }

    // Verify access to conversation
    const { data: conversation } = await supabase
      .from('lwp_conversations')
      .select('customer_id')
      .eq('id', parseInt(conversationId))
      .single()

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Customers can only access their own conversations
    if (userData.role === 'customer' && conversation.customer_id !== userData.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('lwp_messages')
      .select(`
        *,
        sender:lwp_users!sender_id(id, first_name, last_name, role)
      `)
      .eq('conversation_id', parseInt(conversationId))
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Mark messages as read
    const isCustomer = userData.role === 'customer'
    await supabase
      .from('lwp_conversations')
      .update({
        [isCustomer ? 'unread_by_customer' : 'unread_by_admin']: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parseInt(conversationId))

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Messages GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/messages - Send a message
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('lwp_users')
      .select('id, role, first_name, last_name')
      .eq('supabase_id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { conversationId, content, attachments } = body

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify access to conversation
    const { data: conversation } = await supabase
      .from('lwp_conversations')
      .select(`
        id, customer_id, subject,
        customer:lwp_users!customer_id(id, first_name, last_name, email, notification_preferences)
      `)
      .eq('id', conversationId)
      .single()

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Customers can only access their own conversations
    if (userData.role === 'customer' && conversation.customer_id !== userData.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date().toISOString()

    // Create message
    const { data: message, error } = await supabase
      .from('lwp_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userData.id,
        content,
        attachments: attachments || null,
        source: 'web',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update conversation
    const isCustomer = userData.role === 'customer'
    await supabase
      .from('lwp_conversations')
      .update({
        last_message_at: now,
        [isCustomer ? 'unread_by_admin' : 'unread_by_customer']: true,
        updated_at: now,
      })
      .eq('id', conversationId)

    // Send notification to recipient
    if (isCustomer) {
      // Notify admins
      const { data: admins } = await supabase
        .from('lwp_users')
        .select('id')
        .in('role', ['admin', 'owner', 'staff'])

      if (admins) {
        const notifications = admins.map((admin) => ({
          user_id: admin.id,
          type: 'message',
          title: `New message from ${userData.first_name} ${userData.last_name}`,
          body: content.length > 100 ? content.substring(0, 100) + '...' : content,
          data: { conversation_id: conversationId },
          channels: ['push'],
        }))

        await supabase.from('lwp_notifications').insert(notifications)
      }
    } else {
      // Notify customer
      const customer = Array.isArray(conversation.customer)
        ? conversation.customer[0]
        : conversation.customer

      if (customer) {
        await supabase.from('lwp_notifications').insert({
          user_id: customer.id,
          type: 'message',
          title: 'New Message from Lake Watch Pros',
          body: content.length > 100 ? content.substring(0, 100) + '...' : content,
          data: { conversation_id: conversationId },
          channels: ['push', 'email'],
        })

        // Send email notification
        if (customer.email) {
          const prefs = customer.notification_preferences as { email?: boolean } | null
          if (prefs?.email !== false) {
            try {
              await sendNewMessageEmail({
                to: customer.email,
                customerName: customer.first_name || 'Valued Customer',
                senderName: `${userData.first_name} ${userData.last_name}`,
                messagePreview: content.length > 200 ? content.substring(0, 200) + '...' : content,
                conversationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/portal/messages/${conversationId}`,
              })
            } catch (emailError) {
              console.error('Failed to send message email:', emailError)
            }
          }
        }
      }
    }

    return NextResponse.json({ data: message }, { status: 201 })
  } catch (error) {
    console.error('Message POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
