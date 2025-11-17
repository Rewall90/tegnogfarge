export const flagsTranslations = {
  no: {
    filters: {
      title: "Filtrer flagg",
      resetAll: "Nullstill alle filtre",
      search: {
        placeholder: "Søk etter land...",
        label: "Søk",
        noResults: "Ingen flagg funnet",
      },
      continent: {
        label: "Kontinent",
        all: "Alle kontinenter",
        options: {
          europe: "Europa",
          asia: "Asia",
          africa: "Afrika",
          northAmerica: "Nord-Amerika",
          southAmerica: "Sør-Amerika",
          oceania: "Oseania",
          antarctica: "Antarktis"
        }
      },
      colors: {
        label: "Farger på flagget",
        all: "Alle farger",
        options: {
          red: "Rød",
          blue: "Blå",
          white: "Hvit",
          black: "Svart",
          green: "Grønn",
          yellow: "Gul",
          orange: "Oransje"
        }
      },
      colorCount: {
        label: "Antall farger",
        all: "Alle",
        options: {
          "2": "2 farger",
          "3": "3 farger",
          "4": "4 eller flere"
        }
      },
      difficulty: {
        label: "Vanskelighetsgrad",
        all: "Alle",
        options: {
          easy: "Enkel",
          medium: "Middels",
          hard: "Vanskelig"
        }
      },
      region: {
        label: "Region",
        all: "Alle regioner"
      },
      hemisphere: {
        label: "Halvkule",
        all: "Alle halvkuler",
        options: {
          northern: "Nordlig",
          southern: "Sørlig",
          eastern: "Østlig",
          western: "Vestlig"
        }
      }
    },
    results: {
      showing: "Viser {{count}} flagg",
      showingFiltered: "Viser {{count}} av {{total}} flagg",
      noResults: "Ingen flagg samsvarer med dine filtre",
      tryDifferent: "Prøv å justere filtrene dine"
    },
    card: {
      viewDetails: "Se detaljer",
      downloadPdf: "Last ned PDF",
      continent: "Kontinent",
      colors: "Farger",
      difficulty: "Vanskelighetsgrad"
    }
  },
  sv: {
    filters: {
      title: "Filtrera flaggor",
      resetAll: "Återställ alla filter",
      search: {
        placeholder: "Sök efter land...",
        label: "Sök",
        noResults: "Inga flaggor hittades",
      },
      continent: {
        label: "Kontinent",
        all: "Alla kontinenter",
        options: {
          europe: "Europa",
          asia: "Asien",
          africa: "Afrika",
          northAmerica: "Nordamerika",
          southAmerica: "Sydamerika",
          oceania: "Oceanien",
          antarctica: "Antarktis"
        }
      },
      colors: {
        label: "Flaggans färger",
        all: "Alla färger",
        options: {
          red: "Röd",
          blue: "Blå",
          white: "Vit",
          black: "Svart",
          green: "Grön",
          yellow: "Gul",
          orange: "Orange"
        }
      },
      colorCount: {
        label: "Antal färger",
        all: "Alla",
        options: {
          "2": "2 färger",
          "3": "3 färger",
          "4": "4 eller fler"
        }
      },
      difficulty: {
        label: "Svårighetsgrad",
        all: "Alla",
        options: {
          easy: "Enkel",
          medium: "Medel",
          hard: "Svår"
        }
      },
      region: {
        label: "Region",
        all: "Alla regioner"
      },
      hemisphere: {
        label: "Halvklot",
        all: "Alla halvklot",
        options: {
          northern: "Norra",
          southern: "Södra",
          eastern: "Östra",
          western: "Västra"
        }
      }
    },
    results: {
      showing: "Visar {{count}} flaggor",
      showingFiltered: "Visar {{count}} av {{total}} flaggor",
      noResults: "Inga flaggor matchar dina filter",
      tryDifferent: "Försök justera dina filter"
    },
    card: {
      viewDetails: "Se detaljer",
      downloadPdf: "Ladda ner PDF",
      continent: "Kontinent",
      colors: "Färger",
      difficulty: "Svårighetsgrad"
    }
  }
} as const;

export type FlagsLocale = keyof typeof flagsTranslations;
