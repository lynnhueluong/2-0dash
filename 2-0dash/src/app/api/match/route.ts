export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { matchResources, computeProfileTags } from '@/lib/matching'
import type { AmbitionProfile, Resource } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's ambition profile
    const { data: profile } = await supabase
      .from('ambition_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'No Ambition Profile found. Complete the process first.' }, { status: 404 })
    }

    // Compute tags if not done
    const computedTags = computeProfileTags(profile as unknown as Partial<AmbitionProfile>)
    
    // Update profile with computed tags
    await supabase
      .from('ambition_profiles')
      .update({ computed_tags: computedTags as unknown as never })
      .eq('user_id', user.id)

    const profileWithTags = { ...profile, computed_tags: computedTags } as unknown as AmbitionProfile

    // Get all resources
    const { data: resources } = await supabase
      .from('resources')
      .select('*')
      .order('relevance_score', { ascending: false })

    if (!resources || resources.length === 0) {
      return NextResponse.json({ matches: [], total: 0 })
    }

    // Run matching algorithm
    const scoredMatches = matchResources(resources as Resource[], profileWithTags, 10)

    // Save matches to database
    const matchInserts = scoredMatches.map(({ resource, score }) => ({
      user_id: user.id,
      resource_id: resource.id,
      matched_at: new Date().toISOString(),
      match_reason: {
        primary_reason: score.reasons[0] || 'Strong overall match',
        tags_matched: score.reasons,
        score_breakdown: score.breakdown,
      },
      match_score: score.total,
    }))

    // Delete old matches and insert new ones
    await supabase.from('matches').delete().eq('user_id', user.id)
    if (matchInserts.length > 0) {
      await supabase.from('matches').insert(matchInserts as never[])
    }

    // Fetch matches with resource details
    const { data: matches } = await supabase
      .from('matches')
      .select('*, resource:resources(*)')
      .eq('user_id', user.id)
      .order('match_score', { ascending: false })

    return NextResponse.json({ matches: matches || [], total: matches?.length || 0 })
  } catch (err) {
    console.error('[Match Route Error]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: matches } = await supabase
      .from('matches')
      .select('*, resource:resources(*)')
      .eq('user_id', user.id)
      .order('match_score', { ascending: false })

    return NextResponse.json({ matches: matches || [], total: matches?.length || 0 })
  } catch (err) {
    console.error('[Match GET Error]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
