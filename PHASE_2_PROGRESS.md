# Phase 2 Implementation Progress

## ✅ Completed Steps

### Step 1: Create i18n Configuration ✅
- **File:** `src/i18n.ts`
- **Status:** Complete
- **Changes:**
  - Defined locales: ['no', 'sv']
  - Set default locale: 'no'
  - Added helper functions for validation

### Step 2: Create Middleware ✅
- **File:** `src/middleware.ts`
- **Status:** Complete
- **Changes:**
  - Added locale routing logic
  - Redirects `/` → `/no`
  - Redirects `/path` → `/no/path`
  - Preserves existing auth, redirects, copyright logic
  - Excludes dashboard, login, register, studio from locale

### Step 3: Create [locale] Directory Structure ✅
- **Status:** Complete
- **Changes:**
  - Created `src/app/[locale]/` directory
  - Moved `(categories)/`, `(info)/`, `blog/`, `page.tsx` into `[locale]/`
  - Kept `(admin)/`, `api/`, root `layout.tsx` outside

### Step 4: Create Locale Layout ✅
- **File:** `src/app/[locale]/layout.tsx`
- **Status:** Complete
- **Changes:**
  - Created layout that validates locale
  - Generates static params for 'no' and 'sv'
  - Returns 404 for invalid locales

---

## 🔄 In Progress

### Step 5: Update Page Components with Locale Param

#### ✅ Completed Files

**Homepage:**
- **File:** `src/app/[locale]/page.tsx`
- **Changes:**
  - ✅ Added `params: { locale }` to generateMetadata
  - ✅ Added `params: { locale }` to Home function
  - ✅ Pass locale to `getAllCategories(locale)`
  - ✅ Pass locale to `getPopularSubcategories(12, locale)`
  - ✅ Updated contact link: `/kontakt` → `/${locale}/kontakt`

#### ⏳ Files Still Needing Updates

**Category Pages:**
1. `src/app/[locale]/(categories)/[categorySlug]/page.tsx`
   - Add `locale` to params type
   - Pass locale to Sanity queries
   - Update generateMetadata
   - Update all internal links

2. `src/app/[locale]/(categories)/[categorySlug]/[subcategorySlug]/page.tsx`
   - Add `locale` to params type
   - Pass locale to Sanity queries
   - Update generateMetadata
   - Update all internal links

3. `src/app/[locale]/(categories)/[categorySlug]/[subcategorySlug]/[drawingSlug]/page.tsx`
   - Add `locale` to params type
   - Pass locale to Sanity queries
   - Update generateMetadata
   - Update all internal links

**Info Pages:**
4. `src/app/[locale]/(info)/kontakt/page.tsx`
5. `src/app/[locale]/(info)/om-oss/page.tsx`
6. `src/app/[locale]/(info)/personvernerklaering/page.tsx`
7. `src/app/[locale]/(info)/vilkar-og-betingelser/page.tsx`
8. `src/app/[locale]/(info)/lisensieringspolicy/page.tsx`
9. `src/app/[locale]/(info)/om-skribenten/page.tsx`
10. `src/app/[locale]/(info)/fjerning-av-innhold/page.tsx`
11. `src/app/[locale]/(categories)/alle-underkategorier/page.tsx`
12. `src/app/[locale]/(categories)/hoved-kategori/page.tsx`

**Blog Pages:**
13. `src/app/[locale]/blog/page.tsx`
14. `src/app/[locale]/blog/[slug]/page.tsx`

---

## ⏳ Remaining Steps

### Step 6: Update GROQ Queries to Filter by Language

**Files to Update:**
- `src/lib/sanity.ts` - Main Sanity client and query functions

**Required Changes:**
```typescript
// Before:
*[_type == "drawingImage" && slug.current == $slug][0]

// After:
*[_type == "drawingImage" && slug.current == $slug && language == $language][0]
```

