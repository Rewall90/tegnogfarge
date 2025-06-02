Steg 1: Oppdater Sanity schema for WebP bilder
Fil: sanity-studio/schemaTypes/drawingImage.ts
Legg til WebP bildestøtte:
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'drawingImage',
  title: 'Tegning',
  type: 'document',
  fields: [
    // ... eksisterende felter ...
    
    defineField({
      name: 'webpImage',
      title: 'WebP Bilde for Online Fargelegging',
      type: 'image',
      options: {
        accept: 'image/webp'
      },
      hidden: ({ document }) => !document?.hasDigitalColoring,
      description: 'Last opp bildet i WebP format for best ytelse ved online fargelegging',
      validation: Rule => Rule.custom((value, context) => {
        const { document } = context as any
        if (document?.hasDigitalColoring && !value) {
          return 'WebP bilde er påkrevd for online fargelegging'
        }
        return true
      })
    }),
  ]
})

Steg 2: Opprett ny fargeleggingsapp-side
Ny fil: src/app/coloring-app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ColoringApp from '@/components/coloring/ColoringApp'
import { getColoringImageWebP } from '@/lib/sanity'

export default function ColoringAppPage() {
  const searchParams = useSearchParams()
  const imageId = searchParams.get('image')
  const [imageData, setImageData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!imageId) {
      setError('Ingen bilde valgt')
      setIsLoading(false)
      return
    }

    const loadImage = async () => {
      try {
        const data = await getColoringImageWebP(imageId)
        if (!data) {
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
  }, [imageId])

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

Steg 3: Opprett ny ColoringApp komponent
Ny fil: src/components/coloring/ColoringApp.tsx

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FloodFill } from '@/lib/flood-fill'
import ColorPalette from './ColorPalette'
import ToolBar from './ToolBar'
import ImageSelector from './ImageSelector'
import type { ColoringState } from '@/types/canvas-coloring'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

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

const MAX_HISTORY = 50

export default function ColoringApp({ imageData: initialImageData }: ColoringAppProps) {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
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

  // Laste inn bilde når currentImage endres
  useEffect(() => {
    const loadImage = async () => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return
        
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        
        setState(prev => ({
          ...prev,
          imageData,
          originalImageData,
          history: [imageData],
          historyStep: 0
        }))
      }
      
      img.src = currentImage.webpImageUrl
    }
    
    loadImage()
  }, [currentImage])

  // Håndter bildevelger
  const handleImageChange = (newImageData: any) => {
    setCurrentImage(newImageData)
    setShowImageSelector(false)
    // Oppdater URL uten å laste siden på nytt
    router.push(`/coloring-app?image=${newImageData._id}`, { scroll: false })
  }

  // ... resten av flood fill, undo, redo, reset, download handlers (samme som før)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
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

      {/* Image Selector Modal */}
      {showImageSelector && (
        <ImageSelector
          currentImageId={currentImage._id}
          categorySlug={currentImage.category.slug}
          subcategorySlug={currentImage.subcategory.slug}
          onSelect={handleImageChange}
          onClose={() => setShowImageSelector(false)}
        />
      )}

      {/* Main content */}
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

Steg 4: Opprett ImageSelector komponent
Ny fil: src/components/coloring/ImageSelector.tsx
'use client'

