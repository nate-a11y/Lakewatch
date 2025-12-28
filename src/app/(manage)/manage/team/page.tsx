'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Plus,
  UserCog,
  Mail,
  Phone,
  Calendar,
  MapPin,
} from 'lucide-react'

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: 'owner' | 'admin' | 'technician'
  status: 'active' | 'inactive'
  hireDate: string
  assignedProperties: number
  completedInspections: number
  avatar?: string
}

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  // Mock data
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      firstName: 'Owner',
      lastName: 'Account',
      email: 'owner@lakewatchpros.com',
      phone: '(314) 555-0001',
      role: 'owner',
      status: 'active',
      hireDate: 'Jan 1, 2020',
      assignedProperties: 0,
      completedInspections: 0,
    },
    {
      id: '2',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@lakewatchpros.com',
      phone: '(314) 555-0002',
      role: 'admin',
      status: 'active',
      hireDate: 'Mar 15, 2022',
      assignedProperties: 0,
      completedInspections: 0,
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike@lakewatchpros.com',
      phone: '(314) 555-0003',
      role: 'technician',
      status: 'active',
      hireDate: 'Jun 1, 2023',
      assignedProperties: 12,
      completedInspections: 156,
    },
    {
      id: '4',
      firstName: 'Sarah',
      lastName: 'Tech',
      email: 'sarah@lakewatchpros.com',
      phone: '(314) 555-0004',
      role: 'technician',
      status: 'active',
      hireDate: 'Sep 15, 2023',
      assignedProperties: 8,
      completedInspections: 87,
    },
  ]

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch =
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || member.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      case 'admin':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      default:
        return 'bg-[#27272a] text-[#a1a1aa] border-[#27272a]'
    }
  }

  const stats = {
    total: teamMembers.length,
    technicians: teamMembers.filter(m => m.role === 'technician').length,
    admins: teamMembers.filter(m => m.role === 'admin' || m.role === 'owner').length,
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Team</h1>
          <p className="text-[#a1a1aa]">
            Manage staff accounts and permissions
          </p>
        </div>
        <Link
          href="/manage/team/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Team Member
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <p className="text-sm text-[#71717a] mb-1">Total Members</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <p className="text-sm text-[#71717a] mb-1">Technicians</p>
          <p className="text-2xl font-bold">{stats.technicians}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <p className="text-sm text-[#71717a] mb-1">Admins</p>
          <p className="text-2xl font-bold">{stats.admins}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0f0f0f] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 bg-[#0f0f0f] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
        >
          <option value="all">All Roles</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="technician">Technician</option>
        </select>
      </div>

      {/* Team Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <Link
            key={member.id}
            href={`/manage/team/${member.id}`}
            className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-5 hover:border-[#4cbb17]/50 transition-colors group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                  member.role === 'owner' ? 'bg-purple-500/10 text-purple-400' :
                  member.role === 'admin' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-[#4cbb17]/10 text-[#4cbb17]'
                }`}>
                  {member.firstName[0]}{member.lastName[0]}
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-[#4cbb17] transition-colors">
                    {member.firstName} {member.lastName}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded border ${getRoleBadge(member.role)}`}>
                    {member.role}
                  </span>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                member.status === 'active'
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-[#27272a] text-[#71717a]'
              }`}>
                {member.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-[#a1a1aa]">
                <Mail className="w-4 h-4 text-[#71717a]" />
                <span className="truncate">{member.email}</span>
              </div>
              <div className="flex items-center gap-2 text-[#a1a1aa]">
                <Phone className="w-4 h-4 text-[#71717a]" />
                <span>{member.phone}</span>
              </div>
            </div>

            {member.role === 'technician' && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#27272a] text-sm">
                <div className="flex items-center gap-2 text-[#71717a]">
                  <MapPin className="w-4 h-4" />
                  <span>{member.assignedProperties} properties</span>
                </div>
                <div className="flex items-center gap-2 text-[#71717a]">
                  <Calendar className="w-4 h-4" />
                  <span>{member.completedInspections} inspections</span>
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 bg-[#0f0f0f] border border-[#27272a] rounded-xl">
          <UserCog className="w-12 h-12 text-[#27272a] mx-auto mb-4" />
          <p className="text-[#71717a]">No team members found</p>
        </div>
      )}
    </div>
  )
}
