'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

interface ColorWheelPickerProps {
  selectedColor: string
  onColorSelect: (color: string) => void
  onClose: () => void
  onPositionChange?: (position: { x: number; y: number }) => void
  onSizeChange?: (size: { width: number; height: number }) => void
  initialPosition?: { x: number; y: number }
  initialSize?: { width: number; height: number }
}

export default function ColorWheelPicker({ 
  selectedColor, 
  onColorSelect, 
  onClose, 
  onPositionChange, 
  onSizeChange,
  initialPosition = { x: 0, y: 0 },
  initialSize = { width: 320, height: 450 }
}: ColorWheelPickerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState(initialSize)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })

  const drawColorWheel = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Create image data for pixel-perfect smooth gradients
    const imageData = ctx.createImageData(canvas.width, canvas.height)
    const data = imageData.data

    for (let x = 0; x < canvas.width; x++) {
      for (let y = 0; y < canvas.height; y++) {
        const dx = x - centerX
        const dy = y - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance <= radius) {
          let angle = Math.atan2(dy, dx) * 180 / Math.PI
          if (angle < 0) angle += 360
          
          const saturation = Math.min(distance / radius, 1)
          const lightness = 0.5
          
          // Convert HSL to RGB using standard algorithm
          const h = angle / 360
          const s = saturation
          const l = lightness
          
          const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1/6) return p + (q - p) * 6 * t
            if (t < 1/2) return q
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
            return p
          }
          
          let r, g, b
          if (s === 0) {
            r = g = b = l // achromatic
          } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s
            const p = 2 * l - q
            r = hue2rgb(p, q, h + 1/3)
            g = hue2rgb(p, q, h)
            b = hue2rgb(p, q, h - 1/3)
          }
          
          const index = (y * canvas.width + x) * 4
          data[index] = Math.round(r * 255)     // R
          data[index + 1] = Math.round(g * 255) // G
          data[index + 2] = Math.round(b * 255) // B
          data[index + 3] = 255                 // A
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0)

    // Draw center white circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.strokeStyle = '#cccccc'
    ctx.lineWidth = 2
    ctx.stroke()
  }, [])

  const hslToHex = useCallback((h: number, s: number, l: number) => {
    l /= 100
    const a = s * Math.min(l, 1 - l) / 100
    const f = (n: number) => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }, [])

  const getColorFromPosition = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return selectedColor

    const rect = canvas.getBoundingClientRect()
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const canvasX = (x - rect.left) * (canvas.width / rect.width)
    const canvasY = (y - rect.top) * (canvas.height / rect.height)

    const dx = canvasX - centerX
    const dy = canvasY - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const radius = Math.min(centerX, centerY) - 10

    if (distance > radius) return selectedColor

    let angle = Math.atan2(dy, dx) * 180 / Math.PI
    if (angle < 0) angle += 360

    const saturation = Math.min(distance / radius, 1) * 100
    const lightness = 50

    return hslToHex(Math.round(angle), Math.round(saturation), Math.round(lightness))
  }, [selectedColor, hslToHex])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    const color = getColorFromPosition(e.clientX, e.clientY)
    onColorSelect(color)
  }, [getColorFromPosition, onColorSelect])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    const color = getColorFromPosition(e.clientX, e.clientY)
    onColorSelect(color)
  }, [isDragging, getColorFromPosition, onColorSelect])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    setIsDragging(true)
    const color = getColorFromPosition(touch.clientX, touch.clientY)
    onColorSelect(color)
  }, [getColorFromPosition, onColorSelect])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    if (!isDragging) return
    const touch = e.touches[0]
    const color = getColorFromPosition(touch.clientX, touch.clientY)
    onColorSelect(color)
  }, [isDragging, getColorFromPosition, onColorSelect])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  // Resize handlers
  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    })
  }, [size])

  const handleResizeTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    const touch = e.touches[0]
    setResizeStart({
      x: touch.clientX,
      y: touch.clientY,
      width: size.width,
      height: size.height
    })
  }, [size])

  useEffect(() => {
    drawColorWheel()
  }, [drawColorWheel, size])

  // Force redraw when component mounts
  useEffect(() => {
    const timer = setTimeout(() => drawColorWheel(), 100)
    return () => clearTimeout(timer)
  }, [drawColorWheel])

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false)
    const handleGlobalTouchEnd = () => setIsDragging(false)

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp)
      document.addEventListener('touchend', handleGlobalTouchEnd)
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('touchend', handleGlobalTouchEnd)
    }
  }, [isDragging])

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isMoving) {
        const newPosition = {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        }
        setPosition(newPosition)
        onPositionChange?.(newPosition)
      }
    }

    const handleGlobalMouseUp = () => {
      setIsMoving(false)
    }

    if (isMoving) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }

    const handleGlobalResizeMove = (e: MouseEvent) => {
      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x
        const deltaY = e.clientY - resizeStart.y
        const newWidth = Math.max(280, resizeStart.width + deltaX)
        const newHeight = Math.max(300, resizeStart.height + deltaY)
        const newSize = { width: newWidth, height: newHeight }
        setSize(newSize)
        onSizeChange?.(newSize)
      }
    }

    const handleGlobalResizeTouchMove = (e: TouchEvent) => {
      if (isResizing) {
        e.preventDefault()
        const touch = e.touches[0]
        const deltaX = touch.clientX - resizeStart.x
        const deltaY = touch.clientY - resizeStart.y
        const newWidth = Math.max(280, resizeStart.width + deltaX)
        const newHeight = Math.max(300, resizeStart.height + deltaY)
        const newSize = { width: newWidth, height: newHeight }
        setSize(newSize)
        onSizeChange?.(newSize)
      }
    }

    const handleGlobalResizeEnd = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleGlobalResizeMove)
      document.addEventListener('mouseup', handleGlobalResizeEnd)
      document.addEventListener('touchmove', handleGlobalResizeTouchMove, { passive: false })
      document.addEventListener('touchend', handleGlobalResizeEnd)
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('mousemove', handleGlobalResizeMove)
      document.removeEventListener('mouseup', handleGlobalResizeEnd)
      document.removeEventListener('touchmove', handleGlobalResizeTouchMove)
      document.removeEventListener('touchend', handleGlobalResizeEnd)
    }
  }, [isMoving, isResizing, dragStart, resizeStart, onPositionChange, onSizeChange])

  return (
    <>
      <div 
        ref={containerRef}
        className="fixed bg-white bg-opacity-95 rounded-lg p-6 shadow-lg border border-gray-200 z-40"
        style={{
          top: `${100 + position.y}px`,
          left: `${330 + position.x}px`,
          width: size.width,
          height: size.height,
          minWidth: '280px',
          minHeight: '300px',
          userSelect: 'none'
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => {
          const rect = containerRef.current?.getBoundingClientRect()
          if (rect) {
            const relativeY = e.clientY - rect.top
            const containerHeight = rect.height
            const dragZoneHeight = containerHeight * 0.1
            
            if (relativeY <= dragZoneHeight) {
              setIsMoving(true)
              setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
              })
            }
          }
        }}
        onMouseMove={(e) => {
          if (isMoving) {
            setPosition({
              x: e.clientX - dragStart.x,
              y: e.clientY - dragStart.y
            })
          }
        }}
        onMouseUp={() => setIsMoving(false)}
      >
        <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-200 cursor-move">
          <h3 className="font-semibold text-lg" style={{ fontFamily: 'Quicksand, sans-serif' }}>Velg farge</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col items-center space-y-4 cursor-auto">
          {/* Color Wheel */}
          <canvas
            ref={canvasRef}
            width={Math.max(200, size.width - 80)}
            height={Math.max(200, size.width - 80)}
            className="cursor-crosshair rounded-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />

          {/* Selected Color Preview */}
          <div className="flex items-center justify-center space-x-3">
            <div className="text-gray-600" style={{ fontFamily: 'Quicksand, sans-serif', fontSize: '18px', fontWeight: 'bold' }}>Valgt farge:</div>
            <div
              className="w-24 h-12 rounded-lg border-2 border-gray-300"
              style={{ backgroundColor: selectedColor }}
            />
          </div>

        </div>

        {/* Resize handle - same 4-line grip pattern as ToolSizeControl */}
        <div
          className="absolute bottom-0 right-0 w-8 h-8 cursor-se-resize hover:bg-gray-100 transition-all duration-200 group flex items-end justify-end p-1"
          onMouseDown={handleResizeMouseDown}
          onTouchStart={handleResizeTouchStart}
          title="Drag to resize"
        >
          {/* Standard grip pattern - four parallel diagonal lines */}
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            className="group-hover:scale-110 transition-transform"
          >
            {/* Four evenly spaced parallel diagonal lines stretching to container edges */}
            <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-gray-500 group-hover:text-gray-700">
              <line x1="4" y1="16" x2="16" y2="4" />
              <line x1="7" y1="16" x2="16" y2="7" />
              <line x1="10" y1="16" x2="16" y2="10" />
              <line x1="13" y1="16" x2="16" y2="13" />
            </g>
          </svg>
        </div>
      </div>
    </>
  )
}