'use client'

import { useState } from 'react'
import {
  Building2,
  Bell,
  CreditCard,
  Mail,
  Shield,
  Globe,
  Save,
  History,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { AuditLogTable } from '@/components/manage/AuditLogTable'
import { NotificationTemplates } from '@/components/manage/NotificationTemplates'

type SettingsTab = 'company' | 'notifications' | 'templates' | 'billing' | 'integrations' | 'security' | 'audit'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('company')

  const tabs = [
    { id: 'company' as const, label: 'Company', icon: Building2 },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'templates' as const, label: 'Templates', icon: FileText },
    { id: 'billing' as const, label: 'Billing', icon: CreditCard },
    { id: 'integrations' as const, label: 'Integrations', icon: Globe },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'audit' as const, label: 'Audit Log', icon: History },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Settings</h1>
        <p className="text-[#a1a1aa]">
          Manage your business settings and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-2 lg:sticky lg:top-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-[#4cbb17]/10 text-[#4cbb17]'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'
                )}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'company' && <CompanySettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'templates' && <NotificationTemplates />}
          {activeTab === 'billing' && <BillingSettings />}
          {activeTab === 'integrations' && <IntegrationSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'audit' && <AuditLogTable />}
        </div>
      </div>
    </div>
  )
}

function CompanySettings() {
  return (
    <div className="space-y-6">
      <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Company Information</h2>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm text-[#71717a] mb-2">Company Name</label>
            <input
              type="text"
              defaultValue="Lake Watch Pros"
              className="w-full px-4 py-2 bg-black/30 border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#71717a] mb-2">Email</label>
              <input
                type="email"
                defaultValue="info@lakewatchpros.com"
                className="w-full px-4 py-2 bg-black/30 border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#71717a] mb-2">Phone</label>
              <input
                type="tel"
                defaultValue="(314) 555-0100"
                className="w-full px-4 py-2 bg-black/30 border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-[#71717a] mb-2">Address</label>
            <input
              type="text"
              defaultValue="123 Business Ave, Lake Ozark, MO 65049"
              className="w-full px-4 py-2 bg-black/30 border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
            />
          </div>
        </div>
      </section>

      <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Service Plans</h2>
        <div className="space-y-4">
          {[
            { name: 'Premium', price: 349, frequency: 'Weekly inspections' },
            { name: 'Standard', price: 199, frequency: 'Bi-weekly inspections' },
            { name: 'Basic', price: 99, frequency: 'Monthly inspections' },
          ].map((plan) => (
            <div key={plan.name} className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
              <div>
                <p className="font-medium">{plan.name}</p>
                <p className="text-sm text-[#71717a]">{plan.frequency}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#4cbb17]">${plan.price}/mo</p>
                <button onClick={() => toast.success('Edit plan settings coming soon')} className="text-sm text-[#4cbb17] hover:underline">Edit</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button className="inline-flex items-center gap-2 px-6 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  )
}

function NotificationSettings() {
  return (
    <div className="space-y-6">
      <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Email Notifications</h2>
        <div className="space-y-4">
          {[
            { label: 'New service request', description: 'When a customer submits a service request', enabled: true },
            { label: 'Inspection completed', description: 'When a technician completes an inspection', enabled: true },
            { label: 'Issue found', description: 'When an issue is reported during inspection', enabled: true },
            { label: 'Payment received', description: 'When a customer payment is processed', enabled: false },
            { label: 'Customer message', description: 'When a customer sends a message', enabled: true },
          ].map((notification) => (
            <div key={notification.label} className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
              <div>
                <p className="font-medium">{notification.label}</p>
                <p className="text-sm text-[#71717a]">{notification.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={notification.enabled} className="sr-only peer" />
                <div className="w-11 h-6 bg-[#27272a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4cbb17]"></div>
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">SMS Notifications</h2>
        <div className="space-y-4">
          {[
            { label: 'Urgent issues', description: 'When an urgent issue is reported', enabled: true },
            { label: 'Schedule reminders', description: 'Daily schedule reminders for technicians', enabled: true },
          ].map((notification) => (
            <div key={notification.label} className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
              <div>
                <p className="font-medium">{notification.label}</p>
                <p className="text-sm text-[#71717a]">{notification.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={notification.enabled} className="sr-only peer" />
                <div className="w-11 h-6 bg-[#27272a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4cbb17]"></div>
              </label>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function BillingSettings() {
  return (
    <div className="space-y-6">
      <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Stripe Integration</h2>
        <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg mb-4">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="font-medium text-green-500">Connected</p>
            <p className="text-sm text-[#71717a]">Stripe account: acct_1ABC123</p>
          </div>
        </div>
        <button className="text-sm text-[#4cbb17] hover:underline">
          Open Stripe Dashboard →
        </button>
      </section>

      <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Invoice Settings</h2>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm text-[#71717a] mb-2">Invoice Prefix</label>
            <input
              type="text"
              defaultValue="INV"
              className="w-full px-4 py-2 bg-black/30 border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#71717a] mb-2">Payment Terms (days)</label>
            <input
              type="number"
              defaultValue="15"
              className="w-full px-4 py-2 bg-black/30 border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#71717a] mb-2">Invoice Footer Note</label>
            <textarea
              rows={3}
              defaultValue="Thank you for your business. Payment is due within 15 days."
              className="w-full px-4 py-2 bg-black/30 border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] resize-none"
            />
          </div>
        </div>
      </section>

      <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Auto-billing</h2>
        <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
          <div>
            <p className="font-medium">Automatic invoicing</p>
            <p className="text-sm text-[#71717a]">Generate invoices automatically on the 1st of each month</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-11 h-6 bg-[#27272a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4cbb17]"></div>
          </label>
        </div>
      </section>
    </div>
  )
}

function IntegrationSettings() {
  // Check environment variables for integration status
  // Note: Only NEXT_PUBLIC_ vars are available client-side
  const hasStripe = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  const hasResend = false // RESEND_API_KEY is server-only, check via API
  const hasTwilio = false // TWILIO vars are server-only, check via API
  const hasMapbox = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  const hasWeather = false // WEATHERAPI_KEY is server-only

  const integrations = [
    {
      name: 'Stripe',
      description: 'Payment processing',
      icon: CreditCard,
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      connected: hasStripe,
      envVar: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY & STRIPE_SECRET_KEY',
      docsUrl: 'https://stripe.com/docs',
    },
    {
      name: 'Resend',
      description: 'Email delivery',
      icon: Mail,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      connected: hasResend,
      envVar: 'RESEND_API_KEY',
      docsUrl: 'https://resend.com/docs',
    },
    {
      name: 'Twilio',
      description: 'SMS notifications',
      icon: Bell,
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-500',
      connected: hasTwilio,
      envVar: 'TWILIO_ACCOUNT_SID & TWILIO_AUTH_TOKEN',
      docsUrl: 'https://twilio.com/docs',
    },
    {
      name: 'Mapbox',
      description: 'Maps & routing',
      icon: Globe,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
      connected: hasMapbox,
      envVar: 'NEXT_PUBLIC_MAPBOX_TOKEN',
      docsUrl: 'https://docs.mapbox.com',
    },
    {
      name: 'WeatherAPI',
      description: 'Weather data',
      icon: Globe,
      iconBg: 'bg-cyan-500/10',
      iconColor: 'text-cyan-500',
      connected: hasWeather,
      envVar: 'WEATHERAPI_KEY',
      docsUrl: 'https://weatherapi.com/docs',
    },
  ]

  return (
    <div className="space-y-6">
      <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Connected Services</h2>
        <p className="text-sm text-[#71717a] mb-4">
          Configure integrations by adding the required environment variables to your deployment.
        </p>
        <div className="space-y-4">
          {integrations.map((integration) => (
            <div key={integration.name} className="p-4 bg-black/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', integration.iconBg)}>
                    <integration.icon className={cn('w-5 h-5', integration.iconColor)} />
                  </div>
                  <div>
                    <p className="font-medium">{integration.name}</p>
                    <p className={cn('text-sm', integration.connected ? 'text-green-500' : 'text-[#71717a]')}>
                      {integration.connected ? 'Connected' : 'Not configured'}
                    </p>
                  </div>
                </div>
                <a
                  href={integration.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#4cbb17] hover:underline"
                >
                  Docs →
                </a>
              </div>
              {!integration.connected && (
                <div className="mt-3 p-3 bg-black/50 rounded-lg">
                  <p className="text-xs text-[#71717a] mb-1">Required environment variable:</p>
                  <code className="text-xs text-yellow-500 font-mono">{integration.envVar}</code>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Environment Setup</h2>
        <div className="p-4 bg-black/30 rounded-lg">
          <p className="text-sm text-[#71717a] mb-3">
            Add these variables to your <code className="text-[#4cbb17]">.env.local</code> file or deployment settings:
          </p>
          <pre className="text-xs text-[#a1a1aa] font-mono bg-black/50 p-3 rounded overflow-x-auto">
{`# Stripe (Payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (Email)
RESEND_API_KEY=re_...

# Twilio (SMS)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Mapbox (Maps)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.ey...

# Weather
WEATHERAPI_KEY=...`}
          </pre>
        </div>
      </section>
    </div>
  )
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Password & Authentication</h2>
        <div className="space-y-4">
          <button className="w-full text-left p-4 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors">
            <p className="font-medium">Change Password</p>
            <p className="text-sm text-[#71717a]">Update your account password</p>
          </button>
          <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-[#71717a]">Add an extra layer of security</p>
            </div>
            <span className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded">Not enabled</span>
          </div>
        </div>
      </section>

      <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Sessions</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
            <div>
              <p className="font-medium">Current Session</p>
              <p className="text-sm text-[#71717a]">Chrome on macOS • Lake Ozark, MO</p>
            </div>
            <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded">Active</span>
          </div>
        </div>
        <button className="mt-4 text-sm text-red-500 hover:underline">
          Sign out of all other sessions
        </button>
      </section>

      <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Danger Zone</h2>
        <div className="p-4 border border-red-500/20 rounded-lg">
          <p className="font-medium text-red-500 mb-2">Delete Account</p>
          <p className="text-sm text-[#71717a] mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors text-sm">
            Delete Account
          </button>
        </div>
      </section>
    </div>
  )
}
