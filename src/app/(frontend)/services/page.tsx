import { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CTA } from '@/components/sections'
import { siteConfig } from '@/lib/utils'
import {
  Eye,
  Home,
  Plane,
  CloudLightning,
  Users,
  ShoppingCart,
  Snowflake,
  Sun,
  AlertTriangle,
  Check,
} from 'lucide-react'

export const metadata: Metadata = {
  title: `Services | ${siteConfig.name}`,
  description: 'Comprehensive home watch, concierge, and property management services for Lake of the Ozarks properties. Inspections, storm checks, winterization, and more.',
}

const services = [
  {
    id: 'home-watch',
    icon: Eye,
    title: 'Home Watch Inspections',
    description: 'Regular, thorough property inspections to catch issues before they become costly problems. Our trained professionals check every aspect of your home.',
    features: [
      'Interior and exterior visual inspection',
      'HVAC system operation check',
      'Plumbing inspection for leaks',
      'Electrical system check',
      'Security system verification',
      'Appliance operation test',
      'Pest and rodent inspection',
      'Detailed photo documentation',
      'Same-day digital report',
    ],
    pricing: 'Starting at $45/month',
    popular: true,
  },
  {
    id: 'pre-arrival',
    icon: Plane,
    title: 'Pre-Arrival Preparation',
    description: 'Arrive to a perfectly prepared home. We ensure everything is ready for your visit so you can start relaxing immediately.',
    features: [
      'Climate control adjustment',
      'Lights and electronics on',
      'Fresh linens (upon request)',
      'General cleaning coordination',
      'Hot tub/pool preparation',
      'Dock and boat lift check',
      'Grocery stocking available',
      'Mail and package collection',
    ],
    pricing: '$75 - $150',
  },
  {
    id: 'post-departure',
    icon: Home,
    title: 'Post-Departure Closing',
    description: 'Leave worry-free knowing your home is properly secured and protected after your visit.',
    features: [
      'Complete walk-through inspection',
      'Climate adjustment for vacancy',
      'All entry points secured',
      'Appliances turned off',
      'Trash and recycling removal',
      'Water shut-off (seasonal)',
      'Security system armed',
      'Digital confirmation report',
    ],
    pricing: '$75 - $150',
  },
  {
    id: 'storm-check',
    icon: CloudLightning,
    title: 'Storm & Weather Checks',
    description: 'Immediate property assessment after severe weather. We respond quickly to identify and mitigate damage.',
    features: [
      'Rapid response after severe weather',
      'Exterior damage assessment',
      'Interior water intrusion check',
      'Roof and gutter inspection',
      'Window and door seal check',
      'Dock and waterfront assessment',
      'Emergency repairs coordination',
      'Insurance documentation photos',
    ],
    pricing: '$60 per check',
  },
  {
    id: 'contractor-coordination',
    icon: Users,
    title: 'Contractor Coordination',
    description: 'We serve as your on-site representative, meeting contractors, overseeing work, and ensuring quality.',
    features: [
      'Contractor meet and greet',
      'Key and access management',
      'Work progress monitoring',
      'Quality verification',
      'Communication relay',
      'Final walk-through',
      'Payment coordination (optional)',
      'Project documentation',
    ],
    pricing: '$40 per visit',
  },
  {
    id: 'concierge',
    icon: ShoppingCart,
    title: 'Concierge Services',
    description: 'Personalized services to make your lake stay exceptional. We handle the details so you can enjoy your time.',
    features: [
      'Grocery shopping and stocking',
      'Restaurant reservations',
      'Event ticket procurement',
      'Boat rental arrangements',
      'Golf tee times',
      'Spa appointments',
      'Transportation coordination',
      'Custom requests welcomed',
    ],
    pricing: '$50/hour',
  },
  {
    id: 'winterization',
    icon: Snowflake,
    title: 'Winterization Services',
    description: 'Comprehensive winterization to protect your property from freeze damage during the cold months.',
    features: [
      'Water system drain-down',
      'Pipe insulation check',
      'Water heater preparation',
      'Toilet and appliance treatment',
      'Outdoor faucet protection',
      'Sprinkler system blow-out coordination',
      'HVAC maintenance scheduling',
      'Documentation of all services',
    ],
    pricing: '$150 - $300',
  },
  {
    id: 'summerization',
    icon: Sun,
    title: 'Summerization Services',
    description: 'Get your property ready for the active season. We restore all systems for your summer enjoyment.',
    features: [
      'Water system restoration',
      'System pressure testing',
      'Appliance reconnection',
      'HVAC summer preparation',
      'Dock preparation',
      'Outdoor furniture setup',
      'Pool/hot tub coordination',
      'Complete system check',
    ],
    pricing: '$150 - $300',
  },
  {
    id: 'emergency',
    icon: AlertTriangle,
    title: 'Emergency Response',
    description: '24/7 emergency response for unexpected situations. We act quickly to protect your property.',
    features: [
      '24/7 availability',
      'Rapid response time',
      'Emergency repairs coordination',
      'Utility shut-off assistance',
      'Emergency contact notification',
      'Insurance company liaison',
      'Temporary security measures',
      'Follow-up inspections',
    ],
    pricing: 'Contact for rates',
    emergency: true,
  },
]

export default function ServicesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-[#060606]">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6">Comprehensive Property Care</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Our <span className="text-[#4cbb17]">Services</span>
            </h1>
            <p className="text-lg md:text-xl text-[#a1a1aa]">
              From routine inspections to full concierge support, we offer everything you need to protect and enjoy your Lake of the Ozarks property.
            </p>
          </div>
        </Container>
      </section>

      {/* Services Grid */}
      <Section className="bg-[#0f0f0f]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((service) => (
              <Card
                key={service.id}
                id={service.id}
                className="relative overflow-hidden scroll-mt-32"
              >
                {service.popular && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="success">Most Popular</Badge>
                  </div>
                )}
                {service.emergency && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-red-500/10 text-red-500 border-red-500/20">24/7</Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="w-14 h-14 bg-[#4cbb17]/10 rounded-xl flex items-center justify-center mb-4">
                    <service.icon className="h-7 w-7 text-[#4cbb17]" />
                  </div>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                  <p className="text-[#4cbb17] font-semibold mt-2">{service.pricing}</p>
                </CardHeader>

                <CardContent>
                  <CardDescription className="mb-6">{service.description}</CardDescription>

                  <h4 className="text-sm font-semibold text-white mb-3">What&apos;s Included:</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-[#a1a1aa]">
                        <Check className="h-4 w-4 text-[#4cbb17] flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-[#a1a1aa] mb-6">
              Need a custom package? We&apos;ll create a service plan tailored to your specific needs.
            </p>
            <Button href="/contact" size="lg">
              Request Custom Quote
            </Button>
          </div>
        </Container>
      </Section>

      <CTA />
    </>
  )
}
