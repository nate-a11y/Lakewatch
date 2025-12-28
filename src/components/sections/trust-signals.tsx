import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Shield, Award, Users, Clock, Car } from 'lucide-react'

const trustItems = [
  {
    icon: Shield,
    title: 'Fully Insured',
    description: 'Comprehensive liability coverage protects your property and gives you peace of mind.',
  },
  {
    icon: Award,
    title: 'Bonded',
    description: 'Our bonding provides additional financial protection for our clients.',
  },
  {
    icon: Users,
    title: 'Locally Owned',
    description: 'We live at the lake and understand the unique needs of lake property owners.',
  },
  {
    icon: Clock,
    title: 'Responsive Service',
    description: 'Quick response times and 24/7 emergency availability when you need us most.',
  },
  {
    icon: Car,
    title: 'Lake Ride Pros Family',
    description: 'Part of the trusted Lake Ride Pros family of companies serving the lake community.',
  },
]

export function TrustSignals() {
  return (
    <Section className="bg-[#0f0f0f]">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why Choose <span className="text-[#4cbb17]">Lake Watch Pros</span>?
          </h2>
          <p className="text-lg text-[#a1a1aa] max-w-2xl mx-auto">
            We&apos;re committed to providing reliable, professional service that lake property owners can trust.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {trustItems.map((item) => (
            <div
              key={item.title}
              className="text-center p-6 rounded-xl bg-[#060606] border border-[#27272a]"
            >
              <div className="w-14 h-14 bg-[#4cbb17]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <item.icon className="h-7 w-7 text-[#4cbb17]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-[#a1a1aa]">{item.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
