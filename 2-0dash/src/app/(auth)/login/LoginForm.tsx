'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [mode, setMode] = useState<'password' | 'magic'>('password')

  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const authError = searchParams.get('error')

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(redirectTo)
      router.refresh()
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setMagicLinkSent(true)
      setLoading(false)
    }
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-4xl">✉️</div>
          <h1 className="text-2xl font-bold">Check your inbox.</h1>
          <p className="text-gray-500">
            We sent a link to <strong className="text-gray-900">{email}</strong>.
            Click it to sign in — no password needed.
          </p>
          <button
            onClick={() => setMagicLinkSent(false)}
            className="text-blue-600 text-sm hover:underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-blue-600 font-mono text-sm tracking-widest uppercase">The 2.0 Collective</div>
          <h1 className="text-3xl font-bold">Welcome back.</h1>
          <p className="text-gray-500">Let&apos;s pick up where you left off.</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => setMode('password')}
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${
              mode === 'password'
                ? 'bg-gray-200 text-gray-900'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setMode('magic')}
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${
              mode === 'magic'
                ? 'bg-gray-200 text-gray-900'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Magic Link
          </button>
        </div>

        {/* Form */}
        <form onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 transition-colors"
            />
          </div>

          {mode === 'password' && (
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
          )}

          {(error || authError) && (
            <div className="px-4 py-3 bg-red-50 border border-red-300 rounded-lg text-red-600 text-sm">
              {error || authError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in...' : mode === 'password' ? 'Sign In' : 'Send Magic Link'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Join 2.0
          </Link>
        </p>
      </div>
    </div>
  )
}
