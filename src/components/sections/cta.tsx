import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { Phone } from 'lucide-react'
import { siteConfig } from '@/lib/utils'

export function CTA() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-[#4cbb17]/10 via-[#060606] to-[#060606] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#4cbb17]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4cbb17]/5 rounded-full blur-3xl" />

      <Container className="relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready for <span className="text-[#4cbb17]">Peace of Mind</span>?
          </h2>
          <p className="text-lg md:text-xl text-[#a1a1aa] mb-8">
            Schedule a free consultation to discuss your property&apos;s needs. No obligation, just honest advice from local experts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/contact" size="lg">
              Schedule Free Consultation
            </Button>
            <Button
              variant="outline"
              size="lg"
              href={`tel:${siteConfig.phone.replace(/\D/g, '')}`}
            >
              <Phone className="mr-2 h-5 w-5" />
              {siteConfig.phone}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
