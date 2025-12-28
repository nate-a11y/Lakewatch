'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FAQ {
  question: string
  answer: string
}

interface FAQAccordionProps {
  faqs: FAQ[]
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="border border-[#27272a] rounded-xl overflow-hidden bg-[#060606]"
        >
          <button
            onClick={() => toggle(index)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-[#0f0f0f] transition-colors"
            aria-expanded={openIndex === index}
          >
            <span className="text-white font-medium pr-4">{faq.question}</span>
            <ChevronDown
              className={cn(
                'h-5 w-5 text-[#4cbb17] flex-shrink-0 transition-transform duration-200',
                openIndex === index && 'rotate-180'
              )}
            />
          </button>
          <div
            className={cn(
              'overflow-hidden transition-all duration-300',
              openIndex === index ? 'max-h-96' : 'max-h-0'
            )}
          >
            <div className="p-5 pt-0 text-[#a1a1aa] leading-relaxed">{faq.answer}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
