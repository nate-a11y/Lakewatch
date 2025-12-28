import { cn } from '@/lib/utils'

interface SectionProps {
  children: React.ReactNode
  className?: string
  id?: string
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn('py-16 md:py-24', className)}>
      {children}
    </section>
  )
}

export function SectionHeader({
  children,
  className,
  centered = true,
}: {
  children: React.ReactNode
  className?: string
  centered?: boolean
}) {
  return (
    <div className={cn('mb-12', centered && 'text-center', className)}>
      {children}
    </div>
  )
}

export function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h2 className={cn('text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4', className)}>
      {children}
    </h2>
  )
}

export function SectionSubtitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p className={cn('text-lg md:text-xl text-[#a1a1aa] max-w-3xl mx-auto', className)}>
      {children}
    </p>
  )
}
