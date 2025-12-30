'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, LogOut, Settings, User, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'
import { NotificationsDropdown } from '@/components/shared/NotificationsDropdown'

interface AdminHeaderProps {
  user: {
    email: string
    firstName: string
    lastName: string
    role: string
  }
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fullName = `${user.firstName} ${user.lastName}`.trim() || user.email
  const initials = getInitials(fullName)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 bg-[#060606]/80 backdrop-blur-lg border-b border-[#27272a]">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        <div className="lg:hidden w-10" />

        {/* Role badge */}
        <div className="hidden lg:flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#4cbb17]" />
          <span className="text-sm text-[#71717a] capitalize">{user.role} Dashboard</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <NotificationsDropdown portal="admin" />

          {/* User menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#27272a] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#4cbb17]/20 flex items-center justify-center text-sm font-medium text-[#4cbb17]">
                {initials}
              </div>
              <span className="hidden sm:block text-sm font-medium">{fullName}</span>
              <ChevronDown className="w-4 h-4 text-[#71717a]" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0f0f0f] border border-[#27272a] rounded-lg shadow-xl py-1">
                <div className="px-4 py-3 border-b border-[#27272a]">
                  <p className="text-sm font-medium">{fullName}</p>
                  <p className="text-xs text-[#71717a]">{user.email}</p>
                  <p className="text-xs text-[#4cbb17] capitalize mt-1">{user.role}</p>
                </div>
                <Link
                  href="/manage/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <Link
                  href="/portal?viewAs=customer"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors"
                >
                  <User className="w-4 h-4" />
                  Customer View
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-[#27272a] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
