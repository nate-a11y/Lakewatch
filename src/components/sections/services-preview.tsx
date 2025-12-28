import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { Section, SectionHeader, SectionTitle, SectionSubtitle } from '@/components/ui/section'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Eye,
  Home,
  CloudLightning,
  Users,
  Snowflake,
  ShoppingCart,
  ArrowRight,
} from 'lucide-react'

const services = [
  {
    icon: Eye,
    title: 'Home Watch Inspections',
    description: 'Regular property inspections to catch issues before they become costly problems.',
    href: '/services#home-watch',
  },
  {
    icon: Home,
    title: 'Pre-Arrival Preparation',
    description: 'Your home is ready and waiting when you arrive—climate set, lights on, everything perfect.',
    href: '/services#pre-arrival',
  },
  {
    icon: CloudLightning,
    title: 'Storm & Weather Checks',
    description: 'Immediate property assessment after severe weather to identify and address damage.',
    href: '/services#storm-check',
  },
  {
    icon: Users,
    title: 'Contractor Coordination',
    description: 'We meet contractors, oversee work, and ensure projects are completed to your standards.',
    href: '/services#contractor-coordination',
  },
  {
    icon: Snowflake,
    title: 'Winterization Services',
    description: 'Comprehensive winterization to protect your property from freeze damage.',
    href: '/services#winterization',
  },
  {
    icon: ShoppingCart,
    title: 'Concierge Services',
    description: 'Grocery stocking, reservations, and personalized services to make your stay perfect.',
    href: '/services#concierge',
  },
]

export function ServicesPreview() {
  return (
    <Section id="services" className="bg-[#060606]">
      <Container>
        <SectionHeader>
          <SectionTitle>
            Services Tailored to <span className="text-[#4cbb17]">Your Needs</span>
          </SectionTitle>
          <SectionSubtitle>
            From routine inspections to full concierge support, we handle every detail so you can enjoy your lake property worry-free.
          </SectionSubtitle>
        </SectionHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link key={service.title} href={service.href}>
              <Card hover className="h-full group">
                <CardHeader>
                  <div className="w-12 h-12 bg-[#4cbb17]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#4cbb17]/20 transition-colors">
                    <service.icon className="h-6 w-6 text-[#4cbb17]" />
                  </div>
                  <CardTitle className="group-hover:text-[#4cbb17] transition-colors">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardDescription>{service.description}</CardDescription>
                <div className="mt-4 flex items-center text-[#4cbb17] text-sm font-medium">
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button href="/services" variant="outline" size="lg">
            View All Services
          </Button>
        </div>
      </Container>
    </Section>
  )
}
