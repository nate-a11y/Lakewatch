'use client'

import { useCallback, useEffect, useState, useRef } from 'react'

interface ConfettiPiece {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
  color: string
  velocityX: number
  velocityY: number
  rotationVelocity: number
}

interface ConfettiProps {
  trigger: boolean
  onComplete?: () => void
  duration?: number
  pieceCount?: number
}

const COLORS = [
  '#4cbb17', // Lime green (brand)
  '#60e421', // Light lime
  '#3a8e11', // Dark lime
  '#fbbf24', // Amber
  '#f59e0b', // Orange
  '#ffffff', // White
]

export function Confetti({
  trigger,
  onComplete,
  duration = 3000,
  pieceCount = 50,
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  const [isActive, setIsActive] = useState(false)

  const createPiece = useCallback((id: number): ConfettiPiece => {
    const angle = Math.random() * Math.PI * 2
    const velocity = 8 + Math.random() * 12
    return {
      id,
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 100,
      y: window.innerHeight / 2,
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      velocityX: Math.cos(angle) * velocity,
      velocityY: Math.sin(angle) * velocity - 10, // Bias upward initially
      rotationVelocity: (Math.random() - 0.5) * 20,
    }
  }, [])

  const burst = useCallback(() => {
    const newPieces: ConfettiPiece[] = []
    for (let i = 0; i < pieceCount; i++) {
      newPieces.push(createPiece(i))
    }
    setPieces(newPieces)
    setIsActive(true)
  }, [pieceCount, createPiece])

  // Track previous trigger value to detect changes
  const prevTriggerRef = useRef(trigger)

  // Trigger burst when trigger changes from false to true
  useEffect(() => {
    const prevTrigger = prevTriggerRef.current
    prevTriggerRef.current = trigger

    if (trigger && !prevTrigger && !isActive) {
      // Defer to avoid synchronous setState in effect body
      const timeoutId = setTimeout(() => burst(), 0)
      return () => clearTimeout(timeoutId)
    }
  }, [trigger, isActive, burst])

  // Animation loop
  useEffect(() => {
    if (!isActive || pieces.length === 0) return

    let animationId: number
    const gravity = 0.3
    const friction = 0.99
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime

      if (elapsed > duration) {
        setIsActive(false)
        setPieces([])
        onComplete?.()
        return
      }

      setPieces((currentPieces) =>
        currentPieces.map((piece) => ({
          ...piece,
          x: piece.x + piece.velocityX,
          y: piece.y + piece.velocityY,
          rotation: piece.rotation + piece.rotationVelocity,
          velocityX: piece.velocityX * friction,
          velocityY: piece.velocityY + gravity,
        }))
      )

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [isActive, pieces.length, duration, onComplete])

  if (!isActive || pieces.length === 0) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[100]"
      aria-hidden="true"
    >
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: piece.x,
            top: piece.y,
            transform: `rotate(${piece.rotation}deg) scale(${piece.scale})`,
            opacity: Math.max(0, 1 - piece.y / (window.innerHeight * 1.5)),
          }}
        >
          <div
            className="w-3 h-3"
            style={{
              backgroundColor: piece.color,
              clipPath:
                piece.id % 3 === 0
                  ? 'polygon(50% 0%, 100% 100%, 0% 100%)' // Triangle
                  : piece.id % 3 === 1
                    ? 'circle(50%)' // Circle
                    : 'none', // Square
            }}
          />
        </div>
      ))}
    </div>
  )
}

// Hook for easy triggering
export function useConfetti() {
  const [trigger, setTrigger] = useState(false)

  const fire = useCallback(() => {
    setTrigger(true)
  }, [])

  const reset = useCallback(() => {
    setTrigger(false)
  }, [])

  return { trigger, fire, reset }
}
