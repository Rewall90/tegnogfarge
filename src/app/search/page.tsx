import React from 'react';
import { searchDrawings } from '@/lib/sanity';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { DrawingCard } from '@/components/cards/DrawingCard';
import { SearchPageTracker } from '@/components/analytics/SearchPageTracker';

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

// Ensure the page is always dynamic
export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: PageProps) {
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  return {
    title: `Søkeresultater for "${query}"`,
    description: `Viser søkeresultater for fargeleggingstegninger relatert til "${query}".`,
    robots: {
      index: false, // Don't index search results pages
      follow: true,
    },
  };
}

interface DrawingSearchResult {
  _id: string;
  title: string;
  slug: string;
  categorySlug: string;
  subcategorySlug: string;
  imageUrl: string;
  imageAlt?: string;
  lqip: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export default async function SearchPage({ searchParams }: PageProps) {
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  const drawings: DrawingSearchResult[] = await searchDrawings(query);

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      {/* Track search analytics */}
      <SearchPageTracker searchQuery={query} resultsCount={drawings.length} />
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-navy mb-2">
            Søkeresultater
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {drawings.length > 0
              ? `Fant ${drawings.length} tegning${drawings.length === 1 ? '' : 'er'} for "${query}"`
              : `Ingen resultater funnet for "${query}"`}
          </p>

          {drawings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {drawings.map((drawing) => (
                <DrawingCard
                  key={drawing._id}
                  title={drawing.title}
                  href={`/${drawing.categorySlug}/${drawing.subcategorySlug}/${drawing.slug}`}
                  imageUrl={drawing.imageUrl}
                  imageAlt={drawing.imageAlt || drawing.title}
                  lqip={drawing.lqip}
                  difficulty={drawing.difficulty}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
} 