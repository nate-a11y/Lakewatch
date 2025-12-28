'use client'

import { toast } from 'sonner'

interface ActionButtonProps {
  label: string
  message?: string
  className?: string
}

export default function ActionButton({
  label,
  message,
  className = 'text-sm text-[#4cbb17] hover:underline',
}: ActionButtonProps) {
  return (
    <button
      onClick={() => toast.success(message || `${label} coming soon`)}
      className={className}
    >
      {label}
    </button>
  )
}
