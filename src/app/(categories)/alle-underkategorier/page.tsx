import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getAllSubcategories } from '@/lib/sanity';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { SubcategoryCard } from '@/components/cards/SubcategoryCard';

export const metadata: Metadata = {
  title: 'Alle Fargeleggingskategorier - TegnOgFarge.no',
  description: 'Utforsk alle våre fargeleggingskategorier for barn og voksne. Last ned gratis fargeleggingsark eller bruk vårt online fargeleggingsverktøy.',
  alternates: {
    canonical: 'https://tegnogfarge.no/alle-underkategorier',
  },
};

interface Subcategory {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  difficulty?: number;
  featuredImage?: { 
    url: string; 
    alt?: string;
    lqip?: string;
  };
  drawingCount?: number;
  parentCategory: {
    _id: string;
    title: string;
    slug: string;
  };
}

export default async function AllSubcategoriesPage() {
  const subcategories = await getAllSubcategories();

  return (
    <div className="flex flex-col min-h-screen bg-[#FEFAF6]">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-8xl mx-auto">
            <nav aria-label="Breadcrumb">
              <Link 
                href="/" 
                className="text-[#264653] hover:underline mb-4 inline-flex items-center gap-2"
              >
                Tilbake til forsiden
              </Link>
            </nav>
            
            <header className="mb-8">
              <h1 className="text-3xl font-bold mb-2 flex items-center font-display text-navy">
                Alle Fargeleggingskategorier
              </h1>
              <p className="text-lg text-navy mt-4">
                Utforsk alle våre fargeleggingskategorier for barn og voksne. Velg en kategori for å finne fargeleggingsark.
              </p>
            </header>
            
            <section className="category-listing" aria-labelledby="subcategories-heading">
              <h2 id="subcategories-heading" className="sr-only">Underkategorier</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {subcategories.map((subcategory: Subcategory, index: number) => (
                  <SubcategoryCard 
                    key={subcategory._id}
                    subcategory={subcategory} 
                    categorySlug={subcategory.parentCategory.slug} 
                    isPriority={index < 8} 
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 