import { useState, useEffect } from 'react'
import { getSubcategoryColoringImages } from '@/lib/sanity'
import Image from 'next/image'

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
          <h2 className="text-xl font-bold">Velg et annet bilde</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <p className="text-center">Laster bilder...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image: any) => (
                <button
                  key={image._id}
                  onClick={() => onSelect(image)}
                  className={`border-2 rounded-lg overflow-hidden hover:border-blue-500 transition ${
                    image._id === currentImageId ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'
                  }`}
                >
                  <div className="relative aspect-[3/4] bg-gray-100">
                    <Image
                      src={image.thumbnailUrl || image.webpImageUrl}
                      alt={image.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <p className="p-2 text-sm font-medium truncate">{image.title}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

Steg 5: Oppdater Sanity queries
Fil: src/lib/sanity.ts
Legg til nye queries:
// Hent bilde med WebP URL for fargelegging
export async function getColoringImageWebP(id: string) {
  return client.fetch(`
    *[_type == "drawingImage" && _id == $id && hasDigitalColoring == true][0] {
      _id,
      title,
      "webpImageUrl": webpImage.asset->url,
      suggestedColors,
      "category": subcategory->parentCategory->{ 
        title, 
        "slug": slug.current 
      },
      "subcategory": subcategory->{ 
        title, 
        "slug": slug.current 
      }
    }
  `, { id })
}

// Hent alle fargeleggingsbilder i en underkategori
export async function getSubcategoryColoringImages(categorySlug: string, subcategorySlug: string) {
  return client.fetch(`
    *[_type == "drawingImage" && 
      subcategory->slug.current == $subcategorySlug && 
      subcategory->parentCategory->slug.current == $categorySlug &&
      hasDigitalColoring == true &&
      isActive == true] {
      _id,
      title,
      "webpImageUrl": webpImage.asset->url,
      "thumbnailUrl": mainImage.asset->url,
      suggestedColors,
      "category": subcategory->parentCategory->{ 
        title, 
        "slug": slug.current 
      },
      "subcategory": subcategory->{ 
        title, 
        "slug": slug.current 
      }
    } | order(order asc, title asc)
  `, { categorySlug, subcategorySlug })
}

Steg 6: Oppdater StartColoringButton
Fil: src/components/buttons/StartColoringButton.tsx

import React from 'react';
import Button from '../ui/Button';

interface StartColoringButtonProps {
  drawingId: string;
  title?: string;
  className?: string;
}

export function StartColoringButton({ drawingId, title = 'Online Coloring', className }: StartColoringButtonProps) {
  return (
    <Button
      href={`/coloring-app?image=${drawingId}`}
      variant="secondary"
      className={className}
      ariaLabel={title}
    >
      {title}
    </Button>
  );
}

Steg 7: Fjern gammel coloring-rute
Slett hele mappen:
src/app/coloring/

Steg 8: Oppdater DrawingDetail komponent
Fil: src/components/drawing/DrawingDetail.tsx
Ingen endringer nødvendig - komponenten bruker allerede StartColoringButton som nå peker til ny URL.
Del 3: Migrering av eksisterende data
Migreringsscript for Sanity
Opprett et script for å konvertere eksisterende bilder til WebP:
Ny fil: scripts/migrate-to-webp.js
// Dette scriptet må kjøres lokalt med Node.js
const sharp = require('sharp');
const { createClient } = require('@sanity/client');
const imageUrlBuilder = require('@sanity/image-url');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  token: process.env.SANITY_WRITE_TOKEN, // Trenger skrivetilgang
  useCdn: false
});

const builder = imageUrlBuilder(client);

async function migrateImages() {
  // Hent alle bilder som har digital coloring
  const images = await client.fetch(`
    *[_type == "drawingImage" && hasDigitalColoring == true && !defined(webpImage)] {
      _id,
      title,
      mainImage
    }
  `);

  console.log(`Fant ${images.length} bilder som må konverteres`);

  for (const image of images) {
    try {
      // Hent original bilde
      const imageUrl = builder.image(image.mainImage).url();
      
      // Last ned og konverter til WebP
      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();
      
      const webpBuffer = await sharp(Buffer.from(buffer))
        .webp({ quality: 90 })
        .toBuffer();
      
      // Last opp WebP til Sanity
      const asset = await client.assets.upload('image', webpBuffer, {
        filename: `${image.title.replace(/\s+/g, '-').toLowerCase()}.webp`,
        contentType: 'image/webp'
      });
      
      // Oppdater dokument med WebP referanse
      await client
        .patch(image._id)
        .set({
          webpImage: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: asset._id
            }
          }
        })
        .commit();
      
      console.log(`✓ Konvertert: ${image.title}`);
    } catch (error) {
      console.error(`✗ Feil ved konvertering av ${image.title}:`, error);
    }
  }
}

migrateImages();