**Functions to Update:**
- `getAllCategories()` → `getAllCategories(language: string)`
- `getPopularSubcategories()` → `getPopularSubcategories(limit: number, language: string)`
- `getCategoryBySlug()` → `getCategoryBySlug(slug: string, language: string)`
- `getSubcategoryBySlug()` → `getSubcategoryBySlug(catSlug: string, subSlug: string, language: string)`
- `getDrawingBySlug()` → `getDrawingBySlug(catSlug: string, subSlug: string, drawingSlug: string, language: string)`
- All other query functions

### Step 7: Update Internal Links

**Components to Update:**
- `src/components/shared/Header.tsx`
- `src/components/shared/Footer.tsx`
- `src/components/frontpage/ColoringCategories.tsx`
- `src/components/category/SubcategoryHighlights.tsx`
- `src/components/category/DrawingCard.tsx`
- Any other components with `<Link>` elements

**Change Pattern:**
```typescript
// Before:
<Link href="/jul/farglegg-nisse">

// After:
<Link href={`/${locale}/jul/farglegg-nisse`}>
```

**Alternative (next-intl):**
Create `src/navigation.ts`:
```typescript
import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { locales } from './i18n';

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales });
```

Then import from there:
```typescript
import { Link } from '@/navigation';
// Link automatically prefixes with locale
```

### Step 8: Update Metadata Generation

**Pattern for All Pages:**
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, ...otherParams } = params;

  // Fetch data with locale
  const data = await getData(otherParams, locale);

  return {
    title: data.title,
    description: data.description,
    alternates: {
      canonical: `https://tegnogfarge.no/${locale}/path`,
      languages: {
        'no': `https://tegnogfarge.no/no/path`,
        'sv': `https://tegnogfarge.no/sv/path`,
      },
    },
  };
}
```

### Step 9: Test Routing

**Test Cases:**
1. ✅ `/` redirects to `/no`
2. ⏳ `/no` loads Norwegian homepage
3. ⏳ `/sv` loads Swedish homepage (or 404 if no content)
4. ⏳ `/no/jul/farglegg-nisse` loads Norwegian drawing
5. ⏳ `/sv/jul/farglaegg-tomte` loads Swedish drawing (when translations exist)
6. ⏳ `/dashboard` works without locale
7. ⏳ Build completes: `npm run build`
8. ⏳ No TypeScript errors: `npm run type-check`

---

## Decision Point

We're at ~30% completion of Phase 2. We have:
- ✅ Infrastructure complete (config, middleware, directory structure)
- ✅ Homepage partially updated
- ⏳ 13+ page files still need updating
- ⏳ Sanity query functions need updating
- ⏳ Component links need updating

**Options:**

### Option A: Continue Full Implementation
- Complete all page updates now
- Update all Sanity queries
- Update all component links
- **Time:** 3-4 more hours
- **Pro:** Phase 2 fully done in one session
- **Con:** Long, tedious work

### Option B: Break Into Sub-Phases
- **2A:** Finish category pages (most important for SEO)
- **2B:** Update info pages
- **2C:** Update blog pages
- **Time:** 1-2 hours per sub-phase
- **Pro:** Can test incrementally
- **Con:** Multiple sessions needed

### Option C: Minimum Viable Phase 2
- Complete only critical path:
  - Category page
  - Subcategory page
  - Drawing page
  - Update Sanity queries for these
- **Time:** 1-2 hours
- **Pro:** Can test core functionality quickly
- **Con:** Info pages won't work with locale

---

## Recommendation

**Option C: Minimum Viable Phase 2**

Focus on getting the core drawing flow working:
1. Update 3 category pages
2. Update Sanity query functions
3. Test `/no/jul/farglegg-nisse` works
4. Then decide if we continue or pause

This lets us:
- Validate the architecture works
- Identify any blockers early
- Have a working demo with Norwegian URLs

Then Phase 2B can handle info pages, blog, etc.

---

## Current Blocker

**We need to update `src/lib/sanity.ts` functions before page updates will work.**

The homepage calls `getAllCategories(locale)` and `getPopularSubcategories(12, locale)`, but these functions don't accept locale params yet. This will cause TypeScript errors.

**Next Action:** Update `src/lib/sanity.ts` to accept locale parameters in all query functions.
