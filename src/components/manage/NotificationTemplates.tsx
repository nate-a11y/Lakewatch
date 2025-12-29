'use client'

import { useState } from 'react'
import { Mail, MessageSquare, Save, RotateCcw, Eye, Code } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Template {
  id: string
  name: string
  type: 'email' | 'sms'
  subject?: string
  body: string
  variables: string[]
}

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'inspection_scheduled',
    name: 'Inspection Scheduled',
    type: 'email',
    subject: 'Your Property Inspection is Scheduled',
    body: `Hi {{customer_name}},

Your property inspection at {{property_name}} has been scheduled for {{date}} at {{time}}.

Our technician will conduct a thorough inspection and you'll receive a detailed report once complete.

If you need to reschedule, please contact us at least 24 hours in advance.

Best regards,
Lake Watch Pros Team`,
    variables: ['customer_name', 'property_name', 'date', 'time'],
  },
  {
    id: 'inspection_complete',
    name: 'Inspection Complete',
    type: 'email',
    subject: 'Inspection Report Ready for {{property_name}}',
    body: `Hi {{customer_name}},

Great news! The inspection at {{property_name}} has been completed.

Summary:
- Status: {{overall_status}}
- Issues Found: {{issues_count}}
- Technician: {{technician_name}}

View the full report with photos and recommendations in your customer portal.

Best regards,
Lake Watch Pros Team`,
    variables: ['customer_name', 'property_name', 'overall_status', 'issues_count', 'technician_name'],
  },
  {
    id: 'invoice_sent',
    name: 'Invoice Sent',
    type: 'email',
    subject: 'Invoice #{{invoice_number}} from Lake Watch Pros',
    body: `Hi {{customer_name}},

Please find your invoice attached.

Invoice #{{invoice_number}}
Amount Due: \${{amount}}
Due Date: {{due_date}}

You can pay securely through your customer portal or by clicking the payment link below.

Thank you for choosing Lake Watch Pros!`,
    variables: ['customer_name', 'invoice_number', 'amount', 'due_date'],
  },
  {
    id: 'payment_received',
    name: 'Payment Received',
    type: 'email',
    subject: 'Payment Confirmed - Thank You!',
    body: `Hi {{customer_name}},

We've received your payment of \${{amount}} for Invoice #{{invoice_number}}.

Thank you for your prompt payment!

Best regards,
Lake Watch Pros Team`,
    variables: ['customer_name', 'amount', 'invoice_number'],
  },
]

interface NotificationTemplatesProps {
  templates?: Template[]
  onSave?: (template: Template) => Promise<void>
  className?: string
}

export function NotificationTemplates({
  templates = DEFAULT_TEMPLATES,
  onSave,
  className,
}: NotificationTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0])
  const [editedBody, setEditedBody] = useState(templates[0].body)
  const [editedSubject, setEditedSubject] = useState(templates[0].subject || '')
  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setEditedBody(template.body)
    setEditedSubject(template.subject || '')
    setShowPreview(false)
  }

  const handleSave = async () => {
    if (!onSave) {
      toast.success('Template saved!')
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        ...selectedTemplate,
        body: editedBody,
        subject: editedSubject,
      })
      toast.success('Template saved!')
    } catch {
      toast.error('Failed to save template')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    const original = DEFAULT_TEMPLATES.find((t) => t.id === selectedTemplate.id)
    if (original) {
      setEditedBody(original.body)
      setEditedSubject(original.subject || '')
      toast.success('Template reset to default')
    }
  }

  const getPreviewContent = (content: string) => {
    const sampleData: Record<string, string> = {
      customer_name: 'John Smith',
      property_name: '123 Lake View Dr',
      date: 'December 30, 2024',
      time: '10:00 AM',
      overall_status: 'All Clear',
      issues_count: '0',
      technician_name: 'Mike Johnson',
      invoice_number: 'INV-2024-001',
      amount: '150.00',
      due_date: 'January 15, 2025',
    }

    return content.replace(/\{\{(\w+)\}\}/g, (_, key) => sampleData[key] || `{{${key}}}`)
  }

  return (
    <div className={cn('', className)}>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-[#71717a] mb-3">Templates</h3>
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                selectedTemplate.id === template.id
                  ? 'bg-[#4cbb17]/10 border border-[#4cbb17]'
                  : 'bg-[#0f0f0f] border border-[#27272a] hover:border-[#4cbb17]/30'
              )}
            >
              {template.type === 'email' ? (
                <Mail className="w-4 h-4 text-[#71717a]" />
              ) : (
                <MessageSquare className="w-4 h-4 text-[#71717a]" />
              )}
              <div>
                <p className="font-medium text-sm">{template.name}</p>
                <p className="text-xs text-[#71717a] capitalize">{template.type}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{selectedTemplate.name}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                  showPreview
                    ? 'bg-[#4cbb17] text-black'
                    : 'bg-[#27272a] text-white hover:bg-[#3f3f46]'
                )}
              >
                {showPreview ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'Edit' : 'Preview'}
              </button>
            </div>
          </div>

          {/* Subject (for email) */}
          {selectedTemplate.type === 'email' && (
            <div>
              <label className="block text-sm text-[#71717a] mb-2">Subject</label>
              {showPreview ? (
                <p className="px-4 py-3 bg-[#0f0f0f] border border-[#27272a] rounded-lg">
                  {getPreviewContent(editedSubject)}
                </p>
              ) : (
                <input
                  type="text"
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                />
              )}
            </div>
          )}

          {/* Body */}
          <div>
            <label className="block text-sm text-[#71717a] mb-2">Body</label>
            {showPreview ? (
              <div className="px-4 py-3 bg-[#0f0f0f] border border-[#27272a] rounded-lg whitespace-pre-wrap min-h-[300px]">
                {getPreviewContent(editedBody)}
              </div>
            ) : (
              <textarea
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] resize-none font-mono text-sm"
              />
            )}
          </div>

          {/* Available Variables */}
          <div>
            <label className="block text-sm text-[#71717a] mb-2">Available Variables</label>
            <div className="flex flex-wrap gap-2">
              {selectedTemplate.variables.map((variable) => (
                <button
                  key={variable}
                  onClick={() => {
                    if (!showPreview) {
                      navigator.clipboard.writeText(`{{${variable}}}`)
                      toast.success(`Copied {{${variable}}}`)
                    }
                  }}
                  className="px-2 py-1 bg-[#27272a] rounded text-xs font-mono hover:bg-[#3f3f46] transition-colors"
                >
                  {`{{${variable}}}`}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-[#27272a]">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-medium rounded-lg hover:bg-[#60e421] transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
