/**
 * Utility functions for flag filtering and color mapping
 * Handles multilingual color names and filter logic
 */

import type { FlagDrawing, FlagFilterState } from '@/types/flags';
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
  }
} as const;

/**
 * Normalize a color name from locale-specific to English
 */
export function normalizeColor(color: string, locale: Locale): string {
  const lowerColor = color.toLowerCase();
  const mapping = COLOR_MAPPING[locale as 'no' | 'sv'];

  if (!mapping) return color;

  return mapping[lowerColor as keyof typeof mapping] || color;
}

/**
 * Get display name for a normalized color in the current locale
 */
export function getColorDisplayName(normalizedColor: string, locale: Locale): string {
  const mapping = COLOR_MAPPING[locale as 'no' | 'sv'];

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
    // Skip flags without metadata if any metadata-based filters are active
    const hasMetadataFilters =
      filters.continent !== 'all' ||
      filters.colors.length > 0 ||
      filters.colorCount !== 'all' ||
      filters.region !== 'all' ||
      filters.hemisphere.length > 0 ||
      filters.isIsland !== undefined;

    if (hasMetadataFilters && !flag.flagMetadata) {
      return false;
    }

    // Search filter (country name or title)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = flag.title?.toLowerCase().includes(searchLower);
      const countryMatch = flag.flagMetadata?.geography?.countryName?.toLowerCase().includes(searchLower);

      if (!titleMatch && !countryMatch) {
        return false;
      }
    }

    // Continent filter
    if (filters.continent && filters.continent !== 'all') {
      const continent = flag.flagMetadata?.geography?.continent;
      if (!continent || continent !== filters.continent) {
        return false;
      }
    }

    // Color filter (match if flag contains ANY of the selected colors)
    if (filters.colors && filters.colors.length > 0) {
      const flagColors = flag.flagMetadata?.flagInfo.flagColors || [];
      const normalizedFlagColors = normalizeColors(flagColors, locale);
      const normalizedFilterColors = normalizeColors(filters.colors, locale);

      const hasMatchingColor = normalizedFilterColors.some(filterColor =>
        normalizedFlagColors.includes(filterColor)
      );

      if (!hasMatchingColor) {
        return false;
      }
    }

    // Color count filter
    if (filters.colorCount && filters.colorCount !== 'all') {
      const colorCount = flag.flagMetadata?.flagInfo.colorCount || 0;
      const filterCount = parseInt(filters.colorCount);

      if (filterCount === 4) {
        // "4 or more"
        if (colorCount < 4) {
          return false;
        }
      } else {
        if (colorCount !== filterCount) {
          return false;
        }
      }
    }

    // Difficulty filter
    if (filters.difficulty && filters.difficulty !== 'all') {
      if (flag.difficulty !== filters.difficulty) {
        return false;
      }
    }

    // Region filter
    if (filters.region && filters.region !== 'all') {
      const subRegion = flag.flagMetadata?.geography?.subRegion;
      if (!subRegion || subRegion !== filters.region) {
        return false;
      }
    }

    // Hemisphere filter (match if flag is in ANY of the selected hemispheres)
    if (filters.hemisphere && filters.hemisphere.length > 0) {
      const flagHemispheres = flag.flagMetadata?.locationInfo?.hemisphere || [];
      if (flagHemispheres.length === 0) {
        return false;
      }

      const hasMatchingHemisphere = filters.hemisphere.some(filterHemi =>
        flagHemispheres.map(h => h.toLowerCase()).includes(filterHemi.toLowerCase())
      );

      if (!hasMatchingHemisphere) {
        return false;
      }
    }

    // Island filter
    if (filters.isIsland !== undefined) {
      const isIsland = flag.flagMetadata?.locationInfo?.isIsland;
      if (isIsland === undefined || isIsland !== filters.isIsland) {
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
      if (flag.flagMetadata.geography.continent) {
        continents.add(flag.flagMetadata.geography.continent);
      }

      // Colors (normalized to English for consistency)
      if (flag.flagMetadata.flagInfo.flagColors) {
        flag.flagMetadata.flagInfo.flagColors.forEach(color => {
          const normalized = normalizeColor(color, locale);
          colors.add(normalized);
        });
      }

      // Regions
      if (flag.flagMetadata.geography.subRegion) {
        regions.add(flag.flagMetadata.geography.subRegion);
      }

      // Hemispheres
      if (flag.flagMetadata.locationInfo.hemisphere) {
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
  };
}
