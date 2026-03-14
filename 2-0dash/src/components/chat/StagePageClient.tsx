'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ChatInterface } from './ChatInterface'
import type { UserStage, AmbitionProfile, ConversationMessage } from '@/lib/types'
import { Loader2 } from 'lucide-react'

interface StagePageClientProps {
  stage: UserStage
  stageLabel: string
  stageNumber: number
  initialProgress: number
  nextRoute: string
  profile?: Record<string, unknown> | null
  savedHistory?: unknown
  initialMessage: string
}

export function StagePageClient({
  stage,
  stageLabel,
  stageNumber,
  initialProgress,
  nextRoute,
  profile,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  savedHistory: _savedHistory,
  initialMessage,
}: StagePageClientProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleStageComplete = async (conversationHistory: ConversationMessage[]) => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, conversation_history: conversationHistory }),
      })
      
      if (res.ok) {
        // Trigger resource matching if narrative complete
        if (stage === 'narrative') {
          await fetch('/api/match', { method: 'POST' })
        }
        router.push(nextRoute)
        router.refresh()
      }
    } catch (err) {
      console.error('Error saving stage:', err)
    } finally {
      setIsSaving(false)
    }
  }

  if (isSaving) {
    return (
      <div className="h-full flex items-center justify-center flex-col gap-4">
        <Loader2 size={32} className="animate-spin text-[#D4AF37]" />
        <p className="text-[#6B6B6B] text-sm">Saving your progress...</p>
      </div>
    )
  }

  return (
    <ChatInterface
      stage={stage}
      stageLabel={stageLabel}
      stageNumber={stageNumber}
      progress={initialProgress}
      initialMessage={initialMessage}
      profile={profile as Partial<AmbitionProfile>}
      onStageComplete={handleStageComplete}
    />
  )
}
