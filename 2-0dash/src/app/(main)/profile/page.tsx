export const dynamic = 'force-dynamic'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Download, ArrowRight } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: appUser }] = await Promise.all([
    supabase.from('ambition_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('users').select('*').eq('id', user.id).single(),
  ])

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-4">
        <h1 className="text-2xl font-bold">Your Ambition Profile isn&apos;t ready yet.</h1>
        <p className="text-gray-500">Complete the 3-stage advancement process to build your profile.</p>
        <Link href="/define" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
          Start Career Inventory →
        </Link>
      </div>
    )
  }

  const inv = profile.inventory_data as Record<string, unknown> | null
  const road = profile.roadmap_data as Record<string, unknown> | null
  const narr = profile.narrative_data as Record<string, unknown> | null
  const dis = profile.disambiguated_terms as Record<string, string> | null

  // Pre-cast arrays so && chains don't widen to unknown
  const skills = inv && Array.isArray(inv.skills) ? (inv.skills as string[]) : null
  const skillGaps = inv && Array.isArray(inv.skill_gaps) ? (inv.skill_gaps as string[]) : null
  const values = road && Array.isArray(road.values) ? (road.values as string[]) : null
  const dealbreakers = road && Array.isArray(road.dealbreakers) ? (road.dealbreakers as string[]) : null

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-blue-600 text-xs font-mono uppercase tracking-wider mb-1">Ambition Profile</div>
            <h1 className="text-2xl font-bold">{String(appUser?.name || user.email || '')}</h1>
          </div>
          <a
            href="/api/export"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors"
          >
            <Download size={14} />
            Export
          </a>
        </div>

        {/* Career Narrative */}
        {narr && (
          <section className="p-5 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
            <h2 className="text-sm text-blue-600 font-mono uppercase tracking-wider">Career Narrative</h2>
            <p className="leading-relaxed">{String(narr.full_narrative || '')}</p>

            {Boolean(narr.elevator_pitch) && (
              <div className="border-t border-gray-200 pt-4">
                <div className="text-xs text-gray-500 mb-2">Elevator Pitch</div>
                <p className="text-sm text-gray-500 leading-relaxed">{String(narr.elevator_pitch)}</p>
              </div>
            )}
          </section>
        )}

        {/* Career Inventory */}
        {inv && (
          <section className="space-y-4">
            <h2 className="text-sm text-gray-500 font-mono uppercase tracking-wider flex items-center justify-between">
              Career Inventory
              <Link href="/define" className="text-blue-600 text-xs hover:underline flex items-center gap-1">Edit <ArrowRight size={12} /></Link>
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {skills && skills.length > 0 && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                  <div className="text-xs text-gray-500">Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-200 rounded text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {skillGaps && skillGaps.length > 0 && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                  <div className="text-xs text-gray-500">Skill Gaps to Close</div>
                  <div className="flex flex-wrap gap-2">
                    {skillGaps.map((s, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-600/10 border border-blue-600/30 rounded text-xs text-blue-600">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {Boolean(inv.current_situation) && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <div className="text-xs text-gray-500">Current Situation</div>
                <p className="text-sm leading-relaxed text-gray-500">{String(inv.current_situation)}</p>
              </div>
            )}
          </section>
        )}

        {/* 2.0 Roadmap */}
        {road && (
          <section className="space-y-4">
            <h2 className="text-sm text-gray-500 font-mono uppercase tracking-wider flex items-center justify-between">
              2.0 Roadmap
              <Link href="/opportunity" className="text-blue-600 text-xs hover:underline flex items-center gap-1">Edit <ArrowRight size={12} /></Link>
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {values && values.length > 0 && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                  <div className="text-xs text-gray-500">Values</div>
                  <div className="flex flex-wrap gap-2">
                    {values.map((v, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-200 rounded text-xs">{v}</span>
                    ))}
                  </div>
                </div>
              )}

              {dealbreakers && dealbreakers.length > 0 && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                  <div className="text-xs text-gray-500">Dealbreakers</div>
                  <div className="flex flex-wrap gap-2">
                    {dealbreakers.map((d, i) => (
                      <span key={i} className="px-2 py-1 bg-red-50 border border-red-300/30 rounded text-xs text-red-600">{d}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {Boolean(road.three_year_vision) && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <div className="text-xs text-gray-500">3-Year Vision</div>
                <p className="text-sm leading-relaxed text-gray-500">{String(road.three_year_vision)}</p>
              </div>
            )}
          </section>
        )}

        {/* My Terms */}
        {dis && Object.keys(dis).length > 0 && (
          <section className="space-y-4">
            <h2 className="text-sm text-gray-500 font-mono uppercase tracking-wider">My Terms</h2>
            <div className="space-y-3">
              {Object.entries(dis).map(([term, definition]) => (
                <div key={term} className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="text-xs text-blue-600 font-mono mb-1 capitalize">{term}</div>
                  <p className="text-sm text-gray-500 leading-relaxed">{definition}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
