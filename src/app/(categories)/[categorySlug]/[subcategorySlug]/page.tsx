import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  getSubcategoryWithDrawings, 
  getAllCategories, 
  getSubcategoriesByCategory, 
  getCategoryWithSubcategories,
  getAllCategoriesWithSubcategories
} from '@/lib/sanity';
import { notFound } from 'next/navigation';
import { DownloadPdfButton } from '@/components/buttons/DownloadPdfButton';
import { StartColoringButton } from '@/components/buttons/StartColoringButton';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

export const revalidate = 3600; // Oppdater siden hver time for bedre caching

// Define interfaces for type safety
interface ParentCategory {
  title: string;
  slug: string;
}

interface Subcategory {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  parentCategory?: ParentCategory;
  difficulty?: string;
  drawings?: Drawing[];
  featuredImage?: {
    url?: string;
    alt?: string;
  };
}

interface Drawing {
  _id: string;
  title: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  hasDigitalColoring?: boolean;
  downloadUrl?: string;
  slug?: string;
  image?: {
    url?: string;
    alt?: string;
  };
}

// Generer metadata
export async function generateMetadata({ params }: { params: { categorySlug: string; subcategorySlug: string } }) {
  const { categorySlug, subcategorySlug } = await Promise.resolve(params);
  const subcategory = await getSubcategoryWithDrawings(categorySlug, subcategorySlug);
  
  if (!subcategory) {
    return { title: 'Underkategori ikke funnet' };
  }

  // Prepare the JSON-LD data for this subcategory
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fargelegg.no';
  const currentUrl = `${baseUrl}/${categorySlug}/${subcategorySlug}`;
  const subcategoryId = currentUrl;
  const categoryId = subcategory.parentCategory 
    ? `${baseUrl}/${subcategory.parentCategory.slug}` 
    : undefined;
  const subcategoryImageUrl = subcategory.featuredImage?.url;
  
  // Create graph items
  const graphItems = [];
  
  // Create hasPart array for the drawings in this subcategory
  const hasPart = subcategory.drawings?.map((drawing: Drawing) => ({
    "@type": "WebPage",
    "@id": `${baseUrl}/${categorySlug}/${subcategorySlug}/${drawing.slug}`
  })) || [];
  
  // Add main subcategory page
  graphItems.push({
    "@type": "CollectionPage",
    "@id": subcategoryId,
    "name": (subcategory.seoTitle || subcategory.title) + " – Fargeleggingsark",
    "description": subcategory.seoDescription || subcategory.description || `Fargeleggingsark med ${subcategory.title.toLowerCase()}-tema for barn.`,
    "url": currentUrl,
    "inLanguage": "nb-NO",
    ...(subcategoryImageUrl && { 
      "image": subcategoryImageUrl,
      "thumbnailUrl": subcategoryImageUrl 
    }),
    ...(subcategory.drawings && subcategory.drawings.length > 0 && {
      "mainEntity": {
        "@type": "ItemList",
        "name": `${subcategory.title} fargeleggingsbilder`,
        "description": `Utforsk alle ${subcategory.title.toLowerCase()} fargeleggingsbilder for barn, inkludert ${subcategory.drawings.map((d: Drawing) => d.title).slice(0, 3).join(', ')}${subcategory.drawings.length > 3 ? ' og flere' : ''}.`,
        "itemListElement": subcategory.drawings.map((drawing: Drawing, index: number) => {
          const drawingImageUrl = drawing.image?.url || drawing.imageUrl;
          return {
            "@type": "ListItem",
            "position": index + 1,
            "name": drawing.seoTitle || drawing.title,
            "url": `${baseUrl}/${categorySlug}/${subcategorySlug}/${drawing.slug}`,
            ...(drawingImageUrl && { 
              "image": drawingImageUrl,
              "thumbnailUrl": drawingImageUrl 
            }),
            "description": drawing.description || `${subcategory.title} fargeleggingsark - ${drawing.title}`
          };
        })
      }
    }),
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
        ...(subcategory.parentCategory ? [
          {
            "@type": "ListItem",
            "position": 2,
            "name": subcategory.parentCategory.title,
            "item": `${baseUrl}/${subcategory.parentCategory.slug}`
          }
        ] : []),
        {
          "@type": "ListItem",
          "position": subcategory.parentCategory ? 3 : 2,
          "name": subcategory.title,
          "item": currentUrl
        }
      ]
    },
    ...(categoryId && {
      "isPartOf": {
        "@id": categoryId
      }
    })
  });
  
  // Add drawing pages if available
  if (subcategory.drawings && subcategory.drawings.length > 0) {
    subcategory.drawings.forEach((drawing: Drawing) => {
      const drawingImageUrl = drawing.image?.url || drawing.imageUrl;
      graphItems.push({
        "@type": "WebPage",
        "@id": `${baseUrl}/${categorySlug}/${subcategorySlug}/${drawing.slug}`,
        "name": `${drawing.seoTitle || drawing.title} – Fargeleggingsark`,
        "url": `${baseUrl}/${categorySlug}/${subcategorySlug}/${drawing.slug}`,
        "inLanguage": "nb-NO",
        ...(drawingImageUrl && { 
          "image": drawingImageUrl,
          "thumbnailUrl": drawingImageUrl 
        }),
        "description": drawing.description || `${subcategory.title} fargeleggingsark - ${drawing.title}`,
        "isPartOf": {
          "@id": subcategoryId
        }
      });
    });
  }
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graphItems
  };

  return {
    title: `${subcategory.seoTitle || subcategory.title} Fargeleggingsbilder | ${subcategory.parentCategory?.title || 'Fargelegg Nå'}`,
    description: subcategory.seoDescription || subcategory.description || `Utforsk ${subcategory.title} tegninger i kategorien ${subcategory.parentCategory?.title}`,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://fargelegg.no'),
    alternates: {
      canonical: `/${categorySlug}/${subcategorySlug}`,
    },
    openGraph: {
      title: `${subcategory.seoTitle || subcategory.title} Fargeleggingsbilder | ${subcategory.parentCategory?.title || 'Fargelegg Nå'}`,
      description: subcategory.seoDescription || subcategory.description || `Utforsk ${subcategory.title} tegninger i kategorien ${subcategory.parentCategory?.title}`,
      url: `/${categorySlug}/${subcategorySlug}`,
      siteName: 'Fargelegg Nå',
      images: subcategoryImageUrl ? [{ url: subcategoryImageUrl }] : [],
      locale: 'nb_NO',
      type: 'website',
    },
    other: {
      'application/ld+json': JSON.stringify(jsonLd),
    },
  };
}

