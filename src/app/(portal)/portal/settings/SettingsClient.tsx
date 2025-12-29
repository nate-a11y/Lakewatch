'use client'

import { useState } from 'react'
import {
  User, Bell, Shield, Mail, Phone, Save, Camera,
  Check, Download, LogOut, Monitor, Smartphone, Clock,
  Users, Trash2, Plus
} from 'lucide-react'
import { toast } from 'sonner'

interface NotificationSetting {
  type: string
  description: string
  email: boolean
  sms: boolean
  push: boolean
}

interface Session {
  id: string
  device: string
  location: string
  lastActive: string
  isCurrent: boolean
}

interface AuthorizedUser {
  id: string
  name: string
  email: string
  role: 'full' | 'view'
}

interface UserData {
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface SettingsClientProps {
  initialUser: UserData
}

export default function SettingsClient({ initialUser }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)

  const [user, setUser] = useState({
    ...initialUser,
    avatar: null as string | null,
  })

  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    { type: 'Inspection Scheduled', description: 'When a new inspection is scheduled', email: true, sms: false, push: true },
    { type: 'Inspection Complete', description: 'When an inspection is completed', email: true, sms: true, push: true },
    { type: 'Report Ready', description: 'When your inspection report is ready', email: true, sms: true, push: true },
    { type: 'Invoice Sent', description: 'When a new invoice is created', email: true, sms: false, push: false },
    { type: 'Payment Received', description: 'When a payment is processed', email: true, sms: false, push: false },
    { type: 'Service Request Updates', description: 'Status changes on your requests', email: true, sms: false, push: true },
    { type: 'New Messages', description: 'When you receive a message', email: true, sms: false, push: true },
  ])

  const [quietHours, setQuietHours] = useState({
    enabled: false,
    start: '22:00',
    end: '07:00',
  })

  const [sessions, setSessions] = useState<Session[]>([
    { id: '1', device: 'Current Browser', location: 'Current Session', lastActive: 'Now', isCurrent: true },
  ])

  const [authorizedUsers, setAuthorizedUsers] = useState<AuthorizedUser[]>([])

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          notificationEmail: notifications.some(n => n.email),
          notificationSms: notifications.some(n => n.sms),
          notificationPush: notifications.some(n => n.push),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save settings')
      }

      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleNotification = (index: number, channel: 'email' | 'sms' | 'push') => {
    setNotifications(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [channel]: !updated[index][channel] }
      return updated
    })
  }

  const handleLogoutSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    toast.success('Session terminated')
  }

  const handleLogoutAllSessions = () => {
    toast.success('All other sessions have been logged out')
  }

  const handleRemoveAuthorizedUser = (userId: string) => {
    setAuthorizedUsers(prev => prev.filter(u => u.id !== userId))
    toast.success('User access removed')
  }

  const handleExportData = () => {
    toast.info('Preparing your data export...', {
      description: 'You will receive an email when it is ready.',
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Settings</h1>
        <p className="text-[#a1a1aa]">
          Manage your account preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-[#0f0f0f] p-1 rounded-lg border border-[#27272a] w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#27272a] text-white'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-6">Profile Information</h2>

            {/* Avatar Upload */}
            <div className="flex items-center gap-6 mb-8 pb-6 border-b border-[#27272a]">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-[#27272a] flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-[#71717a]">
                      {user.firstName[0] || ''}{user.lastName[0] || ''}
                    </span>
                  )}
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#4cbb17] text-black rounded-full flex items-center justify-center hover:bg-[#60e421] transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-[#71717a]">Customer</p>
              </div>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    value={user.firstName}
                    onChange={(e) => setUser(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    value={user.lastName}
                    onChange={(e) => setUser(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
                  <input
                    type="tel"
                    value={user.phone}
                    onChange={(e) => setUser(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Authorized Users */}
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Authorized Users</h2>
                <p className="text-sm text-[#71717a]">People who can access your account</p>
              </div>
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors">
                <Plus className="w-4 h-4" />
                Invite
              </button>
            </div>

            <div className="space-y-3">
              {authorizedUsers.length === 0 ? (
                <p className="text-[#71717a] text-sm py-4">No authorized users yet</p>
              ) : (
                authorizedUsers.map((authUser) => (
                  <div key={authUser.id} className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-[#27272a]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#27272a] flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#71717a]" />
                      </div>
                      <div>
                        <p className="font-medium">{authUser.name}</p>
                        <p className="text-sm text-[#71717a]">{authUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        authUser.role === 'full' ? 'bg-[#4cbb17]/10 text-[#4cbb17]' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {authUser.role === 'full' ? 'Full Access' : 'View Only'}
                      </span>
                      <button
                        onClick={() => handleRemoveAuthorizedUser(authUser.id)}
                        className="p-2 text-[#71717a] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-2">Notification Preferences</h2>
            <p className="text-sm text-[#71717a] mb-6">Choose how you want to be notified</p>

            {/* Notification Matrix */}
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-[#27272a]">
                    <th className="text-left py-3 font-medium">Notification Type</th>
                    <th className="text-center py-3 font-medium w-20">
                      <div className="flex flex-col items-center">
                        <Mail className="w-4 h-4 mb-1" />
                        <span className="text-xs">Email</span>
                      </div>
                    </th>
                    <th className="text-center py-3 font-medium w-20">
                      <div className="flex flex-col items-center">
                        <Smartphone className="w-4 h-4 mb-1" />
                        <span className="text-xs">SMS</span>
                      </div>
                    </th>
                    <th className="text-center py-3 font-medium w-20">
                      <div className="flex flex-col items-center">
                        <Bell className="w-4 h-4 mb-1" />
                        <span className="text-xs">Push</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notification, index) => (
                    <tr key={notification.type} className="border-b border-[#27272a] last:border-0">
                      <td className="py-4">
                        <p className="font-medium text-sm">{notification.type}</p>
                        <p className="text-xs text-[#71717a]">{notification.description}</p>
                      </td>
                      <td className="text-center py-4">
                        <button
                          onClick={() => toggleNotification(index, 'email')}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            notification.email ? 'bg-[#4cbb17] text-black' : 'bg-[#27272a] text-[#71717a]'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="text-center py-4">
                        <button
                          onClick={() => toggleNotification(index, 'sms')}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            notification.sms ? 'bg-[#4cbb17] text-black' : 'bg-[#27272a] text-[#71717a]'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="text-center py-4">
                        <button
                          onClick={() => toggleNotification(index, 'push')}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            notification.push ? 'bg-[#4cbb17] text-black' : 'bg-[#27272a] text-[#71717a]'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              Save Preferences
            </button>
          </div>

          {/* Quiet Hours */}
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Quiet Hours</h2>
                <p className="text-sm text-[#71717a]">Pause notifications during specific times</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={quietHours.enabled}
                  onChange={(e) => setQuietHours(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#27272a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4cbb17]"></div>
              </label>
            </div>

            {quietHours.enabled && (
              <div className="flex items-center gap-4 pt-4 border-t border-[#27272a]">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#71717a]" />
                  <span className="text-sm text-[#71717a]">From</span>
                  <input
                    type="time"
                    value={quietHours.start}
                    onChange={(e) => setQuietHours(prev => ({ ...prev, start: e.target.value }))}
                    className="px-3 py-2 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#71717a]">to</span>
                  <input
                    type="time"
                    value={quietHours.end}
                    onChange={(e) => setQuietHours(prev => ({ ...prev, end: e.target.value }))}
                    className="px-3 py-2 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-6">Change Password</h2>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success('Password updated'); }}>
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] transition-colors"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
              >
                Update Password
              </button>
            </form>
          </div>

          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Two-Factor Authentication</h2>
            <p className="text-[#a1a1aa] mb-4">
              Add an extra layer of security to your account by enabling two-factor authentication.
            </p>
            <button className="px-4 py-2.5 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors">
              Enable 2FA
            </button>
          </div>

          {/* Active Sessions */}
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Active Sessions</h2>
                <p className="text-sm text-[#71717a]">Devices where you are logged in</p>
              </div>
              <button
                onClick={handleLogoutAllSessions}
                className="text-sm text-red-400 hover:underline"
              >
                Log out all devices
              </button>
            </div>

            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-[#27272a]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#27272a] flex items-center justify-center">
                      {session.device.includes('iPhone') ? (
                        <Smartphone className="w-5 h-5 text-[#71717a]" />
                      ) : (
                        <Monitor className="w-5 h-5 text-[#71717a]" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{session.device}</p>
                      <p className="text-xs text-[#71717a]">{session.location} • {session.lastActive}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {session.isCurrent ? (
                      <span className="text-xs bg-[#4cbb17]/10 text-[#4cbb17] px-2 py-1 rounded">
                        Current
                      </span>
                    ) : (
                      <button
                        onClick={() => handleLogoutSession(session.id)}
                        className="p-2 text-[#71717a] hover:text-red-400 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data & Privacy */}
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Data & Privacy</h2>
            <p className="text-[#a1a1aa] mb-4">
              Download a copy of your data or delete your account permanently.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleExportData}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
              >
                <Download className="w-4 h-4" />
                Export My Data
              </button>
            </div>
          </div>

          <div className="bg-[#0f0f0f] border border-red-500/20 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-red-500">Danger Zone</h2>
            <p className="text-[#a1a1aa] mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="px-4 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
