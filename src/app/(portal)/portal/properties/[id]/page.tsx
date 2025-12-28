'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  FileText,
  Key,
  Users,
  Zap,
  Edit,
  Plus,
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  FileIcon,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'

// Mock data - replace with actual API call
const mockProperty = {
  id: '1',
  name: 'Lake House',
  address: {
    street: '123 Lakefront Dr',
    city: 'Lake Ozark',
    state: 'MO',
    zip: '65049',
  },
  type: 'house',
  squareFootage: 3500,
  status: 'active',
  servicePlan: {
    name: 'Bi-weekly Standard',
    frequency: 'Every 2 weeks',
    nextInspection: 'January 3, 2026',
  },
  accessInfo: {
    gateCode: '1234',
    lockboxCode: '5678',
    alarmCode: '0000',
    alarmCompany: 'ADT',
    wifiNetwork: 'LakeHouse_5G',
    specialInstructions: 'Please check the dock area for any storm damage.',
  },
  contacts: [
    { name: 'John Smith (Neighbor)', phone: '(555) 123-4567', relationship: 'neighbor' },
    { name: 'Bob\'s HVAC', phone: '(555) 987-6543', relationship: 'contractor' },
  ],
  utilities: [
    { type: 'Electric', provider: 'Ameren', phone: '(800) 552-7583' },
    { type: 'Propane', provider: 'Lake Propane', phone: '(573) 555-1234' },
    { type: 'Internet', provider: 'Spectrum', phone: '(855) 707-7328' },
  ],
  recentInspections: [
    { id: '1', date: 'December 20, 2025', status: 'all_clear' },
    { id: '2', date: 'December 6, 2025', status: 'all_clear' },
    { id: '3', date: 'November 22, 2025', status: 'issues_found' },
  ],
  photos: [
    { id: '1', url: '/placeholder-property.jpg', caption: 'Front view', date: 'Dec 20, 2025' },
    { id: '2', url: '/placeholder-property.jpg', caption: 'Dock area', date: 'Dec 20, 2025' },
    { id: '3', url: '/placeholder-property.jpg', caption: 'Back porch', date: 'Dec 6, 2025' },
    { id: '4', url: '/placeholder-property.jpg', caption: 'Lake view', date: 'Dec 6, 2025' },
  ],
  documents: [
    { id: '1', name: 'Property Deed.pdf', type: 'deed', size: '2.4 MB', uploadedAt: 'Nov 15, 2025' },
    { id: '2', name: 'Insurance Policy.pdf', type: 'insurance', size: '1.8 MB', uploadedAt: 'Oct 20, 2025' },
    { id: '3', name: 'HOA Guidelines.pdf', type: 'hoa', size: '560 KB', uploadedAt: 'Sep 5, 2025' },
    { id: '4', name: 'Alarm System Manual.pdf', type: 'manual', size: '3.2 MB', uploadedAt: 'Aug 10, 2025' },
  ],
}

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'photos', label: 'Photos' },
  { id: 'documents', label: 'Documents' },
  { id: 'history', label: 'History' },
]

