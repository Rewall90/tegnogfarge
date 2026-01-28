'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { FlagCard } from './FlagCard';
import { FlagFilters } from './FlagFilters';
import { FlagSortMenu } from './FlagSortMenu';
import type { FlagDrawing, FlagFilterState, FlagSortOption } from '@/types/flags';
import type { Locale } from '@/i18n';
import { filterFlags, sortFlags, extractFilterOptions, createEmptyFilterState } from '@/lib/flag-utils';
import { flagsTranslations } from '@/i18n/translations/flags';

interface FlagGridProps {
  flags: FlagDrawing[];
  categorySlug: string;
  subcategorySlug: string;
  locale: Locale;
}

export function FlagGrid({
  flags,
  categorySlug,
  subcategorySlug,
  locale
}: FlagGridProps) {
  const t = flagsTranslations[locale as 'no' | 'sv' | 'de'];
  const searchParams = useSearchParams();

  // Initialize filters from URL params on mount
  const [activeFilters, setActiveFilters] = useState<FlagFilterState>(() => {
    const colors = searchParams.get('colors')?.split(',').filter(Boolean) || [];
    const hemisphere = searchParams.get('hemisphere')?.split(',').filter(Boolean) || [];

    return {
      search: searchParams.get('search') || '',
      continent: searchParams.get('continent') || 'all',
      colors,
      colorCount: searchParams.get('colorCount') || 'all',
      difficulty: searchParams.get('difficulty') || 'all',
      region: searchParams.get('region') || 'all',
      hemisphere,
      isIsland: searchParams.get('isIsland') === 'true' ? true : undefined,
      sortBy: (searchParams.get('sort') as FlagSortOption) || 'name-asc',
    };
  });

  // Extract available filter options from the flags
  const filterOptions = useMemo(() => {
    return extractFilterOptions(flags, locale);
  }, [flags, locale]);

  // Apply filters and sorting to get final flag list
  const filteredAndSortedFlags = useMemo(() => {
    const filtered = filterFlags(flags, activeFilters, locale);
    return sortFlags(filtered, activeFilters.sortBy, locale);
  }, [flags, activeFilters, locale]);

  // Generate href for each flag based on locale
  const getFlagHref = (flagSlug: string) => {
    return locale === 'no'
      ? `/${categorySlug}/${subcategorySlug}/${flagSlug}`
      : `/${locale}/${categorySlug}/${subcategorySlug}/${flagSlug}`;
  };

  // Handle sort change
  const handleSortChange = (sortBy: FlagSortOption) => {
    setActiveFilters(prev => ({ ...prev, sortBy }));
  };

  // Replace {{count}} and {{total}} in translation strings
  const getResultsText = () => {
    const hasFilters = Object.entries(activeFilters).some(([key, value]) => {
      if (key === 'sortBy') return false; // Exclude sortBy from filter check
      return Array.isArray(value) ? value.length > 0 : value && value !== 'all';
    });

    if (hasFilters) {
      return t.results.showingFiltered
        .replace('{{count}}', String(filteredAndSortedFlags.length))
        .replace('{{total}}', String(flags.length));
    }

    return t.results.showing.replace('{{count}}', String(filteredAndSortedFlags.length));
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar with filters */}
      <aside className="md:w-1/4 flex-shrink-0">
        <FlagFilters
          locale={locale}
          filterOptions={filterOptions}
          onFilterChange={setActiveFilters}
        />
      </aside>

      {/* Main content area */}
      <div className="flex-grow md:w-3/4">
        {/* Results header with count and sort menu */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 text-sm">
            {getResultsText()}
          </p>
          <FlagSortMenu
            currentSort={activeFilters.sortBy}
            onSortChange={handleSortChange}
            locale={locale}
          />
        </div>

        {/* Grid of flags */}
        {filteredAndSortedFlags.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedFlags.map((flag, index) => (
              <FlagCard
                key={flag._id}
                flag={flag}
                href={getFlagHref(flag.slug)}
                locale={locale}
                isPriority={index < 6}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t.results.noResults}
              </h3>
              <p className="text-sm text-gray-500">
                {t.results.tryDifferent}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
