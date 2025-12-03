export const categoryTranslations = {
  no: {
    breadcrumb: {
      ariaLabel: 'Brødsmulesti',
      backToHome: 'Tilbake til forsiden',
    },
    subcategories: {
      heading: 'Underkategorier',
    },
    subcategoryCard: {
      linkAriaLabel: 'Gå til {name} fargeleggingsark',
      difficulty: {
        unknown: 'Ukjent',
        easy: 'Enkel',
        medium: 'Middels',
        hard: 'Vanskelig',
      },
      drawingsCount: '{count} tegninger',
    },
    emptyState: {
      heading: 'Ingen underkategorier ennå',
      text: 'Det er ingen underkategorier tilgjengelig i denne kategorien for øyeblikket.',
    },
  },
  sv: {
    breadcrumb: {
      ariaLabel: 'Brödsmulor',
      backToHome: 'Tillbaka till startsidan',
    },
    subcategories: {
      heading: 'Underkategorier',
    },
    subcategoryCard: {
      linkAriaLabel: 'Gå till {name} målarbilder',
      difficulty: {
        unknown: 'Okänd',
        easy: 'Enkel',
        medium: 'Medel',
        hard: 'Svår',
      },
      drawingsCount: '{count} teckningar',
    },
    emptyState: {
      heading: 'Inga underkategorier ännu',
      text: 'Det finns inga underkategorier tillgängliga i denna kategori för tillfället.',
    },
  },
  de: {
    breadcrumb: {
      ariaLabel: 'Breadcrumb-Navigation',
      backToHome: 'Zurück zur Startseite',
    },
    subcategories: {
      heading: 'Unterkategorien',
    },
    subcategoryCard: {
      linkAriaLabel: 'Gehe zu {name} Ausmalbilder',
      difficulty: {
        unknown: 'Unbekannt',
        easy: 'Einfach',
        medium: 'Mittel',
        hard: 'Schwer',
      },
      drawingsCount: '{count} Zeichnungen',
    },
    emptyState: {
      heading: 'Noch keine Unterkategorien',
      text: 'Derzeit sind keine Unterkategorien in dieser Kategorie verfügbar.',
    },
  },
} as const;

export type Locale = keyof typeof categoryTranslations;

// Type for translations to be passed to components
export type CategoryTranslations = typeof categoryTranslations.no;
