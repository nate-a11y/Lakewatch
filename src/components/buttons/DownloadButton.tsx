'use client'

import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface DownloadButtonProps {
  label?: string
  fileName?: string
  className?: string
}

export default function DownloadButton({
  label = 'Download PDF',
  fileName = 'document',
  className = '',
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)

    // Simulate download
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.success(`${fileName}.pdf downloaded`)
    setIsDownloading(false)
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={`flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${className}`}
    >
      {isDownloading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Download className="w-5 h-5" />
      )}
      {label}
    </button>
  )
}
