export const sidebarListingsTranslations = {
  no: {
    trending: 'Trending Fargeleggingsark',
    popular: 'Populære Fargeleggingsark',
    newest: 'Nyeste Fargeleggingsark',
  },
  sv: {
    trending: 'Populära Målarbilder',
    popular: 'Mest Populära Målarbilder',
    newest: 'Nyaste Målarbilder',
  },
  de: {
    trending: 'Beliebte Ausmalbilder',
    popular: 'Beliebteste Ausmalbilder',
    newest: 'Neueste Ausmalbilder',
  },
} as const;

export type SidebarListingsLocale = keyof typeof sidebarListingsTranslations;
