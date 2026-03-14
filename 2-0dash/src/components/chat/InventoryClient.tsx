'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { ChatInterface } from './ChatInterface'
import { ThoughtMap } from './ThoughtMap'
import type { AmbitionProfile, ConversationMessage, ThoughtNode } from '@/lib/types'

interface InventoryClientProps {
  profile?: Record<string, unknown> | null
  savedHistory?: unknown
}

const INITIAL_MESSAGE =
  "Before we get into the career stuff — what are you actually trying to accomplish in the next few years? Career goals, life goals, all of it. Not the polished version. The real list."

export function InventoryClient({ profile }: InventoryClientProps) {
  const router = useRouter()
  const [nodes, setNodes] = useState<ThoughtNode[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleNodesUpdate = useCallback((newNodes: ThoughtNode[]) => {
    setNodes(prev => {
      // Merge: new nodes overwrite existing ones with same id, append new ones
      const existingIds = new Set(prev.map(n => n.id))
      const incoming = newNodes.filter(n => !existingIds.has(n.id))
      return [...prev, ...incoming]
    })
  }, [])

  const handleStageComplete = useCallback(async (conversationHistory: ConversationMessage[]) => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'inventory', conversation_history: conversationHistory }),
      })
      if (res.ok) {
        router.push('/opportunity')
        router.refresh()
      }
    } catch (err) {
      console.error('Error saving inventory:', err)
    } finally {
      setIsSaving(false)
    }
  }, [router])

  if (isSaving) {
    return (
      <div className="h-full flex items-center justify-center flex-col gap-4">
        <Loader2 size={32} className="animate-spin text-blue-600" />
        <p className="text-gray-500 text-sm">Building your Ambition Profile...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top header — spans full width */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-mono text-xs font-bold">01</span>
            <span className="text-sm font-semibold text-gray-900">Career Inventory</span>
            <span className="text-xs text-gray-400 ml-1">· maps as you talk</span>
          </div>
          <span className="text-xs text-gray-400">{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-0.5">
          <div
            className="progress-bar h-0.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Split content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat (fixed width) */}
        <div className="w-[400px] flex-shrink-0 border-r border-gray-200 flex flex-col overflow-hidden">
          <ChatInterface
            stage="inventory"
            stageLabel="Career Inventory"
            stageNumber={1}
            progress={0}
            initialMessage={INITIAL_MESSAGE}
            profile={profile as Partial<AmbitionProfile>}
            showHeader={false}
            onStageComplete={handleStageComplete}
            onNodesUpdate={handleNodesUpdate}
            onProgressChange={setProgress}
          />
        </div>

        {/* Right: Thought Map */}
        <div className="flex-1 overflow-hidden">
          <ThoughtMap nodes={nodes} />
        </div>
      </div>
    </div>
  )
}
