'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  _id: string;
  title: string;
  slug: string;
  categorySlug: string;
  subcategorySlug: string;
}

interface SearchFormProps {
  className?: string;
}

export function SearchForm({ className }: SearchFormProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsDropdownVisible(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    if (debouncedSearchQuery.length < 2) {
      setResults([]);
      setIsDropdownVisible(false);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearchQuery)}`, { signal });
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data: SearchResult[] = await response.json();
        setResults(data);
        setIsDropdownVisible(true);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Fetch error:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();

    return () => {
      controller.abort();
    };
  }, [debouncedSearchQuery]);

  const formClasses = className || "";

  return (
    <div className={`relative ${formClasses}`} ref={searchContainerRef}>
      <form onSubmit={handleSearch} role="search">
        <label htmlFor="search-input" className="sr-only">
          Search for coloring pages
        </label>
        <div className="relative">
          <input
            id="search-input"
            type="search"
            placeholder="Søk etter fargeleggingsark..."
            className="w-full py-2 pl-9 pr-4 border-2 border-[#2EC4B6] rounded-md focus:outline-none placeholder:text-[#264653]/70"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsDropdownVisible(results.length > 0)}
            autoComplete="off"
            style={{
              color: '#264653',
              borderColor: '#2EC4B6',
              caretColor: '#264653',
            }}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
      </form>

      {isDropdownVisible && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <li className="px-4 py-2 text-gray-500">Laster...</li>
          ) : results.length > 0 ? (
            results.map((result) => (
              <li key={result._id}>
                <a
                  href={`/${result.categorySlug}/${result.subcategorySlug}/${result.slug}`}
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsDropdownVisible(false)}
                >
                  {result.title}
                </a>
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500">Ingen resultater funnet.</li>
          )}
        </ul>
      )}
    </div>
  );
} 