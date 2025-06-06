import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCategoryWithSubcategories, getAllCategories, getAllCategoriesWithSubcategories } from '@/lib/sanity';
import { notFound } from 'next/navigation';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

// Increase revalidation time for better caching
export const revalidate = 3600; // Revalidate every hour instead of 30 minutes

interface PageProps {
  params: Promise<{
    categorySlug: string;
  }>;
}

// Generer metadata
export async function generateMetadata({ params: paramsPromise }: PageProps) {
  try {
    const { categorySlug } = await paramsPromise;
    const category = await getCategoryWithSubcategories(categorySlug);
    
    if (!category) {
      return { title: 'Kategori ikke funnet' };
    }

    const title = category.seoTitle || category.title;
    const description = category.seoDescription || category.description || `Utforsk ${category.title} fargeleggingsbilder`;
    
    // Prepare the JSON-LD data for this category
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fargelegg.no';
    const categoryId = `${baseUrl}/${category.slug}`;
    const currentUrl = `${baseUrl}/${categorySlug}`;
    const categoryImageUrl = category.image?.url;
    
    // Create hasPart array for the main category
    const hasPart = category.subcategories?.map((subcategory: Subcategory) => ({
      "@type": "CollectionPage",
      "@id": `${baseUrl}/${category.slug}/${subcategory.slug}`
    })) || [];
    
    // Prepare graph items
    const graphItems = [];
    
    // Add main category page
    graphItems.push({
      "@type": "CollectionPage",
      "@id": categoryId,
      "name": (category.seoTitle || category.title) + " – Fargeleggingsark",
      "description": category.seoDescription || category.description || `Oppdag vårt utvalg av fargeleggingsark med ${category.title.toLowerCase()}.`,
      "url": currentUrl,
      "inLanguage": "nb-NO",
      ...(categoryImageUrl && { 
        "image": categoryImageUrl,
        "thumbnailUrl": categoryImageUrl 
      }),
      "mainEntity": {
        "@type": "ItemList",
        "name": `${category.title} fargeleggingsbilder`,
        "description": `Utforsk alle ${category.title.toLowerCase()} fargeleggingsbilder for barn, inkludert ${category.subcategories?.map((s: Subcategory) => s.title).slice(0, 3).join(', ')}${category.subcategories && category.subcategories.length > 3 ? ' og flere' : ''}.`,
        "itemListElement": category.subcategories?.map((subcategory: Subcategory, index: number) => {
          const subcategoryImageUrl = subcategory.featuredImage?.url;
          return {
            "@type": "ListItem",
            "position": index + 1,
            "name": subcategory.seoTitle || subcategory.title,
            "url": `${baseUrl}/${category.slug}/${subcategory.slug}`,
            ...(subcategoryImageUrl && { 
              "image": subcategoryImageUrl,
              "thumbnailUrl": subcategoryImageUrl
            }),
            "description": subcategory.description || `Fargeleggingsark med ${subcategory.title}-tema for barn.`
          };
        }) || []
      },
      "hasPart": hasPart,
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Hjem",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": category.title,
            "item": currentUrl
          }
        ]
      }
    });
    
    // Add subcategory pages
    if (category.subcategories && category.subcategories.length > 0) {
      category.subcategories.forEach((subcategory: Subcategory) => {
        const subcategoryImageUrl = subcategory.featuredImage?.url;
        graphItems.push({
          "@type": "CollectionPage",
          "@id": `${baseUrl}/${category.slug}/${subcategory.slug}`,
          "name": `${subcategory.seoTitle || subcategory.title} – Fargeleggingsark`,
          "url": `${baseUrl}/${category.slug}/${subcategory.slug}`,
          "inLanguage": "nb-NO",
          ...(subcategoryImageUrl && { 
            "image": subcategoryImageUrl,
            "thumbnailUrl": subcategoryImageUrl
          }),
          "description": subcategory.description || `Fargeleggingsark med ${subcategory.title}-tema for barn.`,
          "isPartOf": {
            "@id": categoryId
          }
        });
      });
    }
    
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": graphItems
    };

    return {
      title: `${title} Fargeleggingsbilder | Fargelegg Nå`,
      description,
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://fargelegg.no'),
      alternates: {
        canonical: `/${categorySlug}`,
      },
      openGraph: {
        title: `${title} Fargeleggingsbilder | Fargelegg Nå`,
        description,
        url: `/${categorySlug}`,
        siteName: 'Fargelegg Nå',
        images: categoryImageUrl ? [{ url: categoryImageUrl }] : [],
        locale: 'nb_NO',
        type: 'website',
      },
      other: {
        'application/ld+json': JSON.stringify(jsonLd),
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Fargeleggingsbilder Kategori',
      description: 'Utforsk våre fargeleggingsbilder kategorier',
    };
  }
}

// Types for better type safety
interface Subcategory {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  icon?: string;
  featuredImage?: { url: string; alt?: string };
  difficulty?: number;
  drawingCount?: number;
  sampleImage?: {
    thumbnailUrl?: string;
    imageUrl?: string;
  };
}

interface Category {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  icon?: string;
  subcategories?: Subcategory[];
}

// Generer statiske paths
export async function generateStaticParams() {
  try {
    const categoriesWithSubs = await getAllCategoriesWithSubcategories();
    return categoriesWithSubs.map((category: Category) => ({
      categorySlug: category.slug
    }));
  } catch (error) {
    console.error('Feil ved generering av kategori-paths:', error);
    return [];
  }
}

// Extract this function outside the component for memoization benefits
function getDifficultyLabel(difficulty: number | undefined) {
  if (!difficulty) return 'Ukjent';
  if (difficulty <= 2) return '🟢 Enkel';
  if (difficulty === 3) return '🟡 Middels';
  if (difficulty >= 4) return '🔴 Vanskelig';
  return 'Ukjent';
}

// Subcategory card component for better code organization
function SubcategoryCard({ subcategory, categorySlug }: { subcategory: Subcategory; categorySlug: string }) {
  return (
    <Link
      key={subcategory._id}
      href={`/${categorySlug}/${subcategory.slug}`}
      className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {(subcategory.featuredImage?.url || subcategory.sampleImage?.thumbnailUrl || subcategory.sampleImage?.imageUrl) && (
        <div className="relative w-full bg-gray-100" style={{ paddingTop: '133.33%' }}>
          <Image 
            src={subcategory.featuredImage?.url || subcategory.sampleImage?.thumbnailUrl || subcategory.sampleImage?.imageUrl || '/placeholder.jpg'}
            alt={subcategory.featuredImage?.alt || subcategory.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZjVmNWY1IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmNWY1ZjUiIC8+PC9zdmc+"
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
  );
}

// Empty state component
function EmptyState() {
  return (
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
  );
}

// Main Category Page Component
export default async function CategoryPage({ params: paramsPromise }: PageProps) {
  const { categorySlug } = await paramsPromise;
  const category = await getCategoryWithSubcategories(categorySlug);
  
  if (!category) {
    notFound();
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <Link 
            href="/" 
            className="text-blue-600 hover:underline mb-4 inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Tilbake til forsiden
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
              <SubcategoryCard 
                key={subcategory._id}
                subcategory={subcategory} 
                categorySlug={categorySlug} 
              />
            ))}
          </div>
          
          {(!category.subcategories || category.subcategories.length === 0) && (
            <EmptyState />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
} 