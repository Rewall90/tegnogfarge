import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSubcategoryWithDrawings, getAllCategories, getSubcategoriesByCategory, getColoringImage } from '@/lib/sanity';
import { notFound } from 'next/navigation';
import { DownloadPdfButton } from '@/components/buttons/DownloadPdfButton';
import { StartColoringButton } from '@/components/buttons/StartColoringButton';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import DrawingJsonLd from '@/components/json-ld/DrawingJsonLd';
import { SVG_BLUR_PLACEHOLDER, WEBP_PLACEHOLDER_PATH, formatDate } from '@/lib/utils';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import { RelatedDrawings } from '@/components/drawing/RelatedDrawings';
import { DrawingPageSidebar } from '@/components/sidebar/DrawingPageSidebar';
import { DrawingDetail } from '@/components/drawing/DrawingDetail';
import type { Drawing } from '@/types';
import { PageViewTracker } from '@/components/analytics/PageViewTracker';
import { getDownloadCount, getCompletionCount } from '@/lib/analytics';
import { buildAlternates, getLocaleConfig } from '@/lib/seo-utils';
import type { Locale } from '@/i18n';

// Increase revalidation time for better caching
export const revalidate = 3600; // Revalidate every hour instead of 30 minutes

// Types for better type safety
// The local interfaces are now removed, as they are imported from @/types

interface PageProps {
  params: Promise<{
    locale: string;
    categorySlug: string;
    subcategorySlug: string;
    drawingSlug: string;
  }>;
}

