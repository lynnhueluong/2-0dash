export const dynamic = 'force-dynamic'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { StagePageClient } from '@/components/chat/StagePageClient'

export default async function NarrativePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: session }] = await Promise.all([
    supabase.from('ambition_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('sessions').select('conversation_history').eq('user_id', user.id).eq('stage', 'narrative').single(),
  ])

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
        <h1 className="text-lg font-bold">Career Narrative</h1>
        <p className="text-sm text-gray-500">Your communicable professional identity — in your words.</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <StagePageClient
          stage="narrative"
          stageLabel="Career Narrative"
          stageNumber={3}
          initialProgress={66}
          nextRoute="/resources"
          profile={profile}
          savedHistory={session?.conversation_history}
          initialMessage="Here we go — the final stage. This is where it all comes together.

I've been listening closely through everything you've shared. Now we're going to synthesize it into a Career Narrative — something you can actually use when someone asks 'tell me about yourself' or when you're writing your LinkedIn about section.

Before I draft anything, I want to reflect back what I heard. You can correct me, add to it, or tell me what doesn't land right.

Does that work? Let me start by summarizing what I think I know about you so far — and then we'll shape your narrative together."
        />
      </div>
    </div>
  )
}
