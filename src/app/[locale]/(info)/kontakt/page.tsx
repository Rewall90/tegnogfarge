import PageLayout from '@/components/shared/PageLayout';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import ContactForm from '@/components/contact/ContactForm';
import GenericWebPageJsonLd from '@/components/json-ld/GenericWebPageJsonLd';
import { buildAlternates, getLocaleConfig } from '@/lib/seo-utils';
import type { Locale } from '@/i18n';
import { contactTranslations } from '@/i18n/translations/contact';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = contactTranslations[locale as Locale] || contactTranslations.no;
  const pathname = '/kontakt';
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

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  const t = contactTranslations[locale as Locale] || contactTranslations.no;

  const breadcrumbItems = [
    { label: t.breadcrumb.home, href: locale === 'no' ? '/' : `/${locale}` },
    { label: t.breadcrumb.contact, href: locale === 'no' ? '/kontakt' : `/${locale}/kontakt`, active: true }
  ];

  return (
    <PageLayout wrapperClassName="bg-[#FEFAF6]">
      <GenericWebPageJsonLd
        pageType="ContactPage"
        title={t.metadata.title}
        description={t.metadata.description}
        pathname="/kontakt"
      />
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="mb-12">
            <h1 className="text-heading text-[#264653] font-bold mb-4">{t.heading}</h1>
            <p className="text-lg text-gray-600 mb-8">
              {t.intro}
            </p>
            <p className="text-lg text-gray-700 mb-4">{t.list.heading}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {t.list.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
        </div>
        <ContactForm translations={t.form} locale={locale} />
      </div>
    </PageLayout>
  );
} 