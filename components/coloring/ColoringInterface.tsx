'use client'
import { useState, useCallback, useEffect } from 'react'
import ColorPalette from '../ColorPicker'
import SVGCanvas from './SVGCanvas'
import Link from 'next/link'

interface ColoringInterfaceProps {
  drawingId: string
  title: string
  svgContent: string
  downloadUrl?: string
  suggestedColors?: Array<{ name: string; hex: string }>
  backUrl?: string
}

export default function ColoringInterface({ 
  drawingId,
  title, 
  svgContent, 
  downloadUrl, 
  suggestedColors,
  backUrl = '/'
}: ColoringInterfaceProps) {
  const [currentColor, setCurrentColor] = useState('#FF0000')
  const [coloredRegions, setColoredRegions] = useState<Record<string, string>>({})
  const [isMobile, setIsMobile] = useState(false)
  const [showMobilePalette, setShowMobilePalette] = useState(false)

  // Sjekk mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSave = useCallback((svgData: string) => {
    // TODO: Implementer lagring til database
    console.log('Lagrer SVG data for tegning:', drawingId)
    console.log('Fargede områder:', coloredRegions)
    
    // Vis bekreftelse til bruker
    if (typeof window !== 'undefined') {
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      notification.textContent = 'Fargelegging lagret!'
      document.body.appendChild(notification)
      
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 3000)
    }
  }, [drawingId, coloredRegions])

  const handleColorChange = useCallback((regions: Record<string, string>) => {
    setColoredRegions(regions)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href={backUrl}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Tilbake
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
                  {title}
                </h1>
                <p className="text-sm text-gray-600 hidden sm:block">
                  Digital fargelegging
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download
                  className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <span className="hidden sm:inline">📄 PDF</span>
                  <span className="sm:hidden">PDF</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile palette toggle */}
      {isMobile && (
        <div className="bg-white border-b p-4 sticky top-[73px] z-30">
          <button
            onClick={() => setShowMobilePalette(!showMobilePalette)}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>🎨</span>
            <span>{showMobilePalette ? 'Skjul' : 'Vis'} Fargepalett</span>
          </button>
        </div>
      )}

      {/* Main Interface */}
      <div className={`flex ${isMobile ? 'flex-col' : 'h-[calc(100vh-73px)]'}`}>
        {(!isMobile || showMobilePalette) && (
          <div className={`${isMobile ? 'border-b bg-white' : 'flex-shrink-0'}`}>
            <ColorPalette
              onColorSelect={setCurrentColor}
              selectedColor={currentColor}
              suggestedColors={suggestedColors}
              className={isMobile ? 'h-auto border-r-0' : ''}
            />
          </div>
        )}
        
        <div className="flex-1 min-h-0">
          <SVGCanvas
            drawingId={drawingId}
            svgContent={svgContent}
            currentColor={currentColor}
            onSave={handleSave}
            onColorChange={handleColorChange}
          />
        </div>
      </div>
    </div>
  )
} 