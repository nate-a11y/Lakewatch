'use client'

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-[#27272a] flex items-center justify-center mb-4">
        <Icon size={32} className="text-[#4cbb17]" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 max-w-sm mb-6">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold bg-[#4cbb17] text-[#060606] rounded-lg hover:bg-[#60e421] active:scale-[0.98] transition-all duration-200"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
