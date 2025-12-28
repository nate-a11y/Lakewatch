import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendInspectionCompleteEmail } from '@/lib/resend'
import { sendInspectionCompleteSMS } from '@/lib/twilio'

export async function POST(
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
      .select('id, role, first_name, last_name')
      .eq('supabase_id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get inspection with full details
    const { data: inspection } = await supabase
      .from('lwp_inspections')
      .select(`
        *,
        property:lwp_properties!property_id(
          id, name, street, city, state, zip,
          owner:lwp_users!owner_id(id, first_name, last_name, email, phone, notification_preferences)
        )
      `)
      .eq('id', parseInt(id))
      .single()

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
    }

    // Check access
    const isAdmin = ['admin', 'owner', 'staff'].includes(userData.role)
    const isTechnician = inspection.technician_id === userData.id

    if (!isAdmin && !isTechnician) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (inspection.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Inspection must be in progress to submit' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { checklistResponses, summary, issuesFound, weather } = body

    // Determine overall status
    const hasIssues = issuesFound && issuesFound.length > 0
    const overallStatus = hasIssues ? 'issues_found' : 'good'

    const now = new Date().toISOString()

    // Update inspection
    const { data, error } = await supabase
      .from('lwp_inspections')
      .update({
        status: 'completed',
        checklist_responses: checklistResponses,
        summary,
        issues_found: issuesFound,
        weather,
        overall_status: overallStatus,
        check_out_time: inspection.check_out_time || now,
        report_generated_at: now,
        updated_at: now,
      })
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get property and owner info
    const property = Array.isArray(inspection.property)
      ? inspection.property[0]
      : inspection.property

    const ownerData = property?.owner
    const owner = Array.isArray(ownerData) ? ownerData[0] : ownerData

    const reportUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/reports/${id}`

    // Create notification for customer
    if (owner?.id) {
      await supabase.from('lwp_notifications').insert({
        user_id: owner.id,
        type: 'report_ready',
        title: 'Inspection Report Ready',
        body: `Your inspection report for ${property?.name || 'your property'} is ready to view.`,
        data: { inspection_id: parseInt(id), property_id: property?.id },
        channels: ['email', 'push'],
      })
    }

    // Send email notification
    if (owner?.email) {
      const prefs = owner.notification_preferences as { email?: boolean } | null
      if (prefs?.email !== false) {
        try {
          await sendInspectionCompleteEmail({
            to: owner.email,
            customerName: owner.first_name || 'Valued Customer',
            propertyName: property?.name || 'your property',
            inspectionDate: new Date(inspection.scheduled_date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            }),
            status: overallStatus,
            issueCount: issuesFound?.length || 0,
            reportUrl,
          })
        } catch (emailError) {
          console.error('Failed to send inspection email:', emailError)
        }
      }
    }

    // Send SMS notification
    if (owner?.phone) {
      const prefs = owner.notification_preferences as { sms?: boolean } | null
      if (prefs?.sms !== false) {
        try {
          await sendInspectionCompleteSMS({
            to: owner.phone,
            propertyName: property?.name || 'your property',
            status: overallStatus,
            reportUrl,
          })
        } catch (smsError) {
          console.error('Failed to send inspection SMS:', smsError)
        }
      }
    }

    return NextResponse.json({
      data,
      message: 'Inspection submitted successfully',
    })
  } catch (error) {
    console.error('Submit inspection error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
