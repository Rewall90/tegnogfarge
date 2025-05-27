import { notFound, redirect } from 'next/navigation'
import { getColoringImage, getAllColoringImages } from '../../../lib/sanity'
import ColoringInterface from '@/components/coloring/ColoringInterface'
import { Metadata } from 'next'

interface ColoringPageProps {
  params: { id: string }
}

export default async function ColoringPage({ params }: ColoringPageProps) {
  const image = await getColoringImage(params.id)
  
  // Redirect hvis bildet ikke finnes
  if (!image) {
    notFound()
  }
  
  // Redirect hvis bildet ikke kan fargelegges digitalt
  if (!image.hasDigitalColoring || !image.svgContent) {
    redirect(`/categories/${image.category?.slug || ''}`)
  }

  return (
    <ColoringInterface
      drawingId={image._id}
      title={image.title}
      svgContent={image.svgContent}
      downloadUrl={image.downloadUrl || undefined}
      suggestedColors={image.suggestedColors || undefined}
      backUrl={image.category ? `/categories/${image.category.slug}` : '/categories'}
    />
  )
}

// Generer statiske paths for alle fargeleggingsbilder
export async function generateStaticParams() {
  try {
    const images = await getAllColoringImages()
    
    return images.map((image: any) => ({
      id: image._id
    }))
  } catch (error) {
    console.error('Feil ved generering av statiske parametere:', error)
    return []
  }
}

// Metadata for SEO
export async function generateMetadata({ params }: ColoringPageProps): Promise<Metadata> {
  try {
    const image = await getColoringImage(params.id)
    
    if (!image) {
      return {
        title: 'Fargelegging ikke funnet',
        description: 'Denne fargeleggingen eksisterer ikke eller er ikke tilgjengelig.'
      }
    }

    const baseTitle = `Fargelegg ${image.title}`
    const description = `Fargelegg ${image.title} digitalt med vårt online fargeleggingsverktøy. Gratis, morsomt og enkelt å bruke!`

    return {
      title: baseTitle,
      description: description,
      openGraph: {
        title: baseTitle,
        description: description,
        images: [
          {
            url: image.imageUrl,
            width: 1200,
            height: 630,
            alt: image.title
          }
        ]
      }
    }
  } catch (error) {
    console.error('Feil ved generering av metadata:', error)
    return {
      title: 'Fargelegging',
      description: 'Digital fargelegging av tegninger'
    }
  }
} 