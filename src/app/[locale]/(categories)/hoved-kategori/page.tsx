import React from 'react';
import Link from 'next/link';
import { getAllCategories } from '@/lib/sanity';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { ColoringCategories } from '@/components/frontpage/ColoringCategories';
import CategoriesListJsonLd from '@/components/json-ld/CategoriesListJsonLd';
import { buildAlternates, getLocaleConfig } from '@/lib/seo-utils';
import type { Locale } from '@/i18n';
import { allCategoriesTranslations } from '@/i18n/translations/allCategories';

export const revalidate = 3600; // Revalidate every hour

interface Category {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  featured?: boolean;
  order?: number;
  image?: {
    url: string;
    alt: string;
  };
}

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = allCategoriesTranslations[locale as Locale] || allCategoriesTranslations.no;
  const pathname = '/hoved-kategori';
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

export default async function MainCategoryPage({ params }: PageProps) {
  const { locale } = await params;
  const t = allCategoriesTranslations[locale as Locale] || allCategoriesTranslations.no;
  const categories = await getAllCategories(locale);

  // Filter active categories and sort them by featured status and order
  const activeCategories = categories
    .filter((cat: Category) => cat.isActive)
    .sort((a: Category, b: Category) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      if ((a.order ?? 0) !== (b.order ?? 0)) return (a.order ?? 0) - (b.order ?? 0);
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="flex flex-col min-h-screen bg-[#FEFAF6]">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-8xl mx-auto">
            <nav aria-label="Breadcrumb">
              <Link
                href={locale === 'no' ? '/' : `/${locale}`}
                className="text-[#264653] hover:underline mb-4 inline-flex items-center gap-2"
              >
                {t.breadcrumb.backToHome}
              </Link>
            </nav>

            <header className="mb-8">
              <h1 className="text-3xl font-bold mb-2 flex items-center font-display text-navy">
                {t.heading}
              </h1>
              <p className="text-lg text-navy mt-4">
                {t.description}
              </p>
            </header>
            
            <ColoringCategories
              categories={activeCategories.map((cat: Category) => ({
                name: cat.title,
                imageUrl: cat.image?.url || cat.imageUrl || '/images/placeholder.svg',
                slug: cat.slug,
              }))}
            />
          </div>
        </div>
      </main>
      <Footer />
      <CategoriesListJsonLd categories={activeCategories} pathname="/hoved-kategori" />
    </div>
  );
} 