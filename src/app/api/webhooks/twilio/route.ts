import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import twilio from 'twilio'

const webhookUrl = process.env.NEXT_PUBLIC_APP_URL + '/api/webhooks/twilio'

// Validate Twilio webhook signature
function validateTwilioSignature(
  request: NextRequest,
  body: string
): boolean {
  const signature = request.headers.get('x-twilio-signature')
  if (!signature || !process.env.TWILIO_AUTH_TOKEN) {
    return false
  }

  // Parse body into params object
  const params: Record<string, string> = {}
  new URLSearchParams(body).forEach((value, key) => {
    params[key] = value
  })

  return twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN,
    signature,
    webhookUrl,
    params
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()

    // Validate signature in production
    if (process.env.NODE_ENV === 'production') {
      if (!validateTwilioSignature(request, body)) {
        console.error('Invalid Twilio signature')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 403 }
        )
      }
    }

    // Parse form data
    const params = new URLSearchParams(body)
    const messageType = params.get('SmsStatus') ? 'status' : 'incoming'

    if (messageType === 'status') {
      // Handle delivery status callback
      const messageSid = params.get('MessageSid')
      const status = params.get('SmsStatus') // sent, delivered, failed, undelivered
      const errorCode = params.get('ErrorCode')

      console.log(`SMS Status Update: ${messageSid} -> ${status}`)

      if (status === 'failed' || status === 'undelivered') {
        console.error(`SMS delivery failed: ${messageSid}, error: ${errorCode}`)
        // Could create notification for admin here
      }

      // Return empty TwiML response
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        {
          headers: { 'Content-Type': 'text/xml' },
        }
      )
    }

    // Handle incoming SMS
    const from = params.get('From')
    const smsBody = params.get('Body')
    const messageSid = params.get('MessageSid')

    if (!from || !smsBody) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log(`Incoming SMS from ${from}: ${smsBody}`)

    const supabase = await createClient()

    // Find user by phone number
    const normalizedPhone = from.replace(/\D/g, '').slice(-10)
    const { data: user } = await supabase
      .from('lwp_users')
      .select('id, first_name, last_name, role')
      .or(`phone.ilike.%${normalizedPhone}`)
      .single()

    if (user) {
      // Find or create conversation with this user
      let conversationId: number | null = null

      // Check for existing active conversation
      const { data: existingConv } = await supabase
        .from('lwp_conversations')
        .select('id')
        .eq('customer_id', user.id)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (existingConv) {
        conversationId = existingConv.id
      } else {
        // Create new conversation
        const { data: newConv } = await supabase
          .from('lwp_conversations')
          .insert({
            customer_id: user.id,
            subject: `SMS from ${user.first_name} ${user.last_name}`,
            status: 'active',
            unread_by_admin: true,
          })
          .select('id')
          .single()

        conversationId = newConv?.id || null
      }

      if (conversationId) {
        // Create message record
        await supabase.from('lwp_messages').insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: smsBody,
          source: 'sms',
          external_id: messageSid,
        })

        // Mark conversation as unread by admin
        await supabase
          .from('lwp_conversations')
          .update({
            unread_by_admin: true,
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', conversationId)

        // Create notification for admin
        const { data: admins } = await supabase
          .from('lwp_users')
          .select('id')
          .in('role', ['admin', 'owner'])

        if (admins) {
          const notifications = admins.map((admin) => ({
            user_id: admin.id,
            type: 'message',
            title: `New SMS from ${user.first_name} ${user.last_name}`,
            body: smsBody.length > 100 ? smsBody.substring(0, 100) + '...' : smsBody,
            data: { conversation_id: conversationId },
            channels: ['push'],
          }))

          await supabase.from('lwp_notifications').insert(notifications)
        }
      }
    } else {
      // Unknown sender - log for review
      console.log(`SMS from unknown number: ${from}`)

      // Could create a lead or alert
      await supabase.from('lwp_notifications').insert({
        user_id: 1, // Assuming admin has ID 1, adjust as needed
        type: 'system',
        title: 'SMS from Unknown Number',
        body: `From: ${from}\nMessage: ${smsBody}`,
        channels: ['push'],
      })
    }

    // Auto-reply TwiML
    const autoReply = user
      ? `Thanks for your message! We'll respond shortly. View your portal at ${process.env.NEXT_PUBLIC_APP_URL}/portal/messages`
      : `Thanks for reaching out to Lake Watch Pros! Please call us at ${process.env.NEXT_PUBLIC_PHONE || '573-206-9499'} or visit lakewatchpros.com`

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${autoReply}</Message>
</Response>`

    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (error) {
    console.error('Twilio webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
