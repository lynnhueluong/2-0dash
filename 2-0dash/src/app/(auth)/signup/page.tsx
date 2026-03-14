'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [referral, setReferral] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, name, referral_source: referral },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=%2Fdashboard`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user && !data.session) {
      setSuccess(true)
      setLoading(false)
    } else if (data.session) {
      router.push('/dashboard')
      router.refresh()
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-4xl">🎉</div>
          <h1 className="text-2xl font-bold">You&apos;re in. Almost.</h1>
          <p className="text-[#6B6B6B]">
            Check your email at <strong className="text-[#FAFAFA]">{email}</strong> and confirm your account. 
            Then we&apos;ll get started on your Ambition Profile.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="text-[#D4AF37] font-mono text-sm tracking-widest uppercase">The 2.0 Collective</div>
          <h1 className="text-3xl font-bold">Build your Ambition Profile.</h1>
          <p className="text-[#6B6B6B]">
            This is your personal career data infrastructure. Let&apos;s build it right.
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-[#A0A0A0]">Your name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="First name is fine"
              required
              className="w-full px-4 py-3 bg-[#141414] border border-[#2A2A2A] rounded-lg text-[#FAFAFA] placeholder-[#6B6B6B] focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>

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

          <div className="space-y-2">
            <label className="text-sm text-[#A0A0A0]">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="8+ characters"
              required
              className="w-full px-4 py-3 bg-[#141414] border border-[#2A2A2A] rounded-lg text-[#FAFAFA] placeholder-[#6B6B6B] focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[#A0A0A0]">How&apos;d you find 2.0? <span className="text-[#6B6B6B]">(optional)</span></label>
            <input
              type="text"
              value={referral}
              onChange={e => setReferral(e.target.value)}
              placeholder="Friend, social media, event..."
              className="w-full px-4 py-3 bg-[#141414] border border-[#2A2A2A] rounded-lg text-[#FAFAFA] placeholder-[#6B6B6B] focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>

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
            {loading ? 'Creating your account...' : "Let's go →"}
          </button>
        </form>

        <p className="text-center text-[#6B6B6B] text-sm">
          Already a member?{' '}
          <Link href="/login" className="text-[#D4AF37] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
