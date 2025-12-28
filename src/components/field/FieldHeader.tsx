'use client'

import Link from 'next/link'
import { User as UserType } from '@supabase/supabase-js'
import { Bell, User } from 'lucide-react'

interface FieldHeaderProps {
  user: UserType
}

export default function FieldHeader({}: FieldHeaderProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-lg border-b border-[#27272a]">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm text-[#71717a]">{today}</p>
          <h1 className="text-lg font-bold text-[#4cbb17]">Lake Watch Pros</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2 hover:bg-[#27272a] rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#4cbb17] rounded-full" />
          </button>
          <Link
            href="/field/profile"
            className="w-9 h-9 bg-[#4cbb17]/10 rounded-full flex items-center justify-center text-[#4cbb17]"
          >
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  )
}
