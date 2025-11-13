# 🌍 Multi-Language SEO Implementation Guide

**Based on:** supercoloring.com analysis
**Target:** tegnogfarge.no (NO → SV translation)
**Competitor research date:** 2025-11-13

---

## 📊 **SuperColoring.com SEO Analysis**

### **What They Do (Best Practices)**

#### 1. **HTML Lang Attribute** ✅
```html
<!-- English (default) -->
<html lang="en">

<!-- Danish -->
<html lang="da">

<!-- Swedish -->
<html lang="sv">
```

**Implementation for us:**
```tsx
// src/app/[locale]/layout.tsx
<html lang={locale}>  {/* 'no' or 'sv' */}
```

---

#### 2. **Comprehensive Hreflang Tags** ✅

**Every page includes ALL language alternatives:**

```html
<!-- In <head> of EVERY page -->
<link href="https://www.supercoloring.com/" rel="alternate" hreflang="en" />
<link href="https://www.supercoloring.com/sv" rel="alternate" hreflang="sv" />
<link href="https://www.supercoloring.com/da" rel="alternate" hreflang="da" />
<link href="https://www.supercoloring.com/de" rel="alternate" hreflang="de" />
<link href="https://www.supercoloring.com/fr" rel="alternate" hreflang="fr" />
<link href="https://www.supercoloring.com/es" rel="alternate" hreflang="es" />
<!-- ... 15+ more languages -->
```

**Key observations:**
- ✅ Includes **all** language versions (even if not fully translated)
- ✅ Uses ISO 639-1 language codes (`sv`, `da`, `no`/`nb`)
- ✅ Points to **root domain** (no subdomains)
- ✅ **No x-default** on homepage hreflang tags (but has it in sitemap)

**Implementation for us:**
```tsx
// src/app/[locale]/layout.tsx
export async function generateMetadata({ params }: Props) {
  const { locale } = params;

  return {
    alternates: {
      canonical: `https://tegnogfarge.no/${locale}`,
      languages: {
        'no': 'https://tegnogfarge.no/no',
        'sv': 'https://tegnogfarge.no/sv',
        'x-default': 'https://tegnogfarge.no/no', // Norwegian as default
      },
    },
  };
}
```

---

#### 3. **Canonical Tags** ✅

**Each language version has its OWN canonical:**

```html
<!-- English homepage -->
<link rel="canonical" href="https://www.supercoloring.com/" />

<!-- Danish homepage -->
<link rel="canonical" href="https://www.supercoloring.com/da" />

<!-- Swedish homepage -->
<link rel="canonical" href="https://www.supercoloring.com/sv" />
```

**Implementation for us:**
```tsx
// Next.js automatically handles this with alternates.canonical
canonical: `https://tegnogfarge.no/${locale}${pathname}`,
```

---

#### 4. **URL Structure** ✅

**Fully translated URLs with language prefix:**

| Language | Homepage | Category | Drawing |
|----------|----------|----------|---------|
| English | `/` | `/coloring-pages/animals/dogs` | `/coloring-pages/animals/dogs/golden-retriever` |
| Swedish | `/sv` | `/sv/malarbilder/djur/hundar` | `/sv/malarbilder/djur/hundar/golden-retriever` |
| Danish | `/da` | `/da/tegninger/dyr/hunde` | `/da/tegninger/dyr/hunde/golden-retriever` |

**Key patterns:**
- ✅ Language code as **first path segment** (`/sv/`, `/da/`)
- ✅ **Translated slugs** throughout URL structure
- ✅ English has **no prefix** (root is default)
- ✅ Consistent structure across all languages

**Implementation for us:**
```
Norwegian: /no/jul/fargelegge-nisse
Swedish:   /sv/jul/farglaegg-tomte    ← Fully translated!
```

---

#### 5. **Open Graph Tags** ✅

**Localized for each language:**

```html
<!-- English -->
<meta property="og:url" content="https://www.supercoloring.com/frontpage" />
<meta property="og:title" content="Super Coloring - Free printable coloring pages..." />
<meta property="og:site_name" content="Super Coloring" />

