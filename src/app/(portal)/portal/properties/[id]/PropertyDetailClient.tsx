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
  ExternalLink,
  Upload,
  File,
  Trash2,
  Clock,
  User,
  Phone,
  Wifi,
  Shield,
  Save,
  X,
  FolderOpen,
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
  assignedTechnician?: {
    name: string
    phone: string
  }
  emergencyContacts?: {
    name: string
    phone: string
    relationship: string
  }[]
  documents?: {
    id: number
    name: string
    type: 'insurance' | 'warranty' | 'manual' | 'other'
    url: string
    expiresAt?: string
  }[]
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: Building2 },
  { id: 'access', label: 'Access Info', icon: Key },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'history', label: 'History', icon: Clock },
]

export default function PropertyDetailClient({ property }: { property: PropertyData }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showCodes, setShowCodes] = useState<Record<string, boolean>>({})
  const [isEditingAccess, setIsEditingAccess] = useState(false)
  const [accessForm, setAccessForm] = useState(property.accessInfo)
  const [isSaving, setIsSaving] = useState(false)

  const fullAddress = `${property.address.street}, ${property.address.city}, ${property.address.state} ${property.address.zip}`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`

  const toggleCodeVisibility = (field: string) => {
    setShowCodes(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSaveAccess = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessInfo: accessForm }),
      })
      if (!response.ok) throw new Error('Failed to save')
      toast.success('Access info updated')
      setIsEditingAccess(false)
    } catch {
      toast.error('Failed to save access info')
    } finally {
      setIsSaving(false)
    }
  }

  // Group documents by type
  const documentsByType = (property.documents || []).reduce((acc, doc) => {
    if (!acc[doc.type]) acc[doc.type] = []
    acc[doc.type]!.push(doc)
    return acc
  }, {} as Record<string, typeof property.documents>)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back button */}
      <Link
        href="/portal/properties"
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 transition-colors min-h-[44px]"
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
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#a1a1aa] hover:text-[#4cbb17] transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span>{fullAddress}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        <Link
          href={`/portal/properties/${property.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#27272a] text-white rounded-lg hover:bg-[#3f3f46] transition-colors min-h-[44px]"
        >
          <Edit className="w-4 h-4" />
          Edit Property
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#27272a] mb-6">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative flex items-center gap-2 min-h-[44px] ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-[#71717a] hover:text-[#a1a1aa]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4cbb17]" />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
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

            {/* Assigned Technician */}
            {property.assignedTechnician && (
              <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-[#4cbb17]" />
                  <h2 className="text-lg font-semibold">Assigned Technician</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#27272a] rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-[#71717a]" />
                  </div>
                  <div>
                    <p className="font-medium">{property.assignedTechnician.name}</p>
                    <a
                      href={`tel:${property.assignedTechnician.phone}`}
                      className="text-sm text-[#4cbb17] hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      {property.assignedTechnician.phone}
                    </a>
                  </div>
                </div>
              </section>
            )}

            {/* Emergency Contacts */}
            {property.emergencyContacts && property.emergencyContacts.length > 0 && (
              <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Phone className="w-5 h-5 text-[#4cbb17]" />
                  <h2 className="text-lg font-semibold">Emergency Contacts</h2>
                </div>
                <div className="space-y-3">
                  {property.emergencyContacts.map((contact, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-[#71717a]">{contact.relationship}</p>
                      </div>
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-[#4cbb17] hover:underline"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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

            {/* Quick Actions */}
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  href="/portal/requests/new"
                  className="block w-full text-center py-3 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
                >
                  Request Service
                </Link>
                <Link
                  href="/portal/calendar"
                  className="block w-full text-center py-3 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
                >
                  Update Occupancy
                </Link>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Access Info Tab */}
      {activeTab === 'access' && (
        <div className="max-w-2xl">
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#4cbb17]" />
                <h2 className="text-lg font-semibold">Access Codes & Information</h2>
              </div>
              {!isEditingAccess ? (
                <button
                  onClick={() => setIsEditingAccess(true)}
                  className="text-[#4cbb17] text-sm hover:underline flex items-center gap-1 min-h-[44px] px-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setAccessForm(property.accessInfo)
                      setIsEditingAccess(false)
                    }}
                    className="text-[#71717a] hover:text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSaveAccess}
                    disabled={isSaving}
                    className="bg-[#4cbb17] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#60e421] disabled:opacity-50 flex items-center gap-2 min-h-[44px]"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Security Codes */}
              <div>
                <h3 className="text-sm font-medium text-[#71717a] mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Security Codes
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <CodeInfoItem
                    label="Gate Code"
                    value={isEditingAccess ? accessForm.gateCode : property.accessInfo.gateCode}
                    visible={showCodes['gateCode']}
                    onToggle={() => toggleCodeVisibility('gateCode')}
                    isEditing={isEditingAccess}
                    onChange={(val) => setAccessForm(f => ({ ...f, gateCode: val }))}
                  />
                  <CodeInfoItem
                    label="Lockbox Code"
                    value={isEditingAccess ? accessForm.lockboxCode : property.accessInfo.lockboxCode}
                    visible={showCodes['lockboxCode']}
                    onToggle={() => toggleCodeVisibility('lockboxCode')}
                    isEditing={isEditingAccess}
                    onChange={(val) => setAccessForm(f => ({ ...f, lockboxCode: val }))}
                  />
                  <CodeInfoItem
                    label="Alarm Code"
                    value={isEditingAccess ? accessForm.alarmCode : property.accessInfo.alarmCode}
                    visible={showCodes['alarmCode']}
                    onToggle={() => toggleCodeVisibility('alarmCode')}
                    isEditing={isEditingAccess}
                    onChange={(val) => setAccessForm(f => ({ ...f, alarmCode: val }))}
                  />
                  {isEditingAccess ? (
                    <div>
                      <label className="text-sm text-[#71717a] block mb-1">Alarm Company</label>
                      <input
                        type="text"
                        value={accessForm.alarmCompany}
                        onChange={(e) => setAccessForm(f => ({ ...f, alarmCompany: e.target.value }))}
                        className="w-full bg-[#0a0a0a] border border-[#27272a] rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                  ) : property.accessInfo.alarmCompany ? (
                    <InfoItem label="Alarm Company" value={property.accessInfo.alarmCompany} />
                  ) : null}
                </div>
              </div>

              {/* WiFi */}
              <div className="pt-4 border-t border-[#27272a]">
                <h3 className="text-sm font-medium text-[#71717a] mb-3 flex items-center gap-2">
                  <Wifi className="w-4 h-4" />
                  WiFi Credentials
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {isEditingAccess ? (
                    <>
                      <div>
                        <label className="text-sm text-[#71717a] block mb-1">Network Name</label>
                        <input
                          type="text"
                          value={accessForm.wifiNetwork}
                          onChange={(e) => setAccessForm(f => ({ ...f, wifiNetwork: e.target.value }))}
                          className="w-full bg-[#0a0a0a] border border-[#27272a] rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-[#71717a] block mb-1">Password</label>
                        <input
                          type="text"
                          value={accessForm.wifiPassword}
                          onChange={(e) => setAccessForm(f => ({ ...f, wifiPassword: e.target.value }))}
                          className="w-full bg-[#0a0a0a] border border-[#27272a] rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {property.accessInfo.wifiNetwork && (
                        <InfoItem label="Network Name" value={property.accessInfo.wifiNetwork} />
                      )}
                      {property.accessInfo.wifiPassword && (
                        <CodeInfoItem
                          label="Password"
                          value={property.accessInfo.wifiPassword}
                          visible={showCodes['wifiPassword']}
                          onToggle={() => toggleCodeVisibility('wifiPassword')}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Special Instructions */}
              <div className="pt-4 border-t border-[#27272a]">
                <h3 className="text-sm font-medium text-[#71717a] mb-3">Special Instructions</h3>
                {isEditingAccess ? (
                  <textarea
                    value={accessForm.specialInstructions}
                    onChange={(e) => setAccessForm(f => ({ ...f, specialInstructions: e.target.value }))}
                    rows={4}
                    className="w-full bg-[#0a0a0a] border border-[#27272a] rounded-lg px-3 py-2 text-white resize-none"
                    placeholder="Enter any special access instructions..."
                  />
                ) : (
                  <p className="text-[#a1a1aa]">
                    {property.accessInfo.specialInstructions || 'No special instructions'}
                  </p>
                )}
              </div>

              {/* Last Updated Notice */}
              <p className="text-xs text-[#71717a] pt-2">
                Please keep this information up to date for our technicians
              </p>
            </div>
          </section>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="max-w-3xl space-y-6">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-[#27272a] rounded-xl p-8 text-center hover:border-[#4cbb17]/50 transition-colors">
            <Upload className="w-10 h-10 text-[#71717a] mx-auto mb-3" />
            <p className="text-[#a1a1aa] mb-2">Drag and drop files here, or click to upload</p>
            <p className="text-sm text-[#71717a]">PDF, DOC, DOCX, JPG, PNG up to 20MB</p>
            <label className="inline-block mt-4 px-6 py-2 bg-[#27272a] text-white rounded-lg hover:bg-[#3f3f46] transition-colors cursor-pointer">
              Choose Files
              <input type="file" className="hidden" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
            </label>
          </div>

          {/* Documents by Category */}
          {['insurance', 'warranty', 'manual', 'other'].map((type) => {
            const docs = documentsByType[type] || []
            const typeLabels: Record<string, string> = {
              insurance: 'Insurance Documents',
              warranty: 'Warranties',
              manual: 'Manuals & Guides',
              other: 'Other Documents',
            }
            return (
              <section key={type} className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FolderOpen className="w-5 h-5 text-[#4cbb17]" />
                  <h2 className="text-lg font-semibold">{typeLabels[type]}</h2>
                </div>
                {docs.length > 0 ? (
                  <div className="space-y-2">
                    {docs.map((doc) => {
                      const isExpiringSoon = doc.expiresAt && new Date(doc.expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                      const isExpired = doc.expiresAt && new Date(doc.expiresAt) < new Date()
                      return (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg group"
                        >
                          <div className="flex items-center gap-3">
                            <File className="w-5 h-5 text-[#71717a]" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              {doc.expiresAt && (
                                <p className={`text-xs ${isExpired ? 'text-red-500' : isExpiringSoon ? 'text-yellow-500' : 'text-[#71717a]'}`}>
                                  {isExpired ? 'Expired' : isExpiringSoon ? 'Expires soon:' : 'Expires:'} {new Date(doc.expiresAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-[#71717a] hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                              className="p-2 text-[#71717a] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-[#71717a] text-center py-4">No {typeLabels[type].toLowerCase()} uploaded</p>
                )}
              </section>
            )
          })}
        </div>
      )}

      {/* History Tab */}
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
                  {index !== property.recentInspections.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-[#27272a]" />
                  )}
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

function InfoItem({ label, value }: { label: string; value: string }) {
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
  isEditing,
  onChange,
}: {
  label: string
  value: string
  visible: boolean
  onToggle: () => void
  isEditing?: boolean
  onChange?: (value: string) => void
}) {
  if (isEditing && onChange) {
    return (
      <div>
        <label className="text-sm text-[#71717a] block mb-1">{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#0a0a0a] border border-[#27272a] rounded-lg px-3 py-2 text-white font-mono"
        />
      </div>
    )
  }

  if (!value) return null

  return (
    <div>
      <p className="text-sm text-[#71717a]">{label}</p>
      <div className="flex items-center gap-2">
        <p className="font-medium font-mono">
          {visible ? value : '••••••'}
        </p>
        <button
          onClick={onToggle}
          className="text-[#71717a] hover:text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center -m-2"
          title={visible ? 'Hide' : 'Show'}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
