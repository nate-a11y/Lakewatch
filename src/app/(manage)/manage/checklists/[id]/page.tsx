'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  CheckSquare,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Loader2,
  Building2,
} from 'lucide-react'
import { toast } from 'sonner'

interface ChecklistItem {
  id: string
  text: string
  category: string
  required: boolean
}

interface Checklist {
  id: string
  name: string
  description: string
  plan: 'Premium' | 'Standard' | 'Basic' | 'Custom'
  items: ChecklistItem[]
  usedBy: number
  lastUpdated: string
}

export default function ChecklistDetailPage() {
  const params = useParams()
  const [isSaving, setIsSaving] = useState(false)

  // Mock checklist data based on ID
  const checklistsData: Record<string, Checklist> = {
    '1': {
      id: '1',
      name: 'Premium Weekly Inspection',
      description: 'Comprehensive weekly inspection for premium plan properties',
      plan: 'Premium',
      items: [
        { id: '1', text: 'Check exterior doors and locks', category: 'Security', required: true },
        { id: '2', text: 'Inspect windows for damage', category: 'Exterior', required: true },
        { id: '3', text: 'Test smoke detectors', category: 'Safety', required: true },
        { id: '4', text: 'Check HVAC system operation', category: 'HVAC', required: true },
        { id: '5', text: 'Inspect water heater', category: 'Plumbing', required: true },
        { id: '6', text: 'Check for water leaks', category: 'Plumbing', required: true },
        { id: '7', text: 'Inspect roof for damage', category: 'Exterior', required: false },
        { id: '8', text: 'Check gutters and downspouts', category: 'Exterior', required: false },
        { id: '9', text: 'Test sump pump', category: 'Plumbing', required: false },
        { id: '10', text: 'Check dock condition', category: 'Waterfront', required: true },
        { id: '11', text: 'Inspect boat lift', category: 'Waterfront', required: false },
        { id: '12', text: 'Check seawall integrity', category: 'Waterfront', required: false },
      ],
      usedBy: 5,
      lastUpdated: 'Dec 15, 2025',
    },
    '2': {
      id: '2',
      name: 'Standard Bi-Weekly Inspection',
      description: 'Standard inspection checklist for bi-weekly visits',
      plan: 'Standard',
      items: [
        { id: '1', text: 'Check exterior doors and locks', category: 'Security', required: true },
        { id: '2', text: 'Inspect windows for damage', category: 'Exterior', required: true },
        { id: '3', text: 'Test smoke detectors', category: 'Safety', required: true },
        { id: '4', text: 'Check HVAC system operation', category: 'HVAC', required: true },
        { id: '5', text: 'Check for water leaks', category: 'Plumbing', required: true },
        { id: '6', text: 'Check dock condition', category: 'Waterfront', required: false },
      ],
      usedBy: 8,
      lastUpdated: 'Dec 10, 2025',
    },
    '3': {
      id: '3',
      name: 'Basic Monthly Inspection',
      description: 'Essential checks for monthly inspection visits',
      plan: 'Basic',
      items: [
        { id: '1', text: 'Check exterior doors and locks', category: 'Security', required: true },
        { id: '2', text: 'Test smoke detectors', category: 'Safety', required: true },
        { id: '3', text: 'Check for water leaks', category: 'Plumbing', required: true },
        { id: '4', text: 'Check HVAC system operation', category: 'HVAC', required: true },
      ],
      usedBy: 4,
      lastUpdated: 'Dec 5, 2025',
    },
    '4': {
      id: '4',
      name: 'Winterization Checklist',
      description: 'Seasonal checklist for preparing properties for winter',
      plan: 'Custom',
      items: [
        { id: '1', text: 'Drain outdoor water lines', category: 'Plumbing', required: true },
        { id: '2', text: 'Winterize irrigation system', category: 'Exterior', required: true },
        { id: '3', text: 'Check insulation', category: 'HVAC', required: true },
        { id: '4', text: 'Set thermostat to winter mode', category: 'HVAC', required: true },
        { id: '5', text: 'Cover outdoor furniture', category: 'Exterior', required: false },
        { id: '6', text: 'Store dock equipment', category: 'Waterfront', required: false },
      ],
      usedBy: 12,
      lastUpdated: 'Nov 1, 2025',
    },
    '5': {
      id: '5',
      name: 'Storm Damage Assessment',
      description: 'Emergency checklist for post-storm property assessment',
      plan: 'Custom',
      items: [
        { id: '1', text: 'Check roof for damage', category: 'Exterior', required: true },
        { id: '2', text: 'Inspect siding and windows', category: 'Exterior', required: true },
        { id: '3', text: 'Check for fallen trees/debris', category: 'Exterior', required: true },
        { id: '4', text: 'Inspect dock and seawall', category: 'Waterfront', required: true },
        { id: '5', text: 'Check for water intrusion', category: 'Interior', required: true },
      ],
      usedBy: 0,
      lastUpdated: 'Oct 20, 2025',
    },
  }

  const checklist = checklistsData[params.id as string]

  const [items, setItems] = useState<ChecklistItem[]>(checklist?.items || [])
  const [name, setName] = useState(checklist?.name || '')
  const [description, setDescription] = useState(checklist?.description || '')

  if (!checklist) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <CheckSquare className="w-16 h-16 text-[#27272a] mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Checklist Not Found</h1>
        <p className="text-[#71717a] mb-6">The checklist you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/manage/checklists"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Checklists
        </Link>
      </div>
    )
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

  const categories = [...new Set(items.map(item => item.category))]

  const addItem = () => {
    const newItem: ChecklistItem = {
      id: String(Date.now()),
      text: '',
      category: categories[0] || 'General',
      required: false,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: keyof ChecklistItem, value: string | boolean) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a checklist name')
      return
    }

    if (items.some(item => !item.text.trim())) {
      toast.error('Please fill in all checklist items')
      return
    }

    setIsSaving(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.success('Checklist saved successfully')
    setIsSaving(false)
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

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-2xl lg:text-3xl font-bold bg-transparent focus:outline-none focus:ring-2 focus:ring-[#4cbb17] rounded px-2 -mx-2"
            />
            <span className={`text-xs px-2 py-1 rounded ${getPlanColor(checklist.plan)}`}>
              {checklist.plan}
            </span>
          </div>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            className="text-[#a1a1aa] bg-transparent focus:outline-none w-full"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <p className="text-sm text-[#71717a] mb-1">Items</p>
          <p className="text-2xl font-bold">{items.length}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <p className="text-sm text-[#71717a] mb-1">Required</p>
          <p className="text-2xl font-bold">{items.filter(i => i.required).length}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-[#71717a]" />
            <p className="text-sm text-[#71717a]">Used By</p>
          </div>
          <p className="text-2xl font-bold">{checklist.usedBy} properties</p>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Checklist Items</h2>
          <button
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
                  onClick={() => removeItem(item.id)}
                  className="p-1 text-[#71717a] hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-8">
            <CheckSquare className="w-12 h-12 text-[#27272a] mx-auto mb-3" />
            <p className="text-[#71717a] mb-3">No items in this checklist</p>
            <button
              onClick={addItem}
              className="text-sm text-[#4cbb17] hover:underline"
            >
              + Add your first item
            </button>
          </div>
        )}
      </div>

      {/* Category Summary */}
      <div className="mt-6 bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => {
            const count = items.filter(i => i.category === category).length
            return (
              <span
                key={category}
                className="px-3 py-1 bg-[#27272a] rounded-full text-sm text-[#a1a1aa]"
              >
                {category} ({count})
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
