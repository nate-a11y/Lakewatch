'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Clock, CheckCircle, Navigation, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface Inspection {
  id: number
  propertyName: string
  address: string
  lat: number
  lng: number
  status: 'upcoming' | 'in_progress' | 'completed'
  scheduledTime?: string
  technicianName?: string
}

interface LiveMapWidgetProps {
  inspections?: Inspection[]
  accessToken?: string
  className?: string
}

export function LiveMapWidget({
  inspections = [],
  accessToken,
  className
}: LiveMapWidgetProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#22c55e' // green-500
      case 'in_progress':
        return '#eab308' // yellow-500
      default:
        return '#71717a' // zinc-500
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in_progress':
        return <Navigation className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-[#71717a]" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      default:
        return 'Upcoming'
    }
  }

  useEffect(() => {
    if (!mapContainer.current || !accessToken) return

    mapboxgl.accessToken = accessToken

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-95.7129, 37.0902], // Center of US
      zoom: 4,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    return () => {
      markersRef.current.forEach(marker => marker.remove())
      map.current?.remove()
    }
  }, [accessToken])

  useEffect(() => {
    if (!map.current || inspections.length === 0) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add markers for each inspection
    const bounds = new mapboxgl.LngLatBounds()

    inspections.forEach((inspection) => {
      // Create custom marker element
      const el = document.createElement('div')
      el.className = 'inspection-marker'
      el.style.cssText = `
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: ${getStatusColor(inspection.status)};
        border: 3px solid #0f0f0f;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      `

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="color: #fff; padding: 8px; min-width: 180px;">
          <p style="font-weight: 600; margin: 0 0 4px 0;">${inspection.propertyName}</p>
          <p style="color: #a1a1aa; font-size: 12px; margin: 0 0 4px 0;">${inspection.address}</p>
          <div style="display: flex; justify-content: space-between; font-size: 12px;">
            <span>${inspection.scheduledTime || 'TBD'}</span>
            <span style="color: ${getStatusColor(inspection.status)};">${getStatusLabel(inspection.status)}</span>
          </div>
          ${inspection.technicianName ? `<p style="color: #4cbb17; font-size: 12px; margin: 4px 0 0 0;">${inspection.technicianName}</p>` : ''}
        </div>
      `)

      const marker = new mapboxgl.Marker(el)
        .setLngLat([inspection.lng, inspection.lat])
        .setPopup(popup)
        .addTo(map.current!)

      markersRef.current.push(marker)
      bounds.extend([inspection.lng, inspection.lat])
    })

    // Fit map to show all markers
    if (inspections.length > 0) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12,
      })
    }
  }, [inspections])

  // If no access token, show list view fallback
  if (!accessToken) {
    return (
      <div className={cn('bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6', className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#4cbb17]" />
            <h3 className="font-semibold">Today&apos;s Inspections</h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#71717a]" />
              Upcoming
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              In Progress
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Completed
            </span>
          </div>
        </div>

        {inspections.length === 0 ? (
          <div className="text-center py-8 text-[#71717a]">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No inspections scheduled today</p>
          </div>
        ) : (
          <div className="space-y-2">
            {inspections.map((inspection) => (
              <div
                key={inspection.id}
                className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded-lg hover:bg-[#171717] transition-colors"
              >
                {getStatusIcon(inspection.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{inspection.propertyName}</p>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      inspection.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                      inspection.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-[#27272a] text-[#71717a]'
                    )}>
                      {getStatusLabel(inspection.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-[#71717a]">
                    <span>{inspection.address}</span>
                    {inspection.technicianName && (
                      <span className="text-[#4cbb17]">{inspection.technicianName}</span>
                    )}
                  </div>
                </div>
                <span className="text-sm text-[#71717a]">{inspection.scheduledTime}</span>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-[#71717a] mt-4 text-center">
          Add NEXT_PUBLIC_MAPBOX_TOKEN to enable map view
        </p>
      </div>
    )
  }

  return (
    <div className={cn(
      'bg-[#0f0f0f] border border-[#27272a] rounded-xl overflow-hidden',
      isExpanded ? 'fixed inset-4 z-50' : '',
      className
    )}>
      <div className="flex items-center justify-between p-4 border-b border-[#27272a]">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#4cbb17]" />
          <h3 className="font-semibold">Today&apos;s Inspections Map</h3>
          <span className="text-sm text-[#71717a]">({inspections.length})</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#71717a]" />
              Upcoming
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              In Progress
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Completed
            </span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-[#27272a] rounded transition-colors"
            title={isExpanded ? 'Minimize' : 'Maximize'}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={mapContainer}
        className={cn(
          'w-full',
          isExpanded ? 'h-[calc(100%-60px)]' : 'h-[300px]'
        )}
      />
    </div>
  )
}
