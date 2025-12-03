export const subcategoryTranslations = {
  no: {
    breadcrumb: {
      ariaLabel: 'Brødsmulesti',
      home: 'Hjem',
    },
    relatedSubcategories: {
      heading: 'Relaterte underkategorier i {category}',
    },
  },
  sv: {
    breadcrumb: {
      ariaLabel: 'Brödsmulor',
      home: 'Hem',
    },
    relatedSubcategories: {
      heading: 'Relaterade underkategorier i {category}',
    },
  },
  de: {
    breadcrumb: {
      ariaLabel: 'Breadcrumb-Navigation',
      home: 'Startseite',
    },
    relatedSubcategories: {
      heading: 'Verwandte Unterkategorien in {category}',
    },
  },
} as const;

export type Locale = keyof typeof subcategoryTranslations;

// Type for translations to be passed to components
export type SubcategoryTranslations = typeof subcategoryTranslations.no;
