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
          <p className="text-gray-500 mt-1">
            {isComplete 
              ? "You've completed the 2.0 advancement process. This is your career data infrastructure."
              : "Three stages. Real talk. No generic advice. You've got this."}
          </p>
        </div>

        {/* Current Stage CTA */}
        {!isComplete && (
          <Link
            href={currentStageData.href}
            className="block p-5 bg-blue-600/10 border border-blue-600/40 rounded-xl hover:border-blue-600 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-600 text-xs font-mono uppercase tracking-wider mb-1">Continue where you left off</div>
                <h2 className="text-lg font-bold">{currentStageData.label}</h2>
                <p className="text-sm text-gray-500">{currentStageData.description}</p>
              </div>
              <ArrowRight className="text-blue-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        )}

        {/* Stage Progress */}
        <div className="space-y-3">
          <h2 className="text-sm text-gray-500 font-mono uppercase tracking-wider">Your Process</h2>
          {STAGES.map((stage) => {
            const status = getStageStatus(stage.key)
            return (
              <Link
                key={stage.key}
                href={stage.href}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                  status === 'active' 
                    ? 'border-blue-600/40 bg-blue-600/5 hover:border-blue-600' 
                    : status === 'done'
                    ? 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    : 'border-gray-200 opacity-50 cursor-not-allowed pointer-events-none'
                }`}
              >
                <div className={`flex-shrink-0 ${status === 'done' ? 'text-green-600' : status === 'active' ? 'text-blue-600' : 'text-gray-500'}`}>
                  {status === 'done' ? <CheckCircle size={20} /> : status === 'active' ? <Loader size={20} /> : <Circle size={20} />}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{stage.label}</div>
                  <div className="text-xs text-gray-500">{stage.description}</div>
                </div>
                {status !== 'locked' && <ArrowRight size={16} className="text-gray-500" />}
              </Link>
            )
          })}
        </div>

        {/* Ambition Profile Preview */}
        {profile && (profile.narrative_data as Record<string, unknown>)?.full_narrative && (
          <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
            <div className="text-xs text-blue-600 font-mono uppercase tracking-wider">Your Career Narrative</div>
            <p className="text-sm leading-relaxed text-gray-500 line-clamp-4">
              {String((profile.narrative_data as Record<string, unknown>).full_narrative)}
            </p>
            <Link href="/profile" className="text-sm text-blue-600 hover:underline">
              View full Ambition Profile →
            </Link>
          </div>
        )}

        {/* Resources teaser */}
        {(matches?.length || 0) > 0 && (
          <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">{matches?.length} resources matched to you</div>
              <div className="text-xs text-gray-500">Curated specifically for your Ambition Profile</div>
            </div>
            <Link 
              href="/resources" 
              className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              View →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
