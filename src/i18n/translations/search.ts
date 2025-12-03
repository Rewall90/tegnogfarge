export const searchTranslations = {
  no: {
    label: 'Search for coloring pages',
    placeholder: 'Søk etter fargeleggingsark...',
    loading: 'Laster...',
    noResults: 'Ingen resultater funnet.',
  },
  sv: {
    label: 'Sök efter målarbilder',
    placeholder: 'Sök efter målarbilder...',
    loading: 'Laddar...',
    noResults: 'Inga resultat hittades.',
  },
  de: {
    label: 'Nach Ausmalbildern suchen',
    placeholder: 'Nach Ausmalbildern suchen...',
    loading: 'Lädt...',
    noResults: 'Keine Ergebnisse gefunden.',
  },
} as const;

export type SearchLocale = keyof typeof searchTranslations;
