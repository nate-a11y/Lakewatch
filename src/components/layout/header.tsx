'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'About', href: '/about' },
  { name: 'Service Area', href: '/service-area' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Contact', href: '/contact' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#060606]/95 backdrop-blur-sm border-b border-[#27272a]">
      <Container>
        <nav className="flex items-center justify-between py-4" aria-label="Main navigation">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3" aria-label="Lake Watch Pros Home">
            <Image
              src="/logo.jpg"
              alt="Lake Watch Pros"
              width={50}
              height={50}
              className="rounded-full"
              priority
            />
            <span className="hidden sm:block text-xl font-bold text-white">
              Lake Watch <span className="text-[#4cbb17]">Pros</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href={`tel:${siteConfig.phone.replace(/\D/g, '')}`}
              className="flex items-center gap-2 text-sm font-medium text-[#4cbb17] hover:text-[#60e421] transition-colors"
            >
              <Phone className="h-4 w-4" />
              {siteConfig.phone}
            </a>
            <Button href="/contact" size="sm">
              Get a Free Quote
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className={cn(
            'lg:hidden overflow-hidden transition-all duration-300',
            mobileMenuOpen ? 'max-h-screen pb-6' : 'max-h-0'
          )}
        >
          <div className="flex flex-col gap-4 pt-4 border-t border-[#27272a]">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-base font-medium text-[#a1a1aa] hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-4 mt-2 border-t border-[#27272a]">
              <a
                href={`tel:${siteConfig.phone.replace(/\D/g, '')}`}
                className="flex items-center gap-2 text-base font-medium text-[#4cbb17]"
              >
                <Phone className="h-5 w-5" />
                {siteConfig.phone}
              </a>
              <Button href="/contact" className="w-full">
                Get a Free Quote
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </header>
  )
}
