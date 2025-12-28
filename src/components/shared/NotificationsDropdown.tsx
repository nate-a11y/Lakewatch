'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Bell,
  AlertTriangle,
  MessageSquare,
  ClipboardCheck,
  Wrench,
  Calendar,
  Check,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'alert' | 'message' | 'inspection' | 'service' | 'reminder'
  title: string
  description: string
  time: string
  read: boolean
  link?: string
}

interface NotificationsDropdownProps {
  portal: 'admin' | 'field' | 'portal'
}

export function NotificationsDropdown({ portal }: NotificationsDropdownProps) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Mock notifications based on portal type
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (portal === 'admin') {
      return [
        {
          id: '1',
          type: 'alert',
          title: 'Overdue Invoice',
          description: 'Johnson property - $450 overdue by 5 days',
          time: '10 min ago',
          read: false,
          link: '/manage/invoices',
        },
        {
          id: '2',
          type: 'service',
          title: 'New Service Request',
          description: 'Lake House - Emergency HVAC repair needed',
          time: '1 hour ago',
          read: false,
          link: '/manage/requests',
        },
        {
          id: '3',
          type: 'inspection',
          title: 'Inspection Completed',
          description: 'Guest Cabin inspection by Mike T.',
          time: '2 hours ago',
          read: true,
          link: '/manage/inspections',
        },
      ]
    } else if (portal === 'field') {
      return [
        {
          id: '1',
          type: 'reminder',
          title: 'Upcoming Inspection',
          description: 'Sunset Cove at 2:00 PM today',
          time: '30 min',
          read: false,
          link: '/field',
        },
        {
          id: '2',
          type: 'service',
          title: 'New Service Assigned',
          description: 'Gutter cleaning at Lake House',
          time: '1 hour ago',
          read: false,
          link: '/field/requests',
        },
        {
          id: '3',
          type: 'message',
          title: 'Message from Admin',
          description: 'Updated access code for Marina View',
          time: '3 hours ago',
          read: true,
        },
      ]
    } else {
      return [
        {
          id: '1',
          type: 'inspection',
          title: 'Inspection Complete',
          description: 'Your Lake House inspection is ready to view',
          time: '2 hours ago',
          read: false,
          link: '/portal/reports',
        },
        {
          id: '2',
          type: 'message',
          title: 'New Message',
          description: 'Response from Lake Watch Pros support',
          time: '1 day ago',
          read: false,
          link: '/portal/messages',
        },
        {
          id: '3',
          type: 'reminder',
          title: 'Upcoming Inspection',
          description: 'Guest Cabin scheduled for Dec 30',
          time: '2 days ago',
          read: true,
        },
      ]
    }
  })

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'message':
        return <MessageSquare className="w-4 h-4 text-blue-500" />
      case 'inspection':
        return <ClipboardCheck className="w-4 h-4 text-[#4cbb17]" />
      case 'service':
        return <Wrench className="w-4 h-4 text-yellow-500" />
      case 'reminder':
        return <Calendar className="w-4 h-4 text-purple-500" />
    }
  }

  const notificationsLink = portal === 'admin' ? '/manage/notifications' :
    portal === 'field' ? '/field/notifications' : '/portal/notifications'

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-[#27272a] transition-colors"
        aria-label="Notifications"
      >
        <Bell className={cn(
          "w-5 h-5",
          portal === 'field' ? 'text-white' : 'text-[#a1a1aa]'
        )} />
        {unreadCount > 0 && (
          <span className={cn(
            "absolute top-1.5 right-1.5 min-w-[8px] h-2 rounded-full",
            portal === 'admin' ? 'bg-red-500' : 'bg-[#4cbb17]'
          )} />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-[#0f0f0f] border border-[#27272a] rounded-xl shadow-xl overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272a]">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[#4cbb17] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <Link
                  key={notification.id}
                  href={notification.link || '#'}
                  onClick={() => {
                    if (!notification.read) {
                      setNotifications(notifications.map(n =>
                        n.id === notification.id ? { ...n, read: true } : n
                      ))
                    }
                    setOpen(false)
                  }}
                  className={cn(
                    "flex gap-3 px-4 py-3 hover:bg-[#27272a] transition-colors border-b border-[#27272a] last:border-0",
                    !notification.read && "bg-[#4cbb17]/5"
                  )}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        "text-sm truncate",
                        !notification.read && "font-medium"
                      )}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <button
                          onClick={(e) => markAsRead(notification.id, e)}
                          className="flex-shrink-0 p-1 hover:bg-[#3f3f46] rounded transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-3 h-3 text-[#71717a]" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-[#71717a] truncate">
                      {notification.description}
                    </p>
                    <p className="text-xs text-[#4f4f4f] mt-1">
                      {notification.time}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-[#27272a] mx-auto mb-2" />
                <p className="text-sm text-[#71717a]">No notifications</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <Link
              href={notificationsLink}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-center text-sm text-[#4cbb17] hover:bg-[#27272a] border-t border-[#27272a] transition-colors"
            >
              View all notifications
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
