'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

export default function NewTeamMemberPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'technician',
    sendInvite: true,
  })

  const roles = [
    { value: 'technician', label: 'Technician', description: 'Can perform inspections and service calls' },
    { value: 'staff', label: 'Staff', description: 'Can view and manage customers, properties, and schedules' },
    { value: 'admin', label: 'Admin', description: 'Full access to all features and settings' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('Please enter first and last name')
      return
    }

    if (!formData.email.trim()) {
      toast.error('Please enter an email address')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          sendInvite: formData.sendInvite,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add team member')
      }

      toast.success('Team member added successfully')
      if (formData.sendInvite) {
        toast.success('Invitation email sent')
      }
      router.push('/manage/team')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add team member')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/manage/team"
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to team
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Add Team Member</h1>
        <p className="text-[#a1a1aa]">Invite a new member to your team</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#4cbb17]" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Smith"
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#4cbb17]" />
            Contact Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="w-full pl-10 pr-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Role */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#4cbb17]" />
            Role & Permissions
          </h2>

          <div className="space-y-3">
            {roles.map(role => (
              <button
                key={role.value}
                type="button"
                onClick={() => setFormData({ ...formData, role: role.value })}
                className={`w-full p-4 rounded-lg border text-left transition-colors ${
                  formData.role === role.value
                    ? 'border-[#4cbb17] bg-[#4cbb17]/10'
                    : 'border-[#27272a] hover:border-[#4cbb17]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${formData.role === role.value ? 'text-[#4cbb17]' : ''}`}>
                      {role.label}
                    </p>
                    <p className="text-sm text-[#71717a]">{role.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    formData.role === role.value
                      ? 'border-[#4cbb17] bg-[#4cbb17]'
                      : 'border-[#27272a]'
                  }`}>
                    {formData.role === role.value && (
                      <div className="w-2 h-2 bg-black rounded-full" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Invitation */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.sendInvite}
              onChange={(e) => setFormData({ ...formData, sendInvite: e.target.checked })}
              className="w-5 h-5 rounded border-[#27272a] bg-[#171717] text-[#4cbb17] focus:ring-[#4cbb17] focus:ring-offset-0"
            />
            <div>
              <p className="font-medium">Send invitation email</p>
              <p className="text-sm text-[#71717a]">
                The new team member will receive an email to set up their account
              </p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/manage/team"
            className="flex-1 px-6 py-3 border border-[#27272a] rounded-lg text-center font-medium hover:bg-[#27272a] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-[#4cbb17] text-black rounded-lg font-semibold hover:bg-[#60e421] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Team Member'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
