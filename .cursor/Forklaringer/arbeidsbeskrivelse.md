# Canvas + Smart Tolerance Implementeringsguide

## Innholdsfortegnelse

1. [Oversikt](#oversikt)
2. [Del 1: Fjerne gammel SVG-løsning](#del-1-fjerne-gammel-svg-løsning)
3. [Del 2: Oppdatere Sanity Schema](#del-2-oppdatere-sanity-schema)
4. [Del 3: Implementere Canvas + Smart Tolerance](#del-3-implementere-canvas--smart-tolerance)
5. [Del 4: Integrasjon med eksisterende kode](#del-4-integrasjon-med-eksisterende-kode)
6. [Del 5: Testing og verifisering](#del-5-testing-og-verifisering)

## Oversikt

### Nåværende arkitektur (SVG-basert)
- SVG-baserte fargelegginger med forhåndsdefinerte områder
- Krever `.fillable-area` klasser og `data-region` attributter
- Lagrer kun farger per region
- Begrenset til forhåndsdefinerte områder

### Ny arkitektur (Canvas + Smart Tolerance)
- Canvas-basert fargelegging med smart flood fill algoritme
- Automatisk kantdeteksjon med justerbar toleranse
- Støtte for både PNG/JPG og SVG-filer
- Mer fleksibel brukeropplevelse

## Del 1: Fjerne gammel SVG-løsning

### 1.1 Filer som skal slettes helt

```bash
# Slett gamle fargeleggingskomponenter
rm -rf src/components/coloring/SVGCanvas.tsx
rm -rf src/components/coloring/ColoringInterface.tsx
rm -rf src/components/coloring/ColorPalette.tsx

# Slett SVG-relaterte utilities
rm -rf src/lib/svg-sanitizer.ts
rm -rf src/lib/coloring-storage.ts

# Slett gamle types
rm -rf src/types/coloring.ts

# Slett gamle constants
rm -rf src/constants/coloring.ts

# Slett UI komponenter som ikke trengs
rm -rf src/components/ui/SkeletonLoader.tsx

1.2 Oppdater package.json
Fjern disse dependencies:
// Fjern fra dependencies:
"isomorphic-dompurify": "^2.25.0",
"dompurify": "^3.2.6"

1.3 Oppdater eksisterende filer
src/app/coloring/[id]/page.tsx
Erstatt hele filen med:
import { notFound } from 'next/navigation'
import { getColoringImage, getAllColoringImages } from '@/lib/sanity'
import ColoringCanvas from '@/components/coloring/ColoringCanvas'
import { Metadata } from 'next'

interface ColoringPageProps {
  params: { id: string }
}

export default async function ColoringPage({ params }: ColoringPageProps) {
  const image = await getColoringImage(params.id)
  
  if (!image || !image.hasDigitalColoring) {
    notFound()
  }

  return (
    <ColoringCanvas
      drawingId={image._id}
      title={image.title}
      imageUrl={image.imageUrl}
      suggestedColors={image.suggestedColors}
      backUrl={image.category ? `/categories/${image.category.slug}` : '/categories'}
    />
  )
}

export async function generateStaticParams() {
  try {
    const images = await getAllColoringImages()
    return images.map((image: { _id: string }) => ({
      id: image._id
    }))
  } catch (error) {
    console.error('Feil ved generering av statiske parametere:', error)
    return []
  }
}

export async function generateMetadata({ params }: ColoringPageProps): Promise<Metadata> {
  const image = await getColoringImage(params.id)
  
  if (!image) {
    return {
      title: 'Fargelegging ikke funnet'
    }
  }

  return {
    title: `Fargelegg ${image.title}`,
    description: `Fargelegg ${image.title} digitalt med vårt online fargeleggingsverktøy.`
  }
}

Del 2: Oppdatere Sanity Schema
2.1 Oppdater drawingImage schema
Legg til nye felter i sanity-schema/drawingImage.ts:

import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'drawingImage',
  title: 'Tegning',
  type: 'document',
  fields: [
    // ... eksisterende felter ...
    
    defineField({
      name: 'coloringSettings',
      title: 'Fargeleggingsinnstillinger',
      type: 'object',
      hidden: ({ document }) => !document?.hasDigitalColoring,
      fields: [
        defineField({
          name: 'defaultTolerance',
          title: 'Standard toleranse',
          type: 'number',
          description: 'Standard toleranseverdi for flood fill (0-255). Høyere verdi = mer fleksibel fylling',
          validation: Rule => Rule.min(0).max(255),
          initialValue: 32
        }),
        defineField({
          name: 'maxBrushSize',
          title: 'Maks penselstørrelse',
          type: 'number',
          description: 'Maksimal penselstørrelse i piksler',
          validation: Rule => Rule.min(1).max(100),
          initialValue: 50
        }),
        defineField({
          name: 'enableSmoothing',
          title: 'Aktiver utjevning',
          type: 'boolean',
          description: 'Aktiver kantutjevning for jevnere fargelegging',
          initialValue: true
        }),
        defineField({
          name: 'preserveDetails',
          title: 'Bevar detaljer',
          type: 'boolean',
          description: 'Bevar små detaljer ved fargelegging',
          initialValue: true
        })
      ]
    }),
    
    defineField({
      name: 'suggestedColors',
      title: 'Foreslåtte farger',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({
            name: 'name',
            type: 'string',
            title: 'Navn'
          }),
          defineField({
            name: 'hex',
            type: 'string',
            title: 'Hex-kode',
            validation: Rule => Rule.regex(/^#[0-9A-Fa-f]{6}$/)
          })
        ]
      }]
    })
  ]
})

2.2 Fjern svgContent felt
Fjern svgContent feltet fra drawingImage schema siden vi ikke lenger trenger SVG-data.
Del 3: Implementere Canvas + Smart Tolerance
3.1 Opprett ny type-fil
Opprett src/types/canvas-coloring.ts:
export interface ColoringCanvasProps {
  drawingId: string
  title: string
  imageUrl: string
  suggestedColors?: Array<{ name: string; hex: string }>
  backUrl?: string
}

export interface ColoringSettings {
  defaultTolerance?: number
  maxBrushSize?: number
  enableSmoothing?: boolean
  preserveDetails?: boolean
}

export interface ColoringState {
  imageData: ImageData | null
  originalImageData: ImageData | null
  currentColor: string
  brushSize: number
  tolerance: number
  isDrawing: boolean
  history: ImageData[]
  historyStep: number
}

export interface Point {
  x: number
  y: number
}

export interface ColorRGB {
  r: number
  g: number
  b: number
  a: number
}

3.2 Opprett flood fill utility
Opprett src/lib/flood-fill.ts:

import type { ColorRGB, Point } from '@/types/canvas-coloring'

export class FloodFill {
  private imageData: ImageData
  private tolerance: number
  private width: number
  private height: number
  private pixels: Uint8ClampedArray
  private fillColor: ColorRGB
  private startColor: ColorRGB
  private pixelsChecked: Set<number>
  private pixelStack: Point[]
  private preserveDetails: boolean

  constructor(
    imageData: ImageData, 
    tolerance: number = 32,
    preserveDetails: boolean = true
  ) {
    this.imageData = imageData
    this.tolerance = tolerance
    this.width = imageData.width
    this.height = imageData.height
    this.pixels = imageData.data
    this.preserveDetails = preserveDetails
    this.pixelsChecked = new Set()
    this.pixelStack = []
  }

  fill(x: number, y: number, fillColor: string): ImageData {
    // Konverter hex til RGB
    this.fillColor = this.hexToRGB(fillColor)
    
    // Få startfarge
    const startPos = (y * this.width + x) * 4
    this.startColor = {
      r: this.pixels[startPos],
      g: this.pixels[startPos + 1],
      b: this.pixels[startPos + 2],
      a: this.pixels[startPos + 3]
    }

    // Hvis start og fyll-farge er like, returner
    if (this.colorsMatch(this.startColor, this.fillColor, 0)) {
      return this.imageData
    }

    // Start flood fill
    this.pixelStack.push({ x, y })
    
    while (this.pixelStack.length > 0) {
      const newPos = this.pixelStack.pop()!
      const pixelPos = (newPos.y * this.width + newPos.x) * 4
      
      // Sjekk om piksel allerede er sjekket
      if (this.pixelsChecked.has(pixelPos)) continue
      this.pixelsChecked.add(pixelPos)
      
      // Hent current pixel color
      const currentColor = {
        r: this.pixels[pixelPos],
        g: this.pixels[pixelPos + 1],
        b: this.pixels[pixelPos + 2],
        a: this.pixels[pixelPos + 3]
      }
      
      // Sjekk om piksel matcher startfarge innenfor toleranse
      if (this.colorsMatch(this.startColor, currentColor, this.tolerance)) {
        // Fyll piksel
        this.pixels[pixelPos] = this.fillColor.r
        this.pixels[pixelPos + 1] = this.fillColor.g
        this.pixels[pixelPos + 2] = this.fillColor.b
        this.pixels[pixelPos + 3] = this.fillColor.a
        
        // Legg til nabopiksler
        this.addNeighbors(newPos.x, newPos.y)
      }
    }
    
    // Apply edge smoothing hvis aktivert
    if (this.preserveDetails) {
      this.smoothEdges()
    }
    
    return this.imageData
  }

  private addNeighbors(x: number, y: number): void {
    // Sjekk alle 8 naboer for bedre fylling
    const neighbors = [
      { x: x - 1, y }, // Venstre
      { x: x + 1, y }, // Høyre
      { x, y: y - 1 }, // Opp
      { x, y: y + 1 }, // Ned
      { x: x - 1, y: y - 1 }, // Øverst venstre
      { x: x + 1, y: y - 1 }, // Øverst høyre
      { x: x - 1, y: y + 1 }, // Nederst venstre
      { x: x + 1, y: y + 1 }  // Nederst høyre
    ]
    
    for (const neighbor of neighbors) {
      if (
        neighbor.x >= 0 && 
        neighbor.x < this.width && 
        neighbor.y >= 0 && 
        neighbor.y < this.height
      ) {
        const pos = (neighbor.y * this.width + neighbor.x) * 4
        if (!this.pixelsChecked.has(pos)) {
          this.pixelStack.push(neighbor)
        }
      }
    }
  }

  private colorsMatch(color1: ColorRGB, color2: ColorRGB, tolerance: number): boolean {
    const dr = Math.abs(color1.r - color2.r)
    const dg = Math.abs(color1.g - color2.g)
    const db = Math.abs(color1.b - color2.b)
    const da = Math.abs(color1.a - color2.a)
    
    return dr <= tolerance && dg <= tolerance && db <= tolerance && da <= tolerance
  }

  private hexToRGB(hex: string): ColorRGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: 255
    } : { r: 0, g: 0, b: 0, a: 255 }
  }

  private smoothEdges(): void {
    // Implementer edge smoothing algoritme for jevnere kanter
    // Dette er en forenklet versjon
    const tempData = new Uint8ClampedArray(this.pixels)
    
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        const pos = (y * this.width + x) * 4
        
        // Sjekk om dette er en kantpiksel
        if (this.isEdgePixel(x, y)) {
          // Beregn gjennomsnitt av nabopiksler
          let r = 0, g = 0, b = 0, count = 0
          
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue
              
              const nPos = ((y + dy) * this.width + (x + dx)) * 4
              r += tempData[nPos]
              g += tempData[nPos + 1]
              b += tempData[nPos + 2]
              count++
            }
          }
          
          // Anvend utjevning
          this.pixels[pos] = Math.round(r / count)
          this.pixels[pos + 1] = Math.round(g / count)
          this.pixels[pos + 2] = Math.round(b / count)
        }
      }
    }
  }

  private isEdgePixel(x: number, y: number): boolean {
    const pos = (y * this.width + x) * 4
    const currentColor = {
      r: this.pixels[pos],
      g: this.pixels[pos + 1],
      b: this.pixels[pos + 2],
      a: this.pixels[pos + 3]
    }
    
    // Sjekk om noen nabopiksler har forskjellig farge
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue
        
        const nx = x + dx
        const ny = y + dy
        
        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          const nPos = (ny * this.width + nx) * 4
          const neighborColor = {
            r: this.pixels[nPos],
            g: this.pixels[nPos + 1],
            b: this.pixels[nPos + 2],
            a: this.pixels[nPos + 3]
          }
          
          if (!this.colorsMatch(currentColor, neighborColor, 10)) {
            return true
          }
        }
      }
    }
    
    return false
  }
}

3.3 Opprett hovedkomponent
Opprett src/components/coloring/ColoringCanvas.tsx:

'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { FloodFill } from '@/lib/flood-fill'
import ColorPalette from './ColorPalette'
import ToolBar from './ToolBar'
import type { ColoringCanvasProps, ColoringState } from '@/types/canvas-coloring'

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
          onColorSelect={(color) => setState(prev => ({ ...prev, currentColor: color }))}
          suggestedColors={suggestedColors}
        />

        {/* Canvas area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
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

3.4 Opprett ColorPalette komponent
Opprett src/components/coloring/ColorPalette.tsx
'use client'
import { useState } from 'react'

interface ColorPaletteProps {
  selectedColor: string
  onColorSelect: (color: string) => void
  suggestedColors?: Array<{ name: string; hex: string }>
}

export default function ColorPalette({
  selectedColor,
  onColorSelect,
  suggestedColors
}: ColorPaletteProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false)

  const defaultColors = [
    '#FF0000', '#FF7F00', '#FFFF00', '#00FF00',
    '#0000FF', '#4B0082', '#9400D3', '#FF1493',
    '#00CED1', '#FFD700', '#8B4513', '#000000',
    '#808080', '#FFFFFF', '#FFC0CB', '#87CEEB'
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Fargepalett</h3>
        
        {/* Foreslåtte farger */}
        {suggestedColors && suggestedColors.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Foreslåtte farger</h4>
            <div className="grid grid-cols-4 gap-2">
              {suggestedColors.map((color, index) => (
                <button
                  key={index}
                  className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedColor === color.hex ? 'border-gray-800 ring-2 ring-blue-300' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => onColorSelect(color.hex)}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Standard farger */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Standard farger</h4>
          <div className="grid grid-cols-4 gap-2">
            {defaultColors.map((color) => (
              <button
                key={color}
                className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                  selectedColor === color ? 'border-gray-800 ring-2 ring-blue-300' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => onColorSelect(color)}
              />
            ))}
          </div>
        </div>

        {/* Egendefinert farge */}
        <div>
          <button
            onClick={() => setShowCustomPicker(!showCustomPicker)}
            className="w-full bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-lg transition-colors"
          >
            Egendefinert farge
          </button>
          
          {showCustomPicker && (
            <div className="mt-3">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => onColorSelect(e.target.value)}
                className="w-full h-12 rounded cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Valgt farge */}
        <div className="mt-6 pt-6 border-t">
          <div className="text-sm text-gray-600 mb-2">Valgt farge:</div>
          <div 
            className="w-full h-16 rounded-lg border-2 border-gray-300"
            style={{ backgroundColor: selectedColor }}
          />
          <div className="text-xs text-gray-600 mt-2 text-center font-mono">
            {selectedColor.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  )
}

3.5 Opprett ToolBar komponent
Opprett src/components/coloring/ToolBar.tsx:
'use client'

interface ToolBarProps {
  tolerance: number
  onToleranceChange: (tolerance: number) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onReset: () => void
  onDownload: () => void
}

export default function ToolBar({
  tolerance,
  onToleranceChange,
  canUndo,
 canRedo,
 onUndo,
 onRedo,
 onReset,
 onDownload
}: ToolBarProps) {
 return (
   <div className="bg-white border-b border-gray-200 p-4">
     <div className="flex flex-wrap items-center gap-4">
       {/* Undo/Redo */}
       <div className="flex gap-2">
         <button
           onClick={onUndo}
           disabled={!canUndo}
           className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
           title="Angre (Ctrl+Z)"
         >
           ↶ Angre
         </button>
         <button
           onClick={onRedo}
           disabled={!canRedo}
           className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
           title="Gjør om (Ctrl+Y)"
         >
           ↷ Gjør om
         </button>
       </div>

       {/* Tolerance slider */}
       <div className="flex items-center gap-3">
         <label htmlFor="tolerance" className="text-sm font-medium text-gray-700">
           Toleranse:
         </label>
         <input
           id="tolerance"
           type="range"
           min="0"
           max="100"
           value={tolerance}
           onChange={(e) => onToleranceChange(Number(e.target.value))}
           className="w-32"
         />
         <span className="text-sm text-gray-600 w-10">{tolerance}</span>
       </div>

       {/* Reset og Download */}
       <div className="flex gap-2 ml-auto">
         <button
           onClick={onReset}
           className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
         >
           ↺ Tilbakestill
         </button>
         <button
           onClick={onDownload}
           className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
         >
           ⬇ Last ned
         </button>
       </div>
     </div>
   </div>
 )
}

Del 4: Integrasjon med eksisterende kode
4.1 Oppdater Sanity queries
Oppdater src/lib/sanity.ts for å hente nye felter:
// Oppdater getColoringImage query
export async function getColoringImage(id: string) {
  return client.fetch(`
    *[_type == "drawingImage" && _id == $id && isActive == true][0] {
      _id,
      title,
      description,
      hasDigitalColoring,
      suggestedColors,
      coloringSettings,
      difficulty,
      order,
      isActive,
      "imageUrl": mainImage.asset->url,
      "downloadUrl": downloadFile.asset->url,
      "category": subcategory->{ 
        title, 
        "slug": slug.current 
      },
      tags,
      downloadCount,
      _createdAt,
      _updatedAt
    }
  `, { id })
}

// Oppdater getAllColoringImages for å bare hente nødvendig data
export async function getAllColoringImages() {
  return client.fetch(`
    *[_type == "drawingImage" && hasDigitalColoring == true && isActive == true] {
      _id
    }
  `)
}

4.2 Oppdater TypeScript definitions
Oppdater Sanity types i sanity.types.ts:
// Legg til i DrawingImage type
coloringSettings?: {
  defaultTolerance?: number;
  maxBrushSize?: number;
  enableSmoothing?: boolean;
  preserveDetails?: boolean;
};

4.3 Oppdater subcategory page
Oppdater src/app/categories/[slug]/[subcategorySlug]/page.tsx for å vise digital fargelegging-knapp:
// I DrawingCard komponenten, legg til:
{drawing.hasDigitalColoring && (
  <Link
    href={`/coloring/${drawing._id}`}
    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition text-sm"
  >
    Fargelegg digitalt
  </Link>
)}

4.4 Oppdater ErrorBoundary
Oppdater src/components/ui/ErrorBoundary.tsx for å håndtere Canvas-feil:
export class CanvasErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CanvasErrorBoundary caught an error:', error, errorInfo)
    
    // Spesifikk håndtering for Canvas-relaterte feil
    if (error.message.includes('getContext')) {
      console.error('Canvas context error - browser may not support Canvas')
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-600 max-w-md mx-auto p-6">
            <p className="text-lg font-semibold mb-2">Noe gikk galt</p>
            <p className="text-sm text-gray-600 mb-4">
              Det oppstod en feil med fargeleggingsverktøyet. 
              Sjekk at nettleseren din støtter Canvas.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Last siden på nytt
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

4.5 Legg til keyboard shortcuts
Opprett src/hooks/useKeyboardShortcuts.ts:

import { useEffect } from 'react'

interface ShortcutHandlers {
  onUndo: () => void
  onRedo: () => void
  onSave?: () => void
}

export function useKeyboardShortcuts({ onUndo, onRedo, onSave }: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        onUndo()
      }
      
      // Ctrl/Cmd + Y eller Ctrl/Cmd + Shift + Z for redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        onRedo()
      }
      
      // Ctrl/Cmd + S for save
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && onSave) {
        e.preventDefault()
        onSave()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onUndo, onRedo, onSave])
}

Bruk denne i ColoringCanvas komponenten:
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

// I komponenten:
useKeyboardShortcuts({
  onUndo: handleUndo,
  onRedo: handleRedo,
  onSave: handleDownload
})

4.6 Oppdater miljøvariabler

Oppdater next.config.ts:
const nextConfig: NextConfig = {
  images: {
    domains: ['cdn.sanity.io'],
  },
  // Legg til headers for CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ]
  },
}