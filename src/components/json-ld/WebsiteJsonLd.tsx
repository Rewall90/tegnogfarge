import { WebSite } from 'schema-dts';

const SITE_URL = 'https://www.tegnogfarge.no';
const SITE_NAME = 'Tegn og Farge';
const PUBLISHER_LOGO_URL = `${SITE_URL}/favicon/tegnogfarge-favicon.svg`;

export function WebsiteJsonLd() {
  const websiteSchema: WebSite = {
    '@type': 'WebSite',
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: PUBLISHER_LOGO_URL,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`
      },
      query: 'search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
    />
  );
} 