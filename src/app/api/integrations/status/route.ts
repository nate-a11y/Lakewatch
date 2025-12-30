import { NextResponse } from 'next/server'

// GET /api/integrations/status - Check which integrations are configured
export async function GET() {
  // Check server-only environment variables
  const status = {
    stripe: !!process.env.STRIPE_SECRET_KEY && !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    resend: !!process.env.RESEND_API_KEY,
    twilio: !!process.env.TWILIO_ACCOUNT_SID && !!process.env.TWILIO_AUTH_TOKEN,
    mapbox: !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    weather: !!process.env.WEATHERAPI_KEY,
  }

  return NextResponse.json(status)
}
