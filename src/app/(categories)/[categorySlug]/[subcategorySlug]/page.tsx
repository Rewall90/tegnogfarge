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
import { DrawingCard } from '@/components/cards/DrawingCard';
import { WEBP_PLACEHOLDER_PATH, SVG_BLUR_PLACEHOLDER } from '@/lib/utils';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { RelatedSubcategories } from '@/components/category/RelatedSubcategories';

export const revalidate = 3600; // Oppdater siden hver time for bedre caching

// Define interfaces for type safety
interface ParentCategory {
  title: string;
  slug: string;
}

interface Drawing {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  thumbnail: {
    url?: string;
    alt?: string;
    lqip?: string;
  };
  displayImage: {
    url?: string;
    alt?: string;
    lqip?: string;
  };
  difficulty?: 'easy' | 'medium' | 'hard';
  order?: number;
  isActive?: boolean;
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

interface PageProps {
  params: Promise<{
    categorySlug: string;
    subcategorySlug: string;
  }>;
}

// Generer metadata
export async function generateMetadata({ params: paramsPromise }: PageProps) {
  const { categorySlug, subcategorySlug } = await paramsPromise;
  const subcategory = await getSubcategoryWithDrawings(categorySlug, subcategorySlug);
  
  if (!subcategory) {
    return { title: 'Underkategori ikke funnet' };
  }

  // Prepare the JSON-LD data for this subcategory
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tegnogfarge.no';
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
          const drawingImageUrl = drawing.displayImage?.url || drawing.thumbnail?.url;
          return {
            "@type": "ListItem",
            "position": index + 1,
            "name": drawing.seoTitle || drawing.title,
            "url": `${baseUrl}/${categorySlug}/${subcategorySlug}/${drawing.slug}`,
            ...(drawingImageUrl && { 
              "image": {
                "@type": "ImageObject",
                "url": drawingImageUrl,
                "caption": drawing.displayImage?.alt || drawing.thumbnail?.alt || drawing.title,
                "description": drawing.description || `${subcategory.title} fargeleggingsark - ${drawing.title}`
              },
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
      const drawingImageUrl = drawing.displayImage?.url || drawing.thumbnail?.url;
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
    title: subcategory.seoTitle || `${subcategory.title} Fargeleggingsbilder | ${subcategory.parentCategory?.title || 'Fargelegg Nå'}`,
    description: subcategory.seoDescription || subcategory.description || `Utforsk ${subcategory.title} tegninger i kategorien ${subcategory.parentCategory?.title}`,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${categorySlug}/${subcategorySlug}`,
    },
    openGraph: {
      title: subcategory.seoTitle || `${subcategory.title} Fargeleggingsbilder | ${subcategory.parentCategory?.title || 'Fargelegg Nå'}`,
      description: subcategory.seoDescription || subcategory.description || `Utforsk ${subcategory.title} tegninger i kategorien ${subcategory.parentCategory?.title}`,
      url: `${baseUrl}/${categorySlug}/${subcategorySlug}`,
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

// Main Subcategory Page Component
export default async function SubcategoryPage({ params: paramsPromise }: PageProps) {
  const { categorySlug, subcategorySlug } = await paramsPromise;
  const subcategory = await getSubcategoryWithDrawings(categorySlug, subcategorySlug);
  
  if (!subcategory || !subcategory.drawings) {
    notFound();
  }
  
  const sortedDrawings = subcategory.drawings.sort((a: Drawing, b: Drawing) => (a.order ?? Infinity) - (b.order ?? Infinity));

  const breadcrumbItems = [
    { label: 'Hjem', href: '/' },
    ...(subcategory.parentCategory ? [{ label: subcategory.parentCategory.title, href: `/${subcategory.parentCategory.slug}` }] : []),
    { label: subcategory.title, href: `/${categorySlug}/${subcategorySlug}`, active: true }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FEFAF6]">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-full mx-auto">
            <Breadcrumbs items={breadcrumbItems} />
            
            <header className="mb-8">
              <h1 id="subcategory-title" className="text-3xl font-bold mb-2 flex items-center font-display text-navy">
                {subcategory.title}
              </h1>
            </header>
            
            <p className="w-full text-lg text-gray-600 mb-8">{subcategory.description}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sortedDrawings.map((drawing: Drawing) => (
                <DrawingCard 
                  key={drawing._id} 
                  title={drawing.title}
                  imageUrl={drawing.thumbnail?.url || WEBP_PLACEHOLDER_PATH}
                  imageAlt={drawing.thumbnail?.alt || 'Tegning'}
                  lqip={drawing.thumbnail?.lqip || SVG_BLUR_PLACEHOLDER}
                  href={`/${categorySlug}/${subcategorySlug}/${drawing.slug}`}
                  difficulty={drawing.difficulty}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
      
      {subcategory.parentCategory && (
        <RelatedSubcategories
          categorySlug={categorySlug}
          currentSubcategorySlug={subcategorySlug}
          categoryTitle={subcategory.parentCategory.title}
        />
      )}

      <Footer />
    </div>
  );
} 