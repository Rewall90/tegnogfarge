import { STRUCTURED_DATA } from '@/lib/structured-data-constants';

interface GenericWebPageJsonLdProps {
  pageType: 'WebPage' | 'AboutPage' | 'ContactPage' | 'PrivacyPolicyPage';
  title: string;
  description: string;
  pathname: string;
}

export default function GenericWebPageJsonLd({
  pageType,
  title,
  description,
  pathname,
}: GenericWebPageJsonLdProps) {
  const baseUrl = STRUCTURED_DATA.ORGANIZATION.URL;
  const currentUrl = `${baseUrl}${pathname}`;

  const webPageData: { [key: string]: any } = {
    '@type': pageType,
    '@id': currentUrl,
    url: currentUrl,
    inLanguage: STRUCTURED_DATA.SITE.LANGUAGE,
    name: title,
    description: description,
    isPartOf: {
      '@id': `${baseUrl}/#website`,
    },
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
    license: STRUCTURED_DATA.LEGAL.LICENSE_URL,
  };

  // For the AboutPage, explicitly state that the main entity is the organization
  if (pageType === 'AboutPage') {
    webPageData.mainEntity = {
      '@id': `${baseUrl}/#organization`,
    };
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [webPageData],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
} 