<!-- Swedish -->
<meta property="og:url" content="https://www.supercoloring.com/sv/content/super-coloring-gratis-utskriftsbara-malarsidor..." />
<meta property="og:title" content="Super Coloring - gratis utskriftsbara målarsidor..." />
<meta property="og:site_name" content="Super Coloring" />
```

**Key observations:**
- ✅ OG URL points to **localized version**
- ✅ OG title is **translated**
- ✅ Site name **stays same** (brand consistency)

**Implementation for us:**
```tsx
openGraph: {
  url: `https://tegnogfarge.no/${locale}${pathname}`,
  title: locale === 'sv' ? 'Swedish title' : 'Norwegian title',
  siteName: 'Tegn og Farge', // Same for all languages
  locale: locale === 'sv' ? 'sv_SE' : 'nb_NO',
},
```

---

#### 6. **Meta Description** ✅

**Translated for each language:**

```html
<!-- English -->
<meta name="description" content="Select from 79872 printable crafts of cartoons, animals, nature, Bible and many more." />

<!-- Swedish -->
<meta name="description" content="Gratis utskrivningsbara bilder med varierande teman som du kan skriva ut och färglägga" />
```

**Implementation for us:**
```tsx
// Already handled by our translation script!
// Just ensure it's being set in metadata
description: translatedMetaDescription,
```

---

#### 7. **XML Sitemap with Hreflang** ✅

**Every URL in sitemap includes ALL hreflang alternatives:**

```xml
<url>
  <loc>https://www.supercoloring.com/sections/coloring-pages</loc>
  <xhtml:link rel="alternate" href="https://www.supercoloring.com/sections/coloring-pages" hreflang="en"/>
  <xhtml:link rel="alternate" href="https://www.supercoloring.com/sv/sections/malarbilder" hreflang="sv"/>
  <xhtml:link rel="alternate" href="https://www.supercoloring.com/da/sections/tegninger-til-farvelaegning" hreflang="da"/>
  <xhtml:link rel="alternate" href="https://www.supercoloring.com/de/sections/ausmalbilder" hreflang="de"/>
  <!-- ... all other languages -->
  <xhtml:link rel="alternate" href="https://www.supercoloring.com/sections/coloring-pages" hreflang="x-default"/>
</url>
```

**Key observations:**
- ✅ **Every URL** has hreflang links to all translations
- ✅ Includes `x-default` pointing to English version
- ✅ Uses `xmlns:xhtml` namespace for sitemap
- ✅ Follows Google's best practices

**Implementation for us:**
```typescript
// Need to generate sitemap with hreflang
// Example structure:
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://tegnogfarge.no/no/jul/fargelegge-nisse</loc>
    <xhtml:link rel="alternate" href="https://tegnogfarge.no/no/jul/fargelegge-nisse" hreflang="no"/>
    <xhtml:link rel="alternate" href="https://tegnogfarge.no/sv/jul/farglaegg-tomte" hreflang="sv"/>
    <xhtml:link rel="alternate" href="https://tegnogfarge.no/no/jul/fargelegge-nisse" hreflang="x-default"/>
  </url>
</urlset>
```

---

#### 8. **Robots.txt** ✅

**Clean structure disallowing admin paths:**

```
User-agent: *
Crawl-delay: 10

# Disallow technical paths
Disallow: /admin/
Disallow: /node/
Disallow: /taxonomy/
Disallow: /field-collection/

# Disallow per language (prevents duplicate content indexing)
Disallow: /sv/node/
Disallow: /sv/taxonomy/
Disallow: /da/node/
Disallow: /da/taxonomy/
# ... etc for all languages
```

**Key observations:**
- ✅ Disallows **technical URLs** (node IDs, taxonomy IDs)
- ✅ Allows **clean URLs** (translated slugs)
- ✅ Prevents indexing of **duplicate content**

**Implementation for us:**
```
# robots.txt
User-agent: *
Allow: /

