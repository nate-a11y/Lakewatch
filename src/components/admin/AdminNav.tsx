'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  ClipboardCheck,
  ClipboardList,
  FileText,
  UserCog,
  Settings,
  X,
  CheckSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navItems = [
  { href: '/manage', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/manage/customers', icon: Users, label: 'Customers' },
  { href: '/manage/properties', icon: Building2, label: 'Properties' },
  { href: '/manage/schedule', icon: Calendar, label: 'Schedule' },
  { href: '/manage/inspections', icon: ClipboardCheck, label: 'Inspections' },
  { href: '/manage/requests', icon: ClipboardList, label: 'Service Requests' },
  { href: '/manage/invoices', icon: FileText, label: 'Invoices' },
  { href: '/manage/checklists', icon: CheckSquare, label: 'Checklists' },
  { href: '/manage/team', icon: UserCog, label: 'Team' },
  { href: '/manage/settings', icon: Settings, label: 'Settings' },
]

export function AdminNav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-[#0f0f0f] border border-[#27272a]"
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-[#27272a] transform transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-[#27272a]">
            <Link href="/manage" className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#4cbb17]">LWP Admin</span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 rounded hover:bg-[#27272a]"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/manage' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#4cbb17]/10 text-[#4cbb17] border border-[#4cbb17]/20'
                      : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[#27272a]">
            <Link
              href="/portal"
              className="flex items-center gap-2 text-sm text-[#71717a] hover:text-white transition-colors"
            >
              ← Back to Customer Portal
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}
