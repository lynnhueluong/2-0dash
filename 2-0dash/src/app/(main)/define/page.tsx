export const dynamic = 'force-dynamic'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { InventoryClient } from '@/components/chat/InventoryClient'

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
    <div className="h-full flex flex-col">
      <InventoryClient
        profile={profile}
        savedHistory={session?.conversation_history}
      />
    </div>
  )
}
