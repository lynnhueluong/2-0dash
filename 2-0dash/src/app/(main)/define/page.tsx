export const dynamic = 'force-dynamic'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { StagePageClient } from '@/components/chat/StagePageClient'

export default async function DefinePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('ambition_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: session } = await supabase
    .from('sessions')
    .select('conversation_history')
    .eq('user_id', user.id)
    .eq('stage', 'inventory')
    .single()

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-shrink-0 px-6 py-4 border-b border-[#2A2A2A]">
        <h1 className="text-lg font-bold">Career Inventory</h1>
        <p className="text-sm text-[#6B6B6B]">Let&apos;s map the full picture of your professional self.</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <StagePageClient
          stage="inventory"
          stageLabel="Career Inventory"
          stageNumber={1}
          initialProgress={0}
          nextRoute="/opportunity"
          profile={profile}
          savedHistory={session?.conversation_history}
          initialMessage="Hey! I'm your hustle buddy for this process. Before we get into the good stuff, I want to make sure I actually understand you — not just your resume.

Let's start here: tell me what's going on in your career right now. What are you doing, what's working, and what's making you feel like something needs to change?"
        />
      </div>
    </div>
  )
}
