import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/user/settings - Get current user settings
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('lwp_users')
      .select('id, first_name, last_name, email, phone, notification_email, notification_sms, notification_push')
      .eq('supabase_id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('User settings GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/user/settings - Update current user settings
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      phone,
      notificationEmail,
      notificationSms,
      notificationPush,
      currentPassword,
      newPassword,
    } = body

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (firstName !== undefined) updateData.first_name = firstName
    if (lastName !== undefined) updateData.last_name = lastName
    if (phone !== undefined) updateData.phone = phone
    if (notificationEmail !== undefined) updateData.notification_email = notificationEmail
    if (notificationSms !== undefined) updateData.notification_sms = notificationSms
    if (notificationPush !== undefined) updateData.notification_push = notificationPush

    // Update database record
    const { error: dbError } = await supabase
      .from('lwp_users')
      .update(updateData)
      .eq('supabase_id', user.id)

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    // Handle password change if requested
    if (newPassword && currentPassword) {
      // Verify current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      })

      if (signInError) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }

      // Update password
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (passwordError) {
        return NextResponse.json({ error: passwordError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User settings PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
