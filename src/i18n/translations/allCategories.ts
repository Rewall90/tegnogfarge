export const allCategoriesTranslations = {
  no: {
    metadata: {
      title: 'Alle Kategorier - TegnOgFarge.no',
      description: 'Utforsk alle våre fargeleggingskategorier for barn og voksne. Velg en kategori for å finne fargeleggingsark.',
    },
    breadcrumb: {
      backToHome: 'Tilbake til forsiden',
    },
    heading: 'Alle Kategorier',
    description: 'Utforsk alle våre fargeleggingskategorier for barn og voksne. Velg en kategori for å finne fargeleggingsark.',
  },
  sv: {
    metadata: {
      title: 'Alla Kategorier - TegnOgFarge.no',
      description: 'Utforska alla våra målarkategorier för barn och vuxna. Välj en kategori för att hitta målarbilder.',
    },
    breadcrumb: {
      backToHome: 'Tillbaka till startsidan',
    },
    heading: 'Alla Kategorier',
    description: 'Utforska alla våra målarkategorier för barn och vuxna. Välj en kategori för att hitta målarbilder.',
  },
} as const;

export type AllCategoriesTranslations = typeof allCategoriesTranslations;
