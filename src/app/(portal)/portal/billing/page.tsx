import { createClient } from '@/lib/supabase/server'
import BillingClient from './BillingClient'

export default async function BillingPage() {
  const supabase = await createClient()

  // Fetch invoices for the current customer
  const { data: invoices, error } = await supabase
    .from('lwp_invoices')
    .select(`
      id, invoice_number, status, issue_date, due_date, paid_date, subtotal, tax, total,
      customer:lwp_users!customer_id(id, first_name, last_name)
    `)
    .order('issue_date', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching invoices:', error)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formattedInvoices = (invoices || []).map((invoice) => ({
    id: String(invoice.id),
    number: invoice.invoice_number,
    date: formatDate(invoice.issue_date),
    dueDate: formatDate(invoice.due_date),
    amount: invoice.total,
    status: invoice.status as 'paid' | 'pending' | 'overdue',
    description: `Invoice ${invoice.invoice_number}`,
  }))

  return <BillingClient invoices={formattedInvoices} />
}
