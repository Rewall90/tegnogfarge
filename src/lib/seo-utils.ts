/**
 * SEO Utilities for Multilingual Site
 * Handles hreflang and canonical URL generation
 */

import { locales, defaultLocale, type Locale } from '@/i18n';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tegnogfarge.no';

/**
 * Get locale-specific configuration for SEO metadata
 * Returns language codes and labels for structured data and OpenGraph
 */
export function getLocaleConfig(locale: Locale) {
  return {
    // For JSON-LD structured data (ISO 639-1 + ISO 3166-1)
    inLanguage: locale === 'sv' ? 'sv-SE' : 'nb-NO',
    // For OpenGraph (uses underscore instead of hyphen)
    ogLocale: locale === 'sv' ? 'sv_SE' : 'nb_NO',
    // For OpenGraph alternate locales
    ogAlternate: locale === 'sv' ? ['nb_NO'] : ['sv_SE'],
    // UI labels
    homeLabel: locale === 'sv' ? 'Hem' : 'Hjem',
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
  const pathWithoutLocale = cleanPath.replace(/^\/(no|sv)/, '');

  const hreflangUrls: Record<string, string> = {};

  for (const locale of locales) {
    if (locale === defaultLocale) {
      // Norwegian (default) - no locale prefix
      hreflangUrls[locale] = `${baseUrl}${pathWithoutLocale}`;
    } else {
      // Other locales - add locale prefix
      hreflangUrls[locale] = `${baseUrl}/${locale}${pathWithoutLocale}`;
    }
  }

  // Add x-default pointing to default locale (Norwegian)
  hreflangUrls['x-default'] = `${baseUrl}${pathWithoutLocale}`;

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
  const pathWithoutLocale = cleanPath.replace(/^\/(no|sv)/, '');

  if (locale === defaultLocale) {
    return `${baseUrl}${pathWithoutLocale}`;
  }

  return `${baseUrl}/${locale}${pathWithoutLocale}`;
}

/**
 * Build alternates object for Next.js metadata
 *
 * @param pathname - The path without locale prefix (e.g., "/jul/nisse")
 * @param locale - Current page locale
 * @returns Alternates object for Next.js metadata API with x-default support
 */
export function buildAlternates(pathname: string, locale: Locale = defaultLocale) {
  const hreflangUrls = generateHreflangUrls(pathname, locale);
  const canonical = generateCanonicalUrl(pathname, locale);

  // Extract language URLs (including x-default for Next.js 14+)
  const languages: Record<string, string> = {};
  for (const [lang, url] of Object.entries(hreflangUrls)) {
    languages[lang] = url;
  }

  return {
    canonical,
    languages,
  };
}
