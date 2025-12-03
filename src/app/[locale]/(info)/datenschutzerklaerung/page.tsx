import Link from 'next/link';
import PageLayout from '@/components/shared/PageLayout';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import GenericWebPageJsonLd from '@/components/json-ld/GenericWebPageJsonLd';
import { buildAlternates, getLocaleConfig } from '@/lib/seo-utils';
import type { Locale } from '@/i18n';
import { privacyTranslations } from '@/i18n/translations/privacy';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;

  // Redirect non-German to their respective URLs
  if (locale === 'no') {
    return {};
  }
  if (locale === 'sv') {
    return {};
  }

  const t = privacyTranslations[locale as Locale] || privacyTranslations.de;
  const pathname = '/datenschutzerklaerung';
  const alternates = buildAlternates(pathname, locale as Locale);
  const localeConfig = getLocaleConfig(locale as Locale);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tegnogfarge.no';

  return {
    title: t.metadata.title,
    description: t.metadata.description,
    keywords: t.metadata.keywords,
    metadataBase: new URL(baseUrl),
    alternates,
    openGraph: {
      title: t.metadata.title,
      description: t.metadata.description,
      url: alternates.canonical,
      siteName: 'TegnOgFarge.no',
      locale: localeConfig.ogLocale,
      alternateLocale: localeConfig.ogAlternate,
      type: 'website',
    },
    other: {
      'privacy-policy': `${baseUrl}/datenschutzerklaerung`,
      'cookie-policy': `${baseUrl}/datenschutzerklaerung`,
    },
  };
}

