# 🚨 CRITICAL ISSUES FOUND - Quality Check

**Date:** 2025-11-13
**Status:** ⛔ **BLOCKING** - Must fix before deployment
**Severity:** HIGH - Code will not compile

---

## 🔴 Issue #1: Function Signature Mismatch (BLOCKER)

### Problem

**In `src/app/[[locale]]/page.tsx` (lines 167, 170):**
```typescript
const categories: Category[] = await getAllCategories(locale);
const featuredSubcategories = await getPopularSubcategories(12, locale);
```

**But in `src/lib/sanity.ts`:**
```typescript
// Line 49
export async function getAllCategories() {
  // NO locale parameter!
}

// Line 486
export async function getPopularSubcategories(limit = 3) {
  // Only accepts limit, NO locale parameter!
}
```

### Impact

❌ **TypeScript compilation error**
❌ **Runtime error if TypeScript is disabled**
❌ **Code will not work**

### Root Cause

The homepage was updated to pass `locale` to these functions, but the functions themselves were never updated to:
1. Accept the locale parameter
2. Filter GROQ queries by language

---

## 🔴 Issue #2: GROQ Queries Missing Language Filter

### Problem

**All GROQ queries in `sanity.ts` are missing `language` filter:**

```typescript
// Current (WRONG):
*[_type == "category" && isActive == true]

// Should be:
*[_type == "category" && isActive == true && language == $language]
```

### Affected Functions

Looking at sanity.ts, these functions need updating:

1. ✅ `getAllCategories()` - Line 49
2. ✅ `getPopularSubcategories()` - Line 486
3. ✅ `getCategoryWithSubcategories()` - Line 173
4. ✅ `getSubcategoriesByCategory()` - Line 221
5. ✅ `getSubcategoryWithDrawings()` - Line 246
6. ✅ `getDrawingsBySubcategory()` - Line 301
7. ✅ `getAllSubcategories()` - Line 457
8. ✅ `searchDrawings()` - Line 425
9. ✅ `getRelatedSubcategories()` - Line 623
10. ✅ `getRelatedDrawings()` - Line 656
11. ✅ `getTrendingSubcategories()` - Line 680
12. ✅ `getSitemapPageData()` - Line 707
13. ✅ `getSitemapImageData()` - Line 733
14. ✅ `getDrawingWithFullPath()` - Line 749

### Impact

Without language filters:
- ❌ Swedish pages will show Norwegian content
- ❌ Norwegian pages might show Swedish content (once it exists)
- ❌ Mixed language results in searches
- ❌ Sitemap will have duplicate URLs

---

## 🔴 Issue #3: Incomplete Page Updates

### Problem

**Only homepage (`page.tsx`) was updated to handle optional locale.**

**These pages still expect required `locale` parameter:**
- `[categorySlug]/page.tsx`
- `[subcategorySlug]/page.tsx`
- `[drawingSlug]/page.tsx`
- `hoved-kategori/page.tsx`
- `alle-underkategorier/page.tsx`
- Blog pages
- Info pages

### Impact

When you visit these URLs:
- `/jul/fargelegg-nisse` → **500 error** (locale is undefined)
- `/jul` → **500 error** (locale is undefined)
- `/sv/jul` → Might work but depends on implementation

---

## ✅ What's Actually Working

1. ✅ `src/i18n.ts` - Perfect
2. ✅ `src/middleware.ts` - Perfect
3. ✅ `src/app/[[locale]]/layout.tsx` - Perfect
4. ⚠️ `src/app/[[locale]]/page.tsx` - Updated but calling broken functions

---

## 🛠️ Fix Required

### Step 1: Update GROQ Query Functions

**Pattern for all functions:**

```typescript
// Before
export async function getAllCategories() {
  return client.fetch(`
    *[_type == "category" && isActive == true]
    ...
  `);
}

// After
export async function getAllCategories(locale: string = 'no') {
  return client.fetch(`
    *[_type == "category" && isActive == true && language == $locale]
    ...
  `, { locale });
}
```

### Step 2: Update All Page Components

**Pattern for all pages:**

```typescript
// Before
export default async function Page({ params }: {
  params: {
    locale: string;  // ❌ Required
    // ... other params
  }
}) {
  const locale = params.locale;  // ❌ Can be undefined
}

// After
export default async function Page({ params }: {
  params: {
    locale?: string;  // ✅ Optional
    // ... other params
  }
}) {
  const locale = params.locale || 'no';  // ✅ Default value
}
```

### Step 3: Test Build

```bash
npm run build
```

This will catch any TypeScript errors.

---

## 📋 Detailed Fix Checklist

### Priority 1: Fix GROQ Functions (BLOCKING)

- [ ] Update `getAllCategories(locale: string = 'no')`
  - Add locale parameter
  - Add `language == $locale` to query

