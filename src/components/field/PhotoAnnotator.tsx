'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Pencil, Circle, ArrowUp, Undo2, Check, X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoAnnotatorProps {
  imageUrl: string
  onSave: (annotatedImageDataUrl: string) => void
  onCancel: () => void
  className?: string
}

type Tool = 'pencil' | 'circle' | 'arrow'

export function PhotoAnnotator({
  imageUrl,
  onSave,
  onCancel,
  className,
}: PhotoAnnotatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<Tool>('pencil')
  const [color] = useState('#ef4444') // Red for highlighting issues
  const [lineWidth] = useState(3)
  const [history, setHistory] = useState<ImageData[]>([])
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Load image onto canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Set canvas size to match image aspect ratio
      const maxWidth = 800
      const maxHeight = 600
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (maxWidth / width) * height
        width = maxWidth
      }
      if (height > maxHeight) {
        width = (maxHeight / height) * width
        height = maxHeight
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      // Save initial state
      const imageData = ctx.getImageData(0, 0, width, height)
      setHistory([imageData])
      setImageLoaded(true)
    }
    img.src = imageUrl
  }, [imageUrl])

  const saveState = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setHistory((prev) => [...prev, imageData])
  }, [])

  const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in e) {
      const touch = e.touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const pos = getMousePos(e)
    setIsDrawing(true)
    setStartPoint(pos)

    if (tool === 'pencil') {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (ctx) {
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        ctx.strokeStyle = color
        ctx.lineWidth = lineWidth
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
      }
    }
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    e.preventDefault()

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    const pos = getMousePos(e)

    if (tool === 'pencil') {
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    }
  }

  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !startPoint) return
    e.preventDefault()

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    const pos = getMousePos(e)

    if (tool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(pos.x - startPoint.x, 2) + Math.pow(pos.y - startPoint.y, 2)
      )
      ctx.beginPath()
      ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2)
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.stroke()
    } else if (tool === 'arrow') {
      // Draw arrow line
      ctx.beginPath()
      ctx.moveTo(startPoint.x, startPoint.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.stroke()

      // Draw arrow head
      const angle = Math.atan2(pos.y - startPoint.y, pos.x - startPoint.x)
      const headLength = 15
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(
        pos.x - headLength * Math.cos(angle - Math.PI / 6),
        pos.y - headLength * Math.sin(angle - Math.PI / 6)
      )
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(
        pos.x - headLength * Math.cos(angle + Math.PI / 6),
        pos.y - headLength * Math.sin(angle + Math.PI / 6)
      )
      ctx.stroke()
    }

    setIsDrawing(false)
    setStartPoint(null)
    saveState()
  }

  const undo = () => {
    if (history.length <= 1) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    const newHistory = [...history]
    newHistory.pop()
    const previousState = newHistory[newHistory.length - 1]
    ctx.putImageData(previousState, 0, 0)
    setHistory(newHistory)
  }

  const clear = () => {
    if (history.length <= 1) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    const initialState = history[0]
    ctx.putImageData(initialState, 0, 0)
    setHistory([initialState])
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    onSave(dataUrl)
  }

  return (
    <div className={cn('fixed inset-0 z-50 bg-black/90 flex flex-col', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-[#0f0f0f] border-b border-[#27272a]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool('pencil')}
            className={cn(
              'p-3 rounded-lg transition-colors',
              tool === 'pencil' ? 'bg-[#4cbb17] text-black' : 'bg-[#27272a] text-white'
            )}
            title="Freehand draw"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTool('circle')}
            className={cn(
              'p-3 rounded-lg transition-colors',
              tool === 'circle' ? 'bg-[#4cbb17] text-black' : 'bg-[#27272a] text-white'
            )}
            title="Circle"
          >
            <Circle className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTool('arrow')}
            className={cn(
              'p-3 rounded-lg transition-colors',
              tool === 'arrow' ? 'bg-[#4cbb17] text-black' : 'bg-[#27272a] text-white'
            )}
            title="Arrow"
          >
            <ArrowUp className="w-5 h-5 rotate-45" />
          </button>
          <div className="w-px h-8 bg-[#27272a] mx-2" />
          <button
            onClick={undo}
            disabled={history.length <= 1}
            className="p-3 rounded-lg bg-[#27272a] text-white disabled:opacity-50"
            title="Undo"
          >
            <Undo2 className="w-5 h-5" />
          </button>
          <button
            onClick={clear}
            disabled={history.length <= 1}
            className="p-3 rounded-lg bg-[#27272a] text-white disabled:opacity-50"
            title="Clear all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-[#27272a] text-white hover:bg-[#27272a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-[#4cbb17] text-black font-medium hover:bg-[#60e421] transition-colors flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            Save
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        {!imageLoaded && (
          <div className="text-white">Loading image...</div>
        )}
        <canvas
          ref={canvasRef}
          className={cn(
            'max-w-full max-h-full rounded-lg shadow-xl cursor-crosshair',
            !imageLoaded && 'hidden'
          )}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* Instructions */}
      <div className="p-4 bg-[#0f0f0f] border-t border-[#27272a] text-center text-sm text-[#71717a]">
        {tool === 'pencil' && 'Draw freely to highlight areas'}
        {tool === 'circle' && 'Click and drag to draw a circle around issues'}
        {tool === 'arrow' && 'Click and drag to draw an arrow pointing to issues'}
      </div>
    </div>
  )
}
