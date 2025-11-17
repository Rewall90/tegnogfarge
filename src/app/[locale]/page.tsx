import React, { Suspense } from "react";
import Link from "next/link";
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { getAllCategories, getPopularSubcategories } from '@/lib/sanity';
import { getDailyDrawing } from '@/lib/daily-drawing';
import { FrontpageHero } from '@/components/frontpage/FrontpageHero';
import dynamic from 'next/dynamic';
import { buildAlternates, getLocaleConfig } from '@/lib/seo-utils';
import type { Locale } from '@/i18n';
import { homepageTranslations } from '@/i18n/translations/homepage';

// Dynamic imports for below-the-fold content
const ColoringCategories = dynamic(
  () => import('@/components/frontpage/ColoringCategories').then(mod => ({ default: mod.ColoringCategories })),
  { 
    loading: () => null,
    ssr: false 
  }
);

const SubcategoryHighlights = dynamic(
  () => import('@/components/category/SubcategoryHighlights').then(mod => ({ default: mod.SubcategoryHighlights })),
  { 
    loading: () => null,
    ssr: false 
  }
);
import Image from 'next/image';
import CategoriesListJsonLd from '@/components/json-ld/CategoriesListJsonLd';
const FAQAccordion = dynamic(
  () => import('@/components/frontpage/FAQAccordion'),
  { 
    loading: () => null,
    ssr: false 
  }
);
const NewsletterForm = dynamic(
  () => import('@/components/newsletter/NewsletterForm'),
  {
    loading: () => null,
    ssr: false
  }
);
const VerificationToast = dynamic(
  () => import('@/components/notifications/VerificationToast').then(mod => ({ default: mod.VerificationToast })),
  {
    loading: () => null,
    ssr: false
  }
);

interface Category {
  title: string;
  imageUrl?: string;
  slug: string;
  isActive: boolean;
  featured?: boolean;
  order?: number;
  image?: {
    url: string;
    alt: string;
  };
}

