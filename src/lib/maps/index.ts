// Maps utilities using Mapbox API

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

interface Coordinates {
  latitude: number
  longitude: number
}

interface GeocodingResult {
  address: string
  coordinates: Coordinates
  placeId: string
}

// Geocode an address to coordinates
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  const encodedAddress = encodeURIComponent(address)
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_TOKEN}&country=US&types=address&limit=1`

  const response = await fetch(url)
  if (!response.ok) {
    console.error('Geocoding failed:', response.statusText)
    return null
  }

  const data = await response.json()

  if (!data.features || data.features.length === 0) {
    return null
  }

  const feature = data.features[0]
  return {
    address: feature.place_name,
    coordinates: {
      longitude: feature.center[0],
      latitude: feature.center[1],
    },
    placeId: feature.id,
  }
}

// Reverse geocode coordinates to address
export async function reverseGeocode(coordinates: Coordinates): Promise<string | null> {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates.longitude},${coordinates.latitude}.json?access_token=${MAPBOX_TOKEN}&types=address&limit=1`

  const response = await fetch(url)
  if (!response.ok) {
    console.error('Reverse geocoding failed:', response.statusText)
    return null
  }

  const data = await response.json()

  if (!data.features || data.features.length === 0) {
    return null
  }

  return data.features[0].place_name
}

// Calculate distance between two points (in miles)
export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRad(point2.latitude - point1.latitude)
  const dLon = toRad(point2.longitude - point1.longitude)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.latitude)) *
      Math.cos(toRad(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Get driving directions between two points
export async function getDirections(
  origin: Coordinates,
  destination: Coordinates
): Promise<{
  distance: number // in miles
  duration: number // in minutes
  geometry: string // encoded polyline
} | null> {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?access_token=${MAPBOX_TOKEN}&geometries=polyline&overview=simplified`

  const response = await fetch(url)
  if (!response.ok) {
    console.error('Directions failed:', response.statusText)
    return null
  }

  const data = await response.json()

  if (!data.routes || data.routes.length === 0) {
    return null
  }

  const route = data.routes[0]
  return {
    distance: route.distance * 0.000621371, // meters to miles
    duration: route.duration / 60, // seconds to minutes
    geometry: route.geometry,
  }
}

// Optimize route for multiple stops
export async function optimizeRoute(
  origin: Coordinates,
  destinations: Coordinates[]
): Promise<{
  orderedStops: number[] // indices of destinations in optimized order
  totalDistance: number // in miles
  totalDuration: number // in minutes
  legs: Array<{
    distance: number
    duration: number
  }>
} | null> {
  if (destinations.length === 0) {
    return { orderedStops: [], totalDistance: 0, totalDuration: 0, legs: [] }
  }

  // Build coordinates string
  const coords = [
    `${origin.longitude},${origin.latitude}`,
    ...destinations.map((d) => `${d.longitude},${d.latitude}`),
  ].join(';')

  const url = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coords}?access_token=${MAPBOX_TOKEN}&roundtrip=false&source=first&destination=any&geometries=polyline`

  const response = await fetch(url)
  if (!response.ok) {
    console.error('Route optimization failed:', response.statusText)
    return null
  }

  const data = await response.json()

  if (!data.trips || data.trips.length === 0) {
    return null
  }

  const trip = data.trips[0]

  // Extract ordered waypoint indices (subtract 1 because origin is index 0)
  const orderedStops = data.waypoints
    .slice(1) // Skip origin
    .sort((a: { waypoint_index: number }, b: { waypoint_index: number }) =>
      a.waypoint_index - b.waypoint_index
    )
    .map((_: unknown, idx: number) => idx)

  // Map legs
  const legs = trip.legs.map((leg: { distance: number; duration: number }) => ({
    distance: leg.distance * 0.000621371,
    duration: leg.duration / 60,
  }))

  return {
    orderedStops,
    totalDistance: trip.distance * 0.000621371,
    totalDuration: trip.duration / 60,
    legs,
  }
}

// Check if a point is within a certain radius of another point
export function isWithinRadius(
  point: Coordinates,
  center: Coordinates,
  radiusMiles: number
): boolean {
  const distance = calculateDistance(point, center)
  return distance <= radiusMiles
}

// Format coordinates for display
export function formatCoordinates(coordinates: Coordinates): string {
  return `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`
}

// Generate static map URL for embedding
export function getStaticMapUrl(
  center: Coordinates,
  zoom = 14,
  width = 400,
  height = 300,
  markers?: Coordinates[]
): string {
  let url = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static`

  // Add markers if provided
  if (markers && markers.length > 0) {
    const markerStrings = markers.map(
      (m) => `pin-s+4cbb17(${m.longitude},${m.latitude})`
    )
    url += `/${markerStrings.join(',')}`
  }

  url += `/${center.longitude},${center.latitude},${zoom}/${width}x${height}@2x?access_token=${MAPBOX_TOKEN}`

  return url
}

// Get estimated travel time between multiple points
export async function getMatrixDistances(
  origins: Coordinates[],
  destinations: Coordinates[]
): Promise<{
  distances: number[][] // miles
  durations: number[][] // minutes
} | null> {
  const coords = [...origins, ...destinations]
    .map((c) => `${c.longitude},${c.latitude}`)
    .join(';')

  const sources = origins.map((_, i) => i).join(';')
  const dests = destinations.map((_, i) => i + origins.length).join(';')

  const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${coords}?sources=${sources}&destinations=${dests}&access_token=${MAPBOX_TOKEN}`

  const response = await fetch(url)
  if (!response.ok) {
    console.error('Matrix request failed:', response.statusText)
    return null
  }

  const data = await response.json()

  // Convert distances to miles and durations to minutes
  const distances = data.distances.map((row: number[]) =>
    row.map((d: number) => d * 0.000621371)
  )
  const durations = data.durations.map((row: number[]) =>
    row.map((d: number) => d / 60)
  )

  return { distances, durations }
}
