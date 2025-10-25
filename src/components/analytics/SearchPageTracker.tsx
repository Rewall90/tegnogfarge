'use client';

import { useEffect } from 'react';
import { trackSearch, trackSearchNoResults } from '@/lib/analytics';

interface SearchPageTrackerProps {
  searchQuery: string;
  resultsCount: number;
}

export function SearchPageTracker({ searchQuery, resultsCount }: SearchPageTrackerProps) {
  useEffect(() => {
    // Only track once when component mounts
    if (!searchQuery.trim()) return;

    // Track the search with results count
    trackSearch({
      searchQuery: searchQuery.trim(),
      resultsCount,
    });

    // If no results, also track specifically as "no results"
    if (resultsCount === 0) {
      trackSearchNoResults({
        searchQuery: searchQuery.trim(),
        searchContext: 'search_page',
      });
    }
  }, []); // Empty dependency array - only run once on mount

  return null; // This component doesn't render anything
}
