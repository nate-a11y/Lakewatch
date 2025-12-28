import { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { siteConfig } from '@/lib/utils'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { ContactForm } from './contact-form'

export const metadata: Metadata = {
  title: `Contact Us | ${siteConfig.name}`,
  description: 'Get in touch with Lake Watch Pros. Schedule a free consultation for home watch and concierge services at Lake of the Ozarks.',
}

const contactInfo = [
  {
    icon: Phone,
    title: 'Phone',
    content: siteConfig.phone,
    href: `tel:${siteConfig.phone.replace(/\D/g, '')}`,
    action: 'Call us',
  },
  {
    icon: Mail,
    title: 'Email',
    content: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
    action: 'Email us',
  },
  {
    icon: MapPin,
    title: 'Service Area',
    content: 'Lake of the Ozarks, Missouri',
    href: '/service-area',
    action: 'View coverage',
  },
  {
    icon: Clock,
    title: 'Hours',
    content: 'Mon-Fri: 8am-6pm\n24/7 Emergency',
    href: null,
  },
]

export default function ContactPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-[#060606]">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6">Get in Touch</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Contact <span className="text-[#4cbb17]">Us</span>
            </h1>
            <p className="text-lg md:text-xl text-[#a1a1aa]">
              Ready to protect your lake property? Schedule a free consultation or send us a message.
            </p>
          </div>
        </Container>
      </section>

      {/* Contact Section */}
      <Section className="bg-[#0f0f0f]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold text-white mb-6">Get in Touch</h2>
              <div className="space-y-4">
                {contactInfo.map((item) => (
                  <Card key={item.title}>
                    <CardContent className="flex items-start gap-4 pt-6">
                      <div className="w-10 h-10 bg-[#4cbb17]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-5 w-5 text-[#4cbb17]" />
                      </div>
                      <div>
                        <h3 className="text-sm text-[#71717a] mb-1">{item.title}</h3>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-white hover:text-[#4cbb17] transition-colors whitespace-pre-line"
                          >
                            {item.content}
                          </a>
                        ) : (
                          <p className="text-white whitespace-pre-line">{item.content}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Additional info */}
              <div className="mt-8 p-6 rounded-xl bg-[#060606] border border-[#27272a]">
                <h3 className="text-lg font-semibold text-white mb-3">Free Consultation</h3>
                <p className="text-[#a1a1aa] text-sm">
                  Not sure what services you need? Schedule a free consultation and we&apos;ll assess your property and recommend the best plan for your situation. No obligation, just honest advice.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-white mb-2">Send Us a Message</h2>
                <p className="text-[#a1a1aa] mb-6">
                  Fill out the form below and we&apos;ll get back to you within 24 hours.
                </p>
                <ContactForm />
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
