/**
 * Utility functions for flag filtering and color mapping
 * Handles multilingual color names and filter logic
 */

import type { FlagDrawing, FlagFilterState, FlagSortOption } from '@/types/flags';
import type { Locale } from '@/i18n';

/**
 * Color mapping between Norwegian/Swedish names and normalized English values
 * This ensures consistent filtering across languages
 */
export const COLOR_MAPPING = {
  no: {
    rød: 'red',
    blå: 'blue',
    hvit: 'white',
    svart: 'black',
    grønn: 'green',
    gul: 'yellow',
    oransje: 'orange',
  },
  sv: {
    röd: 'red',
    blå: 'blue',
    vit: 'white',
    svart: 'black',
    grön: 'green',
    gul: 'yellow',
    orange: 'orange',
  },
  de: {
    rot: 'red',
    blau: 'blue',
    weiß: 'white',
    schwarz: 'black',
    grün: 'green',
    gelb: 'yellow',
    orange: 'orange',
  }
} as const;

/**
 * Normalize a color name from locale-specific to English
 */
export function normalizeColor(color: string, locale: Locale): string {
  const lowerColor = color.toLowerCase();
  const mapping = COLOR_MAPPING[locale as 'no' | 'sv' | 'de'];

  if (!mapping) return color;

  return mapping[lowerColor as keyof typeof mapping] || color;
}

/**
 * Get display name for a normalized color in the current locale
 */
export function getColorDisplayName(normalizedColor: string, locale: Locale): string {
  const mapping = COLOR_MAPPING[locale as 'no' | 'sv' | 'de'];

  if (!mapping) return normalizedColor;

  const entry = Object.entries(mapping).find(([_, val]) => val === normalizedColor);
  return entry ? entry[0] : normalizedColor;
}

/**
 * Normalize an array of colors from any locale to English
 */
export function normalizeColors(colors: string[], locale: Locale): string[] {
  return colors.map(color => normalizeColor(color, locale));
}

/**
 * Filter flags based on filter state
 */
