'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { FloodFill, type PixelChange } from '@/lib/flood-fill'
import ColorPalette from './ColorPalette'
import ToolBar from './ToolBar'
import type { ColoringCanvasProps, ColoringState } from '@/types/canvas-coloring'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

type HistoryStep = PixelChange[];

const MAX_HISTORY = 5

export default function ColoringCanvas({
  drawingId,
  title,
  imageUrl,
  suggestedColors,
  backUrl = '/'
}: ColoringCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
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

  const [history, setHistory] = useState<HistoryStep[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Laste inn bilde
  useEffect(() => {
    console.log('[ColoringCanvas] useEffect START', imageUrl)
    let isMounted = true
    const loadImage = async () => {
      try {
        if (!isMounted) return
        setIsLoading(true)
        console.log('[ColoringCanvas] setIsLoading(true)')
        const img = new window.Image()
        imageRef.current = img // Hold på referansen
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          console.log('[ColoringCanvas] img.onload', imageUrl, img.width, img.height, img.naturalWidth, img.naturalHeight)
          if (!isMounted) return
          const canvas = canvasRef.current
          if (!canvas) { console.log('[ColoringCanvas] canvasRef.current mangler'); return }
          const ctx = canvas.getContext('2d', { willReadFrequently: true })
          if (!ctx) { console.log('[ColoringCanvas] ctx mangler'); return }
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          setState(prev => {
            console.log('[ColoringCanvas] setState imageData')
            return {
              ...prev,
              imageData,
              originalImageData,
              history: [imageData],
              historyStep: 0
            }
          })
          setIsLoading(false)
          console.log('[ColoringCanvas] setIsLoading(false)')
        }
        img.onerror = (e) => {
          console.error('[ColoringCanvas] img.onerror', imageUrl, e, img.width, img.height, img.naturalWidth, img.naturalHeight)
          if (!isMounted) return
          setError('Kunne ikke laste bilde')
          setIsLoading(false)
        }
        console.log('[ColoringCanvas] Event-handlere satt')
        console.log('[ColoringCanvas] Setter img.src til', imageUrl)
        img.src = imageUrl
        console.log('[ColoringCanvas] img.src er satt')
      } catch (err) {
        console.error('[ColoringCanvas] Exception ved lasting av bilde', imageUrl, err)
        setError('En feil oppstod ved lasting av bildet')
        setIsLoading(false)
      }
    }
    loadImage()
    return () => {
      isMounted = false
      imageRef.current = null // Rydd opp
      console.log('[ColoringCanvas] useEffect CLEANUP (unmount eller imageUrl endret)')
    }
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
    const floodFill = new FloodFill(state.imageData, state.tolerance, 50)
    const { imageData: newImageData, changes } = floodFill.fill(x, y, state.currentColor)
    if (changes.length === 0) return
    ctx.putImageData(newImageData, 0, 0)
    const newHistory = history.slice(0, historyStep + 1)
    newHistory.push(changes)
    setHistory(newHistory.slice(-MAX_HISTORY))
    setHistoryStep(Math.min(newHistory.length - 1, MAX_HISTORY - 1))
    setState(prev => ({
      ...prev,
      imageData: newImageData
    }))
  }, [state.currentColor, state.tolerance, state.imageData, state.history, state.historyStep, history, historyStep])

  function applyChanges(pixels32: Uint32Array, changes: PixelChange[], reverse = false) {
    for (const change of changes) {
      pixels32[change.index] = reverse ? change.oldColor : change.newColor
    }
  }

  const handleUndo = useCallback(() => {
    if (historyStep < 0) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels32 = new Uint32Array(imageData.data.buffer)
    applyChanges(pixels32, history[historyStep], true)
    ctx.putImageData(imageData, 0, 0)
    setHistoryStep(historyStep - 1)
    setState(prev => ({ ...prev, imageData }))
  }, [history, historyStep])

  const handleRedo = useCallback(() => {
    if (historyStep >= history.length - 1) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels32 = new Uint32Array(imageData.data.buffer)
    applyChanges(pixels32, history[historyStep + 1], false)
    ctx.putImageData(imageData, 0, 0)
    setHistoryStep(historyStep + 1)
    setState(prev => ({ ...prev, imageData }))
  }, [history, historyStep])

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