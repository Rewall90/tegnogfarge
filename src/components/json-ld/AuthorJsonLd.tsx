import { ProfilePage } from 'schema-dts';

const SITE_URL = 'https://www.tegnogfarge.no';
const AUTHOR_NAME = 'Petter'; 

export function AuthorJsonLd() {
  const profilePageSchema: ProfilePage = {
    '@type': 'ProfilePage',
    name: `Om ${AUTHOR_NAME}`,
    url: `${SITE_URL}/om-skribenten`,
    mainEntity: {
      '@type': 'Person',
      '@id': `${SITE_URL}/om-skribenten#person`,
      name: AUTHOR_NAME,
      url: `${SITE_URL}/om-skribenten`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema) }}
    />
  );
} 