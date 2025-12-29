'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, X, Cloud, CloudRain, Zap, Wind, Thermometer } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WeatherAlert {
  type: 'warning' | 'watch' | 'advisory'
  event: string
  headline: string
  expires: string
  severity: 'minor' | 'moderate' | 'severe' | 'extreme'
}

interface WeatherAlertBannerProps {
  lat?: number
  lng?: number
  className?: string
}

export function WeatherAlertBanner({ lat, lng, className }: WeatherAlertBannerProps) {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([])
  const [dismissed, setDismissed] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, this would fetch from a weather API
    // For demo purposes, we'll simulate checking for alerts
    const checkForAlerts = async () => {
      setIsLoading(true)
      try {
        // Simulated weather check - in production would use OpenWeatherMap alerts API
        // or National Weather Service API for the US
        await new Promise(r => setTimeout(r, 500))

        // Demo: Show mock alert occasionally (10% chance)
        if (Math.random() < 0.1) {
          setAlerts([
            {
              type: 'warning',
              event: 'Thunderstorm Warning',
              headline: 'Severe Thunderstorm Warning in effect until 3:00 PM',
              expires: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
              severity: 'severe',
            },
          ])
        } else {
          setAlerts([])
        }
      } catch (error) {
        console.error('Failed to fetch weather alerts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkForAlerts()

    // Check for alerts every 15 minutes
    const interval = setInterval(checkForAlerts, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [lat, lng])

  const getAlertIcon = (event: string) => {
    const lower = event.toLowerCase()
    if (lower.includes('thunder') || lower.includes('lightning')) {
      return <Zap className="w-5 h-5" />
    }
    if (lower.includes('rain') || lower.includes('flood')) {
      return <CloudRain className="w-5 h-5" />
    }
    if (lower.includes('wind') || lower.includes('tornado')) {
      return <Wind className="w-5 h-5" />
    }
    if (lower.includes('heat') || lower.includes('cold')) {
      return <Thermometer className="w-5 h-5" />
    }
    return <Cloud className="w-5 h-5" />
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'extreme':
        return 'bg-red-500/20 border-red-500/50 text-red-400'
      case 'severe':
        return 'bg-orange-500/20 border-orange-500/50 text-orange-400'
      case 'moderate':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
      default:
        return 'bg-blue-500/20 border-blue-500/50 text-blue-400'
    }
  }

  const handleDismiss = (event: string) => {
    setDismissed((prev) => [...prev, event])
  }

  const visibleAlerts = alerts.filter((a) => !dismissed.includes(a.event))

  if (isLoading || visibleAlerts.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-2', className)}>
      {visibleAlerts.map((alert) => (
        <div
          key={alert.event}
          className={cn(
            'flex items-center gap-3 p-4 rounded-xl border animate-pulse',
            getSeverityColor(alert.severity)
          )}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {getAlertIcon(alert.event)}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{alert.headline}</p>
            <p className="text-xs opacity-75">
              Expires: {new Date(alert.expires).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>
          <button
            onClick={() => handleDismiss(alert.event)}
            className="p-2 hover:bg-black/20 rounded-lg transition-colors"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
