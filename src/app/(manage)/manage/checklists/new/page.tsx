'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CheckSquare,
  Plus,
  Trash2,
  GripVertical,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

interface ChecklistItem {
  id: string
  text: string
  category: string
  required: boolean
}

export default function NewChecklistPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const itemIdCounter = useRef(0)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    plan: 'Custom',
  })

  const [items, setItems] = useState<ChecklistItem[]>([
    { id: '1', text: '', category: 'General', required: false },
  ])

  const plans = [
    { value: 'Premium', label: 'Premium' },
    { value: 'Standard', label: 'Standard' },
    { value: 'Basic', label: 'Basic' },
    { value: 'Custom', label: 'Custom' },
  ]

  const addItem = () => {
    itemIdCounter.current += 1
    const newItem: ChecklistItem = {
      id: `new-${itemIdCounter.current}`,
      text: '',
      category: 'General',
      required: false,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof ChecklistItem, value: string | boolean) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Please enter a checklist name')
      return
    }

    if (items.some(item => !item.text.trim())) {
      toast.error('Please fill in all checklist items')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          planType: formData.plan,
          items: items.filter(item => item.text.trim()),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create checklist')
      }

      toast.success('Checklist created successfully')
      router.push('/manage/checklists')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create checklist')
      setIsSubmitting(false)
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Premium':
        return 'bg-purple-500/10 text-purple-400'
      case 'Standard':
        return 'bg-blue-500/10 text-blue-400'
      case 'Basic':
        return 'bg-[#27272a] text-[#a1a1aa]'
      default:
        return 'bg-[#4cbb17]/10 text-[#4cbb17]'
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/manage/checklists"
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to checklists
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Create Checklist</h1>
        <p className="text-[#a1a1aa]">Create a new inspection checklist template</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#4cbb17]" />
            Checklist Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Premium Weekly Inspection"
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this checklist is for..."
                rows={2}
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Plan Type
              </label>
              <div className="flex flex-wrap gap-2">
                {plans.map(plan => (
                  <button
                    key={plan.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, plan: plan.value })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.plan === plan.value
                        ? getPlanColor(plan.value)
                        : 'bg-[#171717] text-[#71717a] hover:bg-[#27272a]'
                    }`}
                  >
                    {plan.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Checklist Items */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Checklist Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          {/* Headers */}
          <div className="grid grid-cols-12 gap-2 text-xs text-[#71717a] font-medium px-2 mb-2">
            <div className="col-span-1"></div>
            <div className="col-span-5">Item</div>
            <div className="col-span-3">Category</div>
            <div className="col-span-2">Required</div>
            <div className="col-span-1"></div>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 items-center p-2 bg-black/20 rounded-lg"
              >
                <div className="col-span-1 flex items-center justify-center">
                  <GripVertical className="w-4 h-4 text-[#71717a] cursor-move" />
                </div>
                <div className="col-span-5">
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateItem(item.id, 'text', e.target.value)}
                    placeholder="Checklist item..."
                    className="w-full px-3 py-2 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] text-sm"
                  />
                </div>
                <div className="col-span-3">
                  <select
                    value={item.category}
                    onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                    className="w-full px-3 py-2 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] text-sm"
                  >
                    <option value="Security">Security</option>
                    <option value="Exterior">Exterior</option>
                    <option value="Interior">Interior</option>
                    <option value="Safety">Safety</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Waterfront">Waterfront</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div className="col-span-2 flex items-center justify-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.required}
                      onChange={(e) => updateItem(item.id, 'required', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#27272a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4cbb17]"></div>
                  </label>
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="p-1 text-[#71717a] hover:text-red-500 disabled:opacity-30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-[#71717a] mt-4">
            Add all the items you want technicians to check during inspections.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/manage/checklists"
            className="flex-1 px-6 py-3 border border-[#27272a] rounded-lg text-center font-medium hover:bg-[#27272a] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-[#4cbb17] text-black rounded-lg font-semibold hover:bg-[#60e421] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Checklist'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
