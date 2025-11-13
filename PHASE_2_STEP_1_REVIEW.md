# Phase 2 - Step 1 Review: i18n Configuration

**File:** `src/i18n.ts`
**Date:** 2025-11-13
**Status:** ✅ APPROVED WITH RECOMMENDATIONS
**Reviewer:** Claude Code

---

## 📋 Overview

This file establishes the central i18n configuration for locale support in the Next.js application. It defines supported locales, type safety, and utility functions for working with locales.

---

## ✅ What's Correct

### 1. Locale Definition ✅
```typescript
export const locales = ['no', 'sv'] as const;
export type Locale = (typeof locales)[number];
```

**✅ CORRECT:**
- Matches Sanity CMS language values ('no', 'sv')
- Uses `as const` for proper type narrowing
- Creates a type-safe union type
- Prevents typos and invalid locale values

**Consistency Check:**
- ✅ Matches `sanity-studio/sanity.config.ts` language IDs
- ✅ Aligns with Phase 1 implementation

---

### 2. Default Locale ✅
```typescript
export const defaultLocale: Locale = 'no';
```

**✅ CORRECT:**
- Norwegian is the base language (original content)
- Type-safe (uses the Locale type)
- Follows i18n best practice (base language as default)

---

### 3. Locale Names ✅
```typescript
export const localeNames: Record<Locale, string> = {
  no: 'Norsk',
  sv: 'Svenska',
};
```

**✅ CORRECT:**
- Native language names (users see "Svenska" not "Swedish")
- Type-safe Record ensures all locales are covered
- Best practice for language switchers

---

### 4. Locale Flags ✅
```typescript
export const localeFlags: Record<Locale, string> = {
  no: '🇳🇴',
  sv: '🇸🇪',
};
```

**✅ CORRECT:**
- Proper flag emojis (Norway 🇳🇴, Sweden 🇸🇪)
- Type-safe Record
- Good for visual language identification

**Note:** Consider testing emoji rendering across browsers, especially older ones.

---

### 5. Validation Function ✅
```typescript
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
```

**✅ CORRECT:**
- Type guard function (`locale is Locale`)
- Runtime validation for user input
- Essential for URL parameters and route handling

**Use Cases:**
- Validating URL path segments (e.g., `/sv/...`)
- Checking query parameters
- Middleware locale detection

---

### 6. Display Name Helper ✅
```typescript
export function getLocaleDisplayName(locale: Locale): string {
  return `${localeFlags[locale]} ${localeNames[locale]}`;
}
```

**✅ CORRECT:**
- Combines flag + name for UI display
- Type-safe input
- Convenient for language switcher components

**Output Examples:**
- `getLocaleDisplayName('no')` → "🇳🇴 Norsk"
- `getLocaleDisplayName('sv')` → "🇸🇪 Svenska"

---

## 💡 Recommendations

### Optional Enhancement 1: Locale Paths
Consider adding path prefixes if using different URL structures:

```typescript
export const localePaths: Record<Locale, string> = {
  no: '',      // No prefix for default (/)
  sv: '/sv',   // Swedish prefix (/sv/...)
};
```

**Why:** Useful if Norwegian routes have no prefix but Swedish uses `/sv/`

**When to add:** After deciding on URL structure for Swedish content

---

### Optional Enhancement 2: Full Locale Codes (SEO)
Consider adding full BCP 47 locale codes for HTML lang attribute and hreflang:

```typescript
export const localeLanguageTags: Record<Locale, string> = {
  no: 'nb-NO',  // Norwegian Bokmål
  sv: 'sv-SE',  // Swedish - Sweden
};
```

**Why:**
- More specific for search engines
- Better for `<html lang="...">` attribute
- Required for proper hreflang tags

**Usage:**
```typescript
<html lang={localeLanguageTags[locale]}>
```

---

### Optional Enhancement 3: Locale Metadata (SEO)
Add SEO-related metadata per locale:

```typescript
export const localeMetadata: Record<Locale, {
  domain: string;
  currency: string;
  dateFormat: string;
}> = {
  no: {
    domain: 'tegnogfarge.no',
    currency: 'NOK',
    dateFormat: 'DD.MM.YYYY',
  },
  sv: {
    domain: 'tegnogfarge.no',  // Same domain for both
    currency: 'SEK',
    dateFormat: 'YYYY-MM-DD',
  },
};
```

**Why:** Useful for:
- Formatting dates per locale
- Currency display (if adding e-commerce)
- Canonical URL generation

---

### Optional Enhancement 4: Direction Support (Future)
If planning to support RTL languages later:

```typescript
export const localeDirection: Record<Locale, 'ltr' | 'rtl'> = {
  no: 'ltr',
  sv: 'ltr',
};
```

**Current Status:** Not needed for Norwegian/Swedish (both LTR)

---

## 🚨 Integration Requirements

### Required for Phase 2 (AI Translation):
This file is **ready to use** for the AI translation system. No changes needed for:
- Identifying source locale ('no')
- Identifying target locale ('sv')
- Type-safe locale handling in scripts

### Required for Next.js Routing (Future Phase):
This file provides the foundation, but you'll also need:

1. **next-intl configuration** (`src/i18n/request.ts`)
2. **Middleware** for locale detection (`src/middleware.ts`)
3. **Routing structure** (`app/[locale]/...`)
4. **Translation files** (`messages/no.json`, `messages/sv.json`)

---

## 🔍 Type Safety Verification

### Test Case 1: Valid Locale
```typescript
const locale: Locale = 'no';  // ✅ Compiles
const locale2: Locale = 'sv'; // ✅ Compiles
const locale3: Locale = 'en'; // ❌ Type error - 'en' not in union
```

### Test Case 2: Runtime Validation
```typescript
const userInput = 'sv';
if (isValidLocale(userInput)) {
  // TypeScript now knows userInput is Locale
  console.log(localeNames[userInput]); // ✅ Type-safe
}
```

### Test Case 3: Exhaustiveness Check
```typescript
function handleLocale(locale: Locale) {
  switch (locale) {
    case 'no':
      return 'Norwegian';
    case 'sv':
      return 'Swedish';
    // No default needed - TypeScript ensures all cases covered
  }
}
```

---

## 📊 Comparison with Sanity Configuration

| Aspect | Sanity (`sanity.config.ts`) | Next.js (`i18n.ts`) | Status |
|--------|----------------------------|---------------------|--------|
| Norwegian ID | `'no'` | `'no'` | ✅ MATCH |
| Swedish ID | `'sv'` | `'sv'` | ✅ MATCH |
| Norwegian Label | "Norwegian (Bokmål)" | "Norsk" | ✅ OK (different contexts) |
| Swedish Label | "Swedish" | "Svenska" | ✅ OK (native vs English) |
| Type Safety | Plugin-managed | Manual type guards | ✅ OK (different layers) |

**Consistency:** ✅ Perfect alignment with Sanity Phase 1 implementation

---

## 🎯 Testing Checklist

Before proceeding to Step 2:

- [x] ✅ File compiles without TypeScript errors
- [x] ✅ Locale IDs match Sanity configuration
- [x] ✅ Type inference works correctly
- [ ] ⏳ Import in AI translation script (Step 2)
- [ ] ⏳ Test `isValidLocale()` with various inputs
- [ ] ⏳ Test `getLocaleDisplayName()` output
- [ ] ⏳ Use in middleware (future step)
- [ ] ⏳ Use in routing structure (future step)

---

## ✅ Final Verdict

**Status:** ✅ **APPROVED**

**Quality:** Excellent - follows best practices and type safety

**Ready for:**
- ✅ AI translation system (Phase 2)
- ✅ Next.js routing setup (Future phase)
- ✅ Language switcher component (Future phase)

**Action Items:**
- None required - file is production-ready
- Optional enhancements can be added incrementally as needed

---

## 📝 Next Steps

### Immediate (Phase 2 - AI Translation):
1. Create OpenAI translation script
2. Import `Locale`, `locales`, `defaultLocale` from this file
3. Use type-safe locale handling in translation logic

### Future (Next.js Routing):
1. Create next-intl configuration file
2. Set up middleware using `locales` and `defaultLocale`
3. Restructure routes to `app/[locale]/...`
4. Create translation message files

---

## 🔗 Related Files

**Current:**
- ✅ `src/i18n.ts` (this file)

**Phase 1 (Sanity):**
- ✅ `sanity-studio/sanity.config.ts:19-21` (language definitions)
- ✅ `sanity-studio/schemas/drawingImage.ts:11` (language field)

**Future Phase (Next.js Routing):**
- ⏳ `src/i18n/request.ts` (next-intl config)
- ⏳ `src/middleware.ts` (locale detection)
- ⏳ `messages/no.json` (Norwegian UI strings)
- ⏳ `messages/sv.json` (Swedish UI strings)

---

**Reviewer Notes:** This is a solid foundation for both AI translation and future Next.js routing. The type safety and consistency with Sanity configuration are particularly well-done. No changes required to proceed with Phase 2 translation work.
