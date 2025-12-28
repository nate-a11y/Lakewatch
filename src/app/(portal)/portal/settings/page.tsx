'use client'

import { useState } from 'react'
import { User, Bell, Shield, Mail, Phone, Save } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  // Mock user data
  const user = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Settings</h1>
        <p className="text-[#a1a1aa]">
          Manage your account preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-[#0f0f0f] p-1 rounded-lg border border-[#27272a] w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
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
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-6">Profile Information</h2>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  defaultValue={user.firstName}
                  className="w-full px-4 py-2 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  defaultValue={user.lastName}
                  className="w-full px-4 py-2 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#71717a]" />
                <input
                  type="email"
                  defaultValue={user.email}
                  className="flex-1 px-4 py-2 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#71717a]" />
                <input
                  type="tel"
                  defaultValue={user.phone}
                  className="flex-1 px-4 py-2 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </form>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-6">Notification Preferences</h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b border-[#27272a]">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-[#71717a]">Receive updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-[#27272a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4cbb17]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-[#27272a]">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-[#71717a]">Receive urgent alerts via SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-[#27272a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4cbb17]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-[#27272a]">
              <div>
                <p className="font-medium">Inspection Reports</p>
                <p className="text-sm text-[#71717a]">Get notified when reports are ready</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-[#27272a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4cbb17]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">Marketing Updates</p>
                <p className="text-sm text-[#71717a]">News and special offers</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-[#27272a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4cbb17]"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-6">Change Password</h2>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
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
            <button className="px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors">
              Enable 2FA
            </button>
          </div>

          <div className="bg-[#0f0f0f] border border-red-500/20 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-red-500">Danger Zone</h2>
            <p className="text-[#a1a1aa] mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
