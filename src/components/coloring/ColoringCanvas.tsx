'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { FloodFill } from '@/lib/flood-fill'
import ColorPalette from './ColorPalette'
import ToolBar from './ToolBar'
import type { ColoringCanvasProps, ColoringState } from '@/types/canvas-coloring'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

const MAX_HISTORY = 50

export default function ColoringCanvas({
  drawingId,
  title,
  imageUrl,
  suggestedColors,
  backUrl = '/'
}: ColoringCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [state, setState] = useState<ColoringState>({
    imageData: null,
    originalImageData: null,
    currentColor: '#FF0000',
    brushSize: 10,
    tolerance: 32,
    isDrawing: false,
    history: [],
    historyStep: -1
  })

  // Laste inn bilde
  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true)
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        img.onload = () => {
          const canvas = canvasRef.current
          if (!canvas) return
          
          const ctx = canvas.getContext('2d', { willReadFrequently: true })
          if (!ctx) return
          
          // Sett canvas størrelse
          canvas.width = img.width
          canvas.height = img.height
          
          // Tegn bilde på canvas
          ctx.drawImage(img, 0, 0)
          
          // Lagre image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          
          setState(prev => ({
            ...prev,
            imageData,
            originalImageData,
            history: [imageData],
            historyStep: 0
          }))
          
          setIsLoading(false)
        }
        
        img.onerror = () => {
          setError('Kunne ikke laste bilde')
          setIsLoading(false)
        }
        
        img.src = imageUrl
      } catch (err) {
        setError('En feil oppstod ved lasting av bildet')
        setIsLoading(false)
      }
    }
    
    loadImage()
  }, [imageUrl])

  // Flood fill handler
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !state.imageData) return
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = Math.floor((e.clientX - rect.left) * scaleX)
    const y = Math.floor((e.clientY - rect.top) * scaleY)
    
    // Utfør flood fill
    const floodFill = new FloodFill(state.imageData, state.tolerance, true)
    const newImageData = floodFill.fill(x, y, state.currentColor)
    
    // Oppdater canvas
    ctx.putImageData(newImageData, 0, 0)
    
    // Oppdater history
    const newHistory = state.history.slice(0, state.historyStep + 1)
    newHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
    
    setState(prev => ({
      ...prev,
      imageData: newImageData,
      history: newHistory.slice(-MAX_HISTORY),
      historyStep: Math.min(newHistory.length - 1, MAX_HISTORY - 1)
    }))
  }, [state.currentColor, state.tolerance, state.imageData, state.history, state.historyStep])

  // Undo handler
  const handleUndo = useCallback(() => {
    if (state.historyStep <= 0) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const newStep = state.historyStep - 1
    const imageData = state.history[newStep]
    
    ctx.putImageData(imageData, 0, 0)
    
    setState(prev => ({
      ...prev,
      imageData,
      historyStep: newStep
    }))
  }, [state.history, state.historyStep])

  // Redo handler
  const handleRedo = useCallback(() => {
    if (state.historyStep >= state.history.length - 1) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const newStep = state.historyStep + 1
    const imageData = state.history[newStep]
    
    ctx.putImageData(imageData, 0, 0)
    
    setState(prev => ({
      ...prev,
      imageData,
      historyStep: newStep
    }))
  }, [state.history, state.historyStep])

  // Reset handler
  const handleReset = useCallback(() => {
    if (!state.originalImageData) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.putImageData(state.originalImageData, 0, 0)
    
    setState(prev => ({
      ...prev,
      imageData: state.originalImageData,
      history: [state.originalImageData!],
      historyStep: 0
    }))
  }, [state.originalImageData])

  // Download handler
  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    canvas.toBlob(blob => {
      if (!blob) return
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fargelegging-${drawingId}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 'image/png', 0.95)
  }, [drawingId])

  useKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    onSave: handleDownload
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Laster fargelegging...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Feil</p>
          <p>{error}</p>
          <Link href={backUrl} className="text-blue-600 hover:underline mt-4 inline-block">
            Gå tilbake
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={backUrl} className="text-blue-600 hover:text-blue-800">
                ← Tilbake
              </Link>
              <h1 className="text-xl md:text-2xl font-bold">{title}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Color palette */}
        <ColorPalette
          selectedColor={state.currentColor}
          onColorSelect={(color: string) => setState(prev => ({ ...prev, currentColor: color }))}
          suggestedColors={suggestedColors}
        />

        {/* Canvas area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <ToolBar
            tolerance={state.tolerance}
            onToleranceChange={(t: number) => setState(prev => ({ ...prev, tolerance: t }))}
            canUndo={state.historyStep > 0}
            canRedo={state.historyStep < state.history.length - 1}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onReset={handleReset}
            onDownload={handleDownload}
          />

          {/* Canvas */}
          <div className="flex-1 overflow-auto bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="max-w-full h-auto bg-white shadow-lg cursor-crosshair"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 