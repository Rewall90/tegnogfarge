import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSubcategoryWithDrawings, getAllCategories, getSubcategoriesByCategory, getColoringImage } from '@/lib/sanity';
import { notFound } from 'next/navigation';
import { DownloadPdfButton } from '@/components/buttons/DownloadPdfButton';
import { StartColoringButton } from '@/components/buttons/StartColoringButton';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import DrawingJsonLd from '@/components/json-ld/DrawingJsonLd';
import { SVG_BLUR_PLACEHOLDER, WEBP_PLACEHOLDER_PATH, formatDate } from '@/lib/utils';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';

// Increase revalidation time for better caching
export const revalidate = 3600; // Revalidate every hour instead of 30 minutes

// Types for better type safety
interface Drawing {
  _id: string;
  title: string;
  description?: string;
  metaDescription?: string;
  imageUrl?: string;
  imageLqip?: string;
  fallbackImageUrl?: string;
  fallbackImageLqip?: string;
  thumbnailUrl?: string;
  thumbnailLqip?: string;
  downloadUrl?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  hasDigitalColoring?: boolean;
  recommendedAgeRange?: string;
  contextContent?: PortableTextBlock[];
  slug?: string;
  publishedDate?: string;
  _createdAt?: string;
}

interface ParentCategory {
  title: string;
  slug: string;
}

interface Subcategory {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  parentCategory?: ParentCategory;
  drawings?: Drawing[];
}

interface PageProps {
  params: {
    categorySlug: string;
    subcategorySlug: string;
    drawingSlug: string;
  };
}

// Generer metadata
export async function generateMetadata({ params }: PageProps) {
  const { categorySlug, subcategorySlug, drawingSlug } = params;
  
  // Få tak i tegningen (basert på ID eller slug)
  const drawing = await getColoringImage(drawingSlug);
  
  if (!drawing) {
    return { title: 'Tegning ikke funnet' };
  }
  
  // Hent underkategorien for å få tilgang til kategori-info
  const subcategory = await getSubcategoryWithDrawings(categorySlug, subcategorySlug);
  
  if (!subcategory) {
    return { title: drawing.title || 'Fargeleggingsbilde' };
  }

  // Prepare structured data for metadata
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fargelegg.no';
  const pathname = `/${categorySlug}/${subcategorySlug}/${drawingSlug}`;
  const currentUrl = `${baseUrl}${pathname}`;
  
  return {
    title: `${drawing.title} | ${subcategory.title} | ${subcategory.parentCategory?.title} | Fargelegg Nå`,
    description: drawing.description || `Fargelegg ${drawing.title} fra kategorien ${subcategory.parentCategory?.title}`,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      title: `${drawing.title} | ${subcategory.title} | Fargelegg Nå`,
      description: drawing.description || `Fargelegg ${drawing.title} fra kategorien ${subcategory.parentCategory?.title}`,
      url: pathname,
      siteName: 'Fargelegg Nå',
      images: [
        {
          url: drawing.thumbnailUrl || drawing.imageUrl || '',
          width: 800,
          height: 600,
          alt: drawing.title,
        },
      ],
      locale: 'nb_NO',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: drawing.title,
      description: drawing.description || `Fargelegg ${drawing.title} fra kategorien ${subcategory.parentCategory?.title}`,
      images: drawing.thumbnailUrl || drawing.imageUrl,
    },
  };
}

// For now, don't generate static paths for drawings since there may be too many
export async function generateStaticParams() {
  return [];
}

// Helper functions (extracted for better organization and potential memoization)
function getDifficultyKey(value: string | undefined): 'easy' | 'medium' | 'hard' {
  if (value === 'easy' || value === 'medium' || value === 'hard') return value;
  return 'medium';
}

const customComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="font-display font-bold text-2xl text-navy mt-8 mb-4">{children}</h2>
    ),
    normal: ({ children }) => (
      <p className="text-lg text-navy mb-4">{children}</p>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="text-lg text-navy list-disc ml-6">{children}</li>,
    number: ({ children }) => <li className="text-lg text-navy list-decimal ml-6">{children}</li>,
  },
};

