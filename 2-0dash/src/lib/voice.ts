'use client'

export interface VoiceRecognitionOptions {
  onResult: (transcript: string, isFinal: boolean) => void
  onError: (error: string) => void
  onStart?: () => void
  onEnd?: () => void
  language?: string
  continuous?: boolean
}

// Use a generic interface instead of relying on missing DOM types
interface ISpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onstart: (() => void) | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onresult: ((event: any) => void) | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

// Extend Window for TypeScript
declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition
    webkitSpeechRecognition: new () => ISpeechRecognition
  }
}

export class VoiceRecognition {
  private recognition: ISpeechRecognition | null = null
  private isListening = false

  constructor(private options: VoiceRecognitionOptions) {}

  get supported(): boolean {
    return typeof window !== 'undefined' && (
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    )
  }

  start() {
    if (!this.supported) {
      this.options.onError('Voice input is not supported in this browser. Try Chrome or Edge.')
      return
    }

    const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition
    this.recognition = new SpeechRecognitionImpl()

    this.recognition.lang = this.options.language || 'en-US'
    this.recognition.continuous = this.options.continuous ?? false
    this.recognition.interimResults = true
    this.recognition.maxAlternatives = 1

    this.recognition.onstart = () => {
      this.isListening = true
      this.options.onStart?.()
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript
        const isFinal = result.isFinal
        this.options.onResult(transcript, isFinal)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onerror = (event: any) => {
      const errors: Record<string, string> = {
        'no-speech': 'No speech detected. Try speaking again.',
        'audio-capture': 'Microphone not found. Check your mic settings.',
        'not-allowed': 'Microphone access denied. Please allow mic access to use voice input.',
        'network': 'Network error. Check your connection.',
      }
      this.options.onError(errors[event.error] || `Voice error: ${event.error}`)
      this.isListening = false
    }

    this.recognition.onend = () => {
      this.isListening = false
      this.options.onEnd?.()
    }

    this.recognition.start()
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
  }

  get active(): boolean {
    return this.isListening
  }
}
