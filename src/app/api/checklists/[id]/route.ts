import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/checklists/[id]
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

    const { data, error } = await supabase
      .from('lwp_checklists')
      .select(`
        *,
        items:lwp_checklist_items(id, item_text, category, is_required, requires_photo, sort_order)
      `)
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Checklist GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/checklists/[id] - Update checklist
export async function PUT(
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

    if (!userData || !['admin', 'owner'].includes(userData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, items } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Update checklist
    const { error: checklistError } = await supabase
      .from('lwp_checklists')
      .update({
        name,
        description: description || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (checklistError) {
      return NextResponse.json({ error: checklistError.message }, { status: 500 })
    }

    // Update items if provided
    if (items && Array.isArray(items)) {
      // Delete existing items
      await supabase.from('lwp_checklist_items').delete().eq('checklist_id', id)

      // Insert new items
      const checklistItems = items.map((item: { text: string; category: string; required: boolean }, index: number) => ({
        checklist_id: parseInt(id),
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
        return NextResponse.json({ error: itemsError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Checklist PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/checklists/[id]
export async function DELETE(
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

    if (!userData || !['admin', 'owner'].includes(userData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Items will cascade delete due to FK constraint
    const { error } = await supabase
      .from('lwp_checklists')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Checklist DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
