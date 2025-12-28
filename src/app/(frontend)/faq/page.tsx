import { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { Section, SectionHeader, SectionTitle, SectionSubtitle } from '@/components/ui/section'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CTA } from '@/components/sections'
import { siteConfig } from '@/lib/utils'
import { FAQAccordion } from './faq-accordion'

export const metadata: Metadata = {
  title: `FAQ | ${siteConfig.name}`,
  description: 'Frequently asked questions about Lake Watch Pros home watch and concierge services at Lake of the Ozarks.',
}

const faqCategories = [
  {
    id: 'general',
    name: 'General',
    faqs: [
      {
        question: 'What is home watch service?',
        answer: 'Home watch is a professional service that provides regular, thorough inspections of your property while you\'re away. We check all aspects of your home—HVAC, plumbing, security, and more—to catch potential issues before they become expensive problems.',
      },
      {
        question: 'How is Lake Watch Pros different from a property manager?',
        answer: 'While property managers typically focus on rental properties and tenant management, we specialize in watching and maintaining homes that are primarily owner-occupied vacation properties. We\'re your eyes and ears at the lake when you can\'t be there.',
      },
      {
        question: 'Are you insured and bonded?',
        answer: 'Yes, Lake Watch Pros is fully insured and bonded. We carry comprehensive liability insurance to protect your property and give you complete peace of mind.',
      },
      {
        question: 'How do I get started with your services?',
        answer: 'Simply contact us to schedule a free consultation. We\'ll visit your property, discuss your needs, and create a customized service plan. There\'s no obligation—just honest advice from local experts.',
      },
    ],
  },
  {
    id: 'home-watch',
    name: 'Home Watch',
    faqs: [
      {
        question: 'What does a home watch inspection include?',
        answer: 'Our comprehensive inspection covers interior and exterior visual checks, HVAC operation, plumbing for leaks, electrical systems, security system verification, appliance testing, pest inspection, and more. You\'ll receive a detailed report with photos after every visit.',
      },
      {
        question: 'How often should I have my home inspected?',
        answer: 'We recommend at least bi-weekly inspections for most properties. However, the ideal frequency depends on factors like your home\'s age, systems, and how long you\'re away. We can help determine the best schedule for your situation.',
      },
      {
        question: 'What happens if you find a problem during an inspection?',
        answer: 'We immediately notify you of any issues found. For urgent problems like water leaks or HVAC failures, we can coordinate emergency repairs with trusted local contractors. We\'ll document everything and keep you informed throughout the process.',
      },
      {
        question: 'Do you provide reports after each visit?',
        answer: 'Yes! After every inspection, you\'ll receive a detailed digital report with timestamps, photos, and notes on everything we checked. This documentation is also valuable for insurance purposes.',
      },
    ],
  },
  {
    id: 'concierge',
    name: 'Concierge',
    faqs: [
      {
        question: 'What concierge services do you offer?',
        answer: 'Our concierge services include grocery shopping and stocking, restaurant reservations, event tickets, boat rental arrangements, golf tee times, spa appointments, transportation coordination, and custom requests. If it makes your lake visit better, we can probably help.',
      },
      {
        question: 'How far in advance should I request concierge services?',
        answer: 'For best results, we recommend booking pre-arrival preparation and grocery stocking at least 48-72 hours in advance. For special reservations or event tickets, the more notice you can give, the better we can serve you.',
      },
      {
        question: 'Can you stock specific brands or items I prefer?',
        answer: 'Absolutely! Just provide us with your shopping list and preferences, and we\'ll ensure everything is there when you arrive. We can shop at specific stores or source specialty items upon request.',
      },
    ],
  },
  {
    id: 'pricing',
    name: 'Pricing',
    faqs: [
      {
        question: 'How is home watch pricing determined?',
        answer: 'Our home watch pricing is based on your property\'s square footage and how frequently you want inspections. We offer per-visit rates and monthly subscription plans. The more frequent the visits, the lower the per-visit cost.',
      },
      {
        question: 'Are there any hidden fees?',
        answer: 'No hidden fees, ever. Our pricing is transparent and straightforward. The only additional costs would be if you request extra services beyond your regular plan, and we\'ll always get your approval before any additional charges.',
      },
      {
        question: 'Do you offer annual contracts?',
        answer: 'We offer both month-to-month and annual plans. Annual plans provide the best value and ensure consistent protection for your property year-round. However, we understand flexibility is important, so we never lock you into long-term commitments you\'re not comfortable with.',
      },
      {
        question: 'Can I customize my service plan?',
        answer: 'Yes! Every property and owner is different. We\'ll work with you to create a customized plan that fits your specific needs and budget. Schedule a free consultation to discuss your options.',
      },
    ],
  },
  {
    id: 'insurance',
    name: 'Insurance',
    faqs: [
      {
        question: 'Does having home watch service affect my insurance?',
        answer: 'Many insurance companies look favorably on homes with professional home watch services. Regular inspections can help demonstrate due diligence in property maintenance. Some insurers may even offer premium discounts. Check with your insurance provider about potential benefits.',
      },
      {
        question: 'Do you help with insurance claims if damage occurs?',
        answer: 'Yes, our detailed inspection reports and photo documentation can be invaluable for insurance claims. We can also coordinate with your insurance adjuster and provide any documentation they need.',
      },
      {
        question: 'What liability coverage do you carry?',
        answer: 'We maintain comprehensive general liability insurance and are bonded for your protection. We\'re happy to provide proof of insurance upon request.',
      },
    ],
  },
  {
    id: 'service-area',
    name: 'Service Area',
    faqs: [
      {
        question: 'What areas do you serve?',
        answer: 'We serve properties throughout the Lake of the Ozarks region, including Lake Ozark, Osage Beach, Village of Four Seasons, Sunrise Beach, Camdenton, Laurie, and surrounding communities. If you\'re not sure if we cover your area, just ask!',
      },
      {
        question: 'Do you charge extra for properties farther from your base?',
        answer: 'Our standard pricing applies to all properties within our primary service area. For properties in extended service areas, we may have a small travel fee, but we\'ll always discuss this upfront during your consultation.',
      },
      {
        question: 'Can you service properties on the main channel and the arms?',
        answer: 'Yes, we service properties throughout the lake—main channel, Gravois Arm, Niangua Arm, and all the coves in between. Lake of the Ozarks is our home, and we know every part of it.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-[#060606]">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6">Got Questions?</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Frequently Asked <span className="text-[#4cbb17]">Questions</span>
            </h1>
            <p className="text-lg md:text-xl text-[#a1a1aa]">
              Find answers to common questions about our home watch and concierge services.
            </p>
          </div>
        </Container>
      </section>

      {/* FAQ Categories */}
      <Section className="bg-[#0f0f0f]">
        <Container>
          {/* Category Quick Links */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {faqCategories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="px-4 py-2 rounded-full bg-[#060606] border border-[#27272a] text-[#a1a1aa] hover:text-white hover:border-[#4cbb17] transition-colors"
              >
                {category.name}
              </a>
            ))}
          </div>

          {/* FAQ Sections */}
          <div className="space-y-12">
            {faqCategories.map((category) => (
              <div key={category.id} id={category.id} className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-white mb-6">{category.name}</h2>
                <FAQAccordion faqs={category.faqs} />
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Still Have Questions */}
      <Section className="bg-[#060606]">
        <Container size="narrow">
          <Card className="text-center p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Still Have Questions?
            </h2>
            <p className="text-[#a1a1aa] mb-6 max-w-xl mx-auto">
              Can&apos;t find the answer you&apos;re looking for? We&apos;re here to help. Reach out and we&apos;ll get back to you as soon as possible.
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
