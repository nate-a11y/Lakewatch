'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface CancelRequestButtonProps {
  requestId: string
}

export default function CancelRequestButton({}: CancelRequestButtonProps) {
  const router = useRouter()
  const [isConfirming, setIsConfirming] = useState(false)

  const handleCancel = async () => {
    if (!isConfirming) {
      setIsConfirming(true)
      return
    }

    // Simulate API call
    toast.success('Request cancelled')
    router.push('/portal/requests')
  }

  return (
    <button
      onClick={handleCancel}
      className={`px-4 py-3 border rounded-xl transition-colors ${
        isConfirming
          ? 'border-red-500 text-red-500 hover:bg-red-500/10'
          : 'border-[#27272a] hover:bg-[#27272a]'
      }`}
    >
      {isConfirming ? 'Confirm Cancel' : 'Cancel Request'}
    </button>
  )
}
