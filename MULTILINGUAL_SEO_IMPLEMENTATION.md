# Multilingual SEO Implementation Guide

## Google's Official Best Practices for tegnogfarge.no

**Source:** All guidelines from developers.google.com (Google Search Central Documentation)

---

## 1. URL Structure ✅

**Status:** Already correctly implemented

### Current Implementation
```
Norwegian (default): https://tegnogfarge.no/jul/nisse
Swedish:             https://tegnogfarge.no/sv/jul/tomte
```

### Why This Works
- ✅ Separate URLs for each language
- ✅ Subdirectory approach (recommended by Google)
- ✅ Clear language signals
- ✅ Consolidated domain authority

**Google's Recommendation:** Use different URLs for each language version (subdirectory with gTLD)

---

## 2. Hreflang Implementation ❌

**Status:** MISSING - High Priority Fix

### Purpose
Tell Google about localized versions to:
- Avoid duplicate content issues
- Serve correct language to users
- Prevent content cannibalization

### Implementation Method: HTML `<link>` Tags

Add to `<head>` of every page:

```html
<!-- Norwegian page: https://tegnogfarge.no/jul/nisse -->
<link rel="alternate" hreflang="no" href="https://tegnogfarge.no/jul/nisse" />
<link rel="alternate" hreflang="sv" href="https://tegnogfarge.no/sv/jul/tomte" />
<link rel="alternate" hreflang="x-default" href="https://tegnogfarge.no/jul/nisse" />

<!-- Swedish page: https://tegnogfarge.no/sv/jul/tomte -->
<link rel="alternate" hreflang="no" href="https://tegnogfarge.no/jul/nisse" />
<link rel="alternate" hreflang="sv" href="https://tegnogfarge.no/sv/jul/tomte" />
<link rel="alternate" hreflang="x-default" href="https://tegnogfarge.no/jul/nisse" />
```

### Critical Rules
1. **Bidirectional Linking** - Each page links to ALL versions (including itself)
2. **Full URLs** - Always use complete URLs with https://
3. **Self-referencing** - Each page must link to itself
4. **Consistency** - Same annotations across all pages
5. **x-default** - Specify fallback page (Norwegian)

### Language Codes (ISO 639-1)
- `no` = Norwegian
- `sv` = Swedish
- `x-default` = Default fallback

---

## 3. Canonical Tags ❌

**Status:** NEEDS FIXING - Each page must point to itself

### Current Problem

```typescript
// src/app/[locale]/(categories)/[categorySlug]/[subcategorySlug]/[drawingSlug]/page.tsx:64
alternates: {
  canonical: `${baseUrl}${pathname}`,  // ❌ Doesn't include locale
}
```

This causes Swedish pages to have incorrect canonical URLs.

### Fix Required

```typescript
export async function generateMetadata({ params: paramsPromise }: PageProps) {
  const { locale, categorySlug, subcategorySlug, drawingSlug } = await paramsPromise;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tegnogfarge.no';
  const localePrefix = locale === 'no' ? '' : `/${locale}`;
  const pathname = `${localePrefix}/${categorySlug}/${subcategorySlug}/${drawingSlug}`;
  const currentUrl = `${baseUrl}${pathname}`;

  return {
    // ... other metadata
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: currentUrl,  // ✅ Includes locale
      languages: {
        'no': `${baseUrl}/${categorySlug}/${subcategorySlug}/${drawingSlug}`,
        'sv': `${baseUrl}/sv/${categorySlug}/${subcategorySlug}/${drawingSlug}`,
      }
    },
  };
}
```

### Google's Rule
- Norwegian page → canonical points to Norwegian page ✅
- Swedish page → canonical points to Swedish page ✅
- **NEVER** point Swedish canonical to Norwegian page ❌

---

## 4. Sitemap with Hreflang ❌

**Status:** MISSING - Needs creation

### Option A: XML Sitemap with Hreflang (Recommended)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <!-- Homepage -->
  <url>
    <loc>https://tegnogfarge.no/</loc>
    <xhtml:link rel="alternate" hreflang="no" href="https://tegnogfarge.no/"/>
    <xhtml:link rel="alternate" hreflang="sv" href="https://tegnogfarge.no/sv"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://tegnogfarge.no/"/>
  </url>

  <url>
    <loc>https://tegnogfarge.no/sv</loc>
    <xhtml:link rel="alternate" hreflang="no" href="https://tegnogfarge.no/"/>
    <xhtml:link rel="alternate" hreflang="sv" href="https://tegnogfarge.no/sv"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://tegnogfarge.no/"/>
  </url>

  <!-- Category Example -->
  <url>
    <loc>https://tegnogfarge.no/jul</loc>
    <xhtml:link rel="alternate" hreflang="no" href="https://tegnogfarge.no/jul"/>
    <xhtml:link rel="alternate" hreflang="sv" href="https://tegnogfarge.no/sv/jul"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://tegnogfarge.no/jul"/>
  </url>

  <url>
    <loc>https://tegnogfarge.no/sv/jul</loc>
    <xhtml:link rel="alternate" hreflang="no" href="https://tegnogfarge.no/jul"/>
    <xhtml:link rel="alternate" hreflang="sv" href="https://tegnogfarge.no/sv/jul"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://tegnogfarge.no/jul"/>
  </url>

