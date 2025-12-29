'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, X, Wrench, AlertCircle, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileQuickActionsFAB() {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    {
      label: 'Request Service',
      href: '/portal/requests/new',
      icon: Wrench,
      color: 'bg-[#4cbb17]',
    },
    {
      label: 'Report Issue',
      href: '/portal/requests/new?type=issue',
      icon: AlertCircle,
      color: 'bg-yellow-500',
    },
    {
      label: 'Send Message',
      href: '/portal/messages/new',
      icon: MessageSquare,
      color: 'bg-blue-500',
    },
  ]

  return (
    <div className="fixed bottom-20 right-4 z-40 lg:hidden">
      {/* Action items */}
      <div
        className={cn(
          'absolute bottom-16 right-0 flex flex-col-reverse gap-3 transition-all duration-300',
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        {actions.map((action, index) => (
          <Link
            key={action.label}
            href={action.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              'flex items-center gap-3 pl-4 pr-5 py-3 rounded-full bg-[#1a1a1a] border border-[#27272a] shadow-lg',
              'transition-all duration-300',
              isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
            )}
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
            }}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center',
                action.color
              )}
            >
              <action.icon size={16} className="text-black" />
            </div>
            <span className="text-sm font-medium text-white whitespace-nowrap">
              {action.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Main FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center shadow-lg',
          'transition-all duration-300 active:scale-95',
          isOpen
            ? 'bg-[#27272a] rotate-45'
            : 'bg-[#4cbb17] hover:bg-[#60e421]'
        )}
        aria-label={isOpen ? 'Close quick actions' : 'Open quick actions'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <Plus size={24} className="text-black" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 -z-10"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
