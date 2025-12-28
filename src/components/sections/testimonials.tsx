'use client'

import { useState } from 'react'
import { Container } from '@/components/ui/container'
import { Section, SectionHeader, SectionTitle, SectionSubtitle } from '@/components/ui/section'
import { Card } from '@/components/ui/card'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: 'Sarah M.',
    location: 'Lake Ozark',
    quote: 'Lake Watch Pros gives us complete peace of mind. Knowing someone is checking on our property regularly while we\'re away is invaluable. They caught a small leak before it became a major problem!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Robert & Linda K.',
    location: 'Osage Beach',
    quote: 'The pre-arrival service is fantastic. We arrive to a perfectly prepared home every time—temperature set, lights on, groceries stocked. It feels like coming home to a five-star resort.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Mike T.',
    location: 'Four Seasons',
    quote: 'After a major storm, they were at our property within hours to check for damage and secure everything. Their quick response prevented thousands in additional damage.',
    rating: 5,
  },
  {
    id: 4,
    name: 'Jennifer H.',
    location: 'Sunrise Beach',
    quote: 'The concierge services make our lake trips so much easier. Having groceries ready and restaurant reservations made ahead of time lets us start relaxing the moment we arrive.',
    rating: 5,
  },
  {
    id: 5,
    name: 'David & Carol P.',
    location: 'Camdenton',
    quote: 'We\'ve used Lake Watch Pros for two years now. Their attention to detail and professionalism is unmatched. They treat our property like it\'s their own.',
    rating: 5,
  },
]

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <Section className="bg-[#060606]">
      <Container size="narrow">
        <SectionHeader>
          <SectionTitle>
            What Our <span className="text-[#4cbb17]">Clients Say</span>
          </SectionTitle>
          <SectionSubtitle>
            Don&apos;t just take our word for it—hear from lake property owners who trust us with their homes.
          </SectionSubtitle>
        </SectionHeader>

        <div className="relative">
          <Card className="text-center py-8 md:py-12 px-6 md:px-12">
            {/* Quote icon */}
            <Quote className="h-12 w-12 text-[#4cbb17]/30 mx-auto mb-6" />

            {/* Rating */}
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(currentTestimonial.rating)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-[#4cbb17] text-[#4cbb17]" />
              ))}
            </div>

            {/* Quote text */}
            <blockquote className="text-lg md:text-xl text-white mb-6 leading-relaxed">
              &ldquo;{currentTestimonial.quote}&rdquo;
            </blockquote>

            {/* Author */}
            <div className="text-[#a1a1aa]">
              <p className="font-semibold text-white">{currentTestimonial.name}</p>
              <p className="text-sm">{currentTestimonial.location}</p>
            </div>
          </Card>

          {/* Navigation buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-[#1a1a1a] border border-[#27272a] text-white hover:bg-[#27272a] hover:border-[#4cbb17] transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Dots indicator */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-[#4cbb17]' : 'bg-[#27272a]'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="p-3 rounded-full bg-[#1a1a1a] border border-[#27272a] text-white hover:bg-[#27272a] hover:border-[#4cbb17] transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Container>
    </Section>
  )
}
