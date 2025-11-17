'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { Locale } from '@/i18n';
import type { FlagFilterState, FlagFilterOptions } from '@/types/flags';
import { createEmptyFilterState, hasActiveFilters } from '@/lib/flag-utils';
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
  const t = flagsTranslations[locale as 'no' | 'sv'];

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FlagFilterState>(() => {
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
    };
  });

  // Update URL when filters change
  const updateURL = useCallback((newFilters: FlagFilterState) => {
    const params = new URLSearchParams();

    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.continent && newFilters.continent !== 'all') {
      params.set('continent', newFilters.continent);
    }
    if (newFilters.colors.length > 0) {
      params.set('colors', newFilters.colors.join(','));
    }
    if (newFilters.colorCount && newFilters.colorCount !== 'all') {
      params.set('colorCount', newFilters.colorCount);
    }
    if (newFilters.difficulty && newFilters.difficulty !== 'all') {
      params.set('difficulty', newFilters.difficulty);
    }
    if (newFilters.region && newFilters.region !== 'all') {
      params.set('region', newFilters.region);
    }
    if (newFilters.hemisphere.length > 0) {
      params.set('hemisphere', newFilters.hemisphere.join(','));
    }
    if (newFilters.isIsland !== undefined) {
      params.set('isIsland', String(newFilters.isIsland));
    }

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl, { scroll: false });
  }, [pathname, router]);

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof FlagFilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(newFilters);
    onFilterChange?.(newFilters);
  }, [filters, updateURL, onFilterChange]);

  // Handle color toggle (multi-select)
  const toggleColor = useCallback((color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color];

    handleFilterChange('colors', newColors);
  }, [filters.colors, handleFilterChange]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    const emptyFilters = createEmptyFilterState();
    setFilters(emptyFilters);
    updateURL(emptyFilters);
    onFilterChange?.(emptyFilters);
  }, [updateURL, onFilterChange]);

  const showResetButton = hasActiveFilters(filters);

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
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.filters.search.label}
          </label>
          <input
            type="text"
            placeholder={t.filters.search.placeholder}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent outline-none transition"
          />
        </div>

        {/* Continent */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.filters.continent.label}
          </label>
          <select
            value={filters.continent}
            onChange={(e) => handleFilterChange('continent', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent outline-none transition"
          >
            <option value="all">{t.filters.continent.all}</option>
            {filterOptions.continents.map(continent => {
              // Normalize continent name to translation key (handles "North America" -> "northAmerica")
              const normalizedKey = CONTINENT_KEY_MAP[continent.toLowerCase()] || continent.toLowerCase();
              const displayName = t.filters.continent.options[normalizedKey as keyof typeof t.filters.continent.options] || continent;

              return (
                <option key={continent} value={continent}>
                  {displayName}
                </option>
              );
            })}
          </select>
        </div>

        {/* Colors (Multi-select checkboxes) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.filters.colors.label}
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filterOptions.colors.map(color => (
              <label
                key={color}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition"
              >
                <input
                  type="checkbox"
                  checked={filters.colors.includes(color)}
                  onChange={() => toggleColor(color)}
                  className="w-4 h-4 text-[#2EC4B6] border-gray-300 rounded focus:ring-[#2EC4B6]"
                />
                <span className="text-sm capitalize">
                  {t.filters.colors.options[color as keyof typeof t.filters.colors.options] || color}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Color Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.filters.colorCount.label}
          </label>
          <select
            value={filters.colorCount}
            onChange={(e) => handleFilterChange('colorCount', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent outline-none transition"
          >
            <option value="all">{t.filters.colorCount.all}</option>
            <option value="2">{t.filters.colorCount.options["2"]}</option>
            <option value="3">{t.filters.colorCount.options["3"]}</option>
            <option value="4">{t.filters.colorCount.options["4"]}</option>
          </select>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.filters.difficulty.label}
          </label>
          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent outline-none transition"
          >
            <option value="all">{t.filters.difficulty.all}</option>
            <option value="easy">{t.filters.difficulty.options.easy}</option>
            <option value="medium">{t.filters.difficulty.options.medium}</option>
            <option value="hard">{t.filters.difficulty.options.hard}</option>
          </select>
        </div>

        {/* Region (if available) */}
        {filterOptions.regions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.filters.region.label}
            </label>
            <select
              value={filters.region}
              onChange={(e) => handleFilterChange('region', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent outline-none transition"
            >
              <option value="all">{t.filters.region.all}</option>
              {filterOptions.regions.map(region => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
