'use client'

import { useState } from 'react'
import { Plus, Pin, PinOff, Trash2, Clock, User, Tag, Star, AlertCircle, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface InternalNote {
  id: string
  content: string
  createdAt: string
  createdBy: string
  isPinned: boolean
  tags: string[]
}

interface InternalNotesTabProps {
  customerId: string
  initialNotes?: InternalNote[]
  customerTags?: string[]
  className?: string
}

const TAG_OPTIONS = [
  { value: 'vip', label: 'VIP', icon: Star, color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  { value: 'referral', label: 'Referral Source', icon: Heart, color: 'bg-pink-500/10 text-pink-500 border-pink-500/20' },
  { value: 'difficult', label: 'Difficult', icon: AlertCircle, color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  { value: 'late-payer', label: 'Late Payer', icon: Clock, color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
]

export function InternalNotesTab({
  initialNotes = [],
  customerTags = [],
  className,
}: InternalNotesTabProps) {
  const [notes, setNotes] = useState<InternalNote[]>(initialNotes)
  const [tags, setTags] = useState<string[]>(customerTags)
  const [newNote, setNewNote] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    const note: InternalNote = {
      id: `note-${Date.now()}`,
      content: newNote.trim(),
      createdAt: new Date().toISOString(),
      createdBy: 'Admin', // Would come from auth context
      isPinned: false,
      tags: [],
    }

    setNotes([note, ...notes])
    setNewNote('')
    setIsAdding(false)
    toast.success('Note added')
  }

  const handleTogglePin = (noteId: string) => {
    setNotes(notes.map(n =>
      n.id === noteId ? { ...n, isPinned: !n.isPinned } : n
    ))
  }

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(n => n.id !== noteId))
    toast.success('Note deleted')
  }

  const handleToggleTag = (tagValue: string) => {
    if (tags.includes(tagValue)) {
      setTags(tags.filter(t => t !== tagValue))
    } else {
      setTags([...tags, tagValue])
    }
    toast.success('Tags updated')
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  // Sort notes: pinned first, then by date
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className={cn('space-y-6', className)}>
      {/* Customer Tags */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-[#71717a]" />
          <h4 className="text-sm font-medium">Customer Tags</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((tag) => {
            const isActive = tags.includes(tag.value)
            const Icon = tag.icon
            return (
              <button
                key={tag.value}
                onClick={() => handleToggleTag(tag.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all',
                  isActive
                    ? tag.color
                    : 'border-[#27272a] text-[#71717a] hover:border-[#4cbb17]/50'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tag.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium">Internal Notes</h4>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#4cbb17] text-black rounded-lg hover:bg-[#60e421] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Note
          </button>
        </div>

        {/* Add Note Form */}
        {isAdding && (
          <div className="mb-4 p-4 bg-[#0a0a0a] rounded-lg border border-[#27272a]">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add an internal note about this customer..."
              className="w-full bg-transparent text-sm resize-none focus:outline-none min-h-[80px]"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => {
                  setIsAdding(false)
                  setNewNote('')
                }}
                className="px-3 py-1.5 text-sm text-[#71717a] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="px-3 py-1.5 text-sm bg-[#4cbb17] text-black rounded-lg hover:bg-[#60e421] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save Note
              </button>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-3">
          {sortedNotes.length === 0 ? (
            <p className="text-sm text-[#71717a] text-center py-8">
              No internal notes yet. Click &quot;Add Note&quot; to create one.
            </p>
          ) : (
            sortedNotes.map((note) => (
              <div
                key={note.id}
                className={cn(
                  'p-4 rounded-lg border transition-colors',
                  note.isPinned
                    ? 'bg-[#4cbb17]/5 border-[#4cbb17]/20'
                    : 'bg-[#0a0a0a] border-[#27272a]'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm flex-1 whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePin(note.id)}
                      className={cn(
                        'p-1.5 rounded transition-colors',
                        note.isPinned
                          ? 'text-[#4cbb17] hover:bg-[#4cbb17]/10'
                          : 'text-[#71717a] hover:text-white hover:bg-[#27272a]'
                      )}
                      title={note.isPinned ? 'Unpin' : 'Pin'}
                    >
                      {note.isPinned ? (
                        <PinOff className="w-4 h-4" />
                      ) : (
                        <Pin className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1.5 rounded text-[#71717a] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-[#71717a]">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {note.createdBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(note.createdAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
