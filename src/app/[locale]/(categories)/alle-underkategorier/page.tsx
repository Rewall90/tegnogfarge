import React from 'react';
import Link from 'next/link';
import { getAllSubcategories } from '@/lib/sanity';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { SubcategoryCard } from '@/components/cards/SubcategoryCard';
import { buildAlternates, getLocaleConfig } from '@/lib/seo-utils';
import type { Locale } from '@/i18n';
import { allSubcategoriesTranslations } from '@/i18n/translations/allSubcategories';

interface Subcategory {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  difficulty?: number;
  featuredImage?: {
    url: string;
    alt?: string;
    lqip?: string;
  };
  drawingCount?: number;
  parentCategory: {
    _id: string;
    title: string;
    slug: string;
  };
}

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = allSubcategoriesTranslations[locale as Locale] || allSubcategoriesTranslations.no;
  const pathname = '/alle-underkategorier';
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

export default async function AllSubcategoriesPage({ params }: PageProps) {
  const { locale } = await params;
  const t = allSubcategoriesTranslations[locale as Locale] || allSubcategoriesTranslations.no;
  const subcategories = await getAllSubcategories(locale);

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

            <section className="category-listing" aria-labelledby="subcategories-heading">
              <h2 id="subcategories-heading" className="sr-only">{t.srOnly.subcategories}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {subcategories.map((subcategory: Subcategory, index: number) => (
                  <SubcategoryCard 
                    key={subcategory._id}
                    subcategory={subcategory} 
                    categorySlug={subcategory.parentCategory.slug} 
                    isPriority={index < 8} 
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 