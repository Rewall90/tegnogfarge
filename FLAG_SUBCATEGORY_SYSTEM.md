# Flag Subcategory System - Implementation Guide

## Overview

This document describes the custom search and filter system implemented for the flags subcategory. This system is **exclusive to the flags subcategory** and does not affect other subcategories.

## Architecture

The system follows Next.js 14+ App Router best practices using:
- **Server Components** for data fetching
- **Client Components** for interactive filtering
- **URL-based state** (searchParams) for SEO and shareability
- **Multilingual support** for Norwegian and Swedish

## File Structure

```
src/
├── i18n/
│   └── translations/
│       └── flags.ts                    # Norwegian and Swedish translations for all filter UI
│
├── types/
│   └── flags.ts                        # TypeScript interfaces for flag metadata
│
├── lib/
│   ├── sanity.ts                       # Added getSubcategoryWithFlags() query
│   └── flag-utils.ts                   # Color mapping, filtering logic, utilities
│
├── components/
│   └── flags/
│       ├── FlagCard.tsx                # Individual flag card component
│       ├── FlagFilters.tsx             # Filter sidebar (client component)
│       └── FlagGrid.tsx                # Main grid with filter integration
│
└── app/
    └── [locale]/
        └── (categories)/
            └── [categorySlug]/
                └── [subcategorySlug]/
                    └── page.tsx        # Updated to conditionally render FlagGrid
```

## Key Components

### 1. Translation System (`flags.ts`)

Provides all UI text in both Norwegian and Swedish:
- Filter labels and options
- Search placeholders
- Result messages
- Button text

### 2. Type Definitions (`flags.ts` in types)

Comprehensive TypeScript interfaces for:
- `FlagMetadata`: Geography, country info, location, flag characteristics
- `FlagDrawing`: Extended drawing type with flag metadata
- `FlagFilterState`: Current filter selections
- `FlagFilterOptions`: Available filter options

### 3. Utility Functions (`flag-utils.ts`)

**Color Mapping:**
```typescript
normalizeColor(color: string, locale: Locale): string
getColorDisplayName(normalizedColor: string, locale: Locale): string
```
Maps locale-specific color names (rød/röd) to normalized English values (red) for consistent filtering.

**Filtering:**
```typescript
filterFlags(flags, filters, locale): FlagDrawing[]
```
Applies all active filters to the flag collection.

**Helpers:**
```typescript
extractFilterOptions(flags, locale)  // Get unique values for dropdowns
hasActiveFilters(filters)             // Check if any filters are applied
createEmptyFilterState()              // Reset to initial state
```

### 4. Sanity Query (`getSubcategoryWithFlags`)

Extended GROQ query that fetches:
- Standard subcategory data
- All flag drawings with complete `flagMetadata` object
- Supports both Norwegian and Swedish locales

### 5. Components

**FlagCard:**
- Displays flag thumbnail, title, country name
- Shows continent, difficulty, and colors
- Hover effects and responsive design

**FlagFilters:**
- Client component with URL state management
- Multi-select color checkboxes
- Dropdowns for continent, difficulty, color count, region
- Search input for country names
- Reset all filters button

**FlagGrid:**
- Manages filter state and applies filtering
- Displays results count
- Responsive grid layout
- Empty state when no results

## How It Works

### 1. Conditional Rendering

In `page.tsx:276`, the system checks if the current subcategory is the flags subcategory:

```typescript
const isFlagsSubcategory = subcategorySlug === 'flagg' || subcategorySlug === 'flags';
```

If true, it uses `getSubcategoryWithFlags()` instead of `getSubcategoryWithDrawings()` and renders `<FlagGrid>` instead of the standard grid.

### 2. URL-Based Filtering

Filters are stored in URL search params:
```
/flagg?continent=Europa&colors=rød,blå&difficulty=medium
/sv/flagg?continent=Europa&colors=röd,blå&difficulty=medium
```

This approach:
- ✅ Makes filtered views shareable
- ✅ Works with browser back/forward buttons
- ✅ SEO-friendly
- ✅ No client-side state loss on refresh

### 3. Multilingual Color Handling

Colors are stored in Sanity in the document's language (Norwegian: "rød", Swedish: "röd"). The system:

1. Normalizes all colors to English internally (`red`)
2. Displays colors in the current locale to users
3. Filters work consistently across languages