export default async function DatenschutzerklaerungPage({ params }: PageProps) {
  const { locale } = await params;

  // Redirect non-German users to their respective URLs
  if (locale === 'no') {
    redirect('/personvernerklaering');
  }
  if (locale === 'sv') {
    redirect('/sv/sekretesspolicy');
  }

  const t = privacyTranslations[locale as Locale] || privacyTranslations.de;

  const breadcrumbItems = [
    { label: t.breadcrumb.home, href: `/${locale}` },
    { label: t.breadcrumb.privacy, href: `/${locale}/datenschutzerklaerung`, active: true }
  ];

  return (
    <PageLayout wrapperClassName="bg-[#FEFAF6]">
      <GenericWebPageJsonLd
        pageType="PrivacyPolicyPage"
        title={t.metadata.title}
        description={t.metadata.description}
        pathname="/datenschutzerklaerung"
      />

      {/* Enhanced JSON-LD for Privacy Compliance */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": t.heading,
            "description": t.metadata.description,
            "url": "https://tegnogfarge.no/de/datenschutzerklaerung",
            "lastReviewed": "2024-12-12",
            "about": [
              {
                "@type": "Thing",
                "name": "GDPR Compliance",
                "description": "EU General Data Protection Regulation compliance"
              },
              {
                "@type": "Thing",
                "name": "Cookie Consent",
                "description": "User consent management for information cookies"
              },
              {
                "@type": "Thing",
                "name": "German Privacy Law",
                "description": "Compliance with German data protection regulations"
              }
            ]
          })
        }}
      />
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} ariaLabel={t.breadcrumb.ariaLabel} />
        <div>
          <h1 className="text-heading text-[#264653] font-bold mb-4">{t.heading}</h1>
          <p className="text-lg text-gray-600 mb-6">{t.lastUpdated}</p>
          <p className="text-lg text-gray-600 mb-4">{t.intro.paragraph1}</p>
          <p className="text-lg text-gray-600 mb-8">{t.intro.paragraph2}</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.definitions.heading}</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
            {t.definitions.items.map((item, index) => (
              <li key={index}><strong>{item.term}</strong> {item.description}</li>
            ))}
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.dataCollection.heading}</h2>
          <p className="text-lg text-gray-700 font-semibold mb-2">{t.dataCollection.personalData.title}</p>
          <p className="text-lg text-gray-600 mb-4">{t.dataCollection.personalData.intro}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
            {t.dataCollection.personalData.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <p className="text-lg text-gray-700 font-semibold mt-4 mb-2">{t.dataCollection.usageData.title}</p>
          <p className="text-lg text-gray-600 mb-4">{t.dataCollection.usageData.intro}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
            {t.dataCollection.usageData.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <p className="text-lg text-gray-700 font-semibold mt-4 mb-2">{t.dataCollection.cookies.title}</p>
          <p className="text-lg text-gray-600 mb-4">{t.dataCollection.cookies.intro}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
            {t.dataCollection.cookies.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <p className="text-lg text-gray-600 mt-4">{t.dataCollection.cookies.note}</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.dataUsage.heading}</h2>
          <p className="text-lg text-gray-600 mb-4">{t.dataUsage.intro}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
            {t.dataUsage.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <p className="text-lg text-gray-600 mt-4">{t.dataUsage.note}</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.dataSharing.heading}</h2>
          <p className="text-lg text-gray-600 mb-4">{t.dataSharing.intro}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
            {t.dataSharing.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <p className="text-lg text-gray-600 mt-4">{t.dataSharing.note}</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.dataRetention.heading}</h2>
          <p className="text-lg text-gray-600">{t.dataRetention.content}</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.dataLocation.heading}</h2>
          <p className="text-lg text-gray-600">{t.dataLocation.content}</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.userRights.heading}</h2>
          <p className="text-lg text-gray-600 mb-4">{t.userRights.intro}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
            {t.userRights.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <p className="text-lg text-gray-600 mt-4">{t.userRights.note}</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.children.heading}</h2>
          <p className="text-lg text-gray-600">{t.children.content}</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.externalLinks.heading}</h2>
          <p className="text-lg text-gray-600">{t.externalLinks.content}</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.policyChanges.heading}</h2>
          <p className="text-lg text-gray-600">{t.policyChanges.content}</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.consentManagement.heading}</h2>
          <p className="text-lg text-gray-600 mb-4">
            {t.consentManagement.paragraph1}
          </p>
          <p className="text-lg text-gray-600 mb-4">
            {t.consentManagement.paragraph2}
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.mobileApp.mainHeading}</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-[#264653]">{t.mobileApp.intro.heading}</h3>
          <p className="text-lg text-gray-600 mb-4">{t.mobileApp.intro.content}</p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-[#264653]">{t.mobileApp.dataCollected.heading}</h3>
          <p className="text-lg text-gray-700 font-semibold mb-2">{t.mobileApp.dataCollected.photoLibrary.title}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg mb-4">
            {t.mobileApp.dataCollected.photoLibrary.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-[#264653]">{t.mobileApp.dataNotCollected.heading}</h3>
          <p className="text-lg text-gray-600 mb-4">{t.mobileApp.dataNotCollected.intro}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg mb-4">
            {t.mobileApp.dataNotCollected.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-[#264653]">{t.mobileApp.dataUsage.heading}</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg mb-4">
            {t.mobileApp.dataUsage.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-[#264653]">{t.mobileApp.permissions.heading}</h3>
          <p className="text-lg text-gray-700 font-semibold mb-2">{t.mobileApp.permissions.photoLibrary.title}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg mb-4">
            {t.mobileApp.permissions.photoLibrary.items.map((item, index) => (
              <li key={index}><strong>{item.label}</strong> {item.text}</li>
            ))}
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-[#264653]">{t.mobileApp.offline.heading}</h3>
          <p className="text-lg text-gray-600 mb-4">{t.mobileApp.offline.intro}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg mb-4">
            {t.mobileApp.offline.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-[#264653]">{t.mobileApp.childPrivacy.heading}</h3>
          <p className="text-lg text-gray-600 mb-4">{t.mobileApp.childPrivacy.intro}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg mb-4">
            {t.mobileApp.childPrivacy.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-[#264653]">{t.mobileApp.policyChanges.heading}</h3>
          <p className="text-lg text-gray-600 mb-4">{t.mobileApp.policyChanges.content}</p>
          <p className="text-lg text-gray-600 mb-6"><strong>{t.mobileApp.policyChanges.lastUpdated}</strong></p>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.contact.heading}</h2>
          <p className="text-lg text-gray-600">{t.contact.text} <Link href={`/${locale}/kontakt`} className="text-link-orange hover:underline">{t.contact.linkText}</Link>{t.contact.suffix}</p>

        </div>
      </div>
    </PageLayout>
  );
}
