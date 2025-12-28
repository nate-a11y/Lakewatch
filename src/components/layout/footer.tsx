import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { siteConfig } from '@/lib/utils'

const footerLinks = {
  services: [
    { name: 'Home Watch Inspections', href: '/services#home-watch' },
    { name: 'Pre-Arrival Preparation', href: '/services#pre-arrival' },
    { name: 'Concierge Services', href: '/services#concierge' },
    { name: 'Storm Checks', href: '/services#storm-check' },
    { name: 'Winterization', href: '/services#winterization' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Service Area', href: '/service-area' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ],
}

const serviceAreas = [
  'Lake Ozark',
  'Osage Beach',
  'Village of Four Seasons',
  'Sunrise Beach',
  'Camdenton',
  'Laurie',
]

export function Footer() {
  return (
    <footer className="bg-[#0f0f0f] border-t border-[#27272a]" role="contentinfo">
      <Container>
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-3 mb-6">
                <Image
                  src="/logo.jpg"
                  alt="Lake Watch Pros"
                  width={60}
                  height={60}
                  className="rounded-full"
                />
              </Link>
              <p className="text-[#a1a1aa] mb-6">
                Professional home watch and concierge services for Lake of the Ozarks properties. Peace of mind for your lake home.
              </p>
              <div className="flex gap-4">
                <a
                  href={siteConfig.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#1a1a1a] rounded-lg text-[#a1a1aa] hover:text-[#4cbb17] hover:bg-[#27272a] transition-colors"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href={siteConfig.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#1a1a1a] rounded-lg text-[#a1a1aa] hover:text-[#4cbb17] hover:bg-[#27272a] transition-colors"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Services Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Services</h3>
              <ul className="space-y-3">
                {footerLinks.services.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-[#a1a1aa] hover:text-[#4cbb17] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-[#a1a1aa] hover:text-[#4cbb17] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href={`tel:${siteConfig.phone.replace(/\D/g, '')}`}
                    className="flex items-center gap-3 text-[#a1a1aa] hover:text-[#4cbb17] transition-colors"
                  >
                    <Phone className="h-5 w-5 flex-shrink-0" />
                    {siteConfig.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="flex items-center gap-3 text-[#a1a1aa] hover:text-[#4cbb17] transition-colors"
                  >
                    <Mail className="h-5 w-5 flex-shrink-0" />
                    {siteConfig.email}
                  </a>
                </li>
                <li className="flex items-start gap-3 text-[#a1a1aa]">
                  <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{siteConfig.address}</span>
                </li>
              </ul>
              <div className="mt-6">
                <h4 className="text-sm text-white font-medium mb-2">Service Areas</h4>
                <p className="text-sm text-[#71717a]">{serviceAreas.join(' • ')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-[#27272a]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[#71717a]">
              © {new Date().getFullYear()} Lake Watch Pros. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-[#71717a]">
                Part of the{' '}
                <a
                  href="https://lakeridepros.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4cbb17] hover:underline"
                >
                  Lake Ride Pros
                </a>{' '}
                family
              </span>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
