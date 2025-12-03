export const headerTranslations = {
  no: {
    coloringPages: 'Fargeleggingsark',
    categories: 'Kategorier',
    aboutUs: 'Om Oss',
    logoAlt: 'TegnOgFarge.no Logo',
    mainNav: 'Hovednavigasjon',
    toHomepage: 'Til forsiden'
  },
  sv: {
    coloringPages: 'Målarbilder',
    categories: 'Kategorier',
    aboutUs: 'Om Oss',
    logoAlt: 'TegnOgFarge.no Logotyp',
    mainNav: 'Huvudnavigering',
    toHomepage: 'Till startsidan'
  },
  de: {
    coloringPages: 'Ausmalbilder',
    categories: 'Kategorien',
    aboutUs: 'Über Uns',
    logoAlt: 'TegnOgFarge.no Logo',
    mainNav: 'Hauptnavigation',
    toHomepage: 'Zur Startseite'
  }
} as const;

export type HeaderTranslations = typeof headerTranslations;
