'use client'

import { useState, useEffect } from 'react'
import ColoringApp from '@/components/coloring/ColoringApp'
import { getColoringImageWebP } from '@/lib/sanity'

export default function ColoringAppPage() {
  const [imageData, setImageData] = useState(null)
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

  return <ColoringApp imageData={imageData} />
} 