// Generer statiske paths
export async function generateStaticParams() {
  try {
    // Hent alle kategorier med underkategorier i én spørring
    const categoriesWithSubs = await getAllCategoriesWithSubcategories();
    const paths = [];
    
    for (const category of categoriesWithSubs) {
      if (category.subcategories && category.subcategories.length > 0) {
        for (const subcategory of category.subcategories) {
          paths.push({
            categorySlug: category.slug,
            subcategorySlug: subcategory.slug
          });
        }
      }
    }
    
    return paths;
  } catch (error) {
    console.error('Feil ved generering av underkategori-paths:', error);
    return [];
  }
}

// DrawingCard component directly in the page file
interface DrawingCardProps {
  drawing: Drawing;
  asLink?: boolean;
  categorySlug?: string;
  subcategorySlug?: string;
  showButtons?: boolean;
  imageObjectFit?: "cover" | "contain";
}

function DrawingCard({ 
  drawing, 
  asLink = false, 
  categorySlug = "", 
  subcategorySlug = "",
  showButtons = true,
  imageObjectFit = "cover"
}: DrawingCardProps) {
  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  };
  
  const difficultyLabels = {
    easy: "Enkel",
    medium: "Middels",
    hard: "Vanskelig",
  };

  const content = (
    <>
      {/* Image Container */}
      <div className="relative w-full bg-gray-100" style={{ paddingTop: '133.33%' }}> {/* 3:4 ratio (4/3 * 100%) */}
        <Image
          src={drawing.thumbnailUrl || drawing.imageUrl || '/placeholder.jpg'}
          alt={drawing.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className={`transition-opacity duration-300 ${imageObjectFit === "contain" ? "object-contain" : "object-cover"}`}
        />
      </div>
      <div className="p-2">
        <h2 className="font-bold text-sm mb-1">{drawing.title}</h2>
        {drawing.description && <p className="text-gray-600 text-xs mb-2">{drawing.description}</p>}
        <div className="flex items-center justify-between text-xs mb-1">
          {drawing.difficulty && (
            <span className={`px-1.5 py-0.5 rounded text-xs ${difficultyColors[drawing.difficulty]}`}>
              {difficultyLabels[drawing.difficulty]}
            </span>
          )}
          {!drawing.difficulty && (
            <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
              {difficultyLabels.medium}
            </span>
          )}
          {drawing.hasDigitalColoring && showButtons && (
            <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-xs ml-1">Digital</span>
          )}
          {!showButtons && (
            <span className="text-gray-500 text-xs">
              Fargeleggingsside
            </span>
          )}
        </div>
        {showButtons && (
          <div className="flex flex-wrap gap-1">
            {drawing.downloadUrl && (
              <DownloadPdfButton
                downloadUrl={drawing.downloadUrl}
                title="Last ned PDF"
                className="bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 transition text-xs"
              />
            )}
            {drawing.hasDigitalColoring && (
              <StartColoringButton
                drawingId={drawing._id}
                title="Online Fargelegging"
                className="bg-purple-600 text-white px-2 py-1 rounded-md hover:bg-purple-700 transition text-xs"
              />
            )}
          </div>
        )}
      </div>
    </>
  );

  if (asLink && categorySlug && subcategorySlug) {
    const drawingSlug = drawing.slug || drawing._id;
    return (
      <Link
        href={`/${categorySlug}/${subcategorySlug}/${drawingSlug}`}
        className="bg-white border rounded-md overflow-hidden shadow-xs hover:shadow-sm transition-shadow block"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="bg-white border rounded-md overflow-hidden shadow-xs hover:shadow-sm transition-shadow">
      {content}
    </div>
  );
}

export default async function SubcategoryPage({ params }: { params: { categorySlug: string; subcategorySlug: string } }) {
  const { categorySlug, subcategorySlug } = await Promise.resolve(params);
  const subcategory = await getSubcategoryWithDrawings(categorySlug, subcategorySlug);
  
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
  
  const getDifficultyKey = (value: string | undefined): 'easy' | 'medium' | 'hard' => {
    if (value === 'easy' || value === 'medium' || value === 'hard') return value;
    return 'medium';
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <nav className="mb-6 text-sm">
            <Link href="/" className="text-blue-600 hover:underline">
              Forsiden
            </Link>
            <span className="mx-2">/</span>
            <Link 
              href={`/${subcategory.parentCategory?.slug}`}
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
            <div className={`inline-block px-3 py-1 rounded text-xs font-medium ${difficultyColors[getDifficultyKey(subcategory.difficulty)]}`}>
              {difficultyLabels[getDifficultyKey(subcategory.difficulty)]}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {subcategory.drawings?.map((drawing: Drawing) => (
              <DrawingCard 
                key={drawing._id}
                drawing={drawing}
                asLink={true}
                categorySlug={categorySlug}
                subcategorySlug={subcategorySlug}
                showButtons={false}
                imageObjectFit="contain"
              />
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
      </main>
      <Footer />
    </div>
  );
} 