import React from 'react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { searchDrawings } from '@/lib/sanity';
import { DrawingCard } from '@/components/cards/DrawingCard';
import { Drawing } from '@/types';
import { SVG_BLUR_PLACEHOLDER, WEBP_PLACEHOLDER_PATH } from '@/lib/utils';

interface SearchPageProps {
  searchParams: {
    search?: string;
  };
}

function SearchResults({ drawings }: { drawings: Drawing[] }) {
  return (
    <div>
      <p className="mb-4 text-navy">
        Fant {drawings.length} {drawings.length === 1 ? 'resultat' : 'resultater'}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {drawings.map((drawing) => {
          const drawingSlug = drawing.slug || drawing._id;
          const href = `/${drawing.categorySlug}/${drawing.subcategorySlug}/${drawingSlug}`;
          const lqip = SVG_BLUR_PLACEHOLDER; // Placeholder until LQIP is added to search query

          return (
            <DrawingCard 
              key={drawing._id}
              title={drawing.title}
              href={href}
              imageUrl={drawing.thumbnailUrl || drawing.imageUrl || WEBP_PLACEHOLDER_PATH}
              imageAlt={drawing.imageAlt || drawing.title}
              lqip={lqip}
              difficulty={drawing.difficulty}
            />
          );
        })}
      </div>
    </div>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <section className="no-results text-center py-12" aria-labelledby="no-results-heading">
      <h2 id="no-results-heading" className="sr-only">Ingen resultater funnet</h2>
      <p className="text-lg text-navy mb-4">
        Ingen fargeleggingssider funnet for "{query}".
      </p>
      <p className="text-navy opacity-80">
        Prøv et annet søkeord.
      </p>
    </section>
  );
}

export default async function ColoringPage({ searchParams }: SearchPageProps) {
  const searchQuery = searchParams.search || '';
  const searchResults: Drawing[] = await searchDrawings(searchQuery);

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <Header />
      <main className="flex-grow bg-cream">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-navy font-display">
            {searchQuery 
              ? `Søkeresultater for "${searchQuery}"` 
              : 'Alle fargeleggingssider'}
          </h1>

          {searchResults.length > 0 ? (
            <SearchResults drawings={searchResults} />
          ) : (
            <NoResults query={searchQuery} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
} 