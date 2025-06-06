import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllCategories } from '@/lib/sanity';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

export const revalidate = 3600; // Oppdater siden hver time

// Legg til en lokal type for category:
type CategoryType = { 
  _id: string; 
  slug: string; 
  imageUrl?: string; 
  title: string; 
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export async function generateMetadata() {
  const categories = await getAllCategories();
  
  // Prepare the JSON-LD data for categories list
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fargelegg.no';
  const currentUrl = `${baseUrl}/all-categories`;
  const categoriesId = `${baseUrl}/categories`;
  
  // Create hasPart array for the categories list
  const hasPart = categories.map((category: CategoryType) => ({
    "@type": "CollectionPage",
    "@id": `${baseUrl}/${category.slug}`
  }));
  
  // Create an array of graph items
  const graphItems = [];
  
  // Add main categories listing page
  graphItems.push({
    "@type": "CollectionPage",
    "@id": categoriesId,
    "name": "Fargeleggingsbilder Kategorier",
    "description": "Utforsk alle kategorier av fargeleggingsbilder for barn og voksne.",
    "url": currentUrl,
    "inLanguage": "nb-NO",
    "mainEntity": {
      "@type": "ItemList",
      "name": "Kategorier av fargeleggingsbilder",
      "description": `Utforsk populære kategorier av fargeleggingsbilder for barn, inkludert ${categories.slice(0, 3).map((cat: CategoryType) => cat.title).join(', ')}${categories.length > 3 ? ' og flere' : ''}.`,
      "itemListElement": categories.map((category: CategoryType, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": category.seoTitle || category.title,
        "url": `${baseUrl}/${category.slug}`,
        ...(category.imageUrl && { 
          "image": category.imageUrl,
          "thumbnailUrl": category.imageUrl 
        }),
        "description": category.description || `Utforsk våre fargeleggingsark med ${category.title.toLowerCase()}-tema for barn.`
      }))
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
          "name": "Kategorier",
          "item": currentUrl
        }
      ]
    }
  });
  
  // Add category pages
  categories.forEach((category: CategoryType) => {
    graphItems.push({
      "@type": "CollectionPage",
      "@id": `${baseUrl}/${category.slug}`,
      "name": `${category.seoTitle || category.title} – Fargeleggingsark`,
      "url": `${baseUrl}/${category.slug}`,
      "inLanguage": "nb-NO",
      ...(category.imageUrl && { 
        "image": category.imageUrl,
        "thumbnailUrl": category.imageUrl 
      }),
      "description": category.description || `Utforsk våre fargeleggingsark med ${category.title.toLowerCase()}-tema for barn.`,
      "isPartOf": {
        "@id": categoriesId
      }
    });
  });
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graphItems
  };

  return {
    title: 'Fargeleggingsbilder Kategorier | Fargelegg Nå',
    description: 'Utforsk alle våre kategorier av fargeleggingsbilder',
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://fargelegg.no'),
    alternates: {
      canonical: '/all-categories',
    },
    openGraph: {
      title: 'Fargeleggingsbilder Kategorier | Fargelegg Nå',
      description: 'Utforsk alle våre kategorier av fargeleggingsbilder',
      url: '/all-categories',
      siteName: 'Fargelegg Nå',
      locale: 'nb_NO',
      type: 'website',
    },
    other: {
      'application/ld+json': JSON.stringify(jsonLd),
    },
  };
}

async function AllCategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Alle kategorier</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category: CategoryType) => (
              <Link 
                key={category._id} 
                href={`/${category.slug}`}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {category.imageUrl && (
                  <div className="relative h-48 w-full">
                    <Image 
                      src={category.imageUrl}
                      alt={category.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      priority={false}
                    />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="font-bold text-xl mb-2">{category.title}</h2>
                  {category.description && (
                    <p className="text-gray-600 text-sm">{category.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default AllCategoriesPage; 