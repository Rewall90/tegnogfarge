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
  }
} as const;

export type HeaderTranslations = typeof headerTranslations;
