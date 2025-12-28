import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generateInspectionReportPDF } from '@/lib/pdf'

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

    // Get inspection with all details
    const { data: inspection } = await supabase
      .from('lwp_inspections')
      .select(`
        *,
        property:lwp_properties!property_id(
          id, name, street, city, state, zip,
          owner:lwp_users!owner_id(id, first_name, last_name, email, phone)
        ),
        technician:lwp_users!technician_id(id, first_name, last_name)
      `)
      .eq('id', parseInt(id))
      .single()

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
    }

    // Check access
    const property = Array.isArray(inspection.property)
      ? inspection.property[0]
      : inspection.property
    const owner = property?.owner
    const ownerData = Array.isArray(owner) ? owner[0] : owner

    if (userData.role === 'customer' && ownerData?.id !== userData.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const technician = Array.isArray(inspection.technician)
      ? inspection.technician[0]
      : inspection.technician

    // Transform checklist responses for PDF
    const checklistItems = (inspection.checklist_responses || []).map((item: {
      category?: string
      item?: string
      response?: string
      notes?: string
    }) => ({
      category: item.category || 'General',
      item: item.item || '',
      status: (item.response === 'pass' ? 'pass' :
              item.response === 'fail' ? 'fail' :
              item.response === 'needs_attention' ? 'attention' : 'na') as 'pass' | 'fail' | 'attention' | 'na',
      notes: item.notes,
    }))

    // Generate PDF
    const pdfBlob = await generateInspectionReportPDF({
      reportNumber: `RPT-${String(inspection.id).padStart(5, '0')}`,
      inspectionDate: new Date(inspection.scheduled_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      inspectionTime: inspection.check_in_time
        ? new Date(inspection.check_in_time).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })
        : 'N/A',
      property: {
        name: property?.name || 'Property',
        address: property?.street || '',
        city: property?.city || '',
        state: property?.state || 'MO',
        zip: property?.zip || '',
      },
      owner: {
        name: ownerData ? `${ownerData.first_name} ${ownerData.last_name}` : 'Owner',
        email: ownerData?.email || '',
        phone: ownerData?.phone,
      },
      technician: {
        name: technician ? `${technician.first_name} ${technician.last_name}` : 'Technician',
      },
      weather: inspection.weather || undefined,
      overallStatus: inspection.overall_status === 'good' ? 'good' : 'issues_found',
      checklistItems,
      summaryNotes: inspection.summary,
    })

    // Return PDF
    const arrayBuffer = await pdfBlob.arrayBuffer()

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="inspection-report-${id}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
