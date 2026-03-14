export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { streamAIResponse } from '@/lib/ai'
import type { AIRequestBody } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    console.log('[AI Route] POST received')
    // Auth check
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('[AI Route] Auth OK, user:', user.id)

    const body: AIRequestBody = await req.json()
    const { messages, stage, profile } = body

    if (!messages || !stage) {
      return NextResponse.json({ error: 'Missing messages or stage' }, { status: 400 })
    }
    console.log('[AI Route] stage:', stage, 'messages count:', messages.length)

    // Save/update session in database (non-blocking — DB errors must not kill the AI response)
    try {
      const { error: dbError } = await supabase.from('sessions').upsert({
        user_id: user.id,
        stage,
        conversation_history: messages as unknown as never,
        progress_pct: calculateProgress(messages.length, stage),
        last_active_at: new Date().toISOString(),
      }, { onConflict: 'user_id,stage' })
      if (dbError) console.error('[Sessions upsert error]', dbError)
      else console.log('[AI Route] Session saved OK')
    } catch (dbErr) {
      console.error('[Sessions upsert error]', dbErr)
    }

    // Stream from Claude
    console.log('[AI Route] Calling streamAIResponse...')
    const aiStream = await streamAIResponse(messages, stage, profile)
    console.log('[AI Route] Got aiStream, building response...')

    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        console.log('[AI Route] ReadableStream start, reading from aiStream...')
        const reader = aiStream.getReader()
        try {
          let chunkCount = 0
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              console.log('[AI Route] Stream done, total chunks:', chunkCount)
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              controller.close()
              break
            }
            chunkCount++
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: value })}\n\n`))
          }
        } catch (err) {
          console.error('[AI Route] Stream read error:', err)
          controller.error(err)
        }
      }
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    console.error('[AI Route Error]', String(err), err instanceof Error ? err.stack : '')
    return NextResponse.json({ error: 'Internal server error', detail: String(err) }, { status: 500 })
  }
}

function calculateProgress(messageCount: number, stage: string): number {
  const stageBase: Record<string, number> = { inventory: 0, roadmap: 33, narrative: 66 }
  const base = stageBase[stage] || 0
  // Each stage has roughly 12-15 exchanges max
  const stageProgress = Math.min((messageCount / 14) * 33, 33)
  return Math.round(base + stageProgress)
}
