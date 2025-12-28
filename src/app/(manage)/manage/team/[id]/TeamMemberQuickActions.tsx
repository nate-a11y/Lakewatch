'use client'

import Link from 'next/link'
import { toast } from 'sonner'

interface TeamMemberQuickActionsProps {
  memberId: string
  memberRole: string
}

export default function TeamMemberQuickActions({ memberId, memberRole }: TeamMemberQuickActionsProps) {
  const handleResetPassword = () => {
    toast.success('Password reset email sent')
  }

  const handleDeactivate = () => {
    if (confirm('Are you sure you want to deactivate this account?')) {
      toast.success('Account deactivated')
    }
  }

  return (
    <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="space-y-2">
        {memberRole === 'technician' && (
          <Link
            href={`/manage/inspections?technician=${memberId}`}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-[#27272a] rounded-lg transition-colors"
          >
            View all inspections
          </Link>
        )}
        {memberRole === 'technician' && (
          <Link
            href={`/manage/schedule/new?technician=${memberId}`}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-[#27272a] rounded-lg transition-colors"
          >
            Schedule inspection
          </Link>
        )}
        <button
          onClick={handleResetPassword}
          className="w-full text-left px-4 py-2 text-sm hover:bg-[#27272a] rounded-lg transition-colors"
        >
          Reset password
        </button>
        <button
          onClick={handleDeactivate}
          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          Deactivate account
        </button>
      </div>
    </section>
  )
}