- [ ] Update `getPopularSubcategories(limit: number = 3, locale: string = 'no')`
  - Add locale as second parameter
  - Add `language == $locale` to query

- [ ] Update remaining 12 functions (see list above)

### Priority 2: Update Remaining Pages

- [ ] `[categorySlug]/page.tsx`
- [ ] `[subcategorySlug]/page.tsx`
- [ ] `[drawingSlug]/page.tsx`
- [ ] `hoved-kategori/page.tsx`
- [ ] `alle-underkategorier/page.tsx`

### Priority 3: Test Everything

- [ ] `npm run build` - Must succeed
- [ ] Test `/` - Norwegian homepage
- [ ] Test `/sv` - Swedish homepage (will be empty but shouldn't error)
- [ ] Test `/jul/fargelegg-nisse` - Norwegian drawing
- [ ] Test `/sv/jul/fargelegg-nisse` - Swedish drawing (404 is OK)

---

## ⚡ Quick Fix Example

### Fix `getAllCategories` Function

**File:** `src/lib/sanity.ts` (Line 49)

```typescript
// BEFORE (BROKEN):
export async function getAllCategories() {
  return client.fetch(`
    *[_type == "category" && isActive == true]
    | order(order asc, title asc) {
      // ... fields
    }
  `);
}

// AFTER (FIXED):
export async function getAllCategories(locale: string = 'no') {
  return client.fetch(`
    *[_type == "category" && isActive == true && language == $locale]
    | order(order asc, title asc) {
      // ... fields
    }
  `, { locale });
}
```

### Fix `getPopularSubcategories` Function

**File:** `src/lib/sanity.ts` (Line 486)

```typescript
// BEFORE (BROKEN):
export async function getPopularSubcategories(limit = 3) {
  const result = await client.fetch(`
    *[_type == "subcategory" && isActive == true && defined(featuredImage)] {
      // ... fields
    } | order(drawingCount desc, title asc)[0...${limit}]
  `);
  // ...
}

// AFTER (FIXED):
export async function getPopularSubcategories(limit: number = 3, locale: string = 'no') {
  const result = await client.fetch(`
    *[_type == "subcategory" && isActive == true && language == $locale && defined(featuredImage)] {
      // ... fields
    } | order(drawingCount desc, title asc)[0...${limit}]
  `, { locale });
  // ...
}
```

---

## 🎯 Current Status Summary

| Component | Status | Needs Fix |
|-----------|--------|-----------|
| `i18n.ts` | ✅ Perfect | No |
| `middleware.ts` | ✅ Perfect | No |
| `[[locale]]/layout.tsx` | ✅ Perfect | No |
| `[[locale]]/page.tsx` | ⚠️ Updated but broken | No (functions need fixing) |
| `sanity.ts` (14 functions) | ❌ Missing locale support | **YES - CRITICAL** |
| `[categorySlug]/page.tsx` | ❌ Not updated | **YES** |
| `[subcategorySlug]/page.tsx` | ❌ Not updated | **YES** |
| `[drawingSlug]/page.tsx` | ❌ Not updated | **YES** |
| Other pages | ❌ Not updated | **YES** |

---

## 💡 Recommended Fix Order

### Day 1 (Now):
1. Fix the 2 functions used by homepage
   - `getAllCategories()`
   - `getPopularSubcategories()`
2. Test homepage works: `/` and `/sv`

### Day 2:
3. Update drawing page (most important user-facing page)
4. Fix related functions: `getDrawingWithFullPath()`, `getRelatedDrawings()`
5. Test drawing URLs work

### Day 3:
6. Update category & subcategory pages
7. Fix remaining GROQ functions
8. Full site test

---

## 🚀 After Fixes Complete

Once all fixes are done:

✅ **What will work:**
- `/` → Norwegian homepage with Norwegian content
- `/sv` → Swedish homepage (empty but no errors)
- `/jul/fargelegg-nisse` → Norwegian drawing with Norwegian data
- `/sv/jul/fargelegg-nisse` → 404 (correct - no Swedish content yet)
- All pages handle optional locale correctly
- GROQ queries filter by language
- Ready for AI translation

✅ **What's ready for Phase 2:**
- Infrastructure complete
- Can add Swedish translations
- URLs work correctly
- Data fetching works with locales

---

## ⛔ Do Not Deploy Until

- [ ] All GROQ functions accept locale parameter
- [ ] All GROQ queries include `language == $locale` filter
- [ ] All pages under `[[locale]]/` handle optional locale
- [ ] `npm run build` succeeds without errors
- [ ] Manual testing of key URLs passes

---

**Status:** ⛔ **BLOCKED** - Cannot proceed until GROQ functions are fixed

**Estimated Fix Time:** 2-3 hours for all functions and pages

**Critical Path:** Fix `getAllCategories()` and `getPopularSubcategories()` first to unblock homepage testing