// Main component
export default async function DrawingPage({ params }: PageProps) {
  const { categorySlug, subcategorySlug, drawingSlug } = params;
  
  // Fetch data
  const drawing = await getColoringImage(drawingSlug);
  if (!drawing) {
    notFound();
  }
  
  const subcategory = await getSubcategoryWithDrawings(categorySlug, subcategorySlug);
  if (!subcategory) {
    notFound();
  }
  
  // Define constants
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800', 
    hard: 'bg-red-100 text-red-800'
  };
  
  const difficultyLabels = {
    easy: 'Enkel',
    medium: 'Middels',
    hard: 'Vanskelig'
  };
  
  const ageRangeLabels: Record<string, string> = {
    '3-5': '3-5 år',
    '6-8': '6-8 år',
    '9-12': '9-12 år',
    '12+': 'Over 12 år',
    'all': 'Alle aldre'
  };
  
  // Prepare the path for JSON-LD
  const pathname = `/${categorySlug}/${subcategorySlug}/${drawingSlug}`;
  
  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <Header />
      {/* Add structured data */}
      <DrawingJsonLd 
        drawing={drawing} 
        pathname={pathname} 
        subcategory={{
          _id: subcategory._id,
          slug: subcategory.slug,
          title: subcategory.title,
          parentCategory: subcategory.parentCategory
        }}
      />
      <main className="flex-grow bg-cream">
        <div className="w-full bg-cream text-black">
          <div className="max-w-screen-xl mx-auto px-4 py-8">
            {/* Breadcrumbs Navigation */}
            <nav className="mb-6 text-sm" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/" className="text-blue-600 hover:underline">
                    Forsiden
                  </Link>
                </li>
                <li className="flex items-center">
                  <span className="mx-2">/</span>
                  <Link 
                    href={`/${categorySlug}`}
                    className="text-blue-600 hover:underline"
                  >
                    {subcategory.parentCategory?.title}
                  </Link>
                </li>
                <li className="flex items-center">
                  <span className="mx-2">/</span>
                  <Link 
                    href={`/${categorySlug}/${subcategorySlug}`}
                    className="text-blue-600 hover:underline"
                  >
                    {subcategory.title}
                  </Link>
                </li>
                <li className="flex items-center">
                  <span className="mx-2">/</span>
                  <span className="text-gray-500">{drawing.title}</span>
                </li>
              </ol>
            </nav>
            
            <div className="flex flex-col md:flex-row">
              {/* Left: Image */}
              <div className="md:w-1/3 flex justify-center items-center">
                {(drawing.imageUrl || drawing.fallbackImageUrl) && (
                  <div className="relative w-full max-w-[450px] min-h-[600px]">
                    <Image
                      src={drawing.imageUrl || drawing.fallbackImageUrl || WEBP_PLACEHOLDER_PATH}
                      alt={drawing.title}
                      priority
                      fill
                      style={{ objectFit: 'contain' }}
                      className="rounded-xl"
                      sizes="(max-width: 640px) 85vw, (max-width: 1024px) 40vw, 25vw"
                      placeholder="blur"
                      blurDataURL={drawing.imageLqip || drawing.fallbackImageLqip || SVG_BLUR_PLACEHOLDER}
                      quality={85}
                    />
                  </div>
                )}
              </div>
              {/* Right: Info/Text */}
              <div className="md:w-2/3 md:pl-12 mt-4 md:mt-0 max-w-2xl">
                <h1 className="text-5xl font-bold mb-4 font-display text-navy">{drawing.title}</h1>
                <div className="mb-4">
                  <p className="text-lg text-gray-600">
                    {formatDate(drawing.publishedDate || drawing._createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {drawing.difficulty && (
                    <span className={`inline-block px-3 py-1 rounded text-sm ${difficultyColors[getDifficultyKey(drawing.difficulty)]}`}> 
                      {difficultyLabels[getDifficultyKey(drawing.difficulty)]}
                    </span>
                  )}
                  {drawing.recommendedAgeRange && (
                    <span className="inline-block px-3 py-1 rounded text-sm bg-blue-100 text-blue-800">
                      {ageRangeLabels[drawing.recommendedAgeRange] || 'Alle aldre'}
                    </span>
                  )}
                </div>
                {drawing.description && (
                  <div className="mb-8">
                    <p className="text-lg text-navy">{drawing.description}</p>
                  </div>
                )}
                {/* Buttons */}
                <div className="flex gap-4 flex-wrap mb-8">
                  {drawing.downloadUrl && (
                    <DownloadPdfButton
                      downloadUrl={drawing.downloadUrl}
                      title="Last ned Bilde"
                      className="border-2 border-black rounded-full px-6 py-2 inline-block hover:bg-gray-100 transition"
                    />
                  )}
                  <StartColoringButton
                    drawingId={drawing._id}
                    title="Start Fargelegging"
                    className="border-2 border-black rounded-full px-6 py-2 inline-block hover:bg-gray-100 transition"
                  />
                </div>
              </div>
            </div>
            {/* Context Content Section - moved below the row, in a card container */}
            {drawing.contextContent && drawing.contextContent.length > 0 && (
              <div className="mt-10 bg-white/80 rounded-xl shadow p-4 sm:p-6">
                <PortableText value={drawing.contextContent} components={customComponents} />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 