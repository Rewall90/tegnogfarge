import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { client, getImagesInCategory } from '../../../lib/sanity';
import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';
import PageLayout from '../../../../components/shared/PageLayout';
import { BreadcrumbItem } from '../../../../components/shared/Breadcrumbs';
import RelatedCategoriesSection from '../../../../components/ui/RelatedCategoriesSection';
import ShareButtons from '../../../../components/ui/ShareButtons';
import { getCategoryBySlug, getRelatedCategories, getCategoryPages, categories, Category } from '../../../data/categoriesData';

export const revalidate = 3600; // Oppdater siden hver time

// Generate metadata for each category page
export async function generateMetadata(
  { params }: CategoryPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = params;
  const category = getCategoryBySlug(slug);
  
  // Return 404 metadata if category doesn't exist
  if (!category) {
    return {
      title: 'Kategori ikke funnet',
      description: 'Beklager, denne kategorien eksisterer ikke'
    };
  }

  // Generate appropriate metadata based on the category
  return {
    title: `${category.name} Fargeleggingsbilder | Fargelegg Nå`,
    description: `Utforsk vår samling av ${category.name.toLowerCase()} fargeleggingsbilder. Velg blant ${category.count} tegninger for alle aldersgrupper og ferdighetsnivåer.`,
    keywords: [`${category.name.toLowerCase()}`, 'fargelegging', 'tegninger', 'kreativitet', 'hobby'],
    openGraph: {
      title: `${category.name} Fargeleggingsbilder | Fargelegg Nå`,
      description: `Utforsk vår samling av ${category.name.toLowerCase()} fargeleggingsbilder. Velg blant ${category.count} tegninger for alle aldersgrupper og ferdighetsnivåer.`,
      url: `categories/${slug}`,
      siteName: 'Fargelegg Nå',
      images: [
        {
          url: category.imageUrl,
          width: 1200,
          height: 630,
          alt: `${category.name} fargeleggingsbilder`
        }
      ],
      locale: 'nb_NO',
      type: 'website',
    }
  };
}

// Generere statiske sider for alle kategorier
export async function generateStaticParams() {
  const categories = await client.fetch(`*[_type == "category"] { "slug": slug.current }`);
  return categories.map((category: any) => ({
    slug: category.slug
  }));
}

interface CategoryPageProps {
  params: { slug: string }
}

async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;
  
  // Hent kategoriinformasjon
  const category = await client.fetch(`
    *[_type == "category" && slug.current == $slug][0] {
      _id,
      title,
      description,
      "imageUrl": image.asset->url
    }
  `, { slug });
  
  if (!category) {
    notFound();
  }
  
  // Hent bilder for denne kategorien
  const images = await getImagesInCategory(category._id, 1, 30);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Link 
        href="/categories" 
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        &larr; Tilbake til alle kategorier
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{category.title}</h1>
        {category.description && (
          <p className="text-gray-600 mt-2">{category.description}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image: any) => (
          <div 
            key={image._id}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {image.imageUrl && (
              <div className="relative h-48 w-full">
                <Image 
                  src={image.imageUrl}
                  alt={image.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h2 className="font-bold text-lg mb-2">{image.title}</h2>
              {image.description && (
                <p className="text-gray-600 text-sm mb-4">{image.description}</p>
              )}
              <div className="flex space-x-3">
                <a 
                  href={image.downloadUrl}
                  download
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Last ned PDF
                </a>
                {image.canColorOnline && (
                  <Link
                    href={`/coloring/${image._id}`}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
                  >
                    Fargelegg nå
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {images.length === 0 && (
        <p className="text-center text-gray-500 my-10">
          Ingen bilder funnet i denne kategorien ennå.
        </p>
      )}
    </div>
  );
}

export default CategoryPage; 