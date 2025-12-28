import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const siteConfig = {
  name: 'Lake Watch Pros',
  description: 'Professional home watch and concierge services for Lake of the Ozarks properties.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://lakewatchpros.com',
  phone: process.env.NEXT_PUBLIC_PHONE || '573-206-9499',
  email: process.env.NEXT_PUBLIC_EMAIL || 'info@lakewatchpros.com',
  address: 'Lake of the Ozarks, Missouri',
  socialLinks: {
    facebook: 'https://facebook.com/lakewatchpros',
    instagram: 'https://instagram.com/lakewatchpros',
  },
}
