'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Plus,
  Building2,
  MapPin,
  User,
  Calendar,
} from 'lucide-react'

interface Property {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  customer: {
    id: string
    name: string
  }
  plan: 'Premium' | 'Standard' | 'Basic'
  status: 'active' | 'inactive' | 'pending'
  lastInspection: string | null
  nextInspection: string | null
}

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [planFilter, setPlanFilter] = useState<string>('all')

  // Mock data
  const properties: Property[] = [
    {
      id: '1',
      name: 'Lake House',
      address: '123 Lakefront Dr',
      city: 'Lake Ozark',
      state: 'MO',
      zip: '65049',
      customer: { id: '5', name: 'John Smith' },
      plan: 'Premium',
      status: 'active',
      lastInspection: 'Dec 20, 2025',
      nextInspection: 'Jan 3, 2026',
    },
    {
      id: '2',
      name: 'Guest Cabin',
      address: '125 Lakefront Dr',
      city: 'Lake Ozark',
      state: 'MO',
      zip: '65049',
      customer: { id: '5', name: 'John Smith' },
      plan: 'Standard',
      status: 'active',
      lastInspection: 'Dec 15, 2025',
      nextInspection: 'Jan 1, 2026',
    },
    {
      id: '3',
      name: 'Sunset Cove',
      address: '456 Marina Way',
      city: 'Osage Beach',
      state: 'MO',
      zip: '65065',
      customer: { id: '6', name: 'Jane Doe' },
      plan: 'Premium',
      status: 'active',
      lastInspection: 'Dec 18, 2025',
      nextInspection: 'Jan 4, 2026',
    },
    {
      id: '4',
      name: 'Hillside Retreat',
      address: '789 Hill Rd',
      city: 'Camdenton',
      state: 'MO',
      zip: '65020',
      customer: { id: '7', name: 'Bob Wilson' },
      plan: 'Basic',
      status: 'active',
      lastInspection: 'Dec 10, 2025',
      nextInspection: 'Jan 10, 2026',
    },
    {
      id: '5',
      name: 'Lakewood Estate',
      address: '100 Estate Dr',
      city: 'Lake Ozark',
      state: 'MO',
      zip: '65049',
      customer: { id: '8', name: 'Sarah Johnson' },
      plan: 'Premium',
      status: 'active',
      lastInspection: 'Dec 22, 2025',
      nextInspection: 'Jan 5, 2026',
    },
    {
      id: '6',
      name: 'Marina View',
      address: '200 Harbor Ln',
      city: 'Osage Beach',
      state: 'MO',
      zip: '65065',
      customer: { id: '8', name: 'Sarah Johnson' },
      plan: 'Standard',
      status: 'active',
      lastInspection: 'Dec 19, 2025',
      nextInspection: 'Jan 2, 2026',
    },
    {
      id: '7',
      name: 'Quiet Bay Cottage',
      address: '300 Bay Rd',
      city: 'Gravois Mills',
      state: 'MO',
      zip: '65037',
      customer: { id: '8', name: 'Sarah Johnson' },
      plan: 'Basic',
      status: 'inactive',
      lastInspection: 'Nov 15, 2025',
      nextInspection: null,
    },
    {
      id: '8',
      name: 'The Brown House',
      address: '400 Oak St',
      city: 'Lake Ozark',
      state: 'MO',
      zip: '65049',
      customer: { id: '9', name: 'Tom Brown' },
      plan: 'Standard',
      status: 'inactive',
      lastInspection: 'Oct 1, 2025',
      nextInspection: null,
    },
  ]

  const filteredProperties = properties.filter(property => {
    const matchesSearch =
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter
    const matchesPlan = planFilter === 'all' || property.plan === planFilter
    return matchesSearch && matchesStatus && matchesPlan
  })

  const stats = {
    total: properties.length,
    active: properties.filter(p => p.status === 'active').length,
    premium: properties.filter(p => p.plan === 'Premium').length,
    standard: properties.filter(p => p.plan === 'Standard').length,
    basic: properties.filter(p => p.plan === 'Basic').length,
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Properties</h1>
          <p className="text-[#a1a1aa]">
            Manage all monitored properties
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors">
          <Plus className="w-5 h-5" />
          Add Property
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <p className="text-sm text-[#71717a] mb-1">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <p className="text-sm text-[#71717a] mb-1">Active</p>
          <p className="text-2xl font-bold text-green-500">{stats.active}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <p className="text-sm text-[#71717a] mb-1">Premium</p>
          <p className="text-2xl font-bold text-purple-400">{stats.premium}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <p className="text-sm text-[#71717a] mb-1">Standard</p>
          <p className="text-2xl font-bold text-blue-400">{stats.standard}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <p className="text-sm text-[#71717a] mb-1">Basic</p>
          <p className="text-2xl font-bold text-[#a1a1aa]">{stats.basic}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0f0f0f] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-[#0f0f0f] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-4 py-2 bg-[#0f0f0f] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
          >
            <option value="all">All Plans</option>
            <option value="Premium">Premium</option>
            <option value="Standard">Standard</option>
            <option value="Basic">Basic</option>
          </select>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProperties.map((property) => (
          <Link
            key={property.id}
            href={`/manage/properties/${property.id}`}
            className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-5 hover:border-[#4cbb17]/50 transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-[#27272a] rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#71717a]" />
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                property.plan === 'Premium' ? 'bg-purple-500/10 text-purple-400' :
                property.plan === 'Standard' ? 'bg-blue-500/10 text-blue-400' :
                'bg-[#27272a] text-[#a1a1aa]'
              }`}>
                {property.plan}
              </span>
            </div>

            <h3 className="font-semibold text-lg mb-1 group-hover:text-[#4cbb17] transition-colors">
              {property.name}
            </h3>

            <div className="flex items-center gap-2 text-sm text-[#71717a] mb-3">
              <MapPin className="w-4 h-4" />
              <span>{property.address}, {property.city}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#a1a1aa] mb-3">
              <User className="w-4 h-4" />
              <span>{property.customer.name}</span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#27272a]">
              <div className="flex items-center gap-2 text-xs text-[#71717a]">
                <Calendar className="w-4 h-4" />
                {property.nextInspection ? (
                  <span>Next: {property.nextInspection}</span>
                ) : (
                  <span>No upcoming inspection</span>
                )}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                property.status === 'active'
                  ? 'bg-green-500/10 text-green-500'
                  : property.status === 'pending'
                  ? 'bg-yellow-500/10 text-yellow-500'
                  : 'bg-[#27272a] text-[#71717a]'
              }`}>
                {property.status}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12 bg-[#0f0f0f] border border-[#27272a] rounded-xl">
          <Building2 className="w-12 h-12 text-[#27272a] mx-auto mb-4" />
          <p className="text-[#71717a]">No properties found</p>
        </div>
      )}
    </div>
  )
}