export function filterFlags(
  flags: FlagDrawing[],
  filters: FlagFilterState,
  locale: Locale
): FlagDrawing[] {
  return flags.filter(flag => {
    // Search filter - searches in country name and title
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = flag.title?.toLowerCase().includes(searchLower);
      const countryMatch = flag.flagMetadata?.geography?.countryName?.toLowerCase().includes(searchLower);

      if (!titleMatch && !countryMatch) {
        return false;
      }
    }

    // Continent filter - supports multiple continents (comma-separated)
    if (filters.continent && filters.continent !== 'all') {
      const flagContinent = flag.flagMetadata?.geography?.continent;
      if (!flagContinent) {
        return false;
      }

      // Split comma-separated continents
      const selectedContinents = filters.continent.split(',').map(c => c.trim());

      // Check if flag's continent matches any of the selected continents
      if (!selectedContinents.includes(flagContinent)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Extract unique filter options from a collection of flags
 */
export function extractFilterOptions(flags: FlagDrawing[], locale: Locale) {
  const continents = new Set<string>();
  const colors = new Set<string>();
  const regions = new Set<string>();
  const hemispheres = new Set<string>();
  const difficulties = new Set<string>();

  flags.forEach(flag => {
    if (flag.flagMetadata) {
      // Continents
      if (flag.flagMetadata.geography?.continent) {
        continents.add(flag.flagMetadata.geography.continent);
      }

      // Colors (normalized to English for consistency) - check if flagInfo exists
      if (flag.flagMetadata.flagInfo?.flagColors) {
        flag.flagMetadata.flagInfo.flagColors.forEach(color => {
          const normalized = normalizeColor(color, locale);
          colors.add(normalized);
        });
      }

      // Regions
      if (flag.flagMetadata.geography?.subRegion) {
        regions.add(flag.flagMetadata.geography.subRegion);
      }

      // Hemispheres
      if (flag.flagMetadata.locationInfo?.hemisphere) {
        flag.flagMetadata.locationInfo.hemisphere.forEach(h => {
          hemispheres.add(h);
        });
      }
    }

    // Difficulties
    if (flag.difficulty) {
      difficulties.add(flag.difficulty);
    }
  });

  return {
    continents: Array.from(continents).sort(),
    colors: Array.from(colors).sort(),
    regions: Array.from(regions).sort(),
    hemispheres: Array.from(hemispheres).sort(),
    difficulties: Array.from(difficulties).sort(),
  };
}

/**
 * Check if any filters are active
 */
export function hasActiveFilters(filters: FlagFilterState): boolean {
  return !!(
    filters.search ||
    (filters.continent && filters.continent !== 'all') ||
    (filters.colors && filters.colors.length > 0) ||
    (filters.colorCount && filters.colorCount !== 'all') ||
    (filters.difficulty && filters.difficulty !== 'all') ||
    (filters.region && filters.region !== 'all') ||
    (filters.hemisphere && filters.hemisphere.length > 0) ||
    filters.isIsland !== undefined
  );
}

/**
 * Create initial/empty filter state
 */
export function createEmptyFilterState(): FlagFilterState {
  return {
    search: '',
    continent: 'all',
    colors: [],
    colorCount: 'all',
    difficulty: 'all',
    region: 'all',
    hemisphere: [],
    isIsland: undefined,
    sortBy: 'name-asc',
  };
}

/**
 * Sort flags based on the selected sort option
 */
export function sortFlags(
  flags: FlagDrawing[],
  sortBy: FlagSortOption,
  locale: Locale
): FlagDrawing[] {
  const sortedFlags = [...flags];

  switch (sortBy) {
    case 'name-asc':
      // Sort alphabetically by country name
      return sortedFlags.sort((a, b) => {
        const nameA = a.flagMetadata?.geography?.countryName || a.title;
        const nameB = b.flagMetadata?.geography?.countryName || b.title;
        return nameA.localeCompare(nameB, locale === 'sv' ? 'sv' : locale === 'de' ? 'de' : 'no');
      });

    case 'population-desc':
      // Sort by population (highest first), null values at the end
      return sortedFlags.sort((a, b) => {
        const popA = a.flagMetadata?.countryInfo?.population ?? -1;
        const popB = b.flagMetadata?.countryInfo?.population ?? -1;

        // Move flags without population to the end
        if (popA === -1 && popB === -1) return 0;
        if (popA === -1) return 1;
        if (popB === -1) return -1;

        return popB - popA;
      });

    case 'population-asc':
      // Sort by population (lowest first), null values at the end
      return sortedFlags.sort((a, b) => {
        const popA = a.flagMetadata?.countryInfo?.population ?? Number.MAX_SAFE_INTEGER;
        const popB = b.flagMetadata?.countryInfo?.population ?? Number.MAX_SAFE_INTEGER;

        // Move flags without population to the end
        if (popA === Number.MAX_SAFE_INTEGER && popB === Number.MAX_SAFE_INTEGER) return 0;
        if (popA === Number.MAX_SAFE_INTEGER) return 1;
        if (popB === Number.MAX_SAFE_INTEGER) return -1;

        return popA - popB;
      });

    case 'continent-asc':
      // Sort by continent, then by country name within each continent
      return sortedFlags.sort((a, b) => {
        const continentA = a.flagMetadata?.geography?.continent || '';
        const continentB = b.flagMetadata?.geography?.continent || '';

        // First sort by continent
        const continentCompare = continentA.localeCompare(continentB, locale === 'sv' ? 'sv' : locale === 'de' ? 'de' : 'no');

        if (continentCompare !== 0) {
          return continentCompare;
        }

        // If same continent, sort by country name
        const nameA = a.flagMetadata?.geography?.countryName || a.title;
        const nameB = b.flagMetadata?.geography?.countryName || b.title;
        return nameA.localeCompare(nameB, locale === 'sv' ? 'sv' : locale === 'de' ? 'de' : 'no');
      });

    case 'difficulty-asc':
      // Sort by difficulty (easy -> medium -> hard), then by country name
      const difficultyOrder = { easy: 1, medium: 2, hard: 3 };

      return sortedFlags.sort((a, b) => {
        const diffA = difficultyOrder[a.difficulty || 'medium'];
        const diffB = difficultyOrder[b.difficulty || 'medium'];

        // First sort by difficulty
        if (diffA !== diffB) {
          return diffA - diffB;
        }

        // If same difficulty, sort by country name
        const nameA = a.flagMetadata?.geography?.countryName || a.title;
        const nameB = b.flagMetadata?.geography?.countryName || b.title;
        return nameA.localeCompare(nameB, locale === 'sv' ? 'sv' : locale === 'de' ? 'de' : 'no');
      });

    default:
      return sortedFlags;
  }
}