</urlset>
```

### Implementation File: `src/app/sitemap.ts`

Create Next.js sitemap with hreflang support:

```typescript
import { MetadataRoute } from 'next';
import { getSitemapPageData } from '@/lib/sanity';
import { locales } from '@/i18n';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tegnogfarge.no';
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Only generate NO entries, but include SV alternates
  const data = await getSitemapPageData('no');

  // Homepage
  sitemapEntries.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
    alternates: {
      languages: {
        'no': baseUrl,
        'sv': `${baseUrl}/sv`,
      }
    }
  });

  // Categories, Subcategories, Drawings...
  // (Add similar entries with alternates)

  return sitemapEntries;
}
```

---

## 5. Common Mistakes to Avoid ⚠️

### ❌ Don't Do This

1. **Automatic language redirects**
   ```javascript
   // ❌ BAD
   if (userLanguage === 'sv') {
     redirect('/sv/...');
   }
   ```

2. **Canonical pointing to different language**
   ```html
   <!-- ❌ BAD (on Swedish page) -->
   <link rel="canonical" href="https://tegnogfarge.no/jul/nisse" />

   <!-- ✅ GOOD (on Swedish page) -->
   <link rel="canonical" href="https://tegnogfarge.no/sv/jul/tomte" />
   ```

3. **Only `lang` attribute without hreflang**
   ```html
   <!-- ❌ NOT ENOUGH -->
   <html lang="sv">

   <!-- ✅ ALSO NEED -->
   <link rel="alternate" hreflang="sv" href="..." />
   ```

4. **Missing self-referencing hreflang**
   ```html
   <!-- ❌ MISSING SELF-REFERENCE -->
   <link rel="alternate" hreflang="no" href="..." />

   <!-- ✅ INCLUDE SELF -->
   <link rel="alternate" hreflang="no" href="..." />
   <link rel="alternate" hreflang="sv" href="..." />
   ```

5. **Using cookies/JavaScript for language switching**
   - Google can't crawl JavaScript-based language switching
   - Always use different URLs

---

## 6. Implementation Checklist

### ✅ Already Correct
- [x] URL structure (subdirectory approach)
- [x] Language-specific content in Sanity CMS
- [x] Translated slugs (no → sv)
- [x] Alt text translation

### ❌ Needs Implementation

#### Priority 1: Hreflang Tags
- [ ] Create `src/components/seo/Hreflang.tsx`
- [ ] Add hreflang to all page metadata
- [ ] Test with Google Rich Results Test

#### Priority 2: Canonical URLs
- [ ] Fix canonical in drawing pages
- [ ] Fix canonical in category pages
- [ ] Fix canonical in subcategory pages
- [ ] Fix canonical in homepage

#### Priority 3: Sitemap
- [ ] Create `src/app/sitemap.ts`
- [ ] Generate entries for both locales
- [ ] Include hreflang in sitemap
- [ ] Submit to Google Search Console

---

## 7. Code Templates

### Template: Hreflang Component

**File:** `src/components/seo/Hreflang.tsx`

```typescript
interface HreflangProps {
  pathname: string; // e.g., "/jul/nisse/snomann"
  locale: string;   // current locale
}

export function Hreflang({ pathname, locale }: HreflangProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tegnogfarge.no';

  // Remove leading /sv if present to get base path
  const basePath = pathname.replace(/^\/sv/, '');

  return (
    <>
      <link rel="alternate" hreflang="no" href={`${baseUrl}${basePath}`} />
      <link rel="alternate" hreflang="sv" href={`${baseUrl}/sv${basePath}`} />
      <link rel="alternate" hreflang="x-default" href={`${baseUrl}${basePath}`} />
    </>
  );
}
```

### Template: Metadata with Hreflang

**Update in all page files:**

```typescript
export async function generateMetadata({ params: paramsPromise }: PageProps) {
  const { locale, categorySlug, subcategorySlug, drawingSlug } = await paramsPromise;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tegnogfarge.no';
  const localePrefix = locale === 'no' ? '' : `/${locale}`;
  const pathname = `${localePrefix}/${categorySlug}/${subcategorySlug}/${drawingSlug}`;

  return {
    title: '...',
    description: '...',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}${pathname}`,
      languages: {
        'no': `${baseUrl}/${categorySlug}/${subcategorySlug}/${drawingSlug}`,
        'sv': `${baseUrl}/sv/${categorySlug}/${subcategorySlug}/${drawingSlug}`,
      }
    },
  };
}
```

---

## 8. Verification Steps

### After Implementation

1. **Test hreflang tags**
   - Visit: https://search.google.com/test/rich-results
   - Enter your URLs
   - Verify hreflang detected

2. **Submit sitemap**
   - Google Search Console
   - Submit `https://tegnogfarge.no/sitemap.xml`
   - Monitor for errors

3. **Check International Targeting**
   - Google Search Console → International Targeting
   - Verify hreflang recognized
   - Check for errors

4. **Use Testing Tools**
   - Aleyda Solis's hreflang tag generator
   - Merkle SEO hreflang tag testing tool

---

## 9. Official Google Resources

All information sourced from developers.google.com:

1. **Main Guide**: [Localized Versions of Pages](https://developers.google.com/search/docs/specialty/international/localized-versions)
2. **Multi-regional Sites**: [Managing Multi-Regional Sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
3. **Sitemap Implementation**: [Multilingual Sitemaps](https://developers.google.com/search/blog/2012/05/multilingual-and-multinational-site)
4. **x-default**: [x-default hreflang](https://developers.google.com/search/blog/2013/04/x-default-hreflang-for-international-pages)
5. **Canonical Tags**: [Consolidate Duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

---

## 10. Expected Results

### After Full Implementation

✅ **No content cannibalization** - Google understands language variants
✅ **Better rankings** - Correct pages shown to correct users
✅ **Clear signals** - Google knows which page serves which market
✅ **Improved CTR** - Users see content in their language
✅ **Clean Search Console** - No duplicate content warnings

### Timeline
- **Week 1-2**: Google discovers hreflang annotations
- **Week 3-4**: Indexing adjusts for language variants
- **Month 2+**: Full benefits in search results

---

**Last Updated:** January 2025
**Based on:** Google Search Central Documentation (developers.google.com)
