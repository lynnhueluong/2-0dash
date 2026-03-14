'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
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
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
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
          <p className="text-[#6B6B6B]">
            We sent a link to <strong className="text-[#FAFAFA]">{email}</strong>. 
            Click it to sign in — no password needed.
          </p>
          <button
            onClick={() => setMagicLinkSent(false)}
            className="text-[#D4AF37] text-sm hover:underline"
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
          <div className="text-[#D4AF37] font-mono text-sm tracking-widest uppercase">The 2.0 Collective</div>
          <h1 className="text-3xl font-bold">Welcome back.</h1>
          <p className="text-[#6B6B6B]">Let&apos;s pick up where you left off.</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-lg border border-[#2A2A2A] p-1">
          <button
            onClick={() => setMode('password')}
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${
              mode === 'password' 
                ? 'bg-[#2A2A2A] text-[#FAFAFA]' 
                : 'text-[#6B6B6B] hover:text-[#FAFAFA]'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setMode('magic')}
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${
              mode === 'magic' 
                ? 'bg-[#2A2A2A] text-[#FAFAFA]' 
                : 'text-[#6B6B6B] hover:text-[#FAFAFA]'
            }`}
          >
            Magic Link
          </button>
        </div>

        {/* Form */}
        <form onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-[#A0A0A0]">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 bg-[#141414] border border-[#2A2A2A] rounded-lg text-[#FAFAFA] placeholder-[#6B6B6B] focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>

          {mode === 'password' && (
            <div className="space-y-2">
              <label className="text-sm text-[#A0A0A0]">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-[#141414] border border-[#2A2A2A] rounded-lg text-[#FAFAFA] placeholder-[#6B6B6B] focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
          )}

          {error && (
            <div className="px-4 py-3 bg-red-950/30 border border-red-800 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#D4AF37] text-[#0A0A0A] font-bold rounded-lg hover:bg-[#F0D060] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in...' : mode === 'password' ? 'Sign In' : 'Send Magic Link'}
          </button>
        </form>

        <p className="text-center text-[#6B6B6B] text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#D4AF37] hover:underline">
            Join 2.0
          </Link>
        </p>
      </div>
    </div>
  )
}