Example:
```typescript
// Norwegian flag with colors: ["rød", "blå", "hvit"]
// Swedish flag with colors: ["röd", "blå", "vit"]
// Both normalize to: ["red", "blue", "white"]
```

### 4. Client-Side Filtering

While the initial data is fetched server-side, filtering happens client-side for instant results:

```typescript
const filteredFlags = useMemo(() => {
  return filterFlags(flags, activeFilters, locale);
}, [flags, activeFilters, locale]);
```

This provides fast, responsive filtering without server round-trips.

## Extending the System

### Adding a New Filter

1. **Update types** (`src/types/flags.ts`):
```typescript
export interface FlagFilterState {
  // ... existing filters
  yourNewFilter: string;
}
```

2. **Update translations** (`src/i18n/translations/flags.ts`):
```typescript
yourNewFilter: {
  label: "Your Filter",
  all: "All",
  options: { ... }
}
```

3. **Update filter logic** (`src/lib/flag-utils.ts`):
```typescript
// Add to filterFlags function
if (filters.yourNewFilter && filters.yourNewFilter !== 'all') {
  // Your filtering logic
}
```

4. **Add UI component** (`src/components/flags/FlagFilters.tsx`):
```typescript
<div>
  <label>{t.filters.yourNewFilter.label}</label>
  <select ...>
```

### Adding More Special Subcategories

To add another subcategory with custom functionality:

1. Update the condition in `page.tsx:276`:
```typescript
const isSpecialSubcategory =
  subcategorySlug === 'flagg' ||
  subcategorySlug === 'your-new-subcategory';
```

2. Create separate components in `src/components/your-category/`
3. Follow the same pattern as flags

## Data Requirements in Sanity

For the flag system to work, each flag drawing in Sanity must have:

```javascript
{
  _type: "drawingImage",
  language: "no" | "sv",
  slug: { current: "mandala-med-blomster-og-albania-flagg" },
  title: "Mandala med blomster og Albania-flagg",

  flagMetadata: {
    geography: {
      continent: "Europe",
      subRegion: "Balkan",
      countryName: "Albania"
    },
    flagInfo: {
      flagColors: ["rød", "svart"],  // In document language
      colorCount: 2,
      flagSymbol: "Dobbeltørn",
      flagPattern: "Simple design"
    },
    locationInfo: {
      borderingCountries: [...],
      coastline: [...],
      isIsland: false,
      hemisphere: ["Northern", "Eastern"]
    },
    // ... other optional metadata
  }
}
```

## Performance Considerations

- **Static Generation**: Pages are generated at build time with revalidation every 3600s
- **Client-Side Filtering**: Fast, no server requests
- **Lazy Loading Images**: Only visible flags load images
- **LQIP**: Low-quality placeholders for smooth loading
- **Memoization**: Filter results are memoized to prevent unnecessary recalculations

## Browser Support

The system uses modern JavaScript features supported in:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## SEO Benefits

- Filter state in URL allows Google to index filtered views
- Server-side rendering for initial page load
- Proper metadata and structured data
- Multilingual support with hreflang tags

## Testing Checklist

- [ ] Norwegian locale displays Norwegian filter labels
- [ ] Swedish locale displays Swedish filter labels
- [ ] Color filtering works in both languages
- [ ] URL updates when filters change
- [ ] Browser back/forward works correctly
- [ ] Filters reset properly
- [ ] Empty state shows when no results
- [ ] Results count updates correctly
- [ ] Mobile responsiveness
- [ ] Accessibility (keyboard navigation, screen readers)

## Troubleshooting

**Filters not working:**
- Check that `flagMetadata` exists in Sanity for those drawings
- Verify color names match expected format
- Check browser console for errors

**Wrong language showing:**
- Verify locale is passed correctly to components
- Check middleware is setting x-locale header
- Ensure Sanity query includes `language == $locale` filter

**URL not updating:**
- Ensure you're using `useRouter()` from `next/navigation`
- Check `router.push()` is called with correct URL

## Future Enhancements

Potential improvements to consider:
- Add map view showing flag locations
- Popular/featured flags section
- Save favorite flags
- Compare multiple flags side-by-side
- Advanced filters (UN membership, independence date ranges)
- Bulk download filtered flags

---

**Created:** 2025-11-17
**Last Updated:** 2025-11-17
**Version:** 1.0.0