// Generer metadata
export async function generateMetadata({ params: paramsPromise }: PageProps) {
  const { locale, categorySlug, subcategorySlug, drawingSlug } = await paramsPromise;

  // Få tak i tegningen (basert på ID eller slug)
  const drawing = await getColoringImage(drawingSlug);

  if (!drawing) {
    return { title: 'Tegning ikke funnet' };
  }

  // Hent underkategorien for å få tilgang til kategori-info
  const subcategory = await getSubcategoryWithDrawings(categorySlug, subcategorySlug, locale);
  
  if (!subcategory) {
    return { title: drawing.title || 'Fargeleggingsbilde' };
  }

  // Prepare structured data for metadata
  const pathname = `/${categorySlug}/${subcategorySlug}/${drawingSlug}`;
  const alternates = buildAlternates(pathname, locale as Locale);
  const localeConfig = getLocaleConfig(locale as Locale);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tegnogfarge.no';
  const currentUrl = alternates.canonical;

  return {
    title: `Fargelegg ${drawing.title} - TegnOgFarge.no`,
    description: drawing.metaDescription || drawing.description || `Fargelegg ${drawing.title} fra kategorien ${subcategory.parentCategory?.title}`,
    metadataBase: new URL(baseUrl),
    alternates,
    openGraph: {
      title: `Fargelegg ${drawing.title} - TegnOgFarge.no`,
      description: drawing.metaDescription || drawing.description || `Fargelegg ${drawing.title} fra kategorien ${subcategory.parentCategory?.title}`,
      url: currentUrl,
      siteName: 'TegnOgFarge.no',
      images: [
        {
          url: drawing.thumbnailUrl || drawing.imageUrl || '',
          width: 1200,
          height: 630,
          alt: drawing.title,
        },
      ],
      locale: localeConfig.ogLocale,
      alternateLocale: localeConfig.ogAlternate,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Fargelegg ${drawing.title} - TegnOgFarge.no`,
      description: drawing.metaDescription || drawing.description || `Fargelegg ${drawing.title} fra kategorien ${subcategory.parentCategory?.title}`,
      images: drawing.thumbnailUrl || drawing.imageUrl,
    },
  };
}

// For now, don't generate static paths for drawings since there may be too many
export async function generateStaticParams() {
  return [];
}

// Helper functions (extracted for better organization and potential memoization)
function getDifficultyKey(value: string | undefined): 'easy' | 'medium' | 'hard' {
  if (value === 'easy' || value === 'medium' || value === 'hard') return value;
  return 'medium';
}

const customComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="font-display font-bold text-2xl text-navy mt-8 mb-4">{children}</h2>
    ),
    normal: ({ children }) => (
      <p className="text-lg text-navy mb-4">{children}</p>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="text-lg text-navy list-disc ml-6">{children}</li>,
    number: ({ children }) => <li className="text-lg text-navy list-decimal ml-6">{children}</li>,
  },
};

// Main component
export default async function DrawingPage({ params: paramsPromise }: PageProps) {
  const { locale, categorySlug, subcategorySlug, drawingSlug } = await paramsPromise;

  // Fetch data
  const drawing = await getColoringImage(drawingSlug);
  if (!drawing) {
    notFound();
  }

  const subcategory = await getSubcategoryWithDrawings(categorySlug, subcategorySlug, locale);
  if (!subcategory) {
    notFound();
  }
  
  // Define constants
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800', 
    hard: 'bg-red-100 text-red-800'
  };
  
  const difficultyLabels = {
    easy: 'Enkel',
    medium: 'Middels',
    hard: 'Vanskelig'
  };
  
  const ageRangeLabels: Record<string, string> = {
    '3-5': '3-5 år',
    '6-8': '6-8 år',
    '9-12': '9-12 år',
    '12+': 'Over 12 år',
    'all': 'Alle aldre'
  };
  
  // Prepare the path for JSON-LD and locale configuration
  const pathname = `/${categorySlug}/${subcategorySlug}/${drawingSlug}`;
  const localeConfig = getLocaleConfig(locale as Locale);

  // Fetch download count (hybrid approach - real-time from database)
  console.log('[DrawingPage] Fetching download count for drawing:', {
    drawingId: drawing._id,
    drawingSlug: drawingSlug,
    drawingTitle: drawing.title
  });
  const downloadCount = await getDownloadCount(drawing._id, 'pdf_download');
  console.log('[DrawingPage] Download count result:', downloadCount);

  // Fetch online coloring completion count (hybrid approach - real-time from database)
  console.log('[DrawingPage] Fetching completion count for drawing:', {
    drawingId: drawing._id,
    drawingSlug: drawingSlug,
    drawingTitle: drawing.title
  });
  const completionCount = await getCompletionCount(drawing._id);
  console.log('[DrawingPage] Completion count result:', completionCount);

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <PageViewTracker
        type="drawing"
        imageId={drawing._id}
        imageTitle={drawing.title}
        category={subcategory.parentCategory?.title || 'Ukjent'}
        subcategory={subcategory.title}
      />
      <Header />
      {/* Add structured data */}
      <DrawingJsonLd
        drawing={drawing}
        pathname={pathname}
        subcategory={{
          _id: subcategory._id,
          slug: subcategory.slug,
          title: subcategory.title,
          parentCategory: subcategory.parentCategory
        }}
        inLanguage={localeConfig.inLanguage}
        homeLabel={localeConfig.homeLabel}
      />
      <main className="flex-grow bg-cream">
        <div className="w-full bg-cream text-black">
          <div className="max-w-screen-xl mx-auto px-4 py-8">
            {/* Breadcrumbs Navigation */}
            <nav className="mb-6 text-sm" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href={locale === 'no' ? '/' : `/${locale}`} className="text-[#264653] hover:underline">
                    Forsiden
                  </Link>
                </li>
                <li className="flex items-center">
                  <span className="mx-2">/</span>
                  <Link
                    href={locale === 'no' ? `/${categorySlug}` : `/${locale}/${categorySlug}`}
                    className="text-[#264653] hover:underline"
                  >
                    {subcategory.parentCategory?.title}
                  </Link>
                </li>
                <li className="flex items-center">
                  <span className="mx-2">/</span>
                  <Link
                    href={locale === 'no' ? `/${categorySlug}/${subcategorySlug}` : `/${locale}/${categorySlug}/${subcategorySlug}`}
                    className="text-[#264653] hover:underline"
                  >
                    {subcategory.title}
                  </Link>
                </li>
                <li className="flex items-center">
                  <span className="mx-2">/</span>
                  <span className="text-[#264653]/60">{drawing.title}</span>
                </li>
              </ol>
            </nav>
            
            <div className="flex flex-col md:flex-row">
              <DrawingDetail
                drawing={drawing}
                difficultyColors={difficultyColors}
                difficultyLabels={difficultyLabels}
                ageRangeLabels={ageRangeLabels}
                customComponents={customComponents}
                downloadCount={downloadCount}
                completionCount={completionCount}
              />
              <DrawingPageSidebar locale={locale as Locale} />
            </div>
          </div>
        </div>

        <RelatedDrawings
          categorySlug={categorySlug}
          subcategorySlug={subcategorySlug}
          currentDrawingSlug={drawingSlug}
          currentDrawingId={drawing._id}
          currentDrawingTitle={drawing.title}
          subcategoryTitle={subcategory.title}
          locale={locale}
        />
      </main>
      <Footer />
    </div>
  );
} 