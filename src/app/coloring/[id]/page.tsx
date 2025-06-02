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