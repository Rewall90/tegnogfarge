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
    NAME: "Fargelegg Nå",
    DESCRIPTION: "Fargeleggingsark for barn og voksne",
    LANGUAGE: "nb-NO"
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