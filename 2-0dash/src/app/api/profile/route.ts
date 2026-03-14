export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { extractProfileData, extractDisambiguatedTerms } from '@/lib/ai'
import type { UserStage, ConversationMessage } from '@/lib/types'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('ambition_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const { data: appUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return NextResponse.json({ profile, user: appUser })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { stage, conversation_history } = body as {
      stage: UserStage
      conversation_history: ConversationMessage[]
    }

    if (!stage || !conversation_history) {
      return NextResponse.json({ error: 'Missing stage or conversation_history' }, { status: 400 })
    }

    // Extract structured data from conversation
    const [stageData, disambiguatedTerms] = await Promise.all([
      extractProfileData(stage, conversation_history),
      extractDisambiguatedTerms(conversation_history),
    ])

    // Get existing profile
    const { data: existingProfile } = await supabase
      .from('ambition_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const updatePayload: Record<string, unknown> = {
      user_id: user.id,
      disambiguated_terms: {
        ...(existingProfile?.disambiguated_terms as Record<string, unknown> || {}),
        ...disambiguatedTerms,
      },
      updated_at: new Date().toISOString(),
    }

    if (stage === 'inventory') updatePayload.inventory_data = stageData
    if (stage === 'roadmap') updatePayload.roadmap_data = stageData
    if (stage === 'narrative') {
      updatePayload.narrative_data = stageData
    }

    // Upsert profile
    const { data: profile, error } = await supabase
      .from('ambition_profiles')
      .upsert(updatePayload as never, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) throw error

    // Advance user stage
    const nextStage: Record<string, string> = {
      inventory: 'roadmap',
      roadmap: 'narrative',
      narrative: 'complete',
    }
    
    await supabase
      .from('users')
      .update({
        current_stage: nextStage[stage] || 'complete',
        profile_completed: stage === 'narrative',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    return NextResponse.json({ profile, success: true })
  } catch (err) {
    console.error('[Profile POST Error]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
