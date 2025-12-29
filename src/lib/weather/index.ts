// Weather API integration using weatherapi.com
// Free tier: 1M calls/month, current + forecast

interface WeatherData {
  temperature: number // Fahrenheit
  feelsLike: number
  condition: string
  description: string
  icon: WeatherIcon
  humidity: number
  windSpeed: number // mph
  location: string
}

type WeatherIcon =
  | 'sun'
  | 'cloud'
  | 'cloud-sun'
  | 'cloud-rain'
  | 'cloud-lightning'
  | 'snowflake'
  | 'cloud-fog'
  | 'moon'
  | 'cloud-moon'

interface WeatherAPIResponse {
  location: {
    name: string
    region: string
  }
  current: {
    temp_f: number
    feelslike_f: number
    humidity: number
    wind_mph: number
    is_day: number
    condition: {
      text: string
      code: number
    }
  }
}

// Map WeatherAPI condition codes to our icon types
// https://www.weatherapi.com/docs/weather_conditions.json
function mapWeatherIcon(code: number, isDay: boolean): WeatherIcon {
  // Sunny/Clear (1000)
  if (code === 1000) return isDay ? 'sun' : 'moon'

  // Partly cloudy (1003)
  if (code === 1003) return isDay ? 'cloud-sun' : 'cloud-moon'

  // Cloudy, Overcast (1006, 1009)
  if (code === 1006 || code === 1009) return 'cloud'

  // Mist, Fog (1030, 1135, 1147)
  if (code === 1030 || code === 1135 || code === 1147) return 'cloud-fog'

  // Rain conditions (1063, 1150-1201, 1240-1246)
  if (
    code === 1063 ||
    (code >= 1150 && code <= 1201) ||
    (code >= 1240 && code <= 1246)
  ) {
    return 'cloud-rain'
  }

  // Snow conditions (1066, 1114, 1117, 1210-1225, 1255-1264)
  if (
    code === 1066 ||
    code === 1114 ||
    code === 1117 ||
    (code >= 1210 && code <= 1225) ||
    (code >= 1255 && code <= 1264)
  ) {
    return 'snowflake'
  }

  // Thunderstorm (1087, 1273-1282)
  if (code === 1087 || (code >= 1273 && code <= 1282)) {
    return 'cloud-lightning'
  }

  // Default to cloud
  return 'cloud'
}

// Lake of the Ozarks coordinates (Osage Beach, MO area)
const LAKE_OF_OZARKS = {
  lat: 38.1195,
  lon: -92.6238,
}

export async function getWeather(
  lat: number = LAKE_OF_OZARKS.lat,
  lon: number = LAKE_OF_OZARKS.lon
): Promise<WeatherData | null> {
  const apiKey = process.env.WEATHERAPI_KEY

  if (!apiKey) {
    console.warn('WEATHERAPI_KEY not configured, using fallback weather')
    return null
  }

  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&aqi=no`,
      {
        next: { revalidate: 1800 }, // Cache for 30 minutes
      }
    )

    if (!response.ok) {
      console.error('Weather API error:', response.status)
      return null
    }

    const data: WeatherAPIResponse = await response.json()
    const isDay = data.current.is_day === 1

    return {
      temperature: Math.round(data.current.temp_f),
      feelsLike: Math.round(data.current.feelslike_f),
      condition: data.current.condition.text,
      description: data.current.condition.text.toLowerCase(),
      icon: mapWeatherIcon(data.current.condition.code, isDay),
      humidity: data.current.humidity,
      windSpeed: Math.round(data.current.wind_mph),
      location: data.location.name,
    }
  } catch (error) {
    console.error('Failed to fetch weather:', error)
    return null
  }
}

// Fallback weather data when API is unavailable
export function getFallbackWeather(): WeatherData {
  const hour = new Date().getHours()
  const isNight = hour < 6 || hour > 20

  return {
    temperature: 68,
    feelsLike: 68,
    condition: 'Clear',
    description: 'partly cloudy',
    icon: isNight ? 'moon' : 'cloud-sun',
    humidity: 45,
    windSpeed: 8,
    location: 'Lake of the Ozarks',
  }
}

// Get weather with fallback
export async function getWeatherWithFallback(
  lat?: number,
  lon?: number
): Promise<WeatherData> {
  const weather = await getWeather(lat, lon)
  return weather ?? getFallbackWeather()
}
