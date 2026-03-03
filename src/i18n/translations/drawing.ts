export const drawingTranslations = {
  no: {
    metadata: {
      titlePrefix: 'Fargelegg',
      titleSuffix: 'TegnOgFarge.no',
      descriptionFallback: 'fra kategorien',
      notFound: 'Tegning ikke funnet',
      fallbackTitle: 'Fargeleggingsbilde',
    },
    breadcrumb: {
      ariaLabel: 'Brødsmulesti',
      home: 'Forsiden',
    },
    difficulty: {
      easy: 'Enkel',
      medium: 'Middels',
      hard: 'Vanskelig',
    },
    ageRange: {
      '3-5': '3-5 år',
      '6-8': '6-8 år',
      '9-12': '9-12 år',
      '12+': 'Over 12 år',
      'all': 'Alle aldre',
    },
    unknownCategory: 'Ukjent',
  },
  sv: {
    metadata: {
      titlePrefix: 'Färglägg',
      titleSuffix: 'TegnOgFarge.no',
      descriptionFallback: 'från kategorin',
      notFound: 'Teckning hittades inte',
      fallbackTitle: 'Målarbild',
    },
    breadcrumb: {
      ariaLabel: 'Brödsmulor',
      home: 'Hem',
    },
    difficulty: {
      easy: 'Enkel',
      medium: 'Medel',
      hard: 'Svår',
    },
    ageRange: {
      '3-5': '3-5 år',
      '6-8': '6-8 år',
      '9-12': '9-12 år',
      '12+': 'Över 12 år',
      'all': 'Alla åldrar',
    },
    unknownCategory: 'Okänd',
  },
  de: {
    metadata: {
      titlePrefix: 'Ausmalbild',
      titleSuffix: 'TegnOgFarge.no',
      descriptionFallback: 'aus der Kategorie',
      notFound: 'Zeichnung nicht gefunden',
      fallbackTitle: 'Ausmalbild',
    },
    breadcrumb: {
      ariaLabel: 'Breadcrumb-Navigation',
      home: 'Startseite',
    },
    difficulty: {
      easy: 'Einfach',
      medium: 'Mittel',
      hard: 'Schwer',
    },
    ageRange: {
      '3-5': '3-5 Jahre',
      '6-8': '6-8 Jahre',
      '9-12': '9-12 Jahre',
      '12+': 'Über 12 Jahre',
      'all': 'Alle Altersgruppen',
    },
    unknownCategory: 'Unbekannt',
  },
} as const;

export type Locale = keyof typeof drawingTranslations;

export type DrawingTranslations = typeof drawingTranslations.no;
