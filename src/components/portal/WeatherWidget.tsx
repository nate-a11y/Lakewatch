import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  Snowflake,
  CloudFog,
  Moon,
  CloudMoon,
  Thermometer,
  Droplets,
  Wind,
} from 'lucide-react'

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

interface WeatherData {
  temperature: number
  feelsLike: number
  condition: string
  description: string
  icon: WeatherIcon
  humidity: number
  windSpeed: number
  location: string
}

interface WeatherWidgetProps {
  weather: WeatherData
  propertyName?: string
}

const iconMap = {
  sun: Sun,
  cloud: Cloud,
  'cloud-sun': CloudSun,
  'cloud-rain': CloudRain,
  'cloud-lightning': CloudLightning,
  snowflake: Snowflake,
  'cloud-fog': CloudFog,
  moon: Moon,
  'cloud-moon': CloudMoon,
}

const iconBgMap: Record<WeatherIcon, string> = {
  sun: 'bg-yellow-500/10',
  cloud: 'bg-slate-500/10',
  'cloud-sun': 'bg-blue-500/10',
  'cloud-rain': 'bg-blue-600/10',
  'cloud-lightning': 'bg-purple-500/10',
  snowflake: 'bg-cyan-500/10',
  'cloud-fog': 'bg-slate-400/10',
  moon: 'bg-indigo-500/10',
  'cloud-moon': 'bg-indigo-400/10',
}

const iconColorMap: Record<WeatherIcon, string> = {
  sun: 'text-yellow-400',
  cloud: 'text-slate-400',
  'cloud-sun': 'text-blue-400',
  'cloud-rain': 'text-blue-500',
  'cloud-lightning': 'text-purple-400',
  snowflake: 'text-cyan-400',
  'cloud-fog': 'text-slate-400',
  moon: 'text-indigo-300',
  'cloud-moon': 'text-indigo-400',
}

export function WeatherWidget({ weather, propertyName }: WeatherWidgetProps) {
  const Icon = iconMap[weather.icon]
  const bgColor = iconBgMap[weather.icon]
  const iconColor = iconColorMap[weather.icon]

  return (
    <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-[#71717a]" />
              <span className="font-semibold text-lg">{weather.temperature}°F</span>
            </div>
            <span className="text-[#71717a] capitalize">{weather.description}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-[#71717a] mt-1">
            <span className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5" />
              {weather.humidity}%
            </span>
            <span className="flex items-center gap-1">
              <Wind className="w-3.5 h-3.5" />
              {weather.windSpeed} mph
            </span>
          </div>
          {propertyName && (
            <p className="text-sm text-[#71717a] mt-0.5">{propertyName}</p>
          )}
        </div>
      </div>
    </div>
  )
}