# Disallow Next.js internal paths
Disallow: /_next/
Disallow: /api/

# Allow all localized content
Allow: /no/
Allow: /sv/

Sitemap: https://tegnogfarge.no/sitemap.xml
```

---

#### 9. **Title Tags** ✅

**Fully translated and SEO-optimized:**

```html
<!-- English -->
<title>Free Printable Coloring Pages for Kids and Adults</title>

<!-- Swedish -->
<title>Gratis utskrivningsbara målarbilder för barn och vuxna</title>

<!-- Danish -->
<title>Gratis Tegninger til Farvelægning</title>
```

**Key observations:**
- ✅ **Completely translated** (not just appended)
- ✅ Uses **natural keywords** for each language
- ✅ SEO-optimized for local search terms

**Implementation for us:**
```tsx
title: locale === 'sv'
  ? 'Gratis målarbilder för barn och vuxna'
  : 'Gratis fargleggingsark for barn og voksne',
```

---

## 🎯 **Implementation Checklist for Tegnogfarge.no**

### **Phase 1: Core SEO Tags** (Priority: HIGH)

- [ ] **1.1 HTML lang attribute**
  - File: `src/app/[locale]/layout.tsx`
  - Add: `<html lang={locale}>`

- [ ] **1.2 Hreflang tags in <head>**
  - File: `src/app/[locale]/layout.tsx`
  - Add all language alternatives
  - Include `x-default` pointing to Norwegian

- [ ] **1.3 Canonical tags**
  - File: `src/app/[locale]/layout.tsx`
  - Ensure each language has own canonical URL

- [ ] **1.4 Translated meta descriptions**
  - Already done by translation script ✅
  - Verify they're being used in metadata

- [ ] **1.5 Open Graph tags**
  - Add localized OG tags
  - Include `og:locale` property

---

### **Phase 2: URL Structure** (Priority: HIGH)

- [ ] **2.1 Verify URL structure**
  - Current: `/no/jul/fargelegge-nisse`
  - Target: `/sv/jul/farglaegg-tomte` ✅ (already implemented)

- [ ] **2.2 Ensure slugs are translated**
  - Handled by translation script ✅
  - Verify in Sanity after translation

---

### **Phase 3: Sitemap** (Priority: MEDIUM)

- [ ] **3.1 Generate XML sitemap with hreflang**
  - File: `src/app/sitemap.ts` (create if needed)
  - Include all Norwegian pages
  - Include all Swedish pages
  - Add hreflang links for each URL pair

- [ ] **3.2 Submit to Google Search Console**
  - Submit Norwegian sitemap
  - Submit Swedish sitemap
  - Monitor indexing status

---

### **Phase 4: Robots.txt** (Priority: LOW)

- [ ] **4.1 Update robots.txt**
  - File: `public/robots.txt`
  - Add sitemap reference
  - Disallow Next.js internals

---

## 🔧 **Implementation Code**

### **1. Layout Metadata (src/app/[locale]/layout.tsx)**

```typescript
import { locales, defaultLocale } from '@/i18n';

type Props = {
  params: { locale: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = params;
  const baseUrl = 'https://tegnogfarge.no';

  // Get current pathname (you'll need to implement this)
  const pathname = '/'; // Replace with actual pathname logic

  return {
    // Canonical URL
    alternates: {
      canonical: `${baseUrl}/${locale}${pathname}`,

      // Hreflang tags
      languages: {
        'no': `${baseUrl}/no${pathname}`,
        'sv': `${baseUrl}/sv${pathname}`,
        'x-default': `${baseUrl}/no${pathname}`, // Norwegian as default
      },
    },

    // Open Graph
    openGraph: {
      url: `${baseUrl}/${locale}${pathname}`,
      siteName: 'Tegn og Farge',
      locale: locale === 'sv' ? 'sv_SE' : 'nb_NO',
      type: 'website',
    },
  };
}

export default function LocaleLayout({ children, params }: Props) {
  const { locale } = params;

  return (
    <html lang={locale} dir="ltr">
      <body>
        {children}
      </body>
    </html>
  );
}
```

---

### **2. Category Page Metadata (src/app/[locale]/[categorySlug]/page.tsx)**

```typescript
export async function generateMetadata({ params }: Props) {
  const { locale, categorySlug } = params;
  const baseUrl = 'https://tegnogfarge.no';

  // Fetch category data
  const category = await getCategory(categorySlug, locale);

  return {
    title: category.seoTitle || category.title,
    description: category.seoDescription || category.description,

    alternates: {
      canonical: `${baseUrl}/${locale}/${categorySlug}`,
      languages: {
        'no': `${baseUrl}/no/${category.slugNo}`,
        'sv': `${baseUrl}/sv/${category.slugSv}`,
        'x-default': `${baseUrl}/no/${category.slugNo}`,
      },
    },

    openGraph: {
      title: category.seoTitle || category.title,
      description: category.seoDescription || category.description,
      url: `${baseUrl}/${locale}/${categorySlug}`,
      siteName: 'Tegn og Farge',
      locale: locale === 'sv' ? 'sv_SE' : 'nb_NO',
      type: 'website',
      images: category.image ? [
        {
          url: category.image.url,
          width: 1200,
          height: 630,
          alt: category.image.alt,
        },
      ] : [],
    },
  };
}
```

---

### **3. Sitemap with Hreflang (src/app/sitemap.ts)**

```typescript
import { MetadataRoute } from 'next';
import { getAllCategories, getAllSubcategories, getAllDrawings } from '@/lib/sanity';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tegnogfarge.no';

  // Fetch all content for both languages
  const categoriesNo = await getAllCategories('no');
  const categoriesSv = await getAllCategories('sv');
  const subcategoriesNo = await getAllSubcategories('no');
  const subcategoriesSv = await getAllSubcategories('sv');
  const drawingsNo = await getAllDrawings('no');
  const drawingsSv = await getAllDrawings('sv');

  const sitemap: MetadataRoute.Sitemap = [
    // Homepage
    {
      url: `${baseUrl}/no`,
      lastModified: new Date(),
      alternates: {
        languages: {
          no: `${baseUrl}/no`,
          sv: `${baseUrl}/sv`,
        },
      },
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // Categories
  for (const categoryNo of categoriesNo) {
    const categorySv = categoriesSv.find(c => c.baseDocumentId === categoryNo._id);

    if (categorySv) {
      sitemap.push({
        url: `${baseUrl}/no/${categoryNo.slug.current}`,
        lastModified: new Date(categoryNo._updatedAt),
        alternates: {
          languages: {
            no: `${baseUrl}/no/${categoryNo.slug.current}`,
            sv: `${baseUrl}/sv/${categorySv.slug.current}`,
          },
        },
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  // Subcategories
  for (const subcatNo of subcategoriesNo) {
    const subcatSv = subcategoriesSv.find(s => s.baseDocumentId === subcatNo._id);

    if (subcatSv) {
      sitemap.push({
        url: `${baseUrl}/no/${subcatNo.parentCategory.slug.current}/${subcatNo.slug.current}`,
        lastModified: new Date(subcatNo._updatedAt),
        alternates: {
          languages: {
            no: `${baseUrl}/no/${subcatNo.parentCategory.slug.current}/${subcatNo.slug.current}`,
            sv: `${baseUrl}/sv/${subcatSv.parentCategory.slug.current}/${subcatSv.slug.current}`,
          },
        },
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  // Drawings
  for (const drawingNo of drawingsNo) {
    const drawingSv = drawingsSv.find(d => d.baseDocumentId === drawingNo._id);

    if (drawingSv) {
      sitemap.push({
        url: `${baseUrl}/no/${drawingNo.subcategory.parentCategory.slug.current}/${drawingNo.subcategory.slug.current}/${drawingNo.slug.current}`,
        lastModified: new Date(drawingNo._updatedAt),
        alternates: {
          languages: {
            no: `${baseUrl}/no/${drawingNo.subcategory.parentCategory.slug.current}/${drawingNo.subcategory.slug.current}/${drawingNo.slug.current}`,
            sv: `${baseUrl}/sv/${drawingSv.subcategory.parentCategory.slug.current}/${drawingSv.subcategory.slug.current}/${drawingSv.slug.current}`,
          },
        },
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  return sitemap;
}
```

---

### **4. Robots.txt (public/robots.txt)**

```
# Robots.txt for tegnogfarge.no

User-agent: *
Allow: /

# Disallow Next.js internals
Disallow: /_next/
Disallow: /api/

# Allow all localized content
Allow: /no/
Allow: /sv/

# Sitemaps
Sitemap: https://tegnogfarge.no/sitemap.xml
```

---

## 📊 **SEO Validation Checklist**

After implementation, verify:

### **1. HTML Validation**
```bash
# Check homepage
curl -s https://tegnogfarge.no/no | grep -E '(hreflang|canonical|og:|lang=)'
curl -s https://tegnogfarge.no/sv | grep -E '(hreflang|canonical|og:|lang=)'
```

### **2. Google Search Console**
- [ ] Verify both `/no/` and `/sv/` properties
- [ ] Submit sitemaps
- [ ] Check international targeting settings
- [ ] Monitor hreflang errors

### **3. Structured Data Test**
- [ ] Test with Google Rich Results Test
- [ ] Verify Open Graph with Facebook Debugger
- [ ] Test with Twitter Card Validator

### **4. Manual Checks**
- [ ] Every page has correct `lang` attribute
- [ ] Every page has hreflang to ALL versions
- [ ] Canonical points to correct language version
- [ ] Meta descriptions are translated
- [ ] URLs are fully translated
- [ ] No Norwegian in Swedish URLs (and vice versa)

---

## 🚀 **Expected SEO Results**

### **Immediate (Week 1-2)**
- ✅ Google discovers Swedish pages
- ✅ Hreflang relationships established
- ✅ No duplicate content warnings

### **Short-term (Month 1-3)**
- ✅ Swedish pages indexed
- ✅ Appear in Swedish search results
- ✅ Reduced duplicate content issues
- ✅ Improved crawl efficiency

### **Long-term (Month 3-6)**
- ✅ Swedish organic traffic increases
- ✅ Better rankings for Swedish keywords
- ✅ Reduced bounce rate from Swedish users
- ✅ Competitive with supercoloring.com in Swedish market

---

## 🎯 **Key Takeaways from SuperColoring**

**What they do exceptionally well:**
1. ✅ **Comprehensive hreflang** - Every page links to ALL language versions
2. ✅ **Fully translated URLs** - Not just content, but entire URL structure
3. ✅ **Sitemap with hreflang** - XML sitemap includes language alternatives
4. ✅ **Clean URL structure** - No `/node/` or technical IDs in URLs
5. ✅ **Consistent metadata** - Every page has translated meta tags

**What we need to copy:**
1. ⚠️ **Add hreflang tags** - Currently missing
2. ⚠️ **Generate sitemap with hreflang** - Need to implement
3. ⚠️ **Ensure canonical tags** - Need per-language canonicals
4. ⚠️ **Add Open Graph locale** - Need localized OG tags
5. ✅ **Translated URLs** - Already implementing via translation script

---

## 📚 **Resources**

- [Google Multi-Regional Sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
- [Hreflang Guide](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [Sitemap with Hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions#sitemap)

---

**Next Step:** Implement Phase 1 (Core SEO Tags) before running Swedish translation.
