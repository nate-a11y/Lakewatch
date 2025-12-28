import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'outline'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-[#4cbb17]/10 text-[#4cbb17] border-[#4cbb17]/20',
    success: 'bg-[#4cbb17] text-[#060606]',
    outline: 'bg-transparent border-[#4cbb17] text-[#4cbb17]',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
