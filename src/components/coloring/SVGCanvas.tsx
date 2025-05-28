'use client'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import type { SVGCanvasProps } from '@/types/coloring'
import { sanitizeSVG, validateSVGForColoring } from '@/lib/svg-sanitizer'
import { ColoringStorage } from '@/lib/coloring-storage'
import { AUTO_SAVE_DELAY, MAX_UNDO_STACK_SIZE } from '@/constants/coloring'
import ColoringSkeletonLoader from '@/components/ui/SkeletonLoader'

export default function SVGCanvas({ 
  drawingId, 
  svgContent, 
  currentColor, 
  onSave, 
  onColorChange 
}: SVGCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [coloredRegions, setColoredRegions] = useState<Record<string, string>>({})
  const [undoStack, setUndoStack] = useState<Record<string, string>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRestorePrompt, setShowRestorePrompt] = useState(false)

  // Auto-save debounced
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  
  const debouncedAutoSave = useCallback((regions: Record<string, string>) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      const success = ColoringStorage.save(drawingId, regions)
      if (!success) {
        console.warn('Auto-save feilet - localStorage kan være full')
      }
    }, AUTO_SAVE_DELAY)
  }, [drawingId])

  // Sjekk for lagret arbeid ved oppstart
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedColoring = ColoringStorage.load(drawingId)
      if (storedColoring && Object.keys(storedColoring).length > 0) {
        setShowRestorePrompt(true)
      }
      
      // Cleanup gamle lagringer
      ColoringStorage.cleanupOldColorings()
    }
  }, [drawingId])

  // Oppdater coloredRegions og trigger auto-save
  const updateColoredRegions = useCallback((newRegions: Record<string, string>) => {
    setColoredRegions(newRegions)
    debouncedAutoSave(newRegions)
    onColorChange?.(newRegions)
  }, [debouncedAutoSave, onColorChange])

  // Gjenopprett lagret arbeid
  const restoreStoredColoring = useCallback(() => {
    const storedColoring = ColoringStorage.load(drawingId)
    if (storedColoring) {
      updateColoredRegions(storedColoring)
    }
    setShowRestorePrompt(false)
  }, [drawingId, updateColoredRegions])

  // Avvis lagret arbeid
  const dismissStoredColoring = useCallback(() => {
    ColoringStorage.clear(drawingId)
    setShowRestorePrompt(false)
  }, [drawingId])

  // Anvend farger på SVG - memoized for performance
  const applyColorsToSVG = useCallback((regions: Record<string, string>) => {
    if (!containerRef.current) return

    const svg = containerRef.current.querySelector('svg')
    if (!svg) return

    const fillableAreas = svg.querySelectorAll('.fillable-area')
    fillableAreas.forEach((area) => {
      const element = area as SVGElement
      const regionId = element.getAttribute('data-region')
      
      if (regionId && regions[regionId]) {
        element.setAttribute('fill', regions[regionId])
      } else {
        element.setAttribute('fill', 'white')
      }
    })
  }, [])

  // Delegert event handling - optimiert
  const handleSVGClick = useCallback((event: Event) => {
    const target = event.target as SVGElement
    
    // Finn nærmeste fillable area
    const fillableArea = target.closest('.fillable-area') as SVGElement
    if (!fillableArea) return

    // Sjekk om området er interaktivt
    if (fillableArea.getAttribute('data-noninteractive') === 'true') return

    const regionId = fillableArea.getAttribute('data-region')
    if (!regionId) {
      console.warn('Fargeleggbart område mangler data-region attributt')
      return
    }

    // Unngå unødvendige oppdateringer
    if (coloredRegions[regionId] === currentColor) return

    // Lagre til undo stack (begrenset størrelse)
    setUndoStack(prev => {
      const newStack = [...prev, { ...coloredRegions }]
      return newStack.slice(-MAX_UNDO_STACK_SIZE)
    })

    // Oppdater farge umiddelbart for responsivitet
    fillableArea.setAttribute('fill', currentColor)
    
    const newRegions = {
      ...coloredRegions,
      [regionId]: currentColor
    }
    
    updateColoredRegions(newRegions)
  }, [coloredRegions, currentColor, updateColoredRegions])

  // Memoized SVG innhold for å unngå unødvendige re-renders
  const sanitizedSVG = useMemo(() => {
    if (!svgContent) return Promise.resolve('')
    
    return sanitizeSVG(svgContent).catch(error => {
      console.error('SVG sanitering feilet:', error)
      return ''
    })
  }, [svgContent])

  // Initialiser SVG - optimiert dependencies
  useEffect(() => {
    const initializeSVG = async () => {
      const sanitized = await sanitizedSVG
      
      if (!sanitized) {
        setError('Ingen gyldig SVG-innhold')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Valider SVG
        const validation = validateSVGForColoring(sanitized)
        if (!validation.isValid) {
          throw new Error('Ugyldig SVG for fargelegging')
        }

        // Sett inn sanitert SVG
        if (containerRef.current) {
          containerRef.current.innerHTML = sanitized
          
          const svg = containerRef.current.querySelector('svg')
          if (svg) {
            // Gjør SVG responsiv
            svg.style.maxWidth = '100%'
            svg.style.height = 'auto'
            svg.style.cursor = 'pointer'

            // Legg til delegert event listener
            svg.addEventListener('click', handleSVGClick, { passive: true })

            // Sett opp hover effekter
            const fillableAreas = svg.querySelectorAll('.fillable-area')
            fillableAreas.forEach((area) => {
              const element = area as SVGElement
              
              // Standardstyling
              if (!element.getAttribute('fill') || element.getAttribute('fill') === 'none') {
                element.setAttribute('fill', 'white')
              }
              element.style.transition = 'opacity 0.2s ease'

              // Hover effekter med passive listeners
              const handleMouseEnter = () => {
                if (element.getAttribute('data-noninteractive') !== 'true') {
                  element.style.opacity = '0.8'
                }
              }

              const handleMouseLeave = () => {
                element.style.opacity = '1'
              }

              element.addEventListener('mouseenter', handleMouseEnter, { passive: true })
              element.addEventListener('mouseleave', handleMouseLeave, { passive: true })
            })

            // Anvend eksisterende farger
            applyColorsToSVG(coloredRegions)
          }
        }

        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kunne ikke laste SVG')
        setIsLoading(false)
      }
    }
    
    initializeSVG()

    // Kopier ref til lokal variabel
    const container = containerRef.current;
    // Cleanup function
    return () => {
      if (container) {
        const svg = container.querySelector('svg')
        if (svg) {
          svg.removeEventListener('click', handleSVGClick)
        }
      }
    }
  }, [sanitizedSVG, handleSVGClick, coloredRegions, applyColorsToSVG])

  // Cleanup auto-save timeout
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return

    const previousState = undoStack[undoStack.length - 1]
    setUndoStack(prev => prev.slice(0, -1))
    updateColoredRegions(previousState)
    applyColorsToSVG(previousState)
  }, [undoStack, updateColoredRegions, applyColorsToSVG])

  const handleClear = useCallback(() => {
    const emptyRegions = {}
    updateColoredRegions(emptyRegions)
    applyColorsToSVG(emptyRegions)
    setUndoStack([])
  }, [updateColoredRegions, applyColorsToSVG])

  const handleSave = useCallback(() => {
    if (containerRef.current && onSave) {
      const svg = containerRef.current.querySelector('svg')
      if (svg) {
        const svgData = svg.outerHTML
        onSave(svgData)
      }
    }
  }, [onSave])

  const handleDownload = useCallback(() => {
    if (!containerRef.current || typeof window === 'undefined') return

    const svg = containerRef.current.querySelector('svg')
    if (!svg) return

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const svgData = new XMLSerializer().serializeToString(svg)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)

      const img = new Image()
      img.onload = () => {
        canvas.width = img.width || 800
        canvas.height = img.height || 600
        
        // Hvit bakgrunn
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        ctx.drawImage(img, 0, 0)
        URL.revokeObjectURL(url)

        canvas.toBlob((blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = downloadUrl
            a.download = `fargelegging-${drawingId}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(downloadUrl)
          }
        }, 'image/png', 0.9)
      }
      
      img.onerror = () => {
        console.error('Kunne ikke laste SVG for nedlasting')
        URL.revokeObjectURL(url)
      }
      
      img.src = url
    } catch (error) {
      console.error('Feil ved nedlasting:', error)
    }
  }, [drawingId])

  if (isLoading) {
    return <ColoringSkeletonLoader />
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-red-600 max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-lg font-semibold mb-2">Kunne ikke laste fargelegging</p>
          <p className="text-sm text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Prøv igjen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Gjenopprett prompt */}
      {showRestorePrompt && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 mx-4 mt-4 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-3">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-blue-700">
                Vi fant lagret arbeid for denne tegningen. Vil du fortsette der du slapp?
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={restoreStoredColoring}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Gjenopprett
              </button>
              <button
                onClick={dismissStoredColoring}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition-colors"
              >
                Start på nytt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verktøylinje */}
      <div className="bg-white border-b border-gray-200 p-4 flex flex-wrap gap-4 items-center">
        <button
          onClick={handleUndo}
          disabled={undoStack.length === 0}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <span>↶</span> Angre
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <span>🗑️</span> Tøm alt
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <span>💾</span> Lagre
        </button>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <span>📥</span> Last ned PNG
        </button>
        
        {/* Auto-save indikator */}
        <div className="flex items-center text-sm text-gray-500 ml-auto">
          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Auto-lagring aktivert
        </div>
      </div>

      {/* SVG Container */}
      <div className="flex-1 p-4 md:p-8 bg-gray-50 overflow-auto">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-4 md:p-8">
          <div 
            ref={containerRef}
            className="w-full"
            style={{ minHeight: '400px' }}
          />
        </div>
      </div>
    </div>
  )
} 