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
  FileText,
  CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: number
  notification_type: string
  title: string
  message: string | null
  link: string | null
  read_at: string | null
  created_at: string
}

interface NotificationsDropdownProps {
  portal: 'admin' | 'field' | 'portal'
}

export function NotificationsDropdown({ portal }: NotificationsDropdownProps) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read_at).length

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('lwp_notifications')
        .select('id, notification_type, title, message, link, read_at, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && data) {
        setNotifications(data)
      }
      setLoading(false)
    }

    fetchNotifications()

    // Set up real-time subscription
    const supabase = createClient()
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lwp_notifications',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new as Notification, ...prev].slice(0, 10))
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev =>
              prev.map(n => n.id === (payload.new as Notification).id ? payload.new as Notification : n)
            )
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => prev.filter(n => n.id !== (payload.old as { id: number }).id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = async (id: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const supabase = createClient()
    await supabase
      .from('lwp_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)

    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read_at: new Date().toISOString() } : n
    ))
  }

  const markAllAsRead = async () => {
    const supabase = createClient()
    const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id)

    if (unreadIds.length > 0) {
      await supabase
        .from('lwp_notifications')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadIds)

      setNotifications(notifications.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })))
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
      case 'issue_found':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'message':
        return <MessageSquare className="w-4 h-4 text-blue-500" />
      case 'inspection_scheduled':
      case 'inspection_complete':
        return <ClipboardCheck className="w-4 h-4 text-[#4cbb17]" />
      case 'service_request':
      case 'service_assigned':
        return <Wrench className="w-4 h-4 text-yellow-500" />
      case 'reminder':
        return <Calendar className="w-4 h-4 text-purple-500" />
      case 'invoice':
      case 'payment':
        return <CreditCard className="w-4 h-4 text-green-500" />
      case 'document':
        return <FileText className="w-4 h-4 text-orange-500" />
      default:
        return <Bell className="w-4 h-4 text-[#71717a]" />
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const notificationsLink = portal === 'admin' ? '/manage/notifications' :
    portal === 'field' ? '/field/notifications' : '/portal/notifications'

  // Get the appropriate link prefix based on portal
  const getLinkWithPortal = (link: string | null) => {
    if (!link) return '#'
    // If link already starts with the portal prefix, use as-is
    if (link.startsWith('/manage') || link.startsWith('/field') || link.startsWith('/portal')) {
      return link
    }
    // Otherwise, prepend the appropriate prefix
    const prefix = portal === 'admin' ? '/manage' : portal === 'field' ? '/field' : '/portal'
    return `${prefix}${link}`
  }

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
            {loading ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-[#71717a]">Loading...</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map(notification => (
                <Link
                  key={notification.id}
                  href={getLinkWithPortal(notification.link)}
                  onClick={() => {
                    if (!notification.read_at) {
                      const supabase = createClient()
                      supabase
                        .from('lwp_notifications')
                        .update({ read_at: new Date().toISOString() })
                        .eq('id', notification.id)
                        .then(() => {
                          setNotifications(notifications.map(n =>
                            n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n
                          ))
                        })
                    }
                    setOpen(false)
                  }}
                  className={cn(
                    "flex gap-3 px-4 py-3 hover:bg-[#27272a] transition-colors border-b border-[#27272a] last:border-0",
                    !notification.read_at && "bg-[#4cbb17]/5"
                  )}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center">
                    {getIcon(notification.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        "text-sm truncate",
                        !notification.read_at && "font-medium"
                      )}>
                        {notification.title}
                      </p>
                      {!notification.read_at && (
                        <button
                          onClick={(e) => markAsRead(notification.id, e)}
                          className="flex-shrink-0 p-1 hover:bg-[#3f3f46] rounded transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-3 h-3 text-[#71717a]" />
                        </button>
                      )}
                    </div>
                    {notification.message && (
                      <p className="text-xs text-[#71717a] truncate">
                        {notification.message}
                      </p>
                    )}
                    <p className="text-xs text-[#4f4f4f] mt-1">
                      {formatTime(notification.created_at)}
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
