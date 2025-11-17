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
} as const;

export type SidebarListingsLocale = keyof typeof sidebarListingsTranslations;
