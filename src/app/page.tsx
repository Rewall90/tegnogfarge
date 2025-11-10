import React, { Suspense } from "react";
import Link from "next/link";
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { getAllCategories, getPopularSubcategories } from '@/lib/sanity';
import { FrontpageHero } from '@/components/frontpage/FrontpageHero';
import dynamic from 'next/dynamic';

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

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://tegnogfarge.no';

  // FAQ schema for structured data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Hvordan registrerer jeg meg?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "For å registere deg, klikk på \"Registrer deg\" knappen på hjemmesiden. Fyll ut skjemaet med nødvendig informasjon. Når du har sendt inn, vil du motta en bekreftelse e-post."
        }
      },
      {
        "@type": "Question",
        "name": "Er det gratis?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, plattformen er helt gratis å bruke. Du kan begynne å fargelegge med en gang uten å registrere deg."
        }
      },
      {
        "@type": "Question",
        "name": "Hvordan lagrer jeg arbeidet?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Du kan laste ned ditt ferdigfargede arbeid som en bildefil når du er ferdig. Det er også mulig å skrive ut fargeleggingene direkte fra nettleseren for fysiske kopier."
        }
      },
      {
        "@type": "Question",
        "name": "Hvilken alder er dette egnet for?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Fargeleggingssiden er egnet for alle aldre, fra små barn til voksne. Vi har enkle motiver for de minste og mer detaljerte tegninger for eldre barn og voksne."
        }
      },
      {
        "@type": "Question",
        "name": "Er dette pedagogisk nyttig for barn?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, fargelegging utvikler barns kreativitet, finmotorikk og fargeforståelse. Du kan både fargelegge digitalt eller laste ned og skrive ut arkene for fysisk fargelegging. Det er en trygg og lærerik aktivitet som kombinerer teknologi med kunstnerisk uttrykk."
        }
      },
      {
        "@type": "Question",
        "name": "Er innholdet trygt for barn?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Alle våre fargeleggingstegninger er familievennlige og trygge for barn. Vi har kun positive motiver uten vold eller upassende innhold."
        }
      }
    ]
  };

  return {
    title: 'Fargelegging Barn Og Voksne – Gratis Fargeleggingsark',
    description: 'Gratis fargeleggingssider for barn og voksne. Last ned eller fargelegg i nettleseren. Tusenvis av motiver i PNG/PDF-format. Trygt og pedagogisk innhold – print og kos deg!',
    metadataBase: new URL(base),
    openGraph: {
      title: 'Fargelegging Barn Og Voksne – Gratis Fargeleggingsark',
      description: 'Gratis fargeleggingssider for barn og voksne. Last ned eller fargelegg i nettleseren. Tusenvis av motiver i PNG/PDF-format. Trygt og pedagogisk innhold – print og kos deg!',
      url: base,
      siteName: 'TegnOgFarge.no',
      locale: 'nb_NO',
      type: 'website',
      images: [
        {
          url: `${base}/images/hero section/fargelegging-barn-voksne-gratis-motiver.webp`,
          width: 1200,
          height: 630,
          alt: 'TegnOgFarge.no - Gratis fargeleggingssider for barn og voksne',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Fargelegging Barn Og Voksne – Gratis Fargeleggingsark',
      description: 'Gratis fargeleggingssider for barn og voksne. Last ned eller fargelegg i nettleseren. Tusenvis av motiver i PNG/PDF-format. Trygt og pedagogisk innhold – print og kos deg!',
      images: [`${base}/images/hero section/fargelegging-barn-voksne-gratis-motiver.webp`],
    },
    alternates: {
      canonical: base,
    },
    other: {
      'application/ld+json': JSON.stringify(faqSchema),
    }
  };
}

export default async function Home() {
  const categories: Category[] = await getAllCategories();
  
  // Fetch popular subcategories - 12 for desktop, but we'll show only 4 on mobile
  const featuredSubcategories = await getPopularSubcategories(12);
  
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

      <Header />
      <FrontpageHero />
      <main className="bg-white">
          <ColoringCategories
            categories={mainCategories.map((cat) => ({
              name: cat.title,
              imageUrl: cat.image?.url || '/images/placeholder-category.png',
              imageAlt: cat.image?.alt || cat.title,
              slug: cat.slug,
            }))}
          />
          
          {/* Newsletter Section */}
          <section className="py-16 bg-[#F4D35E] text-navy" aria-labelledby="newsletter-heading">
            <div className="container mx-auto px-4 max-w-5xl text-center">
              <h2 id="newsletter-heading" className="text-heading mb-6">Ikke gå glipp av nye fargeleggingsark</h2>
              <p className="text-body mb-8">Få de nyeste fargeleggingsarkene før alle andre – meld deg på i dag.</p>
              
              <NewsletterForm />
            </div>
          </section>
          
          {/* Featured Subcategories Section */}
          <SubcategoryHighlights 
            subcategories={subcategoriesToDisplay}
            title="Utvalgte Fargeleggingsark"
            subtitle="Våre mest populære samlinger"
          />
          
          {/* FAQ Section */}
          <section className="py-16 bg-gray-50" aria-labelledby="faq-heading">
            <div className="container mx-auto px-4 max-w-3xl">
              <h2 id="faq-heading" className="text-heading mb-10">Ofte stilte spørsmål</h2>
              <p className="text-body mb-8 text-gray-600">Her finner du svar på vanlige spørsmål om plattformen og hvordan du bruker den.</p>
              
              <div className="space-y-6" role="group" aria-labelledby="faq-heading">
                <FAQAccordion 
                  id="faq-1"
                  question="Hvordan registrerer jeg meg?" 
                  answer="For å registere deg, klikk på &quot;Registrer deg&quot; knappen på hjemmesiden. Fyll ut skjemaet med nødvendig informasjon. Når du har sendt inn, vil du motta en bekreftelse e-post."
                />
                
                <FAQAccordion
                  id="faq-2"
                  question="Er det gratis?"
                  answer="Ja, plattformen er helt gratis å bruke. Du kan begynne å fargelegge med en gang uten å registrere deg."
                />
                
                <FAQAccordion 
                  id="faq-3"
                  question="Hvordan lagrer jeg arbeidet?" 
                  answer="Du kan laste ned ditt ferdigfargede arbeid som en bildefil når du er ferdig. Det er også mulig å skrive ut fargeleggingene direkte fra nettleseren for fysiske kopier."
                />
                
                <FAQAccordion 
                  id="faq-4"
                  question="Hvilken alder er dette egnet for?" 
                  answer="Fargeleggingssiden er egnet for alle aldre, fra små barn til voksne. Vi har enkle motiver for de minste og mer detaljerte tegninger for eldre barn og voksne."
                />
                
                <FAQAccordion
                  id="faq-5"
                  question="Er dette pedagogisk nyttig for barn?"
                  answer="Ja, fargelegging utvikler barns kreativitet, finmotorikk og fargeforståelse. Du kan både fargelegge digitalt eller laste ned og skrive ut arkene for fysisk fargelegging. Det er en trygg og lærerik aktivitet som kombinerer teknologi med kunstnerisk uttrykk."
                />
                
                <FAQAccordion
                  id="faq-6"
                  question="Er innholdet trygt for barn?"
                  answer="Alle våre fargeleggingstegninger er familievennlige og trygge for barn. Vi har kun positive motiver uten vold eller upassende innhold."
                />
              </div>
              
              <div className="mt-12 text-center">
                <h3 className="text-section font-bold mb-4">Har du fortsatt spørsmål?</h3>
                <p className="text-body mb-6 text-gray-600">Ta kontakt med oss, så hjelper vi deg så raskt som mulig.</p>
                <Link
                  href="/kontakt"
                  className="text-button border border-black px-6 py-3 rounded inline-block hover:bg-gray-100"
                  aria-label="Kontakt oss med dine spørsmål"
                >
                  Kontakt oss
                </Link>
              </div>
            </div>
          </section>
        </main>
      <Footer />
    </>
  );
}
