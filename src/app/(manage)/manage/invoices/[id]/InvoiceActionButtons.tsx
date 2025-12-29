'use client'

import { useRouter } from 'next/navigation'
import { CreditCard, Send, Download, Printer, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface InvoiceActionButtonsProps {
  invoiceId: string
  status: string
}

export default function InvoiceActionButtons({ status }: InvoiceActionButtonsProps) {
  const router = useRouter()

  const handleRecordPayment = () => {
    toast.success('Payment recorded')
    router.refresh()
  }

  const handleSend = () => {
    toast.success('Invoice sent to customer')
  }

  const handleDownload = () => {
    toast.info('Generating PDF...')
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== 'paid' && status !== 'cancelled' && (
        <button
          onClick={handleRecordPayment}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
        >
          <CreditCard className="w-4 h-4" />
          Record Payment
        </button>
      )}
      <button
        onClick={handleSend}
        className="inline-flex items-center gap-2 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
      >
        <Send className="w-4 h-4" />
        Send
      </button>
      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-2 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
      >
        <Download className="w-4 h-4" />
        PDF
      </button>
    </div>
  )
}

interface InvoiceQuickActionsProps {
  invoiceId: string
  status: string
}

export function InvoiceQuickActions({ invoiceId, status }: InvoiceQuickActionsProps) {
  const router = useRouter()

  const handleSendReminder = () => {
    toast.success('Reminder sent')
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDuplicate = () => {
    router.push(`/manage/invoices/new?duplicate=${invoiceId}`)
  }

  const handleVoid = () => {
    toast.info('Invoice voided')
    router.refresh()
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleSendReminder}
        className="w-full text-left px-4 py-2 text-sm hover:bg-[#27272a] rounded-lg transition-colors flex items-center gap-2"
      >
        <Send className="w-4 h-4" />
        Send reminder
      </button>
      <button
        onClick={handlePrint}
        className="w-full text-left px-4 py-2 text-sm hover:bg-[#27272a] rounded-lg transition-colors flex items-center gap-2"
      >
        <Printer className="w-4 h-4" />
        Print invoice
      </button>
      <button
        onClick={handleDuplicate}
        className="w-full text-left px-4 py-2 text-sm hover:bg-[#27272a] rounded-lg transition-colors flex items-center gap-2"
      >
        <FileText className="w-4 h-4" />
        Duplicate
      </button>
      {status !== 'paid' && status !== 'cancelled' && (
        <button
          onClick={handleVoid}
          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          Void invoice
        </button>
      )}
    </div>
  )
}
