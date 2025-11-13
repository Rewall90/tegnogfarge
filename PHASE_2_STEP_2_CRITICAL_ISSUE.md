# 🚨 CRITICAL ISSUE: Step 2 Middleware Implementation

**Status:** ❌ **BLOCKING** - Must fix before proceeding
**Severity:** HIGH - Will break all existing URLs and damage SEO
**Date:** 2025-11-13

---

## 🔴 The Problem

The current middleware implementation redirects **ALL** paths to include the `/no/` prefix:

```typescript
// Current behavior:
if (!pathnameHasLocale) {
  const newUrl = new URL(`/${defaultLocale}${pathname}`, request.url);
  return NextResponse.redirect(newUrl);
}
```

**What this does:**
```
/ → /no/
/jul/fargelegg-nisse → /no/jul/fargelegg-nisse
/fargelegg-mandala/blomster-i-rund-monster → /no/fargelegg-mandala/blomster-i-rund-monster
```

---

## ⚠️ Why This Is Critical

### 1. Breaks ALL Existing URLs ❌

Your site currently has **thousands** of indexed URLs in Google:
- `tegnogfarge.no/jul/fargelegg-nisse`
- `tegnogfarge.no/fargelegg-mandala/...`
- `tegnogfarge.no/vitenskap/...`

**After deployment:**
- All these URLs will redirect to `/no/...`
- Creates 301 redirects for EVERY page
- Google has to re-index everything
- Temporary rankings loss
- Link equity dilution

### 2. SEO Impact ❌

**Consequences:**
- Lost rankings (temporarily)
- Redirect chains (if combined with other redirects)
- Google treats redirected URLs differently
- May lose featured snippets
- Increased bounce rate if users hit old URLs

### 3. User Experience Impact ❌

**Broken:**
- User bookmarks (thousands of users)
- Social media shares
- Email links in newsletters
- Backlinks from other websites
- Printed materials with URLs

### 4. Not Following i18n Best Practices ❌

The standard approach for sites with existing content is:
- **Default locale:** NO PREFIX
- **Other locales:** WITH PREFIX

**Example:**
- Norwegian: `tegnogfarge.no/jul/fargelegg-nisse`
- Swedish: `tegnogfarge.no/sv/jul/fargelegg-nisse`

---

## ✅ The Correct Approach

### Pattern: "Prefix Except Default Locale"

This is the **standard pattern** for internationalizing existing sites:

```
Norwegian (default) → No prefix
  / → homepage
  /jul/fargelegg-nisse → Norwegian drawing
  /fargelegg-mandala → Norwegian category

Swedish → /sv/ prefix
  /sv → Swedish homepage
  /sv/jul/fargelegg-nisse → Swedish drawing
  /sv/fargelegg-mandala → Swedish category
```

---

## 🔧 Correct Middleware Implementation

### Option 1: Manual Implementation (Simple)

```typescript
// --- LOCALE ROUTING ---
const nonLocalizedRoutes = [
  '/dashboard',
  '/login',
  '/register',
  '/studio',
  '/verify-email',
  '/verify-newsletter',
  '/unsubscribe-confirmation',
  '/api',
];

const shouldSkipLocale =
  nonLocalizedRoutes.some(route => pathname.startsWith(route)) ||
  pathname.includes('.');

if (!shouldSkipLocale) {
  // Check if pathname starts with /sv/ (Swedish)
  const isSwedish = pathname.startsWith('/sv/') || pathname === '/sv';

  // If Swedish, let it through (it's already correctly prefixed)
  if (isSwedish) {
    return NextResponse.next();
  }

  // All other paths are Norwegian (no prefix needed)
  // Just continue - no redirect needed
  return NextResponse.next();
}

return NextResponse.next();
```

**Behavior:**
- `/` → Norwegian homepage (no redirect)
- `/jul/fargelegg-nisse` → Norwegian content (no redirect)
- `/sv` → Swedish homepage (passes through)
- `/sv/jul/fargelegg-nisse` → Swedish content (passes through)

---

### Option 2: Using next-intl (Recommended)

You have `next-intl@4.5.2` installed. Use their middleware:

**Step 1:** Create `src/i18n/request.ts`
```typescript
import {getRequestConfig} from 'next-intl/server';
import {locales} from '@/i18n';

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    return {
      locale: 'no',
      messages: {}
    };
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
```

**Step 2:** Update `middleware.ts`
```typescript
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';
import { NextRequest } from 'next/server';

// Create next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // ← KEY: No prefix for default locale
});

export async function middleware(request: NextRequest) {
  // --- CANONICAL DOMAIN REDIRECT (before locale) ---
  // [Keep existing canonical redirect code]

  // --- LOCALE ROUTING ---
  const { pathname } = request.nextUrl;

  // Skip locale logic for specific routes
  const nonLocalizedRoutes = [
    '/dashboard',
    '/login',
    '/register',
    '/studio',
    '/verify-email',
    '/verify-newsletter',
    '/unsubscribe-confirmation',
    '/api',
  ];

  if (nonLocalizedRoutes.some(route => pathname.startsWith(route))) {
    // [Continue with auth logic]
  }

  // Apply next-intl middleware for content routes
  const response = intlMiddleware(request);

  // [Continue with auth logic after]

  return response;
}
```

**Step 3:** Update `next.config.js`
```typescript
const nextConfig = {
  // ... existing config

  // IMPORTANT: Tell Next.js about i18n
  i18n: {
    locales: ['no', 'sv'],
    defaultLocale: 'no',
    localeDetection: false, // We control this in middleware
  },
};
```

---

## 🎯 Why "as-needed" Locale Prefix?

The `localePrefix: 'as-needed'` option in next-intl means:

```typescript
localePrefix: 'as-needed'
// Default locale (no) → NO prefix
// Other locales (sv) → WITH prefix
```

**Result:**
- Norwegian: `tegnogfarge.no/jul/fargelegg-nisse` ✅
- Swedish: `tegnogfarge.no/sv/jul/fargelegg-nisse` ✅

This preserves all existing URLs while adding Swedish support.

---

## 📊 Comparison Table

| URL Pattern | Current (Wrong) | Correct (as-needed) |
|-------------|----------------|---------------------|
| Norwegian homepage | `/` → redirects to `/no` ❌ | `/` → Norwegian ✅ |
| Norwegian drawing | `/jul/fargelegg-nisse` → redirects to `/no/jul/...` ❌ | `/jul/fargelegg-nisse` → Norwegian ✅ |
| Swedish homepage | `/sv` → passes through ⚠️ | `/sv` → Swedish ✅ |
| Swedish drawing | `/sv/jul/fargelegg-nisse` → passes through ⚠️ | `/sv/jul/fargelegg-nisse` → Swedish ✅ |
| Existing Google URLs | All break (301 redirect) ❌ | All work (no redirect) ✅ |
| User bookmarks | All break ❌ | All work ✅ |
| SEO impact | Negative (temporary loss) ❌ | Positive (no disruption) ✅ |

---

## 🚀 Routing Structure

With the correct approach, your app structure should be:

```
src/app/
  ├── (no-locale-routes)/
  │   ├── dashboard/
  │   ├── login/
  │   └── register/
  │
  ├── [locale]/                    ← All content routes
  │   ├── page.tsx                 ← Homepage
  │   ├── [categorySlug]/
  │   │   ├── page.tsx
  │   │   └── [subcategorySlug]/
  │   │       ├── page.tsx
  │   │       └── [drawingSlug]/
  │   │           └── page.tsx
  │   └── layout.tsx
  │
  └── layout.tsx
```

**URL Examples:**
```
Norwegian (no prefix):
  / → src/app/[locale]/page.tsx (locale='no')
  /jul/fargelegg-nisse → src/app/[locale]/[categorySlug]/page.tsx (locale='no')

Swedish (with /sv/ prefix):
  /sv → src/app/[locale]/page.tsx (locale='sv')
  /sv/jul/fargelegg-nisse → src/app/[locale]/[categorySlug]/page.tsx (locale='sv')
```

---

## 📝 What Needs to Change

### Immediate (Fix Middleware):
1. ❌ Remove redirect to `/no/...` for paths without locale
2. ✅ Keep Norwegian paths as-is (no prefix)
3. ✅ Only handle `/sv/...` paths for Swedish

### Phase 2 (AI Translation):
- Can proceed once middleware is fixed
- Swedish URLs will be `/sv/...`
- Norwegian URLs stay as-is

### Phase 3 (Routing Refactor):
- Move content routes under `[locale]` folder
- Update GROQ queries to accept locale parameter
- Test both `/` and `/sv/` paths

---

## ⚡ Quick Fix (Minimum Change)

If you want the absolute minimum change right now:

**Replace lines 129-141 in middleware.ts:**

```typescript
if (!shouldSkipLocale) {
  // Only handle Swedish paths - Norwegian needs no prefix
  const isSwedish = pathname.startsWith('/sv/') || pathname === '/sv';

  if (isSwedish) {
    // Swedish path - continue processing
    return NextResponse.next();
  }

  // Norwegian path (no prefix) - continue processing
  // DO NOT redirect to /no/ - this would break all existing URLs
  return NextResponse.next();
}
```

**This:**
- ✅ Keeps all Norwegian URLs working (no redirect)
- ✅ Allows Swedish URLs with `/sv/` prefix
- ✅ Preserves SEO
- ✅ Preserves bookmarks
- ⚠️ Still need to restructure app folder later

---

## 🎯 Action Required

**Before proceeding with Phase 2:**

1. **STOP** - Don't deploy current middleware to production
2. **FIX** - Implement "prefix except default" pattern
3. **TEST** - Verify Norwegian URLs work without redirect
4. **VERIFY** - Check `/sv/` paths work (even if 404 for now)
5. **THEN** - Proceed with AI translation

**Current Status:** ⛔ **BLOCKED** - Cannot proceed until fixed

---

## 📚 References

- [next-intl: Locale prefix strategies](https://next-intl-docs.vercel.app/docs/routing#locale-prefix)
- [Next.js i18n routing](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [Google i18n best practices](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)

---

**Recommendation:** Use next-intl's middleware with `localePrefix: 'as-needed'` for production-ready i18n handling.
