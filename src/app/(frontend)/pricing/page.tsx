import { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { Section, SectionHeader, SectionTitle, SectionSubtitle } from '@/components/ui/section'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CTA } from '@/components/sections'
import { siteConfig } from '@/lib/utils'
import { Check, Info } from 'lucide-react'

export const metadata: Metadata = {
  title: `Pricing | ${siteConfig.name}`,
  description: 'Transparent pricing for home watch and concierge services at Lake of the Ozarks. Find the right plan for your property.',
}

const homeWatchPlans = [
  {
    name: 'Under 2,000 sq ft',
    perVisit: '$50',
    monthly1x: '$45/mo',
    monthly2x: '$80/mo',
    monthly4x: '$150/mo',
  },
  {
    name: '2,000 - 4,000 sq ft',
    perVisit: '$65',
    monthly1x: '$60/mo',
    monthly2x: '$110/mo',
    monthly4x: '$200/mo',
    popular: true,
  },
  {
    name: '4,000 - 6,500 sq ft',
    perVisit: '$85',
    monthly1x: '$80/mo',
    monthly2x: '$150/mo',
    monthly4x: '$280/mo',
  },
  {
    name: 'Over 6,500 sq ft',
    perVisit: '$110+',
    note: 'Custom quote required',
  },
]

const conciergeServices = [
  { service: 'Hourly Rate', price: '$50/hr', note: '1-hour minimum' },
  { service: 'Pre-Arrival Preparation', price: '$75 - $150', note: 'Based on home size' },
  { service: 'Post-Departure Closing', price: '$75 - $150', note: 'Based on home size' },
  { service: 'Grocery Stocking', price: '$50 + cost', note: 'Plus cost of goods' },
  { service: 'Storm/Weather Check', price: '$60', note: 'Per check' },
  { service: 'Contractor Meet/Key-In', price: '$40', note: 'Per visit' },
  { service: 'Winterization', price: '$150 - $300', note: 'Based on home size' },
  { service: 'Summerization', price: '$150 - $300', note: 'Based on home size' },
]

const included = [
  'Comprehensive interior & exterior inspection',
  'Photo documentation with every visit',
  'Same-day digital report',
  'HVAC, plumbing, and electrical checks',
  'Security system verification',
  'Pest inspection',
  'Mail & package collection',
  '24/7 emergency contact availability',
]

export default function PricingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-[#060606]">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6">Transparent Pricing</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Simple, <span className="text-[#4cbb17]">Honest Pricing</span>
            </h1>
            <p className="text-lg md:text-xl text-[#a1a1aa]">
              No hidden fees, no surprises. Choose the plan that fits your property and needs.
            </p>
          </div>
        </Container>
      </section>

      {/* Home Watch Pricing */}
      <Section className="bg-[#0f0f0f]">
        <Container>
          <SectionHeader>
            <SectionTitle>Home Watch Plans</SectionTitle>
            <SectionSubtitle>
              Regular property inspections to keep your lake home protected year-round.
            </SectionSubtitle>
          </SectionHeader>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#27272a]">
                  <th className="text-left py-4 px-4 text-white font-semibold">Property Size</th>
                  <th className="text-center py-4 px-4 text-white font-semibold">Per Visit</th>
                  <th className="text-center py-4 px-4 text-white font-semibold">1x/Month</th>
                  <th className="text-center py-4 px-4 text-white font-semibold">2x/Month</th>
                  <th className="text-center py-4 px-4 text-white font-semibold">
                    <span className="flex items-center justify-center gap-2">
                      4x/Month
                      <Badge variant="success" className="text-xs">Best Value</Badge>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {homeWatchPlans.map((plan) => (
                  <tr
                    key={plan.name}
                    className={`border-b border-[#27272a] ${plan.popular ? 'bg-[#4cbb17]/5' : ''}`}
                  >
                    <td className="py-4 px-4">
                      <span className="text-white font-medium">{plan.name}</span>
                      {plan.popular && (
                        <Badge variant="outline" className="ml-2 text-xs">Popular</Badge>
                      )}
                    </td>
                    <td className="text-center py-4 px-4 text-[#a1a1aa]">{plan.perVisit}</td>
                    <td className="text-center py-4 px-4 text-[#a1a1aa]">{plan.monthly1x || '-'}</td>
                    <td className="text-center py-4 px-4 text-[#a1a1aa]">{plan.monthly2x || '-'}</td>
                    <td className="text-center py-4 px-4">
                      {plan.monthly4x ? (
                        <span className="text-[#4cbb17] font-semibold">{plan.monthly4x}</span>
                      ) : plan.note ? (
                        <span className="text-[#71717a] text-sm">{plan.note}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {homeWatchPlans.map((plan) => (
              <Card key={plan.name} className={plan.popular ? 'border-[#4cbb17]/50' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {plan.popular && <Badge variant="success">Popular</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-[#a1a1aa]">Per Visit</div>
                    <div className="text-white font-medium">{plan.perVisit}</div>

                    {plan.monthly1x && (
                      <>
                        <div className="text-[#a1a1aa]">1x/Month</div>
                        <div className="text-white">{plan.monthly1x}</div>
                      </>
                    )}

                    {plan.monthly2x && (
                      <>
                        <div className="text-[#a1a1aa]">2x/Month</div>
                        <div className="text-white">{plan.monthly2x}</div>
                      </>
                    )}

                    {plan.monthly4x && (
                      <>
                        <div className="text-[#a1a1aa]">4x/Month</div>
                        <div className="text-[#4cbb17] font-semibold">{plan.monthly4x}</div>
                      </>
                    )}

                    {plan.note && (
                      <div className="col-span-2 text-[#71717a] text-sm mt-2">{plan.note}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* What's Included */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>What&apos;s Included in Every Home Watch Visit</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[#a1a1aa]">
                    <Check className="h-5 w-5 text-[#4cbb17] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </Container>
      </Section>

      {/* Concierge Pricing */}
      <Section className="bg-[#060606]">
        <Container>
          <SectionHeader>
            <SectionTitle>Concierge Services</SectionTitle>
            <SectionSubtitle>
              Additional services to make your lake property experience exceptional.
            </SectionSubtitle>
          </SectionHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {conciergeServices.map((item) => (
              <Card key={item.service}>
                <CardContent className="pt-6">
                  <h3 className="text-white font-semibold mb-2">{item.service}</h3>
                  <p className="text-2xl font-bold text-[#4cbb17] mb-1">{item.price}</p>
                  <p className="text-sm text-[#71717a]">{item.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Note */}
          <div className="mt-12 p-6 bg-[#0f0f0f] rounded-xl border border-[#27272a] flex gap-4">
            <Info className="h-6 w-6 text-[#4cbb17] flex-shrink-0" />
            <div>
              <h3 className="text-white font-semibold mb-2">Need a Custom Quote?</h3>
              <p className="text-[#a1a1aa]">
                Every property is unique. Schedule a free consultation and we&apos;ll create a customized service plan that fits your specific needs and budget. No obligation, just honest advice.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <CTA />
    </>
  )
}
