'use client'

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react'
import { Mic, Square } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceNoteButtonProps {
  onTranscript: (text: string) => void
  className?: string
  disabled?: boolean
}

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance
}

// Extend the Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

export function VoiceNoteButton({
  onTranscript,
  className,
  disabled = false,
}: VoiceNoteButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  // Check support outside of useEffect to avoid setState in effect
  const isSupported = useSyncExternalStore(
    () => () => {},
    () => typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    () => false
  )

  useEffect(() => {
    if (!isSupported) return

    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      return
    }

    // Initialize recognition
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript)
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isSupported])

  const startListening = useCallback(() => {
    if (!recognitionRef.current || disabled) return

    setTranscript('')
    setIsListening(true)

    try {
      recognitionRef.current.start()
    } catch {
      // May throw if already started
      setIsListening(false)
    }
  }, [disabled])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return

    recognitionRef.current.stop()
    setIsListening(false)

    // Send transcript after a brief delay to ensure we have the final result
    setTimeout(() => {
      if (transcript.trim()) {
        onTranscript(transcript.trim())
        setTranscript('')
      }
    }, 100)
  }, [transcript, onTranscript])

  const handleClick = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  if (!isSupported) {
    return null
  }

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'p-3 rounded-full transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center',
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-[#27272a] text-[#71717a] hover:text-white hover:bg-[#3f3f46]',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-label={isListening ? 'Stop recording' : 'Start voice note'}
        title={isListening ? 'Click to stop' : 'Voice to text'}
      >
        {isListening ? (
          <Square className="w-5 h-5 fill-current" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {/* Recording indicator */}
      {isListening && (
        <div className="absolute -top-1 -right-1 w-3 h-3">
          <span className="absolute inline-flex w-full h-full bg-red-500 rounded-full opacity-75 animate-ping" />
          <span className="relative inline-flex w-3 h-3 bg-red-500 rounded-full" />
        </div>
      )}

      {/* Live transcript preview */}
      {isListening && transcript && (
        <div className="absolute top-full mt-2 left-0 right-0 min-w-[200px] p-2 bg-[#0f0f0f] border border-[#27272a] rounded-lg text-sm text-[#a1a1aa] z-10">
          <p className="line-clamp-3">{transcript}</p>
        </div>
      )}
    </div>
  )
}
