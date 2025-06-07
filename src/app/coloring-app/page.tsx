'use client'

import { useState, useEffect } from 'react'
import ColoringApp from '@/components/coloring/ColoringApp'
import { getColoringImageWebP } from '@/lib/sanity'

export default function ColoringAppPage() {
  const [imageData, setImageData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadImage = async () => {
      const imageId = typeof window !== 'undefined' ? sessionStorage.getItem('coloringAppImageId') : null
      if (!imageId) {
        setError('Ingen bilde valgt. Gå tilbake og velg et bilde for å starte fargelegging.')
        setIsLoading(false)
        return
      }

      try {
        const data = await getColoringImageWebP(imageId)
        if (!data) {
          setError('Kunne ikke hente bildedata.')
          setIsLoading(false)
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
      <main className="min-h-screen flex items-center justify-center">
        <section className="text-center" aria-label="Laster inn">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" role="status">
            <span className="sr-only">Laster inn...</span>
          </div>
          <p>Laster fargeleggingsapp...</p>
        </section>
      </main>
    )
  }

  if (error || !imageData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <section className="text-center" aria-labelledby="error-heading">
          <h1 id="error-heading" className="sr-only">Feil ved lasting</h1>
          <p className="text-red-600 mb-4">{error || 'En feil oppstod'}</p>
          <nav>
            <a href="/categories" className="text-blue-600 hover:underline">
              Tilbake til kategorier
            </a>
          </nav>
        </section>
      </main>
    )
  }

  return (
    <main>
      <ColoringApp imageData={imageData} />
    </main>
  )
} 