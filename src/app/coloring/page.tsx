'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { client } from '@/lib/sanity';

interface ColoringImage {
  _id: string;
  title: string;
  imageUrl: string;
}

export default function ColoringPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const [searchResults, setSearchResults] = useState<ColoringImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSearchResults() {
      if (!searchQuery) return;
      
      setIsLoading(true);
      try {
        // Search query using Sanity GROQ
        const results = await client.fetch(`
          *[_type == "drawingImage" && 
            (title match $searchQuery || 
             description match $searchQuery ||
             $searchQuery in tags) && 
            isActive == true] {
            _id,
            title,
            "imageUrl": coalesce(mainImage.asset->url, image.asset->url),
            "slug": slug.current
          } | order(title asc)[0...20]
        `, { searchQuery: `*${searchQuery}*` });
        
        setSearchResults(results);
      } catch (err) {
        console.error('Error searching for coloring pages:', err);
        setError('Det oppstod en feil under søk etter fargeleggingssider.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSearchResults();
  }, [searchQuery]);

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          {searchQuery 
            ? `Søkeresultater for "${searchQuery}"` 
            : 'Alle fargeleggingssider'}
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        ) : (
          <div>
            {searchQuery && (
              <p className="mb-4">
                Fant {searchResults.length} {searchResults.length === 1 ? 'resultat' : 'resultater'}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {searchResults.map((image) => (
                <div key={image._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Link href={`/coloring/${image._id}`}>
                    <div className="aspect-w-4 aspect-h-3">
                      <img 
                        src={image.imageUrl} 
                        alt={image.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h2 className="text-lg font-semibold text-gray-800 mb-1">{image.title}</h2>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {searchResults.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600 mb-4">
                  Ingen fargeleggingssider funnet for "{searchQuery}".
                </p>
                <p className="text-gray-500">
                  Prøv et annet søkeord eller se våre populære kategorier nedenfor.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
} 