export default function PropertyDetailPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [showCodes, setShowCodes] = useState<Record<string, boolean>>({})
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadType, setUploadType] = useState<'photo' | 'document'>('photo')

  const property = mockProperty
  const fullAddress = `${property.address.street}, ${property.address.city}, ${property.address.state} ${property.address.zip}`

  const toggleCodeVisibility = (field: string) => {
    setShowCodes(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % property.photos.length)
  }

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + property.photos.length) % property.photos.length)
  }

  const handleUpload = () => {
    toast.success(uploadType === 'photo' ? 'Photo uploaded successfully' : 'Document uploaded successfully')
    setUploadModalOpen(false)
  }

  const handleDeleteDocument = (docId: string) => {
    toast.success('Document deleted')
    console.log('Delete document:', docId)
  }

  const handleDownloadDocument = (docName: string) => {
    toast.success(`Downloading ${docName}`)
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
                  Next inspection: {property.servicePlan.nextInspection}
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
                <CodeInfoItem
                  label="Gate Code"
                  value={property.accessInfo.gateCode}
                  visible={showCodes['gateCode']}
                  onToggle={() => toggleCodeVisibility('gateCode')}
                />
                <CodeInfoItem
                  label="Lockbox Code"
                  value={property.accessInfo.lockboxCode}
                  visible={showCodes['lockboxCode']}
                  onToggle={() => toggleCodeVisibility('lockboxCode')}
                />
                <CodeInfoItem
                  label="Alarm Code"
                  value={property.accessInfo.alarmCode}
                  visible={showCodes['alarmCode']}
                  onToggle={() => toggleCodeVisibility('alarmCode')}
                />
                <InfoItem label="Alarm Company" value={property.accessInfo.alarmCompany} />
                <InfoItem label="WiFi Network" value={property.accessInfo.wifiNetwork} />
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
                {property.recentInspections.map((inspection) => (
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
                ))}
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
                <InfoItem label="Square Footage" value={`${property.squareFootage.toLocaleString()} sq ft`} />
                <InfoItem label="Status" value={property.status} />
              </div>
            </section>

            {/* Emergency Contacts */}
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#4cbb17]" />
                  <h2 className="text-lg font-semibold">Contacts</h2>
                </div>
                <button className="text-[#4cbb17] text-sm hover:underline flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="space-y-3">
                {property.contacts.map((contact, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-[#71717a]">{contact.phone}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Utilities */}
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#4cbb17]" />
                  <h2 className="text-lg font-semibold">Utilities</h2>
                </div>
                <button className="text-[#4cbb17] text-sm hover:underline flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="space-y-3">
                {property.utilities.map((utility, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-medium">{utility.type}</p>
                    <p className="text-[#71717a]">{utility.provider} • {utility.phone}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {activeTab === 'photos' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Property Photos</h2>
            <button
              onClick={() => { setUploadType('photo'); setUploadModalOpen(true) }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
            >
              <Camera className="w-4 h-4" />
              Upload Photo
            </button>
          </div>

          {property.photos.length === 0 ? (
            <div className="text-center py-16 bg-[#0f0f0f] border border-[#27272a] rounded-xl">
              <Camera className="w-12 h-12 text-[#71717a] mx-auto mb-4" />
              <p className="text-[#a1a1aa] mb-4">No photos uploaded yet</p>
              <button
                onClick={() => { setUploadType('photo'); setUploadModalOpen(true) }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#27272a] rounded-lg hover:bg-[#3f3f46] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add First Photo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {property.photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => openLightbox(index)}
                  className="aspect-square relative rounded-xl overflow-hidden group bg-[#0f0f0f] border border-[#27272a]"
                >
                  <Image
                    src={photo.url}
                    alt={photo.caption}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2 text-left">
                      <p className="text-sm font-medium truncate">{photo.caption}</p>
                      <p className="text-xs text-[#a1a1aa]">{photo.date}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Documents</h2>
            <button
              onClick={() => { setUploadType('document'); setUploadModalOpen(true) }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>

          {property.documents.length === 0 ? (
            <div className="text-center py-16 bg-[#0f0f0f] border border-[#27272a] rounded-xl">
              <FileIcon className="w-12 h-12 text-[#71717a] mx-auto mb-4" />
              <p className="text-[#a1a1aa] mb-4">No documents uploaded yet</p>
              <button
                onClick={() => { setUploadType('document'); setUploadModalOpen(true) }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#27272a] rounded-lg hover:bg-[#3f3f46] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add First Document
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {property.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-[#0f0f0f] border border-[#27272a] rounded-xl hover:bg-[#171717] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-[#71717a]">{doc.size} • Uploaded {doc.uploadedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadDocument(doc.name)}
                      className="p-2 text-[#a1a1aa] hover:text-white hover:bg-[#27272a] rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-2 text-[#a1a1aa] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          <h2 className="text-lg font-semibold mb-6">Inspection History</h2>
          <div className="space-y-4">
            {property.recentInspections.map((inspection, index) => (
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
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 p-3 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <div className="relative w-full max-w-4xl h-[80vh]">
            <Image
              src={property.photos[lightboxIndex].url}
              alt={property.photos[lightboxIndex].caption}
              fill
              className="object-contain"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
              <p className="font-medium">{property.photos[lightboxIndex].caption}</p>
              <p className="text-sm text-[#a1a1aa]">{property.photos[lightboxIndex].date}</p>
            </div>
          </div>

          <button
            onClick={nextImage}
            className="absolute right-4 p-3 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Thumbnail strip */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {property.photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => setLightboxIndex(index)}
                className={`w-16 h-16 relative rounded-lg overflow-hidden border-2 transition-colors ${
                  index === lightboxIndex ? 'border-[#4cbb17]' : 'border-transparent'
                }`}
              >
                <Image
                  src={photo.url}
                  alt={photo.caption}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                Upload {uploadType === 'photo' ? 'Photo' : 'Document'}
              </h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-[#71717a] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border-2 border-dashed border-[#27272a] rounded-xl p-8 text-center mb-6">
              <Upload className="w-12 h-12 text-[#71717a] mx-auto mb-4" />
              <p className="text-[#a1a1aa] mb-2">
                Drag and drop your {uploadType} here, or
              </p>
              <button className="text-[#4cbb17] hover:underline">
                browse files
              </button>
              <p className="text-xs text-[#71717a] mt-2">
                {uploadType === 'photo'
                  ? 'PNG, JPG up to 10MB'
                  : 'PDF, DOC, DOCX up to 25MB'}
              </p>
            </div>

            {uploadType === 'photo' && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Caption</label>
                <input
                  type="text"
                  placeholder="Enter photo caption"
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setUploadModalOpen(false)}
                className="flex-1 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="flex-1 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
              >
                Upload
              </button>
            </div>
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
      <p className="font-medium">{value}</p>
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
