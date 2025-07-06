import React from 'react';
import Link from 'next/link';
import { getCategoryWithSubcategories, getAllCategoriesWithSubcategories } from '@/lib/sanity';
import { notFound } from 'next/navigation';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { CategoryGrid, EmptyState } from '@/components/category/CategoryGrid';
import { urlFor } from '@/lib/sanity';

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
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tegnogfarge.no';
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
        "image": {
          "@type": "ImageObject",
          "url": categoryImageUrl,
          "caption": `${category.title} fargeleggingsark`
        },
        "thumbnailUrl": categoryImageUrl 
      }),
      "potentialAction": {
        "@type": "ViewAction",
        "target": currentUrl,
        "name": `Utforsk ${category.title} fargeleggingsark`
      },
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
              "image": {
                "@type": "ImageObject",
                "url": subcategoryImageUrl,
                "caption": `${subcategory.title} fargeleggingsark`
              },
              "thumbnailUrl": subcategoryImageUrl
            }),
            "description": subcategory.description || `Fargeleggingsark med ${subcategory.title}-tema for barn.`,
            "potentialAction": {
              "@type": "ViewAction",
              "target": `${baseUrl}/${category.slug}/${subcategory.slug}`,
              "name": `Utforsk ${subcategory.title} fargeleggingsark`
            }
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
            "image": {
              "@type": "ImageObject",
              "url": subcategoryImageUrl,
              "caption": `${subcategory.title} fargeleggingsark`
            },
            "thumbnailUrl": subcategoryImageUrl
          }),
          "description": subcategory.description || `Fargeleggingsark med ${subcategory.title}-tema for barn.`,
          "isPartOf": {
            "@id": categoryId
          },
          "potentialAction": [
            {
              "@type": "ViewAction",
              "target": `${baseUrl}/${category.slug}/${subcategory.slug}`,
              "name": `Se ${subcategory.title} fargeleggingsark`
            },
            {
              "@type": "DownloadAction",
              "target": `${baseUrl}/${category.slug}/${subcategory.slug}?download=true`,
              "name": `Last ned ${subcategory.title} fargeleggingsark`
            }
          ]
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
      metadataBase: new URL(baseUrl),
      alternates: {
        canonical: `${baseUrl}/${categorySlug}`,
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
  featuredImage?: { 
    url: string; 
    alt?: string;
  };
  difficulty?: number;
  drawingCount?: number;
  sampleImage?: {
    thumbnailUrl?: string;
    thumbnailAlt?: string;
    imageUrl?: string;
    imageAlt?: string;
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
  image?: {
    url?: string;
  };
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

// Server Component
export default async function CategoryPage({ params: paramsPromise }: PageProps) {
  const { categorySlug } = await paramsPromise;
  const category = await getCategoryWithSubcategories(categorySlug);
  
  if (!category) {
    notFound();
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-[#FEFAF6]">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-8xl mx-auto">
            <nav aria-label="Breadcrumb">
              <Link 
                href="/" 
                className="text-[#FF6F59] hover:underline mb-4 inline-flex items-center gap-2"
              >
                Tilbake til forsiden
              </Link>
            </nav>
            
            <header className="mb-8">
              <h1 id="category-title" className="text-3xl font-bold mb-2 flex items-center font-display text-navy">
                {category.icon && <img src={urlFor(category.icon).width(30).height(30).url()} alt={`${category.title} icon`} className="mr-3"/>}
                {category.title}
              </h1>
              {category.description && (
                <p className="text-lg text-navy mt-4">{category.description}</p>
              )}
            </header>
            
            {category.subcategories && category.subcategories.length > 0 ? (
              <section className="category-listing" aria-labelledby="subcategories-heading">
                <h2 id="subcategories-heading" className="sr-only">Underkategorier</h2>
                <CategoryGrid 
                  subcategories={category.subcategories}
                  categorySlug={categorySlug}
                />
              </section>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Add data fetching to separate the concerns
export async function getCategory({ params }: { params: { categorySlug: string } }) {
  const { categorySlug } = params;
  const category = await getCategoryWithSubcategories(categorySlug);
  return { category, categorySlug };
} 