import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ChecklistEditor from './ChecklistEditor'

export default async function ChecklistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch the checklist
  const { data: checklist, error } = await supabase
    .from('lwp_checklists')
    .select('id, name, description, plan_type, updated_at')
    .eq('id', id)
    .single()

  if (error || !checklist) {
    notFound()
  }

  // Fetch checklist items
  const { data: items } = await supabase
    .from('lwp_checklist_items')
    .select('id, item_text, category, is_required, requires_photo, sort_order')
    .eq('checklist_id', id)
    .order('sort_order', { ascending: true })

  // Count properties using this checklist
  const { count: usedByCount } = await supabase
    .from('lwp_properties')
    .select('id', { count: 'exact', head: true })
    .eq('checklist_id', id)

  const formattedChecklist = {
    id: checklist.id,
    name: checklist.name,
    description: checklist.description || '',
    plan: (checklist.plan_type || 'Custom') as 'Premium' | 'Standard' | 'Basic' | 'Custom',
    items: (items || []).map(item => ({
      id: String(item.id),
      text: item.item_text,
      category: item.category || 'General',
      required: item.is_required,
    })),
    usedBy: usedByCount || 0,
    lastUpdated: new Date(checklist.updated_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  }

  return <ChecklistEditor checklist={formattedChecklist} />
}
