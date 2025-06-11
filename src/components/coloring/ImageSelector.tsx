'use client'

import { useState, useEffect } from 'react'
import { getSubcategoryColoringImages } from '@/lib/sanity'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { SVG_BLUR_PLACEHOLDER } from '@/lib/utils'

interface ImageSelectorProps {
  currentImageId: string
  categorySlug: string
  subcategorySlug: string
  onSelect: (image: any) => void
  onClose: () => void
}

export default function ImageSelector({
  currentImageId,
  categorySlug,
  subcategorySlug,
  onSelect,
  onClose
}: ImageSelectorProps) {
  const [images, setImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadImages = async () => {
      try {
        const data = await getSubcategoryColoringImages(categorySlug, subcategorySlug)
        setImages(data)
      } catch (error) {
        console.error('Kunne ikke laste bilder:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadImages()
  }, [categorySlug, subcategorySlug])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-section">Velg et annet bilde</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <p className="text-body text-center">Laster bilder...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image: any, index: number) => (
                <button
                  key={image._id}
                  onClick={() => onSelect(image)}
                  className={`border-2 rounded-lg overflow-hidden hover:border-blue-500 transition ${
                    image._id === currentImageId ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'
                  }`}
                >
                  <div className="relative aspect-[3/4] bg-gray-100">
                    <OptimizedImage
                      src={image.thumbnailUrl || image.webpImageUrl}
                      alt={image.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 85vw, (max-width: 1024px) 40vw, 25vw"
                      rootMargin="200px 0px"
                      placeholder="blur"
                      blurDataURL={SVG_BLUR_PLACEHOLDER}
                      // No priority needed for modal content that's not initially visible
                    />
                  </div>
                  <p className="p-2 text-sm font-display font-medium truncate">{image.title}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 