'use client'

import { cn } from '@/lib/utils'

interface CustomerHealthScoreProps {
  paymentHistory: {
    onTime: number
    late: number
    total: number
  }
  engagement: {
    messages: number
    requests: number
  }
  tenureMonths: number
  className?: string
}

export function CustomerHealthScore({
  paymentHistory,
  engagement,
  tenureMonths,
  className,
}: CustomerHealthScoreProps) {
  // Calculate health score (0-100)
  const calculateScore = () => {
    let score = 0

    // Payment history (up to 40 points)
    if (paymentHistory.total > 0) {
      const onTimeRate = paymentHistory.onTime / paymentHistory.total
      score += Math.round(onTimeRate * 40)
    } else {
      score += 40 // New customers get benefit of doubt
    }

    // Engagement (up to 30 points)
    const engagementScore = Math.min(engagement.messages + engagement.requests * 2, 30)
    score += engagementScore

    // Tenure (up to 30 points)
    // 1 month = 3 points, max at 10 months
    score += Math.min(tenureMonths * 3, 30)

    return Math.min(score, 100)
  }

  const score = calculateScore()

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    if (score >= 40) return 'text-orange-500'
    return 'text-red-500'
  }

  const getScoreBgColor = () => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    if (score >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'At Risk'
  }

  const paymentRate = paymentHistory.total > 0
    ? Math.round((paymentHistory.onTime / paymentHistory.total) * 100)
    : 100

  return (
    <div className={cn('bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Customer Health</h3>
        <div className={cn(
          'text-xs px-2 py-1 rounded-full',
          score >= 80 ? 'bg-green-500/10 text-green-500' :
          score >= 60 ? 'bg-yellow-500/10 text-yellow-500' :
          score >= 40 ? 'bg-orange-500/10 text-orange-500' :
          'bg-red-500/10 text-red-500'
        )}>
          {getScoreLabel()}
        </div>
      </div>

      {/* Score Display */}
      <div className="flex items-center gap-4 mb-4">
        <div className={cn('text-4xl font-bold', getScoreColor())}>
          {score}
        </div>
        <div className="flex-1">
          <div className="h-3 bg-[#27272a] rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', getScoreBgColor())}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-[#71717a]">Payment History</span>
          <span className={paymentRate >= 90 ? 'text-green-500' : paymentRate >= 70 ? 'text-yellow-500' : 'text-red-500'}>
            {paymentRate}% on-time
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#71717a]">Engagement</span>
          <span className="text-[#a1a1aa]">
            {engagement.messages} msgs, {engagement.requests} requests
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#71717a]">Customer Since</span>
          <span className="text-[#a1a1aa]">
            {tenureMonths} {tenureMonths === 1 ? 'month' : 'months'}
          </span>
        </div>
      </div>
    </div>
  )
}
