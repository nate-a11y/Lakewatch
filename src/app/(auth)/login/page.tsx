'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/portal'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMagicLink, setShowMagicLink] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Determine redirect based on user role
    const role = data.user?.user_metadata?.role || 'customer'
    let targetPath = redirect

    // If no explicit redirect, use role-based default
    if (redirect === '/portal') {
      if (role === 'admin' || role === 'owner') {
        targetPath = '/manage'
      } else if (role === 'technician') {
        targetPath = '/field'
      }
    }

    router.push(targetPath)
    router.refresh()
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setMagicLinkSent(true)
    setLoading(false)
  }

  if (magicLinkSent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-[#4cbb17]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-[#4cbb17]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
        <p className="text-[#a1a1aa] mb-6">
          We sent a magic link to <strong>{email}</strong>
        </p>
        <button
          onClick={() => setMagicLinkSent(false)}
          className="text-[#4cbb17] hover:underline"
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
      <p className="text-[#a1a1aa] mb-8">
        Sign in to your Lake Watch Pros account
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={showMagicLink ? handleMagicLink : handleLogin}>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] transition-colors"
              placeholder="you@example.com"
            />
          </div>

          {!showMagicLink && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] transition-colors"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : showMagicLink ? 'Send magic link' : 'Sign in'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center space-y-4">
        <button
          onClick={() => setShowMagicLink(!showMagicLink)}
          className="text-[#4cbb17] hover:underline text-sm"
        >
          {showMagicLink ? 'Use password instead' : 'Sign in with magic link'}
        </button>

        {!showMagicLink && (
          <p className="text-sm text-[#71717a]">
            <Link href="/reset-password" className="text-[#4cbb17] hover:underline">
              Forgot your password?
            </Link>
          </p>
        )}

        <p className="text-sm text-[#71717a]">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#4cbb17] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

function LoginFormFallback() {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-[#27272a] rounded mb-2 w-48" />
      <div className="h-6 bg-[#27272a] rounded mb-8 w-64" />
      <div className="space-y-4">
        <div>
          <div className="h-4 bg-[#27272a] rounded mb-2 w-12" />
          <div className="h-12 bg-[#27272a] rounded" />
        </div>
        <div>
          <div className="h-4 bg-[#27272a] rounded mb-2 w-16" />
          <div className="h-12 bg-[#27272a] rounded" />
        </div>
        <div className="h-12 bg-[#27272a] rounded" />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  )
}
