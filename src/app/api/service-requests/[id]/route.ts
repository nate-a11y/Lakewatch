import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendServiceRequestUpdateEmail } from '@/lib/resend'
import { sendServiceRequestUpdateSMS } from '@/lib/twilio'

// GET /api/service-requests/[id] - Get a specific service request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const { data: request_data, error } = await supabase
      .from('lwp_service_requests')
      .select(`
        *,
        property:lwp_properties!property_id(*),
        requested_by:lwp_users!requested_by_id(id, first_name, last_name, email, phone),
        assigned_to:lwp_users!assigned_to_id(id, first_name, last_name)
      `)
      .eq('id', parseInt(id))
      .single()

    if (error || !request_data) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 })
    }

    // Check access
    if (userData.role === 'customer' && request_data.requested_by_id !== userData.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (userData.role === 'technician' && request_data.assigned_to_id !== userData.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ data: request_data })
  } catch (error) {
    console.error('Service request GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/service-requests/[id] - Update a service request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Get existing request
    const { data: existingRequest } = await supabase
      .from('lwp_service_requests')
      .select(`
        *,
        requested_by:lwp_users!requested_by_id(id, first_name, last_name, email, phone, notification_preferences),
        property:lwp_properties!property_id(name)
      `)
      .eq('id', parseInt(id))
      .single()

    if (!existingRequest) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 })
    }

    const isAdmin = ['admin', 'owner', 'staff'].includes(userData.role)
    const isTechnician = userData.role === 'technician' && existingRequest.assigned_to_id === userData.id
    const isRequester = existingRequest.requested_by_id === userData.id

    if (!isAdmin && !isTechnician && !isRequester) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    // Admin can update all fields
    if (isAdmin) {
      if (body.assignedToId !== undefined) updateData.assigned_to_id = body.assignedToId
      if (body.status !== undefined) updateData.status = body.status
      if (body.priority !== undefined) updateData.priority = body.priority
      if (body.scheduledDate !== undefined) updateData.scheduled_date = body.scheduledDate
      if (body.scheduledTime !== undefined) updateData.scheduled_time = body.scheduledTime
      if (body.pricing !== undefined) updateData.pricing = body.pricing
      if (body.adminNotes !== undefined) updateData.admin_notes = body.adminNotes
    }

    // Technician can update status and completion notes
    if (isTechnician || isAdmin) {
      if (body.status !== undefined) {
        // Technicians can only set certain statuses
        if (['in_progress', 'completed'].includes(body.status) || isAdmin) {
          updateData.status = body.status
        }
      }
      if (body.completionNotes !== undefined) updateData.completion_notes = body.completionNotes
      if (body.completionPhotos !== undefined) updateData.completion_photos = body.completionPhotos
      if (body.status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }
    }

    // Requester can update description and preferred times (only if pending)
    if (isRequester && existingRequest.status === 'pending') {
      if (body.description !== undefined) updateData.description = body.description
      if (body.preferredDate !== undefined) updateData.preferred_date = body.preferredDate
      if (body.preferredTimeStart !== undefined) updateData.preferred_time_start = body.preferredTimeStart
      if (body.preferredTimeEnd !== undefined) updateData.preferred_time_end = body.preferredTimeEnd
    }

    const { data, error } = await supabase
      .from('lwp_service_requests')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send notification if status changed
    if (body.status && body.status !== existingRequest.status) {
      const requester = Array.isArray(existingRequest.requested_by)
        ? existingRequest.requested_by[0]
        : existingRequest.requested_by

      // Create in-app notification
      await supabase.from('lwp_notifications').insert({
        user_id: requester?.id,
        type: 'service_request_update',
        title: 'Service Request Updated',
        body: `Your request "${existingRequest.title}" has been updated to: ${body.status}`,
        data: { service_request_id: parseInt(id) },
        channels: ['push', 'email'],
      })

      // Send email
      if (requester?.email) {
        const prefs = requester.notification_preferences as { email?: boolean } | null
        if (prefs?.email !== false) {
          try {
            await sendServiceRequestUpdateEmail({
              to: requester.email,
              customerName: requester.first_name || 'Valued Customer',
              requestTitle: existingRequest.title,
              newStatus: formatStatus(body.status),
              notes: body.adminNotes,
              portalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/portal/requests/${id}`,
            })
          } catch (emailError) {
            console.error('Failed to send email:', emailError)
          }
        }
      }

      // Send SMS
      if (requester?.phone) {
        const prefs = requester.notification_preferences as { sms?: boolean } | null
        if (prefs?.sms !== false) {
          try {
            await sendServiceRequestUpdateSMS({
              to: requester.phone,
              requestTitle: existingRequest.title,
              newStatus: formatStatus(body.status),
            })
          } catch (smsError) {
            console.error('Failed to send SMS:', smsError)
          }
        }
      }
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Service request PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pending Review',
    approved: 'Approved',
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }
  return statusMap[status] || status
}
