export const dynamic = 'force-dynamic'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink, Sparkles } from 'lucide-react'

const PRICING_BADGE: Record<string, string> = {
  free: 'bg-green-950/40 text-green-400 border-green-800/40',
  freemium: 'bg-blue-950/40 text-blue-400 border-blue-800/40',
  paid: 'bg-[#2A2A2A] text-[#6B6B6B] border-[#3A3A3A]',
}

const TYPE_EMOJI: Record<string, string> = {
  tool: '🛠',
  book: '📚',
  course: '🎓',
  community: '🤝',
  framework: '🗺',
  template: '📋',
  office_hours: '💬',
}

export default async function ResourcesPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: appUser }, { data: matches }, { data: profile }] = await Promise.all([
    supabase.from('users').select('profile_completed').eq('id', user.id).single(),
    supabase.from('matches').select('*, resource:resources(*)').eq('user_id', user.id).order('match_score', { ascending: false }),
    supabase.from('ambition_profiles').select('id').eq('user_id', user.id).single(),
  ])

  if (!appUser?.profile_completed && (!matches || matches.length === 0)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-4">
        <Sparkles size={32} className="text-[#D4AF37]" />
        <h1 className="text-2xl font-bold">Your matched resources are waiting.</h1>
        <p className="text-[#6B6B6B] max-w-md">
          Complete your Ambition Profile first. Then we&apos;ll match you to tools and resources based on 
          exactly where you are and where you&apos;re going.
        </p>
        <Link href="/define" className="px-6 py-3 bg-[#D4AF37] text-[#0A0A0A] font-bold rounded-xl hover:bg-[#F0D060] transition-colors">
          Start the process →
        </Link>
      </div>
    )
  }

  // Suppress unused variable warning for profile
  void profile

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div>
          <div className="text-[#D4AF37] text-xs font-mono uppercase tracking-wider mb-1">Cross-pollinated for you</div>
          <h1 className="text-2xl font-bold">Your Matched Resources</h1>
          <p className="text-[#6B6B6B] text-sm mt-1">
            {matches?.length || 0} resources matched to your Ambition Profile — based on your values, skill gaps, and where you&apos;re headed.
          </p>
        </div>

        {(!matches || matches.length === 0) && (
          <div className="text-center py-12 text-[#6B6B6B]">
            <p>No matches yet. Complete your Ambition Profile to get matched.</p>
          </div>
        )}

        <div className="space-y-4">
          {(matches || []).map((match: Record<string, unknown>) => {
            const resource = match.resource as Record<string, unknown> | null
            if (!resource) return null
            const reasons = (match.match_reason as Record<string, unknown>)?.tags_matched as string[] || []

            return (
              <div key={String(match.id)} className="p-5 bg-[#141414] border border-[#2A2A2A] rounded-xl hover:border-[#3A3A3A] transition-colors space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{TYPE_EMOJI[String(resource.type)] || '📌'}</span>
                    <div>
                      <h3 className="font-semibold">{String(resource.name)}</h3>
                      <p className="text-sm text-[#6B6B6B]">{String(resource.description)}</p>
                    </div>
                  </div>
                  <a
                    href={String(resource.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 p-2 text-[#6B6B6B] hover:text-[#FAFAFA] transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 border rounded text-xs capitalize ${PRICING_BADGE[String(resource.pricing)] || PRICING_BADGE.paid}`}>
                    {String(resource.pricing)}
                  </span>
                  {reasons.slice(0, 2).map((reason, i) => (
                    <span key={i} className="px-2 py-0.5 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded text-xs text-[#D4AF37]">
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
