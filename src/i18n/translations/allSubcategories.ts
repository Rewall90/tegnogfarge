export const allSubcategoriesTranslations = {
  no: {
    metadata: {
      title: 'Alle Fargeleggingskategorier - TegnOgFarge.no',
      description: 'Utforsk alle våre fargeleggingskategorier for barn og voksne. Last ned gratis fargeleggingsark eller bruk vårt online fargeleggingsverktøy.',
    },
    breadcrumb: {
      backToHome: 'Tilbake til forsiden',
    },
    heading: 'Alle Fargeleggingskategorier',
    description: 'Utforsk alle våre fargeleggingskategorier for barn og voksne. Velg en kategori for å finne fargeleggingsark.',
    srOnly: {
      subcategories: 'Underkategorier',
    },
  },
  sv: {
    metadata: {
      title: 'Alla Målarkategorier - TegnOgFarge.no',
      description: 'Utforska alla våra målarkategorier för barn och vuxna. Ladda ner gratis målarbilder eller använd vårt online målarverktyg.',
    },
    breadcrumb: {
      backToHome: 'Tillbaka till startsidan',
    },
    heading: 'Alla Målarkategorier',
    description: 'Utforska alla våra målarkategorier för barn och vuxna. Välj en kategori för att hitta målarbilder.',
    srOnly: {
      subcategories: 'Underkategorier',
    },
  },
} as const;

export type AllSubcategoriesTranslations = typeof allSubcategoriesTranslations;
