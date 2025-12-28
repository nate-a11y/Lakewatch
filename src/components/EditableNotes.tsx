'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface EditableNotesProps {
  initialNotes: string
  title?: string
  placeholder?: string
  onSave?: (notes: string) => Promise<void>
}

export default function EditableNotes({
  initialNotes,
  title = 'Notes',
  placeholder = 'Add notes here...',
  onSave,
}: EditableNotesProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState(initialNotes)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (onSave) {
        await onSave(notes)
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      toast.success('Notes saved')
      setIsEditing(false)
    } catch {
      toast.error('Failed to save notes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setNotes(initialNotes)
    setIsEditing(false)
  }

  return (
    <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-[#4cbb17] hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder={placeholder}
            className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] resize-none text-sm"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 py-2 text-sm border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm bg-[#4cbb17] text-black font-medium rounded-lg hover:bg-[#60e421] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#a1a1aa]">
          {notes || <span className="italic text-[#71717a]">No notes yet</span>}
        </p>
      )}
    </section>
  )
}
