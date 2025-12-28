import { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { Section, SectionHeader, SectionTitle, SectionSubtitle } from '@/components/ui/section'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CTA } from '@/components/sections'
import { siteConfig } from '@/lib/utils'
import { MapPin, Check, HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: `Service Area | ${siteConfig.name}`,
  description: 'Lake Watch Pros serves properties throughout Lake of the Ozarks including Lake Ozark, Osage Beach, Four Seasons, Sunrise Beach, Camdenton, and surrounding areas.',
}

const primaryAreas = [
  {
    name: 'Village of Four Seasons',
    description: 'Porto Cima, Shawnee Bend, and surrounding developments',
  },
  {
    name: 'Lake Ozark',
    description: 'Bagnell Dam area and Highway 54 corridor',
  },
  {
    name: 'Osage Beach',
    description: 'Main commercial area and lakefront properties',
  },
  {
    name: 'Sunrise Beach',
    description: 'West side communities and coves',
  },
]

const additionalAreas = [
  'Eldon',
  'Linn Creek',
  'Camdenton',
  'Laurie',
  'Gravois Mills',
  'Roach',
  'Climax Springs',
  'Rocky Mount',
  'Versailles',
  'Greenview',
]

const mileMarkers = [
  { range: 'Mile Markers 0-20', areas: 'Bagnell Dam, Lake Ozark, HH Highway area' },
  { range: 'Mile Markers 20-40', areas: 'Osage Beach, Grand Glaize, Lazy Gator area' },
  { range: 'Mile Markers 40-60', areas: 'Gravois Arm, Laurie, Hurricane Deck' },
  { range: 'Mile Markers 60+', areas: 'Extended coverage available upon request' },
]

export default function ServiceAreaPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-[#060606]">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6">Coverage Area</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Our <span className="text-[#4cbb17]">Service Area</span>
            </h1>
            <p className="text-lg md:text-xl text-[#a1a1aa]">
              Proudly serving lake properties throughout the Lake of the Ozarks region.
            </p>
          </div>
        </Container>
      </section>

      {/* Map Placeholder */}
      <Section className="bg-[#0f0f0f] py-12">
        <Container>
          <Card className="overflow-hidden">
            <div className="aspect-video bg-[#060606] flex items-center justify-center relative">
              {/* Stylized map representation */}
              <div className="absolute inset-0 opacity-20">
                <svg viewBox="0 0 800 450" className="w-full h-full">
                  {/* Lake outline - simplified representation */}
                  <path
                    d="M100,200 Q200,100 350,150 Q450,80 500,180 Q600,120 700,200 Q650,300 550,280 Q450,350 350,280 Q250,350 150,280 Q80,250 100,200"
                    fill="none"
                    stroke="#4cbb17"
                    strokeWidth="2"
                  />
                  {/* Location markers */}
                  {[
                    { x: 350, y: 150, label: 'Lake Ozark' },
                    { x: 450, y: 180, label: 'Osage Beach' },
                    { x: 300, y: 220, label: 'Four Seasons' },
                    { x: 550, y: 200, label: 'Sunrise Beach' },
                    { x: 600, y: 250, label: 'Camdenton' },
                  ].map((marker, i) => (
                    <g key={i}>
                      <circle cx={marker.x} cy={marker.y} r="8" fill="#4cbb17" />
                      <circle cx={marker.x} cy={marker.y} r="12" fill="none" stroke="#4cbb17" strokeWidth="2" opacity="0.5" />
                    </g>
                  ))}
                </svg>
              </div>
              <div className="text-center z-10 p-8">
                <MapPin className="h-16 w-16 text-[#4cbb17] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Lake of the Ozarks, Missouri</h3>
                <p className="text-[#a1a1aa]">Serving the entire lake community</p>
              </div>
            </div>
          </Card>
        </Container>
      </Section>

      {/* Primary Service Areas */}
      <Section className="bg-[#060606]">
        <Container>
          <SectionHeader>
            <SectionTitle>Primary Service Areas</SectionTitle>
            <SectionSubtitle>
              Our core service areas with the fastest response times.
            </SectionSubtitle>
          </SectionHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {primaryAreas.map((area) => (
              <Card key={area.name} hover>
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="w-10 h-10 bg-[#4cbb17] rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-[#060606]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">{area.name}</h3>
                    <p className="text-[#a1a1aa]">{area.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Mile Markers */}
      <Section className="bg-[#0f0f0f]">
        <Container>
          <SectionHeader>
            <SectionTitle>Coverage by Mile Marker</SectionTitle>
            <SectionSubtitle>
              We service properties throughout the lake&apos;s main channel and arms.
            </SectionSubtitle>
          </SectionHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mileMarkers.map((marker) => (
              <div
                key={marker.range}
                className="flex items-center gap-4 p-4 rounded-lg border border-[#27272a] bg-[#060606]"
              >
                <Check className="h-5 w-5 text-[#4cbb17] flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">{marker.range}</p>
                  <p className="text-sm text-[#71717a]">{marker.areas}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Additional Areas */}
      <Section className="bg-[#060606]">
        <Container>
          <SectionHeader>
            <SectionTitle>Additional Communities Served</SectionTitle>
            <SectionSubtitle>
              We also provide services to these surrounding areas.
            </SectionSubtitle>
          </SectionHeader>

          <div className="flex flex-wrap justify-center gap-3">
            {additionalAreas.map((area) => (
              <span
                key={area}
                className="px-4 py-2 rounded-full bg-[#0f0f0f] border border-[#27272a] text-[#a1a1aa]"
              >
                {area}
              </span>
            ))}
          </div>
        </Container>
      </Section>

      {/* Not Sure Section */}
      <Section className="bg-[#0f0f0f]">
        <Container size="narrow">
          <Card className="text-center p-8 md:p-12">
            <HelpCircle className="h-12 w-12 text-[#4cbb17] mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Not Sure If We Cover Your Area?
            </h2>
            <p className="text-[#a1a1aa] mb-6 max-w-xl mx-auto">
              We&apos;re always expanding our service area to meet the needs of lake property owners. Even if you don&apos;t see your location listed, reach out—we may still be able to help.
            </p>
            <Button href="/contact" size="lg">
              Contact Us
            </Button>
          </Card>
        </Container>
      </Section>

      <CTA />
    </>
  )
}
