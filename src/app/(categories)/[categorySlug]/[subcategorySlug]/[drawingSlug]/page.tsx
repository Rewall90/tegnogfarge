import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSubcategoryWithDrawings, getAllCategories, getSubcategoriesByCategory, getColoringImage } from '@/lib/sanity';
import { notFound } from 'next/navigation';
import { DownloadPdfButton } from '@/components/buttons/DownloadPdfButton';
import { StartColoringButton } from '@/components/buttons/StartColoringButton';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

// Increase revalidation time for better caching
export const revalidate = 3600; // Revalidate every hour instead of 30 minutes

// Types for better type safety
interface Drawing {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  fallbackImageUrl?: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  hasDigitalColoring?: boolean;
  tags?: string[];
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

// Generer metadata
export async function generateMetadata(props: { params: { categorySlug: string; subcategorySlug: string; drawingSlug: string } }) {
  const params = await Promise.resolve(props.params);
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

  return {
    title: `${drawing.title} | ${subcategory.title} | ${subcategory.parentCategory?.title} | Fargelegg Nå`,
    description: drawing.description || `Fargelegg ${drawing.title} fra kategorien ${subcategory.parentCategory?.title}`,
    openGraph: {
      images: [
        {
          url: drawing.thumbnailUrl || drawing.imageUrl || '',
          width: 800,
          height: 600,
          alt: drawing.title,
        },
      ],
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

function formatDate(dateString?: string): string {
  if (!dateString) return new Date().toISOString().split('T')[0].replace(/-/g, '/');
  
  try {
    return new Date(dateString).toISOString().split('T')[0].replace(/-/g, '/');
  } catch (error) {
    console.error('Error formatting date:', error);
    return new Date().toISOString().split('T')[0].replace(/-/g, '/');
  }
}

// Main component
export default async function DrawingPage(props: { params: { categorySlug: string; subcategorySlug: string; drawingSlug: string } }) {
  const params = await Promise.resolve(props.params);
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
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow">
        <div className="w-full bg-white text-black">
          <div className="max-w-screen-lg mx-auto px-4 py-8">
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
              {/* Left side - Image */}
              <div className="md:w-1/2 flex justify-center">
                {(drawing.imageUrl || drawing.fallbackImageUrl) && (
                  <div className="flex justify-center items-center w-full">
                    <div className="relative w-full max-w-[450px] min-h-[600px]">
                      <Image
                        src={drawing.imageUrl || drawing.fallbackImageUrl || ''}
                        alt={drawing.title}
                        priority
                        fill
                        style={{ objectFit: 'contain' }}
                        className="rounded-md"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 450px"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZjVmNWY1IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmNWY1ZjUiIC8+PC9zdmc+"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right side - Information and buttons */}
              <div className="md:w-1/2 md:pl-12 mt-4 md:mt-0">
                <h1 className="text-5xl font-bold mb-4">{drawing.title}</h1>
                
                <div className="mb-4">
                  <p className="text-lg text-gray-600">
                    {formatDate(drawing.publishedDate || drawing._createdAt)}
                  </p>
                </div>
                
                {drawing.difficulty && (
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded text-sm ${difficultyColors[getDifficultyKey(drawing.difficulty)]}`}>
                      {difficultyLabels[getDifficultyKey(drawing.difficulty)]}
                    </span>
                  </div>
                )}
                
                {drawing.description && (
                  <div className="mb-8">
                    <p className="text-lg">{drawing.description}</p>
                  </div>
                )}
                
                {/* Buttons */}
                <div className="flex gap-4 flex-wrap">
                  {drawing.downloadUrl && (
                    <DownloadPdfButton
                      downloadUrl={drawing.downloadUrl}
                      title="Last ned PDF"
                      className="border-2 border-black rounded-full px-6 py-2 inline-block hover:bg-gray-100 transition"
                    />
                  )}
                  
                  <StartColoringButton
                    drawingId={drawing._id}
                    title="Online fargelegging"
                    className="border-2 border-black rounded-full px-6 py-2 inline-block hover:bg-gray-100 transition"
                  />
                </div>
                
                {/* Tags Section */}
                {drawing.tags && drawing.tags.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-2">Stikkord</h2>
                    <div className="flex flex-wrap gap-2">
                      {drawing.tags.map((tag: string) => (
                        <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 