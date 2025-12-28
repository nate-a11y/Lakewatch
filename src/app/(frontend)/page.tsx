import { Metadata } from 'next'
import { Hero, ServicesPreview, TrustSignals, Testimonials, CTA } from '@/components/sections'
import { siteConfig } from '@/lib/utils'

export const metadata: Metadata = {
  title: `${siteConfig.name} | Professional Home Watch & Concierge Services`,
  description: 'Peace of mind for your Lake of the Ozarks property. Professional home watch inspections, pre-arrival preparation, storm checks, and concierge services.',
  keywords: [
    'home watch',
    'Lake of the Ozarks',
    'property management',
    'concierge services',
    'home inspections',
    'lake property',
    'vacation home',
    'Missouri',
  ],
  openGraph: {
    title: `${siteConfig.name} | Professional Home Watch & Concierge Services`,
    description: 'Peace of mind for your Lake of the Ozarks property. Professional home watch and concierge services.',
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: 'en_US',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesPreview />
      <TrustSignals />
      <Testimonials />
      <CTA />
    </>
  )
}
