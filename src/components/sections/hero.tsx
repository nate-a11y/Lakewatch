import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Badge } from '@/components/ui/badge'
import { Shield, Clock, MapPin } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#060606] via-[#0a0a0a] to-[#060606]" />

      {/* Decorative elements */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#4cbb17]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-[#4cbb17]/5 rounded-full blur-3xl" />

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <Badge className="mb-6">Serving Lake of the Ozarks</Badge>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Peace of Mind for Your{' '}
            <span className="text-[#4cbb17]">Lake Property</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-[#a1a1aa] mb-8 max-w-2xl mx-auto">
            Professional home watch and concierge services that keep your Lake of the Ozarks property secure, maintained, and ready for your arrival.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button href="/contact" size="lg">
              Get a Free Quote
            </Button>
            <Button href="/services" variant="outline" size="lg">
              Explore Services
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            <div className="flex items-center gap-2 text-[#a1a1aa]">
              <Shield className="h-5 w-5 text-[#4cbb17]" />
              <span className="text-sm">Fully Insured & Bonded</span>
            </div>
            <div className="flex items-center gap-2 text-[#a1a1aa]">
              <Clock className="h-5 w-5 text-[#4cbb17]" />
              <span className="text-sm">24/7 Emergency Response</span>
            </div>
            <div className="flex items-center gap-2 text-[#a1a1aa]">
              <MapPin className="h-5 w-5 text-[#4cbb17]" />
              <span className="text-sm">Locally Owned & Operated</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
