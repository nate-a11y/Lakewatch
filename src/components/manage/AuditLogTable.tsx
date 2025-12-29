'use client'

import { useState } from 'react'
import {
  FileText,
  User,
  Eye,
  Edit,
  Trash2,
  Settings,
  UserPlus,
  Search,
  Filter,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuditLogEntry {
  id: string
  action: string
  actionType: 'create' | 'update' | 'delete' | 'view' | 'login' | 'settings'
  resource: string
  resourceId?: string
  details?: string
  userId: string
  userName: string
  userEmail: string
  ipAddress?: string
  createdAt: string
}

interface AuditLogTableProps {
  entries?: AuditLogEntry[]
  className?: string
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  create: <UserPlus className="w-4 h-4" />,
  update: <Edit className="w-4 h-4" />,
  delete: <Trash2 className="w-4 h-4" />,
  view: <Eye className="w-4 h-4" />,
  login: <User className="w-4 h-4" />,
  settings: <Settings className="w-4 h-4" />,
}

const ACTION_COLORS: Record<string, string> = {
  create: 'text-green-500 bg-green-500/10',
  update: 'text-blue-500 bg-blue-500/10',
  delete: 'text-red-500 bg-red-500/10',
  view: 'text-[#71717a] bg-[#27272a]',
  login: 'text-[#4cbb17] bg-[#4cbb17]/10',
  settings: 'text-yellow-500 bg-yellow-500/10',
}

export function AuditLogTable({ entries = [], className }: AuditLogTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      searchQuery === '' ||
      entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.resource.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filterType === 'all' || entry.actionType === filterType

    return matchesSearch && matchesType
  })

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div className={cn('', className)}>
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0f0f0f] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 border border-[#27272a] rounded-lg transition-colors',
            showFilters ? 'bg-[#27272a]' : 'hover:bg-[#27272a]'
          )}
        >
          <Filter className="w-4 h-4" />
          Filter
          <ChevronDown className={cn('w-4 h-4 transition-transform', showFilters && 'rotate-180')} />
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-6 p-4 bg-[#0f0f0f] border border-[#27272a] rounded-lg">
          {['all', 'create', 'update', 'delete', 'view', 'login', 'settings'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm capitalize transition-colors',
                filterType === type
                  ? 'bg-[#4cbb17] text-black'
                  : 'bg-[#27272a] text-[#a1a1aa] hover:text-white'
              )}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {/* Log entries */}
      <div className="space-y-2">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-[#71717a]">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No audit log entries found</p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-4 p-4 bg-[#0f0f0f] border border-[#27272a] rounded-lg hover:border-[#4cbb17]/30 transition-colors"
            >
              <span
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  ACTION_COLORS[entry.actionType]
                )}
              >
                {ACTION_ICONS[entry.actionType]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{entry.action}</p>
                <p className="text-sm text-[#71717a] mt-0.5">
                  {entry.resource}
                  {entry.resourceId && (
                    <span className="text-[#4cbb17]"> #{entry.resourceId}</span>
                  )}
                </p>
                {entry.details && (
                  <p className="text-sm text-[#71717a] mt-1">{entry.details}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-[#71717a]">
                  <span>{entry.userName}</span>
                  {entry.ipAddress && <span>IP: {entry.ipAddress}</span>}
                </div>
              </div>
              <div className="text-right text-sm text-[#71717a] flex-shrink-0">
                <p>{formatDate(entry.createdAt)}</p>
                <p className="text-xs">{formatTime(entry.createdAt)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
