import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
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
