import Link from 'next/link';
import PageLayout from '@/components/shared/PageLayout';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { AuthorJsonLd } from '@/components/json-ld/AuthorJsonLd';
import { buildAlternates, getLocaleConfig } from '@/lib/seo-utils';
import type { Locale } from '@/i18n';
import { authorTranslations } from '@/i18n/translations/author';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;

  // Redirect Norwegian to /om-skribenten
  if (locale === 'no') {
    return {};
  }

  const t = authorTranslations[locale as Locale] || authorTranslations.sv;
  const pathname = '/om-forfattaren';
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

export default async function ForfattarenPage({ params }: PageProps) {
  const { locale } = await params;

  // Redirect Norwegian users to the Norwegian URL
  if (locale === 'no') {
    redirect('/om-skribenten');
  }

  const t = authorTranslations[locale as Locale] || authorTranslations.sv;

  const breadcrumbItems = [
    { label: t.breadcrumb.home, href: `/${locale}` },
    { label: t.breadcrumb.author, href: `/${locale}/om-forfattaren`, active: true }
  ];

  return (
    <PageLayout wrapperClassName="bg-[#FEFAF6]">
      <AuthorJsonLd />
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className="text-3xl font-bold mb-8">{t.heading}</h1>
        <div className="prose lg:prose-xl max-w-none">
          <p>
            {t.content.intro}
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">{t.content.backgroundHeading}</h2>
          <p>
            {t.content.background}
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">{t.content.philosophyHeading}</h2>
          <p>
            {t.content.philosophy}
          </p>

          <p>
            {t.content.love}
          </p>

          <p>
            {t.content.thanks}
          </p>

          <p>
            {t.content.licensing} <Link href={`/${locale}/lisensieringspolicy`}>{t.content.licensingLink}</Link>.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
