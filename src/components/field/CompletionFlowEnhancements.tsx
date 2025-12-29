'use client'

import { useState, useRef } from 'react'
import {
  Clock,
  Package,
  Camera,
  PenTool,
  Play,
  Pause,
  CheckCircle,
  Plus,
  X,
  Image as ImageIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface MaterialUsed {
  id: string
  name: string
  quantity: number
  unit: string
}

interface CompletionFlowEnhancementsProps {
  requestId: string
  requestType: string
  onComplete?: (data: CompletionData) => void
  className?: string
}

interface CompletionData {
  materialsUsed: MaterialUsed[]
  timeSpent: number // in seconds
  beforePhotos: string[]
  afterPhotos: string[]
  signature?: string
  notes: string
}

export function CompletionFlowEnhancements({
  requestId: _requestId,
  requestType,
  onComplete,
  className,
}: CompletionFlowEnhancementsProps) {
  const [materials, setMaterials] = useState<MaterialUsed[]>([])
  const [newMaterial, setNewMaterial] = useState({ name: '', quantity: 1, unit: 'pcs' })
  const [isAddingMaterial, setIsAddingMaterial] = useState(false)

  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Photos
  const [beforePhotos, setBeforePhotos] = useState<string[]>([])
  const [afterPhotos, setAfterPhotos] = useState<string[]>([])

  // Signature
  const [signature, setSignature] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // Notes
  const [notes, setNotes] = useState('')

  // Timer functions
  const startTimer = () => {
    setIsTimerRunning(true)
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)
  }

  const pauseTimer = () => {
    setIsTimerRunning(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Material functions
  const addMaterial = () => {
    if (!newMaterial.name.trim()) return

    const material: MaterialUsed = {
      id: `mat-${Date.now()}`,
      name: newMaterial.name.trim(),
      quantity: newMaterial.quantity,
      unit: newMaterial.unit,
    }

    setMaterials([...materials, material])
    setNewMaterial({ name: '', quantity: 1, unit: 'pcs' })
    setIsAddingMaterial(false)
  }

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id))
  }

  // Photo functions
  const handlePhotoUpload = (type: 'before' | 'after') => {
    // In real implementation, this would open camera or file picker
    const mockPhotoUrl = `https://picsum.photos/400/300?random=${Date.now()}`
    if (type === 'before') {
      setBeforePhotos([...beforePhotos, mockPhotoUrl])
    } else {
      setAfterPhotos([...afterPhotos, mockPhotoUrl])
    }
    toast.success(`${type === 'before' ? 'Before' : 'After'} photo added`)
  }

  // Signature functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    let x, y

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    let x, y

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.lineTo(x, y)
    ctx.strokeStyle = '#4cbb17'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  const endDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      setSignature(canvas.toDataURL())
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    setSignature(null)
  }

  // Submit
  const handleComplete = () => {
    pauseTimer()

    const completionData: CompletionData = {
      materialsUsed: materials,
      timeSpent: elapsedTime,
      beforePhotos,
      afterPhotos,
      signature: signature || undefined,
      notes,
    }

    onComplete?.(completionData)
    toast.success('Request completed successfully!')
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Time Tracking */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-[#4cbb17]" />
          <h3 className="font-medium">Time Tracking</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-3xl font-mono font-bold text-[#4cbb17]">
            {formatTime(elapsedTime)}
          </div>
          <button
            onClick={isTimerRunning ? pauseTimer : startTimer}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
              isTimerRunning
                ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
                : 'bg-[#4cbb17] text-black hover:bg-[#60e421]'
            )}
          >
            {isTimerRunning ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                {elapsedTime > 0 ? 'Resume' : 'Start'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Materials Used */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#4cbb17]" />
            <h3 className="font-medium">Materials Used</h3>
          </div>
          <button
            onClick={() => setIsAddingMaterial(true)}
            className="flex items-center gap-1 text-sm text-[#4cbb17] hover:underline"
          >
            <Plus className="w-4 h-4" />
            Add Material
          </button>
        </div>

        {isAddingMaterial && (
          <div className="mb-4 p-3 bg-[#0a0a0a] rounded-lg">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                placeholder="Material name"
                className="flex-1 px-3 py-2 bg-[#171717] border border-[#27272a] rounded-lg text-sm focus:outline-none focus:border-[#4cbb17]"
              />
              <input
                type="number"
                value={newMaterial.quantity}
                onChange={(e) => setNewMaterial({ ...newMaterial, quantity: Number(e.target.value) })}
                min={1}
                className="w-20 px-3 py-2 bg-[#171717] border border-[#27272a] rounded-lg text-sm focus:outline-none focus:border-[#4cbb17]"
              />
              <select
                value={newMaterial.unit}
                onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                className="px-3 py-2 bg-[#171717] border border-[#27272a] rounded-lg text-sm focus:outline-none focus:border-[#4cbb17]"
              >
                <option value="pcs">pcs</option>
                <option value="ft">ft</option>
                <option value="gal">gal</option>
                <option value="lbs">lbs</option>
                <option value="bags">bags</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAddingMaterial(false)}
                className="px-3 py-1.5 text-sm text-[#71717a] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={addMaterial}
                className="px-3 py-1.5 text-sm bg-[#4cbb17] text-black rounded-lg hover:bg-[#60e421]"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {materials.length > 0 ? (
          <div className="space-y-2">
            {materials.map((material) => (
              <div
                key={material.id}
                className="flex items-center justify-between p-2 bg-[#0a0a0a] rounded-lg"
              >
                <span className="text-sm">{material.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#71717a]">
                    {material.quantity} {material.unit}
                  </span>
                  <button
                    onClick={() => removeMaterial(material.id)}
                    className="p-1 text-[#71717a] hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#71717a] text-center py-4">
            No materials recorded
          </p>
        )}
      </div>

      {/* Before/After Photos */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Camera className="w-5 h-5 text-[#4cbb17]" />
          <h3 className="font-medium">Before/After Photos</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Before */}
          <div>
            <p className="text-sm text-[#71717a] mb-2">Before</p>
            <div className="space-y-2">
              {beforePhotos.map((photo, idx) => (
                <div key={idx} className="relative aspect-video bg-[#0a0a0a] rounded-lg overflow-hidden">
                  <img src={photo} alt={`Before ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
              <button
                onClick={() => handlePhotoUpload('before')}
                className="w-full aspect-video flex flex-col items-center justify-center bg-[#0a0a0a] border border-dashed border-[#27272a] rounded-lg hover:border-[#4cbb17] transition-colors"
              >
                <ImageIcon className="w-6 h-6 text-[#71717a] mb-1" />
                <span className="text-xs text-[#71717a]">Add Photo</span>
              </button>
            </div>
          </div>

          {/* After */}
          <div>
            <p className="text-sm text-[#71717a] mb-2">After</p>
            <div className="space-y-2">
              {afterPhotos.map((photo, idx) => (
                <div key={idx} className="relative aspect-video bg-[#0a0a0a] rounded-lg overflow-hidden">
                  <img src={photo} alt={`After ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
              <button
                onClick={() => handlePhotoUpload('after')}
                className="w-full aspect-video flex flex-col items-center justify-center bg-[#0a0a0a] border border-dashed border-[#27272a] rounded-lg hover:border-[#4cbb17] transition-colors"
              >
                <ImageIcon className="w-6 h-6 text-[#71717a] mb-1" />
                <span className="text-xs text-[#71717a]">Add Photo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Signature (optional based on request type) */}
      {requestType !== 'inspection' && (
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PenTool className="w-5 h-5 text-[#4cbb17]" />
              <h3 className="font-medium">Customer Signature (Optional)</h3>
            </div>
            {signature && (
              <button
                onClick={clearSignature}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Clear
              </button>
            )}
          </div>
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={300}
              height={100}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={endDrawing}
              className="w-full bg-[#0a0a0a] border border-[#27272a] rounded-lg cursor-crosshair touch-none"
            />
            {!signature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs text-[#71717a]">Sign here</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
        <label className="block text-sm font-medium mb-2">Completion Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any notes about the work completed..."
          className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#27272a] rounded-lg text-sm focus:outline-none focus:border-[#4cbb17] min-h-[80px] resize-none"
        />
      </div>

      {/* Complete Button */}
      <button
        onClick={handleComplete}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#4cbb17] text-black font-semibold rounded-xl hover:bg-[#60e421] transition-colors"
      >
        <CheckCircle className="w-5 h-5" />
        Mark as Complete
      </button>
    </div>
  )
}
