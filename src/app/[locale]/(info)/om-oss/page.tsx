import Link from 'next/link';
import PageLayout from '@/components/shared/PageLayout';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import GenericWebPageJsonLd from '@/components/json-ld/GenericWebPageJsonLd';
import { buildAlternates, getLocaleConfig } from '@/lib/seo-utils';
import type { Locale } from '@/i18n';
import { aboutTranslations } from '@/i18n/translations/about';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = aboutTranslations[locale as Locale] || aboutTranslations.no;
  const pathname = '/om-oss';
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

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  const t = aboutTranslations[locale as Locale] || aboutTranslations.no;

  const breadcrumbItems = [
    { label: t.breadcrumb.home, href: locale === 'no' ? '/' : `/${locale}` },
    { label: t.breadcrumb.about, href: locale === 'no' ? '/om-oss' : `/${locale}/om-oss`, active: true }
  ];

  return (
    <PageLayout wrapperClassName="bg-[#FEFAF6]">
      <GenericWebPageJsonLd
        pageType="AboutPage"
        title={t.metadata.title}
        description={t.metadata.description}
        pathname="/om-oss"
      />

      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className="text-3xl font-bold mb-6">{t.heading}</h1>

        <div className="prose lg:prose-xl max-w-none mb-10">
          <p className="mb-8">{t.content.intro}</p>

          <p>{t.content.vision}</p>

          <p className="mb-8">{t.content.mission}</p>

          <p>{t.content.goal}</p>

          <p>{t.content.closing}</p>
        </div>

        <h2 className="text-2xl font-semibold mb-4">{t.contact.heading}</h2>
        <p>
          {t.contact.text}{' '}
          <Link href={locale === 'no' ? '/kontakt' : `/${locale}/kontakt`} className="text-[#264653] hover:underline">
            {t.contact.linkText}
          </Link>
          .
        </p>
      </div>
    </PageLayout>
  );
} 