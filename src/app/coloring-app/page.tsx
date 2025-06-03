'use client'

import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { getColoringImageWebP } from '@/lib/sanity'

// Dynamisk import av ColoringApp-komponenten
const ColoringApp = dynamic(() => import('@/components/coloring/ColoringApp'), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Laster fargeleggingsapp...</p>
      </div>
    </div>
  ),
  ssr: false // Deaktiverer server-side rendering for canvas-komponenten
})

export default function ColoringAppPage() {
  const [imageData, setImageData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const imageId = typeof window !== 'undefined' ? sessionStorage.getItem('coloringAppImageId') : null
    console.log('coloringAppImageId fra sessionStorage:', imageId)
    if (!imageId) {
      setError('Ingen bilde valgt. Gå tilbake og velg et bilde for å starte fargelegging.')
      setIsLoading(false)
      return
    }
    const loadImage = async () => {
      try {
        const data = await getColoringImageWebP(imageId)
        console.log('Sanity image data:', data)
        if (!data || !data.webpImageUrl) {
          setError('Bilde ikke funnet')
          return
        }
        setImageData(data)
      } catch (err) {
        setError('Kunne ikke laste bilde')
      } finally {
        setIsLoading(false)
      }
    }
    loadImage()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Laster fargeleggingsapp...</p>
        </div>
      </div>
    )
  }

  if (error || !imageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'En feil oppstod'}</p>
          <a href="/categories" className="text-blue-600 hover:underline">
            Tilbake til kategorier
          </a>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Forbereder fargeleggingsverktøy...</p>
        </div>
      </div>
    }>
      <ColoringApp imageData={imageData} />
    </Suspense>
  )
} 