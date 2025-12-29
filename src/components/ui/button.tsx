'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  children: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', href, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4cbb17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060606] disabled:opacity-50 disabled:pointer-events-none rounded-lg active:scale-[0.98]'

    const variants = {
      primary:
        'bg-[#4cbb17] text-[#060606] hover:bg-[#60e421] hover:shadow-lg hover:shadow-[#4cbb17]/25 active:bg-[#3a8e11]',
      secondary:
        'bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] border border-[#27272a]',
      outline:
        'border-2 border-[#4cbb17] text-[#4cbb17] hover:bg-[#4cbb17] hover:text-[#060606]',
      ghost: 'text-white hover:bg-white/10',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }

    const classes = cn(baseStyles, variants[variant], sizes[size], className)

    if (href) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      )
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
