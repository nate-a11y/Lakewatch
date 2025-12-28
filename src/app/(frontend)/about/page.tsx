import { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { Section, SectionHeader, SectionTitle, SectionSubtitle } from '@/components/ui/section'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CTA } from '@/components/sections'
import { siteConfig } from '@/lib/utils'
import { Shield, Clock, MapPin, Heart, Car, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: `About Us | ${siteConfig.name}`,
  description: 'Learn about Lake Watch Pros - locally owned and operated home watch and concierge services for Lake of the Ozarks. Part of the Lake Ride Pros family.',
}

const values = [
  {
    icon: Shield,
    title: 'Trust & Reliability',
    description: 'We treat every property as if it were our own. Fully insured and bonded for your peace of mind.',
  },
  {
    icon: Clock,
    title: 'Responsive Service',
    description: 'Quick response times and 24/7 emergency availability. When you need us, we\'re there.',
  },
  {
    icon: MapPin,
    title: 'Local Expertise',
    description: 'We live at the lake and understand the unique challenges of lake property ownership.',
  },
  {
    icon: Heart,
    title: 'Personal Attention',
    description: 'Every client receives personalized service tailored to their specific needs and preferences.',
  },
]

const team = [
  {
    name: 'Jim Brentlinger',
    role: 'Co-Owner',
    bio: 'Lake of the Ozarks resident with deep roots in the community and a passion for exceptional service.',
  },
  {
    name: 'Nate Bulock',
    role: 'Co-Owner',
    bio: 'Dedicated to building lasting relationships with property owners and ensuring their complete satisfaction.',
  },
  {
    name: 'Michael Brandt',
    role: 'Co-Owner',
    bio: 'Committed to operational excellence and delivering premium service to every Lake Watch Pros client.',
  },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-[#060606]">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6">Our Story</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              About <span className="text-[#4cbb17]">Lake Watch Pros</span>
            </h1>
            <p className="text-lg md:text-xl text-[#a1a1aa]">
              Locally owned, professionally operated, and committed to protecting your Lake of the Ozarks investment.
            </p>
          </div>
        </Container>
      </section>

      {/* Story Section */}
      <Section className="bg-[#0f0f0f]">
        <Container size="narrow">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
            <p className="text-lg text-[#a1a1aa] mb-6">
              Lake Watch Pros was born from a simple observation: Lake of the Ozarks property owners needed a trustworthy partner to protect their investments when they couldn&apos;t be there.
            </p>
            <p className="text-lg text-[#a1a1aa] mb-6">
              As part of the Lake Ride Pros family of companies, we bring the same dedication to excellence and customer service that has made Lake Ride Pros the premier transportation service at the lake. Founded by Jim Brentlinger, Nate Bulock, and Michael Brandt in 2022, Lake Ride Pros quickly established itself as a trusted name in the community.
            </p>
            <p className="text-lg text-[#a1a1aa] mb-6">
              Lake Watch Pros extends that commitment to property owners who want peace of mind knowing their lake home is protected, maintained, and ready for their arrival. We live here, we work here, and we understand the unique needs of lake property ownership.
            </p>
            <p className="text-lg text-[#a1a1aa]">
              Whether you&apos;re a weekend visitor or only make it to the lake a few times a year, we&apos;re here to ensure your property is always in good hands.
            </p>
          </div>
        </Container>
      </Section>

      {/* Lake Ride Pros Connection */}
      <Section className="bg-[#060606]">
        <Container>
          <Card className="p-8 md:p-12 bg-gradient-to-br from-[#4cbb17]/10 to-[#060606]">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-[#060606] rounded-full flex items-center justify-center border-2 border-[#4cbb17]">
                  <Car className="h-12 w-12 text-[#4cbb17]" />
                </div>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Part of the Lake Ride Pros Family
                </h3>
                <p className="text-[#a1a1aa] mb-4">
                  Lake Watch Pros is a sister company to Lake Ride Pros, the premier transportation service at Lake of the Ozarks. Our shared ownership means the same commitment to excellence, reliability, and customer satisfaction extends to every service we provide.
                </p>
                <a
                  href="https://lakeridepros.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[#4cbb17] font-semibold hover:underline"
                >
                  Visit Lake Ride Pros →
                </a>
              </div>
            </div>
          </Card>
        </Container>
      </Section>

      {/* Values Section */}
      <Section className="bg-[#0f0f0f]">
        <Container>
          <SectionHeader>
            <SectionTitle>Our Values</SectionTitle>
            <SectionSubtitle>
              The principles that guide everything we do.
            </SectionSubtitle>
          </SectionHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value) => (
              <Card key={value.title}>
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="w-12 h-12 bg-[#4cbb17]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <value.icon className="h-6 w-6 text-[#4cbb17]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                    <p className="text-[#a1a1aa]">{value.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Team Section */}
      <Section className="bg-[#060606]">
        <Container>
          <SectionHeader>
            <SectionTitle>Meet the Team</SectionTitle>
            <SectionSubtitle>
              The people behind Lake Watch Pros.
            </SectionSubtitle>
          </SectionHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((member) => (
              <Card key={member.name} className="text-center">
                <CardContent className="pt-8 pb-6">
                  <div className="w-20 h-20 bg-[#4cbb17]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-10 w-10 text-[#4cbb17]" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-1">{member.name}</h3>
                  <p className="text-[#4cbb17] text-sm font-medium mb-3">{member.role}</p>
                  <p className="text-[#a1a1aa] text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <CTA />
    </>
  )
}
