export const dynamic = 'force-dynamic'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Circle, Loader } from 'lucide-react'

const STAGES = [
  { key: 'inventory', label: 'Career Inventory', href: '/define', description: 'Map your skills, gaps & lifestyle design' },
  { key: 'roadmap', label: '2.0 Roadmap', href: '/opportunity', description: 'Surface your values, priorities & dealbreakers' },
  { key: 'narrative', label: 'Career Narrative', href: '/narrative', description: 'Synthesize your communicable professional identity' },
]

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: appUser }, { data: profile }, { data: matches }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('ambition_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('matches').select('id').eq('user_id', user.id),
  ])

  const currentStage = appUser?.current_stage || 'inventory'
  const isComplete = appUser?.profile_completed || false

  const getStageStatus = (stageKey: string) => {
    const stageOrder = ['inventory', 'roadmap', 'narrative', 'complete']
    const currentIdx = stageOrder.indexOf(currentStage)
    const stageIdx = stageOrder.indexOf(stageKey)
    if (stageIdx < currentIdx) return 'done'
    if (stageIdx === currentIdx) return 'active'
    return 'locked'
  }

  const currentStageData = STAGES.find(s => s.key === currentStage) || STAGES[0]

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold">
            {isComplete ? 'Your Ambition Profile is live.' : `Hey${appUser?.name ? `, ${appUser.name.split(' ')[0]}` : ''}. Let's build your Ambition Profile.`}
          </h1>
          <p className="text-[#6B6B6B] mt-1">
            {isComplete 
              ? "You've completed the 2.0 advancement process. This is your career data infrastructure."
              : "Three stages. Real talk. No generic advice. You've got this."}
          </p>
        </div>

        {/* Current Stage CTA */}
        {!isComplete && (
          <Link
            href={currentStageData.href}
            className="block p-5 bg-[#D4AF37]/10 border border-[#D4AF37]/40 rounded-xl hover:border-[#D4AF37] transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[#D4AF37] text-xs font-mono uppercase tracking-wider mb-1">Continue where you left off</div>
                <h2 className="text-lg font-bold">{currentStageData.label}</h2>
                <p className="text-sm text-[#6B6B6B]">{currentStageData.description}</p>
              </div>
              <ArrowRight className="text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        )}

        {/* Stage Progress */}
        <div className="space-y-3">
          <h2 className="text-sm text-[#6B6B6B] font-mono uppercase tracking-wider">Your Process</h2>
          {STAGES.map((stage) => {
            const status = getStageStatus(stage.key)
            return (
              <Link
                key={stage.key}
                href={stage.href}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                  status === 'active' 
                    ? 'border-[#D4AF37]/40 bg-[#D4AF37]/5 hover:border-[#D4AF37]' 
                    : status === 'done'
                    ? 'border-[#2A2A2A] bg-[#141414] hover:border-[#3A3A3A]'
                    : 'border-[#2A2A2A] opacity-50 cursor-not-allowed pointer-events-none'
                }`}
              >
                <div className={`flex-shrink-0 ${status === 'done' ? 'text-[#22C55E]' : status === 'active' ? 'text-[#D4AF37]' : 'text-[#6B6B6B]'}`}>
                  {status === 'done' ? <CheckCircle size={20} /> : status === 'active' ? <Loader size={20} /> : <Circle size={20} />}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{stage.label}</div>
                  <div className="text-xs text-[#6B6B6B]">{stage.description}</div>
                </div>
                {status !== 'locked' && <ArrowRight size={16} className="text-[#6B6B6B]" />}
              </Link>
            )
          })}
        </div>

        {/* Ambition Profile Preview */}
        {profile && (profile.narrative_data as Record<string, unknown>)?.full_narrative && (
          <div className="p-5 bg-[#141414] border border-[#2A2A2A] rounded-xl space-y-3">
            <div className="text-xs text-[#D4AF37] font-mono uppercase tracking-wider">Your Career Narrative</div>
            <p className="text-sm leading-relaxed text-[#A0A0A0] line-clamp-4">
              {String((profile.narrative_data as Record<string, unknown>).full_narrative)}
            </p>
            <Link href="/profile" className="text-sm text-[#D4AF37] hover:underline">
              View full Ambition Profile →
            </Link>
          </div>
        )}

        {/* Resources teaser */}
        {(matches?.length || 0) > 0 && (
          <div className="p-5 bg-[#141414] border border-[#2A2A2A] rounded-xl flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">{matches?.length} resources matched to you</div>
              <div className="text-xs text-[#6B6B6B]">Curated specifically for your Ambition Profile</div>
            </div>
            <Link 
              href="/resources" 
              className="px-4 py-2 bg-[#D4AF37] text-[#0A0A0A] text-sm font-bold rounded-lg hover:bg-[#F0D060] transition-colors"
            >
              View →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
