'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Users,
  Building2,
  ClipboardCheck,
  Calendar,
  FileText,
  Settings,
  CreditCard,
  MessageSquare,
  BarChart,
  Wrench,
  Plus,
  ArrowRight,
  Command,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  title: string
  description?: string
  icon: React.ReactNode
  action: () => void
  category: 'navigation' | 'quick-actions' | 'search-results'
  keywords?: string[]
}

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Navigation commands
  const navigationCommands: CommandItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Go to admin dashboard',
      icon: <BarChart className="w-4 h-4" />,
      action: () => router.push('/manage'),
      category: 'navigation',
      keywords: ['home', 'main', 'overview'],
    },
    {
      id: 'customers',
      title: 'Customers',
      description: 'View all customers',
      icon: <Users className="w-4 h-4" />,
      action: () => router.push('/manage/customers'),
      category: 'navigation',
      keywords: ['clients', 'users', 'accounts'],
    },
    {
      id: 'properties',
      title: 'Properties',
      description: 'Manage properties',
      icon: <Building2 className="w-4 h-4" />,
      action: () => router.push('/manage/properties'),
      category: 'navigation',
      keywords: ['homes', 'houses', 'locations'],
    },
    {
      id: 'schedule',
      title: 'Schedule',
      description: 'View inspection schedule',
      icon: <Calendar className="w-4 h-4" />,
      action: () => router.push('/manage/schedule'),
      category: 'navigation',
      keywords: ['calendar', 'appointments', 'dates'],
    },
    {
      id: 'inspections',
      title: 'Inspections',
      description: 'All inspection reports',
      icon: <ClipboardCheck className="w-4 h-4" />,
      action: () => router.push('/manage/inspections'),
      category: 'navigation',
      keywords: ['reports', 'checks'],
    },
    {
      id: 'requests',
      title: 'Service Requests',
      description: 'Manage service requests',
      icon: <Wrench className="w-4 h-4" />,
      action: () => router.push('/manage/requests'),
      category: 'navigation',
      keywords: ['maintenance', 'services', 'tasks'],
    },
    {
      id: 'invoices',
      title: 'Invoices',
      description: 'Billing and payments',
      icon: <CreditCard className="w-4 h-4" />,
      action: () => router.push('/manage/invoices'),
      category: 'navigation',
      keywords: ['billing', 'payments', 'money'],
    },
    {
      id: 'messages',
      title: 'Messages',
      description: 'Customer messages',
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => router.push('/manage/messages'),
      category: 'navigation',
      keywords: ['inbox', 'communication', 'chat'],
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'Analytics and reports',
      icon: <FileText className="w-4 h-4" />,
      action: () => router.push('/manage/reports'),
      category: 'navigation',
      keywords: ['analytics', 'data', 'metrics'],
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'System settings',
      icon: <Settings className="w-4 h-4" />,
      action: () => router.push('/manage/settings'),
      category: 'navigation',
      keywords: ['preferences', 'config', 'options'],
    },
  ]

  // Quick action commands
  const quickActionCommands: CommandItem[] = [
    {
      id: 'new-customer',
      title: 'New Customer',
      description: 'Add a new customer',
      icon: <Plus className="w-4 h-4" />,
      action: () => router.push('/manage/customers/new'),
      category: 'quick-actions',
      keywords: ['add', 'create', 'customer'],
    },
    {
      id: 'new-property',
      title: 'New Property',
      description: 'Add a new property',
      icon: <Plus className="w-4 h-4" />,
      action: () => router.push('/manage/properties/new'),
      category: 'quick-actions',
      keywords: ['add', 'create', 'property'],
    },
    {
      id: 'new-inspection',
      title: 'Schedule Inspection',
      description: 'Schedule a new inspection',
      icon: <Plus className="w-4 h-4" />,
      action: () => router.push('/manage/schedule/new'),
      category: 'quick-actions',
      keywords: ['add', 'create', 'schedule'],
    },
    {
      id: 'new-invoice',
      title: 'Create Invoice',
      description: 'Create a new invoice',
      icon: <Plus className="w-4 h-4" />,
      action: () => router.push('/manage/invoices/new'),
      category: 'quick-actions',
      keywords: ['add', 'bill', 'charge'],
    },
  ]

  const allCommands = [...navigationCommands, ...quickActionCommands]

  // Filter commands based on query
  const filteredCommands = query.trim()
    ? allCommands.filter(cmd => {
        const searchTerms = [
          cmd.title.toLowerCase(),
          cmd.description?.toLowerCase() || '',
          ...(cmd.keywords || []),
        ].join(' ')
        return query.toLowerCase().split(' ').every(term =>
          searchTerms.includes(term)
        )
      })
    : allCommands

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = []
    }
    acc[cmd.category].push(cmd)
    return acc
  }, {} as Record<string, CommandItem[]>)

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }

      // Also open with /
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      setSelectedIndex(0)
    } else {
      setQuery('')
    }
  }, [open])

  // Handle keyboard navigation within palette
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const flatCommands = Object.values(groupedCommands).flat()

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % flatCommands.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + flatCommands.length) % flatCommands.length)
        break
      case 'Enter':
        e.preventDefault()
        if (flatCommands[selectedIndex]) {
          flatCommands[selectedIndex].action()
          setOpen(false)
        }
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        break
    }
  }, [groupedCommands, selectedIndex])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector('[data-selected="true"]')
      selected?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'navigation':
        return 'Navigation'
      case 'quick-actions':
        return 'Quick Actions'
      case 'search-results':
        return 'Search Results'
      default:
        return category
    }
  }

  if (!open) {
    return null
  }

  let flatIndex = -1

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div className="absolute left-1/2 top-24 w-full max-w-lg -translate-x-1/2">
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#27272a]">
            <Search className="w-5 h-5 text-[#71717a]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelectedIndex(0)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-white placeholder-[#71717a] focus:outline-none"
            />
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-[#27272a] rounded text-xs text-[#71717a]">
              esc
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
            {Object.entries(groupedCommands).map(([category, commands]) => (
              <div key={category}>
                <p className="px-4 py-2 text-xs font-medium text-[#71717a] uppercase tracking-wider">
                  {getCategoryLabel(category)}
                </p>
                {commands.map((cmd) => {
                  flatIndex++
                  const isSelected = flatIndex === selectedIndex

                  return (
                    <button
                      key={cmd.id}
                      data-selected={isSelected}
                      onClick={() => {
                        cmd.action()
                        setOpen(false)
                      }}
                      className={cn(
                        "flex items-center gap-3 w-full px-4 py-2 text-left transition-colors",
                        isSelected
                          ? "bg-[#4cbb17]/10 text-white"
                          : "text-[#a1a1aa] hover:bg-[#27272a] hover:text-white"
                      )}
                    >
                      <span className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        isSelected ? "bg-[#4cbb17]/20 text-[#4cbb17]" : "bg-[#27272a]"
                      )}>
                        {cmd.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{cmd.title}</p>
                        {cmd.description && (
                          <p className="text-xs text-[#71717a] truncate">{cmd.description}</p>
                        )}
                      </div>
                      {isSelected && (
                        <ArrowRight className="w-4 h-4 text-[#4cbb17]" />
                      )}
                    </button>
                  )
                })}
              </div>
            ))}

            {filteredCommands.length === 0 && (
              <div className="px-4 py-8 text-center">
                <Search className="w-8 h-8 text-[#27272a] mx-auto mb-2" />
                <p className="text-sm text-[#71717a]">No results for &quot;{query}&quot;</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-[#27272a] text-xs text-[#71717a]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[#27272a] rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-[#27272a] rounded">↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[#27272a] rounded">↵</kbd>
                select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Command className="w-3 h-3" />
              <span>K to open</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
