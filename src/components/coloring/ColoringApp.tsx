'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FloodFill, type PixelChange } from '@/lib/flood-fill'
import ColorPalette from './ColorPalette'
import ToolBar from './ToolBar'
import ImageSelector from './ImageSelector'
import type { ColoringState } from '@/types/canvas-coloring'

interface ColoringAppProps {
  imageData: {
    _id: string
    title: string
    webpImageUrl: string
    suggestedColors?: Array<{ name: string; hex: string }>
    category: { title: string; slug: string }
    subcategory: { title: string; slug: string }
  }
}

type HistoryStep = PixelChange[];

const MAX_HISTORY = 5

export default function ColoringApp({ imageData: initialImageData }: ColoringAppProps) {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shadowCanvasRef = useRef<HTMLCanvasElement>(null)
  const [currentImage, setCurrentImage] = useState(initialImageData)
  const [showImageSelector, setShowImageSelector] = useState(false)
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

  useEffect(() => {
    const loadImage = async () => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = canvasRef.current
        const shadowCanvas = shadowCanvasRef.current
        if (!canvas || !shadowCanvas) return
        canvas.width = img.width
        canvas.height = img.height
        shadowCanvas.width = img.width
        shadowCanvas.height = img.height
        const ctx = canvas.getContext('2d')
        const shadowCtx = shadowCanvas.getContext('2d')
        if (!ctx || !shadowCtx) return
        shadowCtx.drawImage(img, 0, 0)
        ctx.drawImage(img, 0, 0)
        const imageData = shadowCtx.getImageData(0, 0, shadowCanvas.width, shadowCanvas.height)
        setState(prev => ({
          ...prev,
          imageData,
          originalImageData: imageData,
          history: [imageData],
          historyStep: 0
        }))
      }
      img.src = currentImage.webpImageUrl
    }
    loadImage()
  }, [currentImage])

  const handleImageChange = (newImageData: any) => {
    setCurrentImage(newImageData)
    setShowImageSelector(false)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const shadowCanvas = shadowCanvasRef.current
    if (!canvas || !shadowCanvas) return
    const ctx = canvas.getContext('2d')
    const shadowCtx = shadowCanvas.getContext('2d')
    if (!ctx || !shadowCtx) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = Math.floor((e.clientX - rect.left) * scaleX)
    const y = Math.floor((e.clientY - rect.top) * scaleY)
    const imageData = shadowCtx.getImageData(0, 0, shadowCanvas.width, shadowCanvas.height)
    const floodFill = new FloodFill(imageData, state.tolerance, 50)
    const { imageData: newImageData, changes } = floodFill.fill(x, y, state.currentColor)
    if (changes.length === 0) return
    shadowCtx.putImageData(newImageData, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(shadowCanvas, 0, 0)
    const newHistory = history.slice(0, historyStep + 1)
    newHistory.push(changes)
    setHistory(newHistory.slice(-MAX_HISTORY))
    setHistoryStep(Math.min(newHistory.length - 1, MAX_HISTORY - 1))
    setState(prev => ({
      ...prev,
      imageData: newImageData
    }))
  }

  function applyChanges(pixels32: Uint32Array, changes: PixelChange[], reverse = false) {
    for (const change of changes) {
      pixels32[change.index] = reverse ? change.oldColor : change.newColor
    }
  }

  const handleUndo = () => {
    if (historyStep < 0) return
    const canvas = canvasRef.current
    const shadowCanvas = shadowCanvasRef.current
    if (!canvas || !shadowCanvas) return
    const ctx = canvas.getContext('2d')
    const shadowCtx = shadowCanvas.getContext('2d')
    if (!ctx || !shadowCtx) return
    const imageData = shadowCtx.getImageData(0, 0, shadowCanvas.width, shadowCanvas.height)
    const pixels32 = new Uint32Array(imageData.data.buffer)
    applyChanges(pixels32, history[historyStep], true)
    shadowCtx.putImageData(imageData, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(shadowCanvas, 0, 0)
    setHistoryStep(historyStep - 1)
    setState(prev => ({ ...prev, imageData }))
  }

  const handleRedo = () => {
    if (historyStep >= history.length - 1) return
    const canvas = canvasRef.current
    const shadowCanvas = shadowCanvasRef.current
    if (!canvas || !shadowCanvas) return
    const ctx = canvas.getContext('2d')
    const shadowCtx = shadowCanvas.getContext('2d')
    if (!ctx || !shadowCtx) return
    const imageData = shadowCtx.getImageData(0, 0, shadowCanvas.width, shadowCanvas.height)
    const pixels32 = new Uint32Array(imageData.data.buffer)
    applyChanges(pixels32, history[historyStep + 1], false)
    shadowCtx.putImageData(imageData, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(shadowCanvas, 0, 0)
    setHistoryStep(historyStep + 1)
    setState(prev => ({ ...prev, imageData }))
  }

  const handleReset = () => {
    if (!state.originalImageData) return
    const canvas = canvasRef.current
    const shadowCanvas = shadowCanvasRef.current
    if (!canvas || !shadowCanvas) return
    const ctx = canvas.getContext('2d')
    const shadowCtx = shadowCanvas.getContext('2d')
    if (!ctx || !shadowCtx) return
    shadowCtx.putImageData(state.originalImageData, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(shadowCanvas, 0, 0)
    setState(prev => ({
      ...prev,
      imageData: state.originalImageData,
      history: state.originalImageData ? [state.originalImageData] : prev.history,
      historyStep: 0
    }))
  }

  const handleDownload = () => {
    const shadowCanvas = shadowCanvasRef.current
    if (!shadowCanvas) return
    shadowCanvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fargelegging-${currentImage.title.replace(/\s+/g, '-').toLowerCase()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 'image/png', 0.95)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl md:text-2xl font-bold">Fargeleggingsapp</h1>
              <button
                onClick={() => setShowImageSelector(true)}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
              >
                Bytt bilde ({currentImage.title})
              </button>
            </div>
            <a 
              href={`/categories/${currentImage.category.slug}/${currentImage.subcategory.slug}`}
              className="text-blue-600 hover:text-blue-800"
            >
              Tilbake til {currentImage.subcategory.title}
            </a>
          </div>
        </div>
      </header>
      {showImageSelector && (
        <ImageSelector
          currentImageId={currentImage._id}
          categorySlug={currentImage.category.slug}
          subcategorySlug={currentImage.subcategory.slug}
          onSelect={handleImageChange}
          onClose={() => setShowImageSelector(false)}
        />
      )}
      <div className="flex h-[calc(100vh-73px)]">
        <ColorPalette
          selectedColor={state.currentColor}
          onColorSelect={(color) => setState(prev => ({ ...prev, currentColor: color }))}
          suggestedColors={currentImage.suggestedColors}
        />
        <div className="flex-1 flex flex-col">
          <ToolBar
            tolerance={state.tolerance}
            onToleranceChange={(t) => setState(prev => ({ ...prev, tolerance: t }))}
            canUndo={state.historyStep > 0}
            canRedo={state.historyStep < state.history.length - 1}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onReset={handleReset}
            onDownload={handleDownload}
          />
          <div className="flex-1 overflow-auto bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                width={state.imageData?.width || 0}
                height={state.imageData?.height || 0}
                className="max-w-full h-auto bg-white shadow-lg cursor-crosshair"
                style={{ imageRendering: 'pixelated' }}
              />
              <canvas ref={shadowCanvasRef} style={{ display: 'none' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 