export const revalidate = 86400; // Revalidate once per day (24 hours) for daily drawing

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://tegnogfarge.no';
  const locale = params.locale as Locale; // next-intl provides the locale
  const alternates = buildAlternates('/', locale);
  const localeConfig = getLocaleConfig(locale);
  const t = homepageTranslations[locale] || homepageTranslations.no;

  // FAQ schema for structured data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": t.faq.questions.register.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t.faq.questions.register.answer
        }
      },
      {
        "@type": "Question",
        "name": t.faq.questions.free.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t.faq.questions.free.answer
        }
      },
      {
        "@type": "Question",
        "name": t.faq.questions.save.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t.faq.questions.save.answer
        }
      },
      {
        "@type": "Question",
        "name": t.faq.questions.age.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t.faq.questions.age.answer
        }
      },
      {
        "@type": "Question",
        "name": t.faq.questions.educational.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t.faq.questions.educational.answer
        }
      },
      {
        "@type": "Question",
        "name": t.faq.questions.safe.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t.faq.questions.safe.answer
        }
      }
    ]
  };

  return {
    title: t.metadata.title,
    description: t.metadata.description,
    metadataBase: new URL(base),
    alternates,
    openGraph: {
      title: t.metadata.title,
      description: t.metadata.description,
      url: alternates.canonical,
      siteName: 'TegnOgFarge.no',
      locale: localeConfig.ogLocale,
      alternateLocale: localeConfig.ogAlternate,
      type: 'website',
      images: [
        {
          url: `${base}/images/hero section/fargelegging-barn-voksne-gratis-motiver.webp`,
          width: 1200,
          height: 630,
          alt: t.hero.imageAlt,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.metadata.title,
      description: t.metadata.description,
      images: [`${base}/images/hero section/fargelegging-barn-voksne-gratis-motiver.webp`],
    },
    other: {
      'application/ld+json': JSON.stringify(faqSchema),
    }
  };
}

export default async function Home({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale; // next-intl provides the locale
  const t = homepageTranslations[locale] || homepageTranslations.no;

  // Fetch daily drawing (updates once per day)
  const dailyDrawing = await getDailyDrawing();
  console.log('[Homepage] Daily drawing:', dailyDrawing);

  const categories: Category[] = await getAllCategories(locale);

  // Fetch popular subcategories - 12 for desktop, but we'll show only 4 on mobile
  const featuredSubcategories = await getPopularSubcategories(12, locale);

  // Debug: Log the fetched subcategories
  console.log('Featured subcategories:', featuredSubcategories);
  
  const mainCategories = categories
    .filter((cat) => cat.isActive)
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      if ((a.order ?? 0) !== (b.order ?? 0)) return (a.order ?? 0) - (b.order ?? 0);
      return a.title.localeCompare(b.title);
    })
    .slice(0, 12);

  // Use a fallback if no subcategories are found
  const subcategoriesToDisplay = featuredSubcategories && featuredSubcategories.length > 0 
    ? featuredSubcategories 
    : [
        {
          _id: 'fallback1',
          title: 'Dyr',
          slug: 'dyr',
          featuredImage: {
            url: '/images/placeholder.svg',
            alt: 'Dyr'
          },
          parentCategory: {
            slug: 'dyr',
            title: 'Dyr'
          }
        },
        {
          _id: 'fallback2',
          title: 'Høytider',
          slug: 'hoytider',
          featuredImage: {
            url: '/images/placeholder.svg',
            alt: 'Høytider'
          },
          parentCategory: {
            slug: 'hoytider',
            title: 'Høytider'
          }
        },
        {
          _id: 'fallback3',
          title: 'Natur',
          slug: 'natur',
          featuredImage: {
            url: '/images/placeholder.svg',
            alt: 'Natur'
          },
          parentCategory: {
            slug: 'natur',
            title: 'Natur'
          }
        },
        {
          _id: 'fallback4',
          title: 'Tegneserier',
          slug: 'tegneserier',
          featuredImage: {
            url: '/images/placeholder.svg',
            alt: 'Tegneserier'
          },
          parentCategory: {
            slug: 'tegneserier',
            title: 'Tegneserier'
          }
        }
      ];

  return (
    <>
      {/* Verification Toast - shows success/error messages after email confirmation */}
      <Suspense fallback={null}>
        <VerificationToast />
      </Suspense>

      <Header locale={locale} />
      <FrontpageHero
        dailyDrawingUrl={dailyDrawing.url}
        translations={t.hero}
        locale={locale}
      />
      <main className="bg-white">
          <ColoringCategories
            categories={mainCategories.map((cat) => ({
              name: cat.title,
              imageUrl: cat.image?.url || '/images/placeholder-category.png',
              imageAlt: cat.image?.alt || cat.title,
              slug: cat.slug,
            }))}
            translations={t.categories}
          />

          {/* Newsletter Section */}
          <section className="py-16 bg-[#F4D35E] text-navy" aria-labelledby="newsletter-heading">
            <div className="container mx-auto px-4 max-w-5xl text-center">
              <h2 id="newsletter-heading" className="text-heading mb-6">{t.newsletter.heading}</h2>
              <p className="text-body mb-8">{t.newsletter.subtitle}</p>

              <NewsletterForm />
            </div>
          </section>

          {/* Featured Subcategories Section */}
          <SubcategoryHighlights
            subcategories={subcategoriesToDisplay}
            title={t.featured.heading}
            subtitle={t.featured.subtitle}
            locale={locale}
          />
          
          {/* FAQ Section */}
          <section className="py-16 bg-gray-50" aria-labelledby="faq-heading">
            <div className="container mx-auto px-4 max-w-3xl">
              <h2 id="faq-heading" className="text-heading mb-10">{t.faq.heading}</h2>
              <p className="text-body mb-8 text-gray-600">{t.faq.subtitle}</p>

              <div className="space-y-6" role="group" aria-labelledby="faq-heading">
                <FAQAccordion
                  id="faq-1"
                  question={t.faq.questions.register.question}
                  answer={t.faq.questions.register.answer}
                />

                <FAQAccordion
                  id="faq-2"
                  question={t.faq.questions.free.question}
                  answer={t.faq.questions.free.answer}
                />

                <FAQAccordion
                  id="faq-3"
                  question={t.faq.questions.save.question}
                  answer={t.faq.questions.save.answer}
                />

                <FAQAccordion
                  id="faq-4"
                  question={t.faq.questions.age.question}
                  answer={t.faq.questions.age.answer}
                />

                <FAQAccordion
                  id="faq-5"
                  question={t.faq.questions.educational.question}
                  answer={t.faq.questions.educational.answer}
                />

                <FAQAccordion
                  id="faq-6"
                  question={t.faq.questions.safe.question}
                  answer={t.faq.questions.safe.answer}
                />
              </div>

              <div className="mt-12 text-center">
                <h3 className="text-section font-bold mb-4">{t.faq.contactPrompt.heading}</h3>
                <p className="text-body mb-6 text-gray-600">{t.faq.contactPrompt.subtitle}</p>
                <Link
                  href={locale === 'no' ? '/kontakt' : `/${locale}/kontakt`}
                  className="text-button border border-black px-6 py-3 rounded inline-block hover:bg-gray-100"
                  aria-label="Kontakt oss med dine spørsmål"
                >
                  {t.faq.contactPrompt.button}
                </Link>
              </div>
            </div>
          </section>
        </main>
      <Footer locale={locale} />
    </>
  );
}
