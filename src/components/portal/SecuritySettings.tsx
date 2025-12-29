'use client'

import { useState } from 'react'
import {
  Key,
  Smartphone,
  Monitor,
  LogOut,
  Clock,
  MapPin,
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Session {
  id: string
  device: string
  browser: string
  location: string
  ipAddress: string
  lastActive: string
  isCurrent: boolean
}

interface LoginHistory {
  id: string
  device: string
  location: string
  ipAddress: string
  timestamp: string
  success: boolean
}

interface SecuritySettingsProps {
  sessions?: Session[]
  loginHistory?: LoginHistory[]
  twoFactorEnabled?: boolean
  className?: string
}

export function SecuritySettings({
  sessions = [],
  loginHistory = [],
  twoFactorEnabled = false,
  className,
}: SecuritySettingsProps) {
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setIsSubmitting(true)
    try {
      // API call would go here
      await new Promise((r) => setTimeout(r, 1000))
      toast.success('Password updated successfully')
      setShowPasswordForm(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      toast.error('Failed to update password')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogoutSession = async (_sessionId: string) => {
    try {
      // API call would go here
      toast.success('Session logged out')
    } catch {
      toast.error('Failed to logout session')
    }
  }

  const handleLogoutAllSessions = async () => {
    try {
      // API call would go here
      toast.success('All other sessions logged out')
    } catch {
      toast.error('Failed to logout sessions')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className={cn('space-y-8', className)}>
      {/* Change Password */}
      <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-[#27272a] flex items-center justify-center">
              <Key className="w-5 h-5 text-[#4cbb17]" />
            </span>
            <div>
              <h3 className="font-semibold">Password</h3>
              <p className="text-sm text-[#71717a]">Change your account password</p>
            </div>
          </div>
          {!showPasswordForm && (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-4 py-2 bg-[#27272a] rounded-lg hover:bg-[#3f3f46] transition-colors"
            >
              Change Password
            </button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="space-y-4 mt-4 pt-4 border-t border-[#27272a]">
            <div className="relative">
              <label className="block text-sm text-[#71717a] mb-2">Current Password</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                required
              />
            </div>
            <div className="relative">
              <label className="block text-sm text-[#71717a] mb-2">New Password</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                required
                minLength={8}
              />
            </div>
            <div className="relative">
              <label className="block text-sm text-[#71717a] mb-2">Confirm New Password</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                required
              />
            </div>
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="flex items-center gap-2 text-sm text-[#71717a] hover:text-white"
            >
              {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPasswords ? 'Hide passwords' : 'Show passwords'}
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className="px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#4cbb17] text-black font-medium rounded-lg hover:bg-[#60e421] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Two-Factor Authentication */}
      <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-[#27272a] flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-[#4cbb17]" />
            </span>
            <div>
              <h3 className="font-semibold">Two-Factor Authentication</h3>
              <p className="text-sm text-[#71717a]">Add an extra layer of security</p>
            </div>
          </div>
          {twoFactorEnabled ? (
            <span className="flex items-center gap-2 px-3 py-1.5 bg-[#4cbb17]/10 text-[#4cbb17] rounded-full text-sm">
              <Check className="w-4 h-4" />
              Enabled
            </span>
          ) : (
            <button
              onClick={() => setShow2FASetup(true)}
              className="px-4 py-2 bg-[#4cbb17] text-black font-medium rounded-lg hover:bg-[#60e421] transition-colors"
            >
              Enable
            </button>
          )}
        </div>

        {show2FASetup && !twoFactorEnabled && (
          <div className="mt-4 pt-4 border-t border-[#27272a]">
            <div className="bg-[#0a0a0a] rounded-lg p-4">
              <h4 className="font-medium mb-2">Set up Two-Factor Authentication</h4>
              <p className="text-sm text-[#71717a] mb-4">
                Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              <div className="flex items-center justify-center bg-white rounded-lg p-4 mb-4 w-fit mx-auto">
                <div className="w-32 h-32 bg-[#0a0a0a] rounded flex items-center justify-center text-xs text-[#71717a]">
                  QR Code Placeholder
                </div>
              </div>
              <p className="text-xs text-[#71717a] text-center mb-4">
                Or enter this code manually: <code className="bg-[#27272a] px-2 py-1 rounded">XXXX-XXXX-XXXX-XXXX</code>
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-[#71717a] mb-2">Enter verification code</label>
                  <input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-2 bg-[#0f0f0f] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] text-center text-lg tracking-widest"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShow2FASetup(false)}
                    className="flex-1 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      toast.success('Two-factor authentication enabled!')
                      setShow2FASetup(false)
                    }}
                    className="flex-1 px-4 py-2 bg-[#4cbb17] text-black font-medium rounded-lg hover:bg-[#60e421] transition-colors"
                  >
                    Verify & Enable
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Active Sessions */}
      <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-[#27272a] flex items-center justify-center">
              <Monitor className="w-5 h-5 text-[#4cbb17]" />
            </span>
            <div>
              <h3 className="font-semibold">Active Sessions</h3>
              <p className="text-sm text-[#71717a]">Manage devices logged into your account</p>
            </div>
          </div>
          {sessions.length > 1 && (
            <button
              onClick={handleLogoutAllSessions}
              className="text-sm text-red-500 hover:text-red-400"
            >
              Log out all other devices
            </button>
          )}
        </div>

        <div className="space-y-3 mt-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-[#71717a]" />
                <div>
                  <p className="font-medium text-sm">
                    {session.device} - {session.browser}
                    {session.isCurrent && (
                      <span className="ml-2 text-xs text-[#4cbb17]">(This device)</span>
                    )}
                  </p>
                  <p className="text-xs text-[#71717a] flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    {session.location} • {session.ipAddress}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#71717a]">{formatDate(session.lastActive)}</span>
                {!session.isCurrent && (
                  <button
                    onClick={() => handleLogoutSession(session.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Login History */}
      <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-10 rounded-full bg-[#27272a] flex items-center justify-center">
            <Clock className="w-5 h-5 text-[#4cbb17]" />
          </span>
          <div>
            <h3 className="font-semibold">Login History</h3>
            <p className="text-sm text-[#71717a]">Recent login attempts</p>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          {loginHistory.slice(0, 5).map((login) => (
            <div
              key={login.id}
              className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg"
            >
              <div className="flex items-center gap-3">
                {login.success ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
                <div>
                  <p className="text-sm">{login.device}</p>
                  <p className="text-xs text-[#71717a]">
                    {login.location} • {login.ipAddress}
                  </p>
                </div>
              </div>
              <span className="text-xs text-[#71717a]">{formatDate(login.timestamp)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
