import React from 'react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { searchDrawings } from '@/lib/sanity';
import { DrawingCard } from '@/components/cards/DrawingCard';
import { Drawing } from '@/types';

interface SearchPageProps {
  searchParams: {
    search?: string;
  };
}

export default async function ColoringPage({ searchParams }: SearchPageProps) {
  const searchQuery = searchParams.search || '';
  const searchResults: Drawing[] = await searchDrawings(searchQuery);

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          {searchQuery 
            ? `Søkeresultater for "${searchQuery}"` 
            : 'Alle fargeleggingssider'}
        </h1>

        {searchResults.length > 0 ? (
          <div>
            <p className="mb-4">
              Fant {searchResults.length} {searchResults.length === 1 ? 'resultat' : 'resultater'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {searchResults.map((drawing) => (
                <DrawingCard 
                  key={drawing._id}
                  drawing={drawing}
                  asLink={true}
                  showButtons={false}
                  imageObjectFit="contain"
                />
              ))}
            </div>
          </div>
        ) : (
          <section className="no-results text-center py-12" aria-labelledby="no-results-heading">
            <h2 id="no-results-heading" className="sr-only">Ingen resultater funnet</h2>
            <p className="text-lg text-gray-600 mb-4">
              Ingen fargeleggingssider funnet for "{searchQuery}".
            </p>
            <p className="text-gray-500">
              Prøv et annet søkeord.
            </p>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
} 