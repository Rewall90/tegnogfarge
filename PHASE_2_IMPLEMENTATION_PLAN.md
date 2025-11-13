# PHASE 2: Next.js Routing Implementation Plan

**Goal:** Configure Next.js to support `/no/...` and `/sv/...` URL structure

---

## Current Structure Analysis

### Existing App Structure
```
src/app/
├── layout.tsx                              # Root layout
├── page.tsx                                # Homepage
├── (categories)/
│   ├── [categorySlug]/page.tsx            # Category page
│   ├── [categorySlug]/[subcategorySlug]/page.tsx  # Subcategory page
│   └── [categorySlug]/[subcategorySlug]/[drawingSlug]/page.tsx  # Drawing page
├── (info)/
│   ├── kontakt/page.tsx
│   ├── om-oss/page.tsx
│   └── personvernerklaering/page.tsx
├── blog/
│   ├── page.tsx
│   └── [slug]/page.tsx
└── (admin)/dashboard/...
```

### Target Structure
```
src/app/
├── layout.tsx                              # Root layout (unchanged)
├── [locale]/                               # NEW: Locale wrapper
│   ├── layout.tsx                         # Locale-aware layout
│   ├── page.tsx                           # Homepage (with locale)
│   ├── (categories)/
│   │   ├── [categorySlug]/page.tsx
│   │   ├── [categorySlug]/[subcategorySlug]/page.tsx
│   │   └── [categorySlug]/[subcategorySlug]/[drawingSlug]/page.tsx
│   ├── (info)/
│   │   ├── kontakt/page.tsx
│   │   ├── om-oss/page.tsx
│   │   └── personvernerklaering/page.tsx
│   └── blog/
│       ├── page.tsx
│       └── [slug]/page.tsx
└── (admin)/dashboard/...                  # Keep outside locale (no translation)
```

---

## Implementation Steps

### Step 1: Create i18n Configuration
**File:** `src/i18n.ts`
**What:** Central configuration for locales

```typescript
export const locales = ['no', 'sv'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'no';

export const localeNames: Record<Locale, string> = {
  no: 'Norsk',
  sv: 'Svenska',
};

export const localeFlags: Record<Locale, string> = {
  no: '🇳🇴',
  sv: '🇸🇪',
};
```

**Status:** ⏳ To Do

---

### Step 2: Create Middleware for Locale Detection
**File:** `src/middleware.ts`
**What:** Handles locale routing and redirects

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for:
  // - API routes
  // - Static files (_next/static, favicon, etc.)
  // - Admin routes (dashboard)
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/dashboard') ||
    pathname.includes('.') // files with extensions
  ) {
    return NextResponse.next();
  }

  // Check if pathname starts with a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Redirect to default locale
  const newUrl = new URL(`/${defaultLocale}${pathname}`, request.url);
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: [
    // Match all pathnames except:
    // - API routes
    // - Static files
    // - Dashboard/admin
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|dashboard).*)',
  ],
};
```

**Key Behavior:**
- `/` → redirects to `/no`
- `/jul/farglegg-nisse` → redirects to `/no/jul/farglegg-nisse`
- `/no/jul/farglegg-nisse` → works as-is
- `/sv/jul/farglaegg-tomte` → works as-is
- `/dashboard` → no redirect (admin stays locale-free)

**Status:** ⏳ To Do

---

### Step 3: Create [locale] Directory Structure
**What:** Physically move pages into locale wrapper

**Actions:**
```bash
# Create [locale] directory
mkdir src/app/[locale]

# Move these into [locale]:
mv src/app/(categories) src/app/[locale]/
mv src/app/(info) src/app/[locale]/
mv src/app/blog src/app/[locale]/
mv src/app/page.tsx src/app/[locale]/

# Keep outside [locale]:
# - (admin) stays at src/app/(admin)
# - api stays at src/app/api
# - Root layout stays at src/app/layout.tsx
```

**Result:**
- `/no/jul/farglegg-nisse` → `app/[locale]/(categories)/[categorySlug]/[subcategorySlug]/[drawingSlug]/page.tsx`
- `/sv/jul/farglaegg-tomte` → Same file, different locale param

**Status:** ⏳ To Do

---

### Step 4: Create Locale Layout
**File:** `src/app/[locale]/layout.tsx`
**What:** Layout that receives locale param

```typescript
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate locale
  if (!locales.includes(params.locale as any)) {
    notFound();
  }

  return <>{children}</>;
}
```

**Status:** ⏳ To Do

---

### Step 5: Update Page Components with Locale Param
**What:** Every page now receives `params.locale`

**Example - Drawing Page:**

**Before:**
```typescript
// app/(categories)/[categorySlug]/[subcategorySlug]/[drawingSlug]/page.tsx
export default async function DrawingPage({
  params,
}: {
  params: { categorySlug: string; subcategorySlug: string; drawingSlug: string };
}) {
  const drawing = await client.fetch(DRAWING_QUERY, { slug: params.drawingSlug });
  // ...
}
```

**After:**
```typescript
// app/[locale]/(categories)/[categorySlug]/[subcategorySlug]/[drawingSlug]/page.tsx
export default async function DrawingPage({
  params,
}: {
  params: {
    locale: string;
    categorySlug: string;
    subcategorySlug: string;
    drawingSlug: string;
  };
}) {
  const drawing = await client.fetch(DRAWING_QUERY, {
    slug: params.drawingSlug,
    language: params.locale // NEW: Filter by language
  });
  // ...
}
```

**Files to Update:**
- `app/[locale]/page.tsx` - Homepage
- `app/[locale]/(categories)/[categorySlug]/page.tsx` - Category
- `app/[locale]/(categories)/[categorySlug]/[subcategorySlug]/page.tsx` - Subcategory
- `app/[locale]/(categories)/[categorySlug]/[subcategorySlug]/[drawingSlug]/page.tsx` - Drawing
- All info pages
- Blog pages

**Status:** ⏳ To Do

---

### Step 6: Update GROQ Queries to Filter by Language
**What:** Modify all Sanity queries to include language filter

**Example:**

**Before:**
```groq
*[_type == "drawingImage" && slug.current == $slug][0] {
  title,
  description,
  // ...
}
```

**After:**
```groq
*[_type == "drawingImage" && slug.current == $slug && language == $language][0] {
  title,
  description,
  // ...
}
```

**Files to Update:**
- `src/lib/sanity.ts` (if queries are centralized)
- Or in each page component where queries are defined

**Key Changes:**
1. Add `&& language == $language` to all queries
2. Pass `language: params.locale` to all fetch calls
3. Add fallback logic if Swedish translation doesn't exist:
   ```typescript
   let drawing = await client.fetch(QUERY, { slug, language: 'sv' });
   if (!drawing) {
     drawing = await client.fetch(QUERY, { slug, language: 'no' });
   }
   ```

**Status:** ⏳ To Do

---

### Step 7: Update Internal Links
**What:** All `<Link>` components need locale prefix

**Helper Function:**
```typescript
// src/lib/i18n-utils.ts
export function localizedPath(path: string, locale: string): string {
  return `/${locale}${path}`;
}
```

**Before:**
```tsx
<Link href="/jul/farglegg-nisse">Fargelegg nisse</Link>
```

**After:**
```tsx
<Link href={localizedPath('/jul/farglegg-nisse', params.locale)}>
  Fargelegg nisse
</Link>
```

**Or use next-intl's Link:**
```tsx
import { Link } from '@/navigation';

<Link href="/jul/farglegg-nisse">Fargelegg nisse</Link>
// Automatically adds locale prefix
```

**Files to Update:**
- All navigation components
- Footer components
- Breadcrumbs
- Card links to drawings/categories

**Status:** ⏳ To Do

---

### Step 8: Update Metadata Generation
**What:** Make metadata locale-aware

**Example:**

**Before:**
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const drawing = await client.fetch(QUERY, { slug: params.drawingSlug });
  return {
    title: drawing.title,
    description: drawing.description,
  };
}
```

**After:**
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const drawing = await client.fetch(QUERY, {
    slug: params.drawingSlug,
    language: params.locale
  });

  return {
    title: drawing.title,
    description: drawing.description,
    alternates: {
      canonical: `https://tegnogfarge.no/${params.locale}/${params.categorySlug}/${params.subcategorySlug}/${params.drawingSlug}`,
      languages: {
        'no': `https://tegnogfarge.no/no/...`,
        'sv': `https://tegnogfarge.no/sv/...`,
      },
    },
  };
}
```

**Status:** ⏳ To Do

---

### Step 9: Test Routing
**What:** Verify everything works

**Test Cases:**
1. ✅ `/` redirects to `/no`
2. ✅ `/jul/farglegg-nisse` redirects to `/no/jul/farglegg-nisse`
3. ✅ `/no/jul/farglegg-nisse` loads Norwegian content
4. ✅ `/sv/jul/farglaegg-tomte` loads Swedish content (if exists)
5. ✅ `/sv/jul/farglegg-nisse` shows 404 or fallback if no Swedish translation
6. ✅ `/dashboard` still works without locale prefix
7. ✅ All links work and include locale
8. ✅ Language switcher changes locale (Phase 5, but test structure)

**Status:** ⏳ To Do

---

## Important Notes

### What Phase 2 Does NOT Include:
- ❌ Creating Swedish translations (that's Phase 4)
- ❌ Language switcher UI (that's Phase 5)
- ❌ Hreflang tags (that's Phase 3)
- ❌ Translated metadata strings (that's Phase 3)

### What Phase 2 DOES Include:
- ✅ URL structure `/no/...` and `/sv/...`
- ✅ Routing that accepts locale param
- ✅ Queries that filter by language
- ✅ Locale-aware links

---

## Risk Assessment

### High Risk
- **Breaking existing URLs:**
  - Norwegian pages move from `/jul/farglegg-nisse` to `/no/jul/farglegg-nisse`
  - **Mitigation:** Middleware redirects will handle this automatically

### Medium Risk
- **404s on Swedish URLs:**
  - `/sv/...` routes will work, but return 404 if no Swedish content exists
  - **Mitigation:** Implement fallback to Norwegian in Step 6

### Low Risk
- **Admin routes:**
  - Dashboard needs to stay locale-free
  - **Mitigation:** Middleware explicitly excludes `/dashboard`

---

## Success Criteria

Phase 2 is complete when:
1. ✅ All Norwegian content accessible via `/no/...` URLs
2. ✅ All pages accept `locale` param
3. ✅ All queries filter by `language` field
4. ✅ Middleware redirects root paths to `/no`
5. ✅ No broken links in Norwegian version
6. ✅ Swedish URLs load (even if showing 404/fallback)
7. ✅ Admin routes still work without locale
8. ✅ Build completes without errors

---

## Execution Order

1. **Create config** (Step 1) - 5 minutes
2. **Create middleware** (Step 2) - 15 minutes
3. **Create [locale] directory** (Step 3) - 10 minutes
4. **Create locale layout** (Step 4) - 10 minutes
5. **Update page components** (Step 5) - 60 minutes (many files)
6. **Update queries** (Step 6) - 45 minutes
7. **Update links** (Step 7) - 60 minutes
8. **Update metadata** (Step 8) - 30 minutes
9. **Test everything** (Step 9) - 30 minutes

**Total Estimated Time:** 4-5 hours

---

## Next Steps After Phase 2

Once routing is working:
- **Phase 3:** Add hreflang tags and SEO metadata
- **Phase 4:** Create Swedish translations (via Studio UI or API script)
- **Phase 5:** Build language switcher component
- **Phase 6:** Testing and launch
