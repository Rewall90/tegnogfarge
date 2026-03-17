/**
 * Constants for structured data (JSON-LD)
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tegnogfarge.no';

export const STRUCTURED_DATA = {
  // Organization details
  ORGANIZATION: {
    NAME: "Tegn og Farge",
    URL: BASE_URL,
    LOGO: `${BASE_URL}/icon.svg`
  },
  
  // Legal information
  LEGAL: {
    LICENSE_URL: `${BASE_URL}/lisensieringspolicy`,
    COPYRIGHT: "© Tegn og Farge"
  },
  
  // Author information
  AUTHOR: {
    NAME: "Tegn og Farge",
    URL: `${BASE_URL}/om-skribenten`
  },
  
  // Site metadata
  SITE: {
    NAME: "TegnOgFarge.no",
    DESCRIPTION: "Fargeleggingsark for barn og voksne",
    LANGUAGE: "nb-NO",
    LOCALE_CONFIG: {
      no: {
        inLanguage: 'nb-NO',
        description: 'Fargeleggingsark for barn og voksne',
      },
      sv: {
        inLanguage: 'sv-SE',
        description: 'Målarbilder för barn och vuxna',
      },
      de: {
        inLanguage: 'de-DE',
        description: 'Ausmalbilder für Kinder und Erwachsene',
      },
    } as Record<string, { inLanguage: string; description: string }>,
  },
  
  // Search configuration
  SEARCH: {
    ENDPOINT: `${BASE_URL}/search?q={search_term_string}`,
    QUERY_PARAM: "search_term_string"
  },
  
  // Page types
  PAGE_TYPES: {
    DRAWING: "CreativeWork",
    COLLECTION: "CollectionPage",
    CATEGORY: "CollectionPage",
    SUBCATEGORY: "CollectionPage"
  },
  
  // Schema types
  SCHEMA_TYPES: {
    BREADCRUMB: "BreadcrumbList",
    LIST_ITEM: "ListItem",
    ORGANIZATION: "Organization",
    WEBSITE: "WebSite"
  }
}; 