import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createCustomer } from '@/lib/stripe'
import { sendWelcomeEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: 'customer',
        },
      },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create Stripe customer
    let stripeCustomerId: string | null = null
    try {
      const stripeCustomer = await createCustomer({
        email,
        name: `${firstName} ${lastName}`,
        phone,
        metadata: {
          supabase_id: authData.user.id,
        },
      })
      stripeCustomerId = stripeCustomer.id
    } catch (stripeError) {
      console.error('Failed to create Stripe customer:', stripeError)
    }

    // Create user record in database
    const { error: userError } = await supabase.from('lwp_users').insert({
      supabase_id: authData.user.id,
      email,
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      role: 'customer',
      stripe_customer_id: stripeCustomerId,
    })

    if (userError) {
      console.error('Failed to create user record:', userError)
    }

    // Send welcome email
    try {
      await sendWelcomeEmail({
        to: email,
        customerName: firstName,
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      })
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
