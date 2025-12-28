'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  MapPin,
  Wrench,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/field', label: 'Today', icon: MapPin },
  { href: '/field/requests', label: 'Requests', icon: Wrench },
  { href: '/field/history', label: 'History', icon: Clock },
]

export default function FieldNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-[#27272a] z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/field' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors',
                isActive
                  ? 'text-[#4cbb17]'
                  : 'text-[#71717a] hover:text-white'
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
