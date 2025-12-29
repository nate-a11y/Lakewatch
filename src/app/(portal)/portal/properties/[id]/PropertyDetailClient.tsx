'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  FileText,
  Key,
  Edit,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'

interface PropertyData {
  id: number
  name: string
  address: {
    street: string
    city: string
    state: string
    zip: string
  }
  type: string
  squareFootage: number
  status: string
  servicePlan: {
    name: string
    frequency: string
    nextInspection: string
  }
  accessInfo: {
    gateCode: string
    lockboxCode: string
    alarmCode: string
    alarmCompany: string
    wifiNetwork: string
    wifiPassword: string
    specialInstructions: string
  }
  recentInspections: {
    id: number
    date: string
    status: string
  }[]
}

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'history', label: 'History' },
]

export default function PropertyDetailClient({ property }: { property: PropertyData }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showCodes, setShowCodes] = useState<Record<string, boolean>>({})

  const fullAddress = `${property.address.street}, ${property.address.city}, ${property.address.state} ${property.address.zip}`

  const toggleCodeVisibility = (field: string) => {
    setShowCodes(prev => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back button */}
      <Link
        href="/portal/properties"
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to properties
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-[#4cbb17]/10 rounded-xl flex items-center justify-center text-[#4cbb17]">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1">{property.name}</h1>
            <div className="flex items-center gap-2 text-[#a1a1aa]">
              <MapPin className="w-4 h-4" />
              <span>{fullAddress}</span>
            </div>
          </div>
        </div>
        <Link
          href={`/portal/properties/${property.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#27272a] text-white rounded-lg hover:bg-[#3f3f46] transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit Property
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#27272a] mb-6">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-[#71717a] hover:text-[#a1a1aa]'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4cbb17]" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Plan */}
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-[#4cbb17]" />
                <h2 className="text-lg font-semibold">Service Plan</h2>
              </div>
              <div className="bg-[#4cbb17]/10 border border-[#4cbb17]/20 rounded-lg p-4">
                <p className="font-medium text-lg">{property.servicePlan.name}</p>
                <p className="text-[#a1a1aa]">{property.servicePlan.frequency}</p>
                <p className="text-sm text-[#71717a] mt-2">
                  {property.servicePlan.nextInspection}
                </p>
              </div>
            </section>

            {/* Access Information */}
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-[#4cbb17]" />
                  <h2 className="text-lg font-semibold">Access Information</h2>
                </div>
                <Link
                  href={`/portal/properties/${property.id}/edit#access`}
                  className="text-[#4cbb17] text-sm hover:underline"
                >
                  Edit
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {property.accessInfo.gateCode && (
                  <CodeInfoItem
                    label="Gate Code"
                    value={property.accessInfo.gateCode}
                    visible={showCodes['gateCode']}
                    onToggle={() => toggleCodeVisibility('gateCode')}
                  />
                )}
                {property.accessInfo.lockboxCode && (
                  <CodeInfoItem
                    label="Lockbox Code"
                    value={property.accessInfo.lockboxCode}
                    visible={showCodes['lockboxCode']}
                    onToggle={() => toggleCodeVisibility('lockboxCode')}
                  />
                )}
                {property.accessInfo.alarmCode && (
                  <CodeInfoItem
                    label="Alarm Code"
                    value={property.accessInfo.alarmCode}
                    visible={showCodes['alarmCode']}
                    onToggle={() => toggleCodeVisibility('alarmCode')}
                  />
                )}
                {property.accessInfo.alarmCompany && (
                  <InfoItem label="Alarm Company" value={property.accessInfo.alarmCompany} />
                )}
                {property.accessInfo.wifiNetwork && (
                  <InfoItem label="WiFi Network" value={property.accessInfo.wifiNetwork} />
                )}
              </div>
              {property.accessInfo.specialInstructions && (
                <div className="mt-4 pt-4 border-t border-[#27272a]">
                  <p className="text-sm text-[#71717a] mb-1">Special Instructions</p>
                  <p className="text-[#a1a1aa]">{property.accessInfo.specialInstructions}</p>
                </div>
              )}
            </section>

            {/* Recent Inspections */}
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#4cbb17]" />
                  <h2 className="text-lg font-semibold">Recent Inspections</h2>
                </div>
                <Link
                  href="/portal/reports"
                  className="text-[#4cbb17] text-sm hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {property.recentInspections.length > 0 ? (
                  property.recentInspections.map((inspection) => (
                    <Link
                      key={inspection.id}
                      href={`/portal/reports/${inspection.id}`}
                      className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg hover:bg-[#171717] transition-colors"
                    >
                      <span>{inspection.date}</span>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        inspection.status === 'all_clear'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {inspection.status === 'all_clear' ? 'All Clear' : 'Issues Found'}
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="text-[#71717a] text-center py-4">No inspections yet</p>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Property Details */}
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Property Details</h2>
              <div className="space-y-3">
                <InfoItem label="Type" value={property.type} />
                {property.squareFootage > 0 && (
                  <InfoItem label="Square Footage" value={`${property.squareFootage.toLocaleString()} sq ft`} />
                )}
                <InfoItem label="Status" value={property.status} />
              </div>
            </section>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          <h2 className="text-lg font-semibold mb-6">Inspection History</h2>
          <div className="space-y-4">
            {property.recentInspections.length > 0 ? (
              property.recentInspections.map((inspection, index) => (
                <div
                  key={inspection.id}
                  className="relative pl-8 pb-8 last:pb-0"
                >
                  {/* Timeline line */}
                  {index !== property.recentInspections.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-[#27272a]" />
                  )}

                  {/* Timeline dot */}
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center ${
                    inspection.status === 'all_clear'
                      ? 'bg-green-500/20'
                      : 'bg-yellow-500/20'
                  }`}>
                    {inspection.status === 'all_clear' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>

                  {/* Content */}
                  <Link
                    href={`/portal/reports/${inspection.id}`}
                    className="block p-4 bg-[#0f0f0f] border border-[#27272a] rounded-xl hover:bg-[#171717] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{inspection.date}</p>
                        <p className="text-sm text-[#71717a]">Routine Inspection</p>
                      </div>
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        inspection.status === 'all_clear'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {inspection.status === 'all_clear' ? 'All Clear' : 'Issues Found'}
                      </span>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-[#0f0f0f] border border-[#27272a] rounded-xl">
                <FileText className="w-12 h-12 text-[#71717a] mx-auto mb-4" />
                <p className="text-[#a1a1aa]">No inspection history yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function InfoItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-sm text-[#71717a]">{label}</p>
      <p className="font-medium capitalize">{value}</p>
    </div>
  )
}

function CodeInfoItem({
  label,
  value,
  visible,
  onToggle,
}: {
  label: string
  value: string
  visible: boolean
  onToggle: () => void
}) {
  return (
    <div>
      <p className="text-sm text-[#71717a]">{label}</p>
      <div className="flex items-center gap-2">
        <p className="font-medium font-mono">
          {visible ? value : '••••••'}
        </p>
        <button
          onClick={onToggle}
          className="text-[#71717a] hover:text-white p-1"
          title={visible ? 'Hide' : 'Show'}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
