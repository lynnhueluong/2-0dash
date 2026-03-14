export const dynamic = 'force-dynamic'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { StagePageClient } from '@/components/chat/StagePageClient'

export default async function OpportunityPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: session }] = await Promise.all([
    supabase.from('ambition_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('sessions').select('conversation_history').eq('user_id', user.id).eq('stage', 'roadmap').single(),
  ])


  return (
    <div className="flex flex-col h-screen">
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
        <h1 className="text-lg font-bold">2.0 Roadmap</h1>
        <p className="text-sm text-gray-500">Surface what actually matters for your next chapter.</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <StagePageClient
          stage="roadmap"
          stageLabel="2.0 Roadmap"
          stageNumber={2}
          initialProgress={33}
          nextRoute="/narrative"
          profile={profile}
          savedHistory={session?.conversation_history}
          initialMessage="Okay, Career Inventory is done — you gave me a lot to work with. Now let's get into the real stuff.

The 2.0 Roadmap isn't about your whole career. It's about the *next* phase — the next 1 to 3 years. We're going to get clear on what actually matters to you right now, what you won't compromise on, and what you're building toward.

Let's start with priorities. If you could only focus on three things in this next chapter of your career, what would they be — and why those three?"
        />
      </div>
    </div>
  )
}
