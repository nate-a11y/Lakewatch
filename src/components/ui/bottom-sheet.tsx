'use client'

import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { useEffect, useRef, useState, useCallback } from 'react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  snapPoints?: ('content' | 'half' | 'full')[]
  className?: string
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = ['content'],
  className,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [startY, setStartY] = useState(0)
  const [sheetHeight, setSheetHeight] = useState(0)

  // Measure content height on open
  useEffect(() => {
    if (isOpen && sheetRef.current) {
      setSheetHeight(sheetRef.current.offsetHeight)
    }
  }, [isOpen, children])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleDragStart = useCallback((clientY: number) => {
    setIsDragging(true)
    setStartY(clientY)
  }, [])

  const handleDragMove = useCallback(
    (clientY: number) => {
      if (!isDragging) return
      const delta = clientY - startY
      // Only allow dragging down
      setDragOffset(Math.max(0, delta))
    },
    [isDragging, startY]
  )

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    // If dragged more than 30% of height, close
    if (dragOffset > sheetHeight * 0.3) {
      onClose()
    }
    setDragOffset(0)
  }, [dragOffset, sheetHeight, onClose])

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY)
  }

  const handleTouchEnd = () => {
    handleDragEnd()
  }

  // Mouse handlers (for desktop testing)
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY)
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      handleDragMove(e.clientY)
    },
    [handleDragMove]
  )

  const handleMouseUp = useCallback(() => {
    handleDragEnd()
  }, [handleDragEnd])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  if (!isOpen) return null

  const getMaxHeight = () => {
    const primarySnap = snapPoints[0]
    switch (primarySnap) {
      case 'full':
        return '90vh'
      case 'half':
        return '50vh'
      default:
        return 'auto'
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-[#0a0a0a] rounded-t-2xl border-t border-[#27272a] shadow-xl',
          'transition-transform duration-300 ease-out',
          !isDragging && 'transform',
          className
        )}
        style={{
          maxHeight: getMaxHeight(),
          transform: `translateY(${dragOffset}px)`,
          transition: isDragging ? 'none' : undefined,
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Bottom sheet'}
      >
        {/* Drag Handle */}
        <div
          className="flex justify-center py-3 cursor-grab active:cursor-grabbing touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <div className="w-12 h-1.5 rounded-full bg-[#3f3f46]" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 pb-3 border-b border-[#27272a]">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 -m-2 text-zinc-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-4 pb-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
          {children}
        </div>

        {/* Safe area for iOS home indicator */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </div>
  )
}
