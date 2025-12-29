import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/checklists - List all checklists
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

    if (!userData || !['admin', 'owner', 'technician'].includes(userData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const planType = searchParams.get('plan_type')

    let query = supabase
      .from('lwp_checklists')
      .select('*')
      .order('name')

    if (planType) {
      query = query.eq('plan_type', planType)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Checklists GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/checklists - Create a new checklist
export async function POST(request: NextRequest) {
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

    if (!userData || !['admin', 'owner'].includes(userData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, planType, items } = body

    if (!name || !items || items.length === 0) {
      return NextResponse.json({ error: 'Name and items are required' }, { status: 400 })
    }

    // Create checklist
    const { data: checklist, error: checklistError } = await supabase
      .from('lwp_checklists')
      .insert({
        name,
        description: description || null,
        plan_type: planType || 'Custom',
      })
      .select()
      .single()

    if (checklistError) {
      return NextResponse.json({ error: checklistError.message }, { status: 500 })
    }

    // Create checklist items
    const checklistItems = items.map((item: { text: string; category: string; required: boolean }, index: number) => ({
      checklist_id: checklist.id,
      item_text: item.text,
      category: item.category || 'General',
      is_required: item.required ?? true,
      requires_photo: false,
      sort_order: index,
    }))

    const { error: itemsError } = await supabase
      .from('lwp_checklist_items')
      .insert(checklistItems)

    if (itemsError) {
      // Rollback checklist if items fail
      await supabase.from('lwp_checklists').delete().eq('id', checklist.id)
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    return NextResponse.json({ data: checklist }, { status: 201 })
  } catch (error) {
    console.error('Checklists POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
