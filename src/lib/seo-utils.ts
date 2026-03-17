/**
 * SEO Utilities for Multilingual Site
 * Handles hreflang and canonical URL generation
 */

import { locales, defaultLocale, type Locale } from '@/i18n';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tegnogfarge.no';

/**
 * ISO 639-1 language code mapping for hreflang attributes
 * Maps internal locale codes to proper ISO 639-1 codes for SEO
 * Internal 'no' → External 'nb' (Norwegian Bokmål) for Google compliance
 */
const hreflangMapping: Record<Locale, string> = {
  no: 'nb',  // Norwegian Bokmål (ISO 639-1 compliant)
  sv: 'sv',  // Swedish (already correct)
  de: 'de',  // German (already correct)
};

/**
 * URL slug mapping for static pages across locales.
 * Bidirectional: keyed by EVERY locale's slug so lookups work
 * regardless of which locale's page calls buildAlternates().
 * Sources: footer.ts translations + static route definitions
 */
const urlSlugMapping: Record<string, Record<Locale, string>> = {};

// Define slug groups — each group links one page across all 3 locales
const slugGroups: Record<Locale, string>[] = [
  { no: '/alle-underkategorier', sv: '/alla-underkategorier', de: '/alle-unterkategorien' },
  { no: '/hoved-kategori', sv: '/huvudkategori', de: '/hauptkategorie' },
  { no: '/om-skribenten', sv: '/om-forfattaren', de: '/ueber-den-autor' },
  { no: '/vilkar-og-betingelser', sv: '/villkor-och-bestammelser', de: '/allgemeine-geschaeftsbedingungen' },
  { no: '/personvernerklaering', sv: '/sekretesspolicy', de: '/datenschutzerklaerung' },
  { no: '/lisensieringspolicy', sv: '/licenspolicy', de: '/lizenzrichtlinien' },
  { no: '/fjerning-av-innhold', sv: '/borttagning-av-innehall', de: '/entfernung-von-inhalten' },
  { no: '/om-oss', sv: '/om-oss', de: '/ueber-uns' },
  { no: '/kontakt', sv: '/kontakt', de: '/kontakt' },
];

// Build bidirectional mapping: every slug variant maps to the full group
for (const group of slugGroups) {
  const slugs = new Set(Object.values(group));
  for (const slug of slugs) {
    urlSlugMapping[slug] = group;
  }
}

/**
 * Get locale-specific configuration for SEO metadata
 * Returns language codes and labels for structured data and OpenGraph
 */
export function getLocaleConfig(locale: Locale) {
  return {
    // For JSON-LD structured data (ISO 639-1 + ISO 3166-1)
    inLanguage: locale === 'sv' ? 'sv-SE' : locale === 'de' ? 'de-DE' : 'nb-NO',
    // For OpenGraph (uses underscore instead of hyphen)
    ogLocale: locale === 'sv' ? 'sv_SE' : locale === 'de' ? 'de_DE' : 'nb_NO',
    // For OpenGraph alternate locales
    ogAlternate: locale === 'sv' ? ['nb_NO', 'de_DE'] : locale === 'de' ? ['nb_NO', 'sv_SE'] : ['sv_SE', 'de_DE'],
    // UI labels
    homeLabel: locale === 'sv' ? 'Hem' : locale === 'de' ? 'Startseite' : 'Hjem',
  };
}

/**
 * Generate hreflang alternate links for a given path
 *
 * @param pathname - The path without locale prefix (e.g., "/jul/nisse")
 * @param currentLocale - Current page locale
 * @returns Object with hreflang URLs for all locales
 */
export function generateHreflangUrls(pathname: string, currentLocale: Locale = defaultLocale) {
  // Ensure pathname starts with /
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;

  // Remove any existing locale prefix from pathname
  const pathWithoutLocale = cleanPath.replace(/^\/(no|sv|de)/, '');

  const hreflangUrls: Record<string, string> = {};

  for (const locale of locales) {
    // Check if this path has a locale-specific slug mapping
    const localizedPath = urlSlugMapping[pathWithoutLocale]?.[locale] || pathWithoutLocale;

    // Use ISO 639-1 compliant language code for hreflang attribute
    const hreflangCode = hreflangMapping[locale];

    if (locale === defaultLocale) {
      // Norwegian (default) - no locale prefix
      hreflangUrls[hreflangCode] = `${baseUrl}${localizedPath}`;
    } else {
      // Other locales - add locale prefix
      hreflangUrls[hreflangCode] = `${baseUrl}/${locale}${localizedPath}`;
    }
  }

  // Add x-default pointing to default locale (Norwegian)
  const defaultPath = urlSlugMapping[pathWithoutLocale]?.no || pathWithoutLocale;
  hreflangUrls['x-default'] = `${baseUrl}${defaultPath}`;

  return hreflangUrls;
}

/**
 * Generate canonical URL for current page
 *
 * @param pathname - The path without locale prefix (e.g., "/jul/nisse")
 * @param locale - Current page locale
 * @returns Canonical URL
 */
export function generateCanonicalUrl(pathname: string, locale: Locale = defaultLocale): string {
  // Ensure pathname starts with /
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;

  // Remove any existing locale prefix from pathname
  const pathWithoutLocale = cleanPath.replace(/^\/(no|sv|de)/, '');

  // Check if this path has a locale-specific slug mapping
  const localizedPath = urlSlugMapping[pathWithoutLocale]?.[locale] || pathWithoutLocale;

  if (locale === defaultLocale) {
    return `${baseUrl}${localizedPath}`;
  }

  return `${baseUrl}/${locale}${localizedPath}`;
}

/**
 * Build alternates object for Next.js metadata
 *
 * @param pathname - The path without locale prefix (e.g., "/jul/nisse")
 * @param locale - Current page locale
 * @param translatedPaths - Optional locale-specific full paths for dynamic content (e.g., { no: '/dyr', sv: '/djur', de: '/ausmalbilder-tiere' })
 * @returns Alternates object for Next.js metadata API with x-default support
 */
export function buildAlternates(
  pathname: string,
  locale: Locale = defaultLocale,
  translatedPaths?: { no?: string; sv?: string; de?: string }
) {
  if (translatedPaths) {
    // Use translated paths for dynamic content pages (categories, subcategories, drawings)
    const languages: Record<string, string> = {};

    if (translatedPaths.no) {
      languages['nb'] = `${baseUrl}${translatedPaths.no}`;
      languages['x-default'] = `${baseUrl}${translatedPaths.no}`;
    }
    if (translatedPaths.sv) {
      languages['sv'] = `${baseUrl}/sv${translatedPaths.sv}`;
    }
    if (translatedPaths.de) {
      languages['de'] = `${baseUrl}/de${translatedPaths.de}`;
    }

    // Generate canonical for current locale
    let canonical: string;
    if (locale === 'no' && translatedPaths.no) {
      canonical = `${baseUrl}${translatedPaths.no}`;
    } else if (locale === 'sv' && translatedPaths.sv) {
      canonical = `${baseUrl}/sv${translatedPaths.sv}`;
    } else if (locale === 'de' && translatedPaths.de) {
      canonical = `${baseUrl}/de${translatedPaths.de}`;
    } else {
      canonical = generateCanonicalUrl(pathname, locale);
    }

    return { canonical, languages };
  }

  // Fall back to static slug mapping for static pages
  const hreflangUrls = generateHreflangUrls(pathname, locale);
  const canonical = generateCanonicalUrl(pathname, locale);

  const languages: Record<string, string> = {};
  for (const [lang, url] of Object.entries(hreflangUrls)) {
    languages[lang] = url;
  }

  return {
    canonical,
    languages,
  };
}
