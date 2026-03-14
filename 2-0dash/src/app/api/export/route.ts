export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [{ data: profile }, { data: appUser }] = await Promise.all([
      supabase.from('ambition_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('users').select('*').eq('id', user.id).single(),
    ])

    if (!profile) return NextResponse.json({ error: 'No profile found' }, { status: 404 })

    const inv = profile.inventory_data as Record<string, unknown> | null
    const road = profile.roadmap_data as Record<string, unknown> | null
    const narr = profile.narrative_data as Record<string, unknown> | null
    const dis = profile.disambiguated_terms as Record<string, string> | null

    const exportText = `
THE 2.0 COLLECTIVE — AMBITION PROFILE
Member: ${appUser?.name || user.email}
Generated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
═══════════════════════════════════════════

CAREER NARRATIVE
${narr ? String(narr.full_narrative || '') : 'Not yet completed.'}

ELEVATOR PITCH
${narr ? String(narr.elevator_pitch || '') : 'Not yet completed.'}

═══════════════════════════════════════════
CAREER INVENTORY

Current Situation:
${inv ? String(inv.current_situation || '') : '—'}

Skills:
${inv && Array.isArray(inv.skills) ? (inv.skills as string[]).map(s => `• ${s}`).join('\n') : '—'}

Transferable Skills:
${inv && Array.isArray(inv.transferable_skills) ? (inv.transferable_skills as string[]).map(s => `• ${s}`).join('\n') : '—'}

Skill Gaps to Close:
${inv && Array.isArray(inv.skill_gaps) ? (inv.skill_gaps as string[]).map(s => `• ${s}`).join('\n') : '—'}

Target Role: ${inv ? String((inv.target_role as Record<string, string>)?.role_type || '') : '—'} at ${inv ? String((inv.target_role as Record<string, string>)?.industry || '') : '—'}

═══════════════════════════════════════════
2.0 ROADMAP

Values:
${road && Array.isArray(road.values) ? (road.values as string[]).map(v => `• ${v}`).join('\n') : '—'}

Priorities:
${road && Array.isArray(road.priorities) ? (road.priorities as string[]).map(p => `• ${p}`).join('\n') : '—'}

Dealbreakers:
${road && Array.isArray(road.dealbreakers) ? (road.dealbreakers as string[]).map(d => `• ${d}`).join('\n') : '—'}

3-Year Vision:
${road ? String(road.three_year_vision || '') : '—'}

═══════════════════════════════════════════
MY TERMS (Personalized Definitions)
${dis ? Object.entries(dis).map(([k, v]) => `${k}: ${v}`).join('\n') : '—'}

═══════════════════════════════════════════
dash.the20.co · This is your career data infrastructure.
`.trim()

    return new Response(exportText, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="ambition-profile-${appUser?.name?.toLowerCase().replace(/\s+/g, '-') || 'member'}.txt"`,
      },
    })
  } catch (err) {
    console.error('[Export Error]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
