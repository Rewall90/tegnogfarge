import Link from 'next/link';
import PageLayout from '@/components/shared/PageLayout';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import GenericWebPageJsonLd from '@/components/json-ld/GenericWebPageJsonLd';
import { buildAlternates, getLocaleConfig } from '@/lib/seo-utils';
import type { Locale } from '@/i18n';
import { contentRemovalTranslations } from '@/i18n/translations/contentRemoval';
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

  const t = contentRemovalTranslations[locale as Locale] || contentRemovalTranslations.de;
  const pathname = '/entfernung-von-inhalten';
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

export default async function EntfernungVonInhaltenPage({ params }: PageProps) {
  const { locale } = await params;

  // Redirect non-German users to their respective URLs
  if (locale === 'no') {
    redirect('/fjerning-av-innhold');
  }
  if (locale === 'sv') {
    redirect('/sv/borttagning-av-innehall');
  }

  const t = contentRemovalTranslations[locale as Locale] || contentRemovalTranslations.de;

  const breadcrumbItems = [
    { label: t.breadcrumb.home, href: `/${locale}` },
    { label: t.breadcrumb.contentRemoval, href: `/${locale}/entfernung-von-inhalten`, active: true }
  ];

  return (
    <PageLayout wrapperClassName="bg-[#FEFAF6]">
      <GenericWebPageJsonLd
        pageType="WebPage"
        title={t.metadata.title}
        description={t.metadata.description}
        pathname="/entfernung-von-inhalten"
      />
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <div>
            <h1 className="text-heading text-[#264653] font-bold mb-4">{t.heading}</h1>
            <p className="text-lg text-gray-600 mb-8">
                {t.intro}
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.sections.report.heading}</h2>
            <p className="text-lg text-gray-600 mb-4">
                {t.sections.report.intro} <Link href={`/${locale}/kontakt`} className="text-link-orange hover:underline">{t.sections.report.linkText}</Link>{t.sections.report.suffix}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
                {t.sections.report.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.sections.process.heading}</h2>
            <p className="text-lg text-gray-600 mb-8">
                {t.sections.process.content}
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.sections.wrongRemoval.heading}</h2>
            <p className="text-lg text-gray-600 mb-4">
                {t.sections.wrongRemoval.intro}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
                {t.sections.wrongRemoval.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.sections.changes.heading}</h2>
            <p className="text-lg text-gray-600 mb-8">
                {t.sections.changes.content}
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">{t.sections.questions.heading}</h2>
            <p className="text-lg text-gray-600">
                {t.sections.questions.text} <Link href={`/${locale}/kontakt`} className="text-link-orange hover:underline">{t.sections.questions.linkText}</Link>{t.sections.questions.suffix}
            </p>
        </div>
      </div>
    </PageLayout>
  );
}
