'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { Locale } from '@/i18n';
import type { FlagFilterState, FlagFilterOptions } from '@/types/flags';
import { createEmptyFilterState } from '@/lib/flag-utils';
import { flagsTranslations } from '@/i18n/translations/flags';

// Map continent names from Sanity to translation keys
const CONTINENT_KEY_MAP: Record<string, string> = {
  'europe': 'europe',
  'asia': 'asia',
  'africa': 'africa',
  'north america': 'northAmerica',
  'south america': 'southAmerica',
  'oceania': 'oceania',
  'antarctica': 'antarctica',
};

interface FlagFiltersProps {
  locale: Locale;
  filterOptions: FlagFilterOptions;
  onFilterChange?: (filters: FlagFilterState) => void;
}

export function FlagFilters({
  locale,
  filterOptions,
  onFilterChange
}: FlagFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = flagsTranslations[locale as 'no' | 'sv' | 'de'];

  // Initialize filters from URL params
  const [selectedContinents, setSelectedContinents] = useState<string[]>(() => {
    const continent = searchParams.get('continent');
    return continent && continent !== 'all' ? continent.split(',') : [];
  });

  const [searchQuery, setSearchQuery] = useState<string>(() => {
    return searchParams.get('search') || '';
  });

  // Update URL when filters change
  const updateURL = useCallback((continents: string[], search: string) => {
    const params = new URLSearchParams();

    if (continents.length > 0) {
      params.set('continent', continents.join(','));
    }
    if (search) {
      params.set('search', search);
    }

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl, { scroll: false });
  }, [pathname, router]);

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    updateURL(selectedContinents, value);

    // Create filter state for the callback
    const emptyFilters = createEmptyFilterState();
    const filterState: FlagFilterState = {
      ...emptyFilters,
      continent: selectedContinents.length > 0 ? selectedContinents.join(',') : 'all',
      search: value
    };
    onFilterChange?.(filterState);
  }, [selectedContinents, updateURL, onFilterChange]);

  // Handle continent checkbox toggle
  const toggleContinent = useCallback((continent: string) => {
    const newContinents = selectedContinents.includes(continent)
      ? selectedContinents.filter(c => c !== continent)
      : [...selectedContinents, continent];

    setSelectedContinents(newContinents);
    updateURL(newContinents, searchQuery);

    // Create filter state for the callback
    const emptyFilters = createEmptyFilterState();
    const filterState: FlagFilterState = {
      ...emptyFilters,
      continent: newContinents.length > 0 ? newContinents.join(',') : 'all',
      search: searchQuery
    };
    onFilterChange?.(filterState);
  }, [selectedContinents, searchQuery, updateURL, onFilterChange]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSelectedContinents([]);
    setSearchQuery('');
    updateURL([], '');
    onFilterChange?.(createEmptyFilterState());
  }, [updateURL, onFilterChange]);

  const showResetButton = selectedContinents.length > 0 || searchQuery.length > 0;

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-xl text-navy">
          {t.filters.title}
        </h2>
        {showResetButton && (
          <button
            onClick={resetFilters}
            className="text-sm text-[#2EC4B6] hover:text-[#26a89c] font-medium"
          >
            {t.filters.resetAll}
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.filters.search.label}
          </label>
          <input
            type="text"
            placeholder={t.filters.search.placeholder}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent outline-none"
          />
        </div>

        {/* Continent Checkboxes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t.filters.continent.label}
          </label>
          <div className="space-y-3">
            {filterOptions.continents.map(continent => {
              // Normalize continent name to translation key
              const normalizedKey = CONTINENT_KEY_MAP[continent.toLowerCase()] || continent.toLowerCase();
              const displayName = t.filters.continent.options[normalizedKey as keyof typeof t.filters.continent.options] || continent;

              return (
                <label
                  key={continent}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedContinents.includes(continent)}
                    onChange={() => toggleContinent(continent)}
                    className="w-4 h-4 text-[#2EC4B6] border-gray-300 rounded focus:ring-[#2EC4B6]"
                  />
                  <span className="text-sm text-gray-700">
                    {displayName}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active filter count */}
      {(selectedContinents.length > 0 || searchQuery) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-1">
            {searchQuery && (
              <p className="text-xs text-gray-500">
                {locale === 'de' ? 'Suche nach' : locale === 'sv' ? 'Söker efter' : 'Søker etter'}: &quot;{searchQuery}&quot;
              </p>
            )}
            {selectedContinents.length > 0 && (
              <p className="text-xs text-gray-500">
                {selectedContinents.length} {locale === 'de'
                  ? (selectedContinents.length === 1 ? 'Kontinent ausgewählt' : 'Kontinente ausgewählt')
                  : locale === 'sv'
                    ? (selectedContinents.length === 1 ? 'kontinent vald' : 'kontinenter valda')
                    : (selectedContinents.length === 1 ? 'kontinent valgt' : 'kontinenter valgt')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
