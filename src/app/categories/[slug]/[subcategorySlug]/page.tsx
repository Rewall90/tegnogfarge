import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSubcategoryWithDrawings, getAllCategories, getSubcategoriesByCategory } from '@/lib/sanity';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const revalidate = 1800; // Oppdater siden hver 30. min

interface SubcategoryPageProps {
  params: { 
    slug: string;
    subcategorySlug: string;
  }
}

// Generer metadata
export async function generateMetadata({ params }: SubcategoryPageProps): Promise<Metadata> {
  const subcategory = await getSubcategoryWithDrawings(params.slug, params.subcategorySlug);
  
  if (!subcategory) {
    return { title: 'Underkategori ikke funnet' };
  }

  return {
    title: `${subcategory.title} Fargeleggingsbilder | ${subcategory.parentCategory?.title} | Fargelegg Nå`,
    description: subcategory.description || `Utforsk ${subcategory.title} tegninger i kategorien ${subcategory.parentCategory?.title}`,
  };
}

// Generer statiske paths
export async function generateStaticParams() {
  try {
    const categories = await getAllCategories();
    const paths = [];
    
    for (const category of categories) {
      const subcategories = await getSubcategoriesByCategory(category.slug);
      for (const subcategory of subcategories) {
        paths.push({
          slug: category.slug,
          subcategorySlug: subcategory.slug
        });
      }
    }
    
    return paths;
  } catch (error) {
    console.error('Feil ved generering av underkategori-paths:', error);
    return [];
  }
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { slug, subcategorySlug } = params;
  const subcategory = await getSubcategoryWithDrawings(slug, subcategorySlug);
  
  if (!subcategory) {
    notFound();
  }
  
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
  
  const getDifficultyKey = (value: any): 'easy' | 'medium' | 'hard' => {
    if (value === 'easy' || value === 'medium' || value === 'hard') return value;
    return 'medium';
  };
  
  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm">
          <Link href="/categories" className="text-blue-600 hover:underline">
            Alle kategorier
          </Link>
          <span className="mx-2">/</span>
          <Link 
            href={`/categories/${subcategory.parentCategory?.slug}`}
            className="text-blue-600 hover:underline"
          >
            {subcategory.parentCategory?.title}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-500">{subcategory.title}</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            {subcategory.title}
          </h1>
          {subcategory.description && (
            <p className="text-gray-600 mb-2">{subcategory.description}</p>
          )}
          <div className={`inline-block px-3 py-1 rounded text-xs font-medium ${difficultyColors[getDifficultyKey(subcategory.difficulty)]}`}>{difficultyLabels[getDifficultyKey(subcategory.difficulty)]}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subcategory.drawings?.map((drawing: any) => (
            <div key={drawing._id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {drawing.imageUrl && (
                <div className="relative h-48 w-full bg-gray-100">
                  <Image 
                    src={drawing.imageUrl}
                    alt={drawing.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="font-bold text-lg mb-2">{drawing.title}</h2>
                {drawing.description && (
                  <p className="text-gray-600 text-sm mb-3">{drawing.description}</p>
                )}
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className={`px-2 py-1 rounded text-xs ${difficultyColors[getDifficultyKey(drawing.difficulty)]}`}>{difficultyLabels[getDifficultyKey(drawing.difficulty)]}</span>
                  {drawing.hasDigitalColoring && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs ml-2">Digital</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {drawing.downloadUrl && (
                    <a href={drawing.downloadUrl} download className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm">Last ned PDF</a>
                  )}
                  {/* Her kan du legge til en knapp for digital fargelegging hvis ønskelig */}
                </div>
              </div>
            </div>
          ))}
        </div>

        {(!subcategory.drawings || subcategory.drawings.length === 0) && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen tegninger ennå</h3>
            <p className="text-gray-500">
              Det er ingen tegninger tilgjengelig i denne underkategorien for øyeblikket.
            </p>
          </div>
        )}
      </div>
    </>
  );
} 