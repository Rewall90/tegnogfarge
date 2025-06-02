import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCategoryWithSubcategories, getAllCategories } from '../../../lib/sanity';
import { notFound } from 'next/navigation';

export const revalidate = 1800; // Oppdater siden hver 30. min

// Generer metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryWithSubcategories(slug);
  
  if (!category) {
    return { title: 'Kategori ikke funnet' };
  }

  return {
    title: `${category.title} Fargeleggingsbilder | Fargelegg Nå`,
    description: category.description || `Utforsk ${category.title} fargeleggingsbilder`,
  };
}

// Legg til type for subcategory
interface Subcategory {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  icon?: string;
  featuredImage?: { url: string; alt?: string };
  difficulty?: number;
  drawingCount?: number;
}

// Oppdater Category hvis nødvendig
interface Category {
  slug: string;
  title: string;
  description?: string;
  icon?: string;
  subcategories?: Subcategory[];
}

// Generer statiske paths
export async function generateStaticParams() {
  try {
    const categories = await getAllCategories();
    return categories.map((category: Category) => ({
      slug: category.slug
    }));
  } catch (error) {
    console.error('Feil ved generering av kategori-paths:', error);
    return [];
  }
}

function getDifficultyLabel(difficulty: number | undefined) {
  if (!difficulty) return 'Ukjent';
  if (difficulty <= 2) return '🟢 Enkel';
  if (difficulty === 3) return '🟡 Middels';
  if (difficulty >= 4) return '🔴 Vanskelig';
  return 'Ukjent';
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryWithSubcategories(slug);
  
  if (!category) {
    notFound();
  }
  
  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <Link 
          href="/categories" 
          className="text-blue-600 hover:underline mb-4 inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Tilbake til alle kategorier
        </Link>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            {category.icon && <span className="mr-3">{category.icon}</span>}
            {category.title}
          </h1>
          {category.description && (
            <p className="text-gray-600 mb-2">{category.description}</p>
          )}
          <p className="text-sm text-gray-500">
            {category.subcategories?.length || 0} underkategorier tilgjengelig
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.subcategories?.map((subcategory: Subcategory) => (
            <Link
              key={subcategory._id}
              href={`/categories/${category.slug}/${subcategory.slug}`}
              className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {subcategory.featuredImage?.url && (
                <div className="relative h-48 w-full bg-gray-100">
                  <Image 
                    src={subcategory.featuredImage.url}
                    alt={subcategory.featuredImage.alt || subcategory.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="font-bold text-lg mb-2">{subcategory.title}</h2>
                {subcategory.description && (
                  <p className="text-gray-600 text-sm mb-3">{subcategory.description}</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                    {getDifficultyLabel(subcategory.difficulty)}
                  </span>
                  <span className="text-gray-500">
                    {subcategory.drawingCount || 0} tegninger
                  </span>
                </div>
              </div>
            </Link>
          )) || []}
        </div>
        
        {(!category.subcategories || category.subcategories.length === 0) && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen underkategorier ennå</h3>
            <p className="text-gray-500">
              Det er ingen underkategorier tilgjengelig i denne kategorien for øyeblikket.
            </p>
          </div>
        )}
      </div>
    </>
  );
} 