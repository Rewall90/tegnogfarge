// Central i18n configuration for locale support
// Defines supported locales, default locale, and locale metadata

export const locales = ['no', 'sv', 'de'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'no';

export const localeNames: Record<Locale, string> = {
  no: 'Norsk',
  sv: 'Svenska',
  de: 'Deutsch',
};

export const localeFlags: Record<Locale, string> = {
  no: '🇳🇴',
  sv: '🇸🇪',
  de: '🇩🇪',
};

// Validate if a string is a valid locale
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// Get locale name with flag
export function getLocaleDisplayName(locale: Locale): string {
  return `${localeFlags[locale]} ${localeNames[locale]}`;
}
