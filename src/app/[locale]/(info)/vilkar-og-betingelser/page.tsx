import Link from 'next/link';
import PageLayout from '@/components/shared/PageLayout';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import GenericWebPageJsonLd from '@/components/json-ld/GenericWebPageJsonLd';
import { buildAlternates, getLocaleConfig } from '@/lib/seo-utils';
import type { Locale } from '@/i18n';
import { termsTranslations } from '@/i18n/translations/terms';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = termsTranslations[locale as Locale] || termsTranslations.no;
  const pathname = '/vilkar-og-betingelser';
  const alternates = buildAlternates(pathname, locale as Locale);
  const localeConfig = getLocaleConfig(locale as Locale);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tegnogfarge.no';

  return {
    title: t.metadata.title,
    description: t.metadata.description,
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
  };
}

export default async function TermsAndConditionsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = termsTranslations[locale as Locale] || termsTranslations.no;

  const breadcrumbItems = [
    { label: t.breadcrumb.home, href: locale === 'no' ? '/' : `/${locale}` },
    { label: t.breadcrumb.terms, href: locale === 'no' ? '/vilkar-og-betingelser' : `/${locale}/vilkar-og-betingelser`, active: true }
  ];

  return (
    <PageLayout wrapperClassName="bg-[#FEFAF6]">
      <GenericWebPageJsonLd
        pageType="WebPage"
        title={t.metadata.title}
        description={t.metadata.description}
        pathname="/vilkar-og-betingelser"
      />
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <div>
            <h1 className="text-heading text-[#264653] font-bold mb-4">{t.heading}</h1>
            <p className="text-lg text-gray-600 mb-8">
                {t.intro}
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.sections.usage.heading}</h2>
            <p className="text-lg text-gray-600 mb-4">
                {t.sections.usage.paragraph1}
            </p>
            <p className="text-lg text-gray-700 mb-4">{t.sections.usage.paragraph2}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
                {t.sections.usage.prohibited.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.sections.copyright.heading}</h2>
            <p className="text-lg text-gray-600 mb-8">
                {t.sections.copyright.content}
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.sections.allowedSharing.heading}</h2>
            <p className="text-lg text-gray-600 mb-8">
                {t.sections.allowedSharing.content}
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.sections.subscription.heading}</h2>
            <p className="text-lg text-gray-600 mb-8">
                {t.sections.subscription.content}
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.sections.prohibited.heading}</h2>
            <p className="text-lg text-gray-700 mb-4">{t.sections.prohibited.intro}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
                {t.sections.prohibited.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.sections.changes.heading}</h2>
            <p className="text-lg text-gray-600 mb-8">
                {t.sections.changes.content}
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.sections.contact.heading}</h2>
            <p className="text-lg text-gray-600">
                {t.sections.contact.text} <Link href={locale === 'no' ? '/kontakt' : `/${locale}/kontakt`} className="text-link-orange hover:underline">{t.sections.contact.linkText}</Link>{t.sections.contact.suffix}
            </p>
        </div>
      </div>
    </PageLayout>
  );
} 