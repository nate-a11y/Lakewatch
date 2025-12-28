'use client'

import { Toaster } from 'sonner'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#0f0f0f',
          border: '1px solid #27272a',
          color: '#fff',
        },
        className: 'toast-notification',
      }}
      theme="dark"
      richColors
      closeButton
    />
  )
}
