'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, Send, Loader2 } from 'lucide-react'
import { VoiceRecognition } from '@/lib/voice'
import { cn } from '@/lib/utils'
import type { ChatMessage, UserStage, AmbitionProfile, ConversationMessage } from '@/lib/types'

interface ChatInterfaceProps {
  stage: UserStage
  stageLabel: string
  stageNumber: number
  progress: number
  initialMessage: string
  profile?: Partial<AmbitionProfile>
  onStageComplete?: (conversationHistory: ConversationMessage[]) => void
}

export function ChatInterface({
  stage,
  stageLabel,
  stageNumber,
  progress,
  initialMessage,
  profile,
  onStageComplete,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: initialMessage,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const [showCompleteButton, setShowCompleteButton] = useState(false)
  const [currentProgress, setCurrentProgress] = useState(progress)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const voiceRef = useRef<VoiceRecognition | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getConversationHistory = useCallback((): ConversationMessage[] => {
    return messages
      .filter(m => !m.isTyping)
      .map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
      }))
  }, [messages])

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userText.trim(),
      timestamp: new Date(),
    }

    const typingMessage: ChatMessage = {
      id: 'typing',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    }

    setMessages(prev => [...prev, userMessage, typingMessage])
    setInput('')
    setIsLoading(true)

    // Build history including the new user message
    const history: ConversationMessage[] = [
      ...getConversationHistory(),
      { role: 'user', content: userText.trim(), timestamp: new Date().toISOString() },
    ]

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, stage, profile }),
      })

      if (!response.ok) throw new Error('AI request failed')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let assistantText = ''
      const assistantId = Date.now().toString() + '-ai'

      // Replace typing indicator with streaming message
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'typing'),
        { id: assistantId, role: 'assistant', content: '', timestamp: new Date() },
      ])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                assistantText += parsed.text
                setMessages(prev => prev.map(m =>
                  m.id === assistantId ? { ...m, content: assistantText } : m
                ))
              }
            } catch { /* ignore parse errors */ }
          }
        }
      }

      // Update progress
      const newProgress = Math.min(currentProgress + 5, 95)
      setCurrentProgress(newProgress)

      // Check if AI is wrapping up (stage complete keywords)
      const lowerText = assistantText.toLowerCase()
      const completeKeywords = ['stage complete', 'you\'re ready', 'let\'s move on', 'next stage', 'ready to move', 'wrapped up', 'all set for']
      if (completeKeywords.some(k => lowerText.includes(k)) && messages.length > 8) {
        setShowCompleteButton(true)
      }

    } catch (err) {
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'typing'),
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: "Sorry, something went wrong on my end. Try sending that again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, getConversationHistory, stage, profile, currentProgress, messages.length])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const toggleVoice = () => {
    if (!voiceRef.current) {
      voiceRef.current = new VoiceRecognition({
        onResult: (transcript, isFinal) => {
          setVoiceTranscript(transcript)
          if (isFinal) {
            setInput(prev => prev + ' ' + transcript)
            setVoiceTranscript('')
          }
        },
        onError: (err) => {
          console.error('Voice error:', err)
          setIsListening(false)
        },
        onStart: () => setIsListening(true),
        onEnd: () => setIsListening(false),
      })
    }

    if (isListening) {
      voiceRef.current.stop()
    } else {
      voiceRef.current.start()
    }
  }

  const handleComplete = async () => {
    if (onStageComplete) {
      onStageComplete(getConversationHistory())
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Stage Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-[#2A2A2A]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[#D4AF37] font-mono text-xs">0{stageNumber}</span>
            <span className="text-sm font-semibold">{stageLabel}</span>
          </div>
          <span className="text-xs text-[#6B6B6B]">{currentProgress}%</span>
        </div>
        <div className="w-full bg-[#2A2A2A] rounded-full h-1">
          <div
            className="progress-bar h-1 rounded-full transition-all duration-500"
            style={{ width: `${currentProgress}%` }}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={cn(
              'flex chat-bubble',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                message.role === 'user'
                  ? 'bg-[#D4AF37] text-[#0A0A0A] rounded-br-sm font-medium'
                  : 'bg-[#1A1A1A] text-[#FAFAFA] rounded-bl-sm border border-[#2A2A2A]'
              )}
            >
              {message.isTyping ? (
                <div className="flex items-center gap-1 py-1 px-1">
                  <span className="typing-dot w-2 h-2 bg-[#6B6B6B] rounded-full inline-block" />
                  <span className="typing-dot w-2 h-2 bg-[#6B6B6B] rounded-full inline-block" />
                  <span className="typing-dot w-2 h-2 bg-[#6B6B6B] rounded-full inline-block" />
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Stage Complete Button */}
      {showCompleteButton && onStageComplete && (
        <div className="flex-shrink-0 px-4 pb-2">
          <button
            onClick={handleComplete}
            className="w-full py-3 bg-[#D4AF37] text-[#0A0A0A] font-bold rounded-xl hover:bg-[#F0D060] transition-colors"
          >
            I&apos;m ready — let&apos;s move to the next stage →
          </button>
        </div>
      )}

      {/* Voice transcript preview */}
      {voiceTranscript && (
        <div className="flex-shrink-0 px-4 py-1">
          <p className="text-xs text-[#6B6B6B] italic">{voiceTranscript}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-[#2A2A2A]">
        <div className="flex items-end gap-2">
          <button
            onClick={toggleVoice}
            className={cn(
              'flex-shrink-0 p-3 rounded-xl transition-colors',
              isListening
                ? 'bg-[#D4AF37] text-[#0A0A0A] voice-active'
                : 'bg-[#1A1A1A] text-[#6B6B6B] hover:text-[#FAFAFA] border border-[#2A2A2A]'
            )}
            title={isListening ? 'Stop recording' : 'Start voice input'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer, or hit the mic to speak..."
            rows={1}
            className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#FAFAFA] placeholder-[#6B6B6B] resize-none focus:outline-none focus:border-[#D4AF37] transition-colors max-h-32 overflow-y-auto"
            style={{ height: 'auto' }}
            onInput={e => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = Math.min(el.scrollHeight, 128) + 'px'
            }}
            disabled={isLoading}
          />

          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 p-3 bg-[#D4AF37] text-[#0A0A0A] rounded-xl hover:bg-[#F0D060] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <p className="text-xs text-[#6B6B6B] mt-2 text-center">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
