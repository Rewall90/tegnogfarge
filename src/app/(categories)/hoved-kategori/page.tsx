import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getAllCategories } from '@/lib/sanity';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { ColoringCategories } from '@/components/frontpage/ColoringCategories';
import CategoriesListJsonLd from '@/components/json-ld/CategoriesListJsonLd';

export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: 'Alle Kategorier - TegnOgFarge.no',
  description: 'Utforsk alle våre fargeleggingskategorier for barn og voksne. Velg en kategori for å finne fargeleggingsark.',
  alternates: {
    canonical: 'https://www.tegnogfarge.no/hoved-kategori',
  },
};

interface Category {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  featured?: boolean;
  order?: number;
  image?: {
    url: string;
    alt: string;
  };
}

export default async function MainCategoryPage() {
  const categories = await getAllCategories();
  
  // Filter active categories and sort them by featured status and order
  const activeCategories = categories
    .filter((cat: Category) => cat.isActive)
    .sort((a: Category, b: Category) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      if ((a.order ?? 0) !== (b.order ?? 0)) return (a.order ?? 0) - (b.order ?? 0);
      return a.title.localeCompare(b.title);
    });

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
              <h1 className="text-3xl font-bold mb-2 flex items-center font-display text-navy">
                Alle Kategorier
              </h1>
              <p className="text-lg text-navy mt-4">
                Utforsk alle våre fargeleggingskategorier for barn og voksne. Velg en kategori for å finne fargeleggingsark.
              </p>
            </header>
            
            <ColoringCategories
              categories={activeCategories.map((cat: Category) => ({
                name: cat.title,
                imageUrl: cat.image?.url || cat.imageUrl || '/images/placeholder.svg',
                slug: cat.slug,
              }))}
            />
          </div>
        </div>
      </main>
      <Footer />
      <CategoriesListJsonLd categories={activeCategories} pathname="/hoved-kategori" />
    </div>
  );
} 