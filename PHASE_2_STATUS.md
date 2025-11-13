# Phase 2: Next.js Routing - Status Report

## ✅ Completed (40%)

### Infrastructure
- ✅ Created `src/i18n.ts` config (locales: 'no', 'sv')
- ✅ Updated middleware for optional locale routing
- ✅ Renamed `app/[locale]` → `app/[[locale]]` (optional segment)
- ✅ Updated `app/[[locale]]/layout.tsx` for optional param
- ✅ Updated homepage (`app/[[locale]]/page.tsx`) with optional locale

### URL Pattern Established
```
Norwegian: /jul/farglegg-nisse        ← No prefix (existing URLs unchanged)
Swedish:   /sv/jul/farglaegg-tomte    ← With /sv/ prefix
```

**SEO Impact:** ✅ Zero - all existing Norwegian URLs work unchanged

---

## ⏳ Remaining Work (60%)

### 1. Update Sanity Query Functions (BLOCKER)
**File:** `src/lib/sanity.ts`

Add `language` parameter to all functions:
- `getAllCategories(language: string)`
- `getPopularSubcategories(limit: number, language: string)`
- `getCategoryBySlug(slug: string, language: string)`
- `getSubcategoryBySlug(catSlug, subSlug, language)`
- `getDrawingBySlug(catSlug, subSlug, drawingSlug, language)`

Add to GROQ queries:
```groq
*[_type == "drawingImage" && slug.current == $slug && language == $language][0]
```

---

### 2. Update Page Components
Add `locale?: string` to params:

**Priority (Core Flow):**
- `app/[[locale]]/(categories)/[categorySlug]/page.tsx`
- `app/[[locale]]/(categories)/[categorySlug]/[subcategorySlug]/page.tsx`
- `app/[[locale]]/(categories)/[categorySlug]/[subcategorySlug]/[drawingSlug]/page.tsx`

**Secondary:**
- All info pages (7 files)
- Blog pages (2 files)
- Other category pages (2 files)

---

### 3. Update Component Links
Add locale-aware links:

```tsx
// Pattern:
href={locale === 'no' ? '/path' : `/${locale}/path`}
```

**Files:**
- `src/components/shared/Header.tsx`
- `src/components/shared/Footer.tsx`
- `src/components/frontpage/ColoringCategories.tsx`
- `src/components/category/SubcategoryHighlights.tsx`
- `src/components/category/DrawingCard.tsx`

---

### 4. Test & Build
```bash
npm run build              # Check for errors
npm run type-check         # TypeScript validation

# Test URLs:
/                         → Norwegian homepage
/jul/farglegg-nisse       → Norwegian drawing
/sv                       → Swedish homepage (when translations exist)
/sv/jul/farglaegg-tomte   → Swedish drawing (when translations exist)
```

---

## Next Steps

### Immediate Priority
1. Update `src/lib/sanity.ts` (unblocks everything else)
2. Update 3 core category pages
3. Test build

### After Core Works
4. Update info pages
5. Update blog pages
6. Update component links
7. Final testing

**Estimated Remaining Time:** 2-3 hours
