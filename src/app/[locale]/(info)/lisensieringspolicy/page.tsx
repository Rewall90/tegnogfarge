import Link from 'next/link';
import PageLayout from '@/components/shared/PageLayout';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import GenericWebPageJsonLd from '@/components/json-ld/GenericWebPageJsonLd';
import { buildAlternates, getLocaleConfig } from '@/lib/seo-utils';
import type { Locale } from '@/i18n';
import { licensingTranslations } from '@/i18n/translations/licensing';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = licensingTranslations[locale as Locale] || licensingTranslations.no;
  const pathname = '/lisensieringspolicy';
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

export default async function LicensePage({ params }: PageProps) {
  const { locale } = await params;
  const t = licensingTranslations[locale as Locale] || licensingTranslations.no;

  const breadcrumbItems = [
    { label: t.breadcrumb.home, href: locale === 'no' ? '/' : `/${locale}` },
    { label: t.breadcrumb.licensing, href: locale === 'no' ? '/lisensieringspolicy' : `/${locale}/lisensieringspolicy`, active: true }
  ];

  return (
    <PageLayout wrapperClassName="bg-[#FEFAF6]">
      <GenericWebPageJsonLd
        pageType="WebPage"
        title={t.metadata.title}
        description={t.metadata.description}
        pathname="/lisensieringspolicy"
      />
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <div>
            <h1 className="text-heading text-[#264653] font-bold mb-4">{t.heading}</h1>
            <p className="text-lg text-gray-600 mb-8">
                {t.intro}
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.sections.allowed.heading}</h2>
            <p className="text-lg text-gray-600 mb-4">{t.sections.allowed.intro}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
                {t.sections.allowed.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.sections.notAllowed.heading}</h2>
            <p className="text-lg text-gray-600 mb-4">{t.sections.notAllowed.intro}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
                {t.sections.notAllowed.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
            </ul>
            <p className="text-lg text-gray-600 mt-4 mb-8">{t.sections.notAllowed.note}</p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.sections.ownership.heading}</h2>
            <p className="text-lg text-gray-600 mb-8">
                {t.sections.ownership.content}
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.sections.specialRequests.heading}</h2>
            <p className="text-lg text-gray-600 mb-8">
                {t.sections.specialRequests.text} <Link href={locale === 'no' ? '/kontakt' : `/${locale}/kontakt`} className="text-link-orange hover:underline">{t.sections.specialRequests.linkText}</Link>{t.sections.specialRequests.suffix}
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.sections.changes.heading}</h2>
            <p className="text-lg text-gray-600 mb-8">
                {t.sections.changes.content}
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.sections.questions.heading}</h2>
            <p className="text-lg text-gray-600">
                {t.sections.questions.text} <Link href={locale === 'no' ? '/kontakt' : `/${locale}/kontakt`} className="text-link-orange hover:underline">{t.sections.questions.linkText}</Link>{t.sections.questions.suffix}
            </p>
        </div>
      </div>
    </PageLayout>
  );
} 