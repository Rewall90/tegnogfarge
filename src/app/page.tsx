import React from "react";
import Link from "next/link";
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { getAllCategories, getPopularSubcategories } from '@/lib/sanity';
import { FrontpageHero } from '@/components/frontpage/FrontpageHero';
import { ColoringCategories } from '@/components/frontpage/ColoringCategories';
import { SubcategoryHighlights } from '@/components/category/SubcategoryHighlights';
import Image from 'next/image';
import CategoriesListJsonLd from '@/components/json-ld/CategoriesListJsonLd';
import FAQAccordion from '@/components/frontpage/FAQAccordion';
import NewsletterForm from '@/components/newsletter/NewsletterForm';

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
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://fargelegg.no';
  
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
          "text": "Ja, plattformen tilbyr gratis tilgang til grunnleggende funksjoner. Du kan oppgradere til premium for flere verktøy og ressurser. Utforsk alternativene våre for mer informasjon."
        }
      },
      {
        "@type": "Question",
        "name": "Hvordan lagrer jeg arbeidet?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ditt arbeid lagres automatisk når du bruker plattformen. Du kan også lagre det manuelt ved å klikke på \"Lagre\" knappen. Bruk Dashboard-siden for å se alle lagrede verk."
        }
      },
      {
        "@type": "Question",
        "name": "Kan jeg dele arbeidet?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, du kan enkelt dele arbeidet ditt på sosiale medier. Klikk på \"Del\" knappen for å få tilgang til delingsmuligheter. Vi har også innebygd støtte for å venneliste!"
        }
      },
      {
        "@type": "Question",
        "name": "Hva er premium-funksjoner?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Premium-funksjoner inkluderer tilgang til flere avanserte farger, spesialeffekter, ubegrenset lagring av dine prosjekter, og mulighet til å laste ned høyoppløselige versjoner av arbeidet ditt. Du får også prioritert støtte fra vårt team."
        }
      }
    ]
  };
  
  return {
    title: 'Fargeleggingsbilder Kategorier | Fargelegg Nå',
    description: 'Utforsk alle våre kategorier av fargeleggingsbilder',
    metadataBase: new URL(base),
    openGraph: {
      title: 'Fargeleggingsbilder Kategorier | Fargelegg Nå',
      description: 'Utforsk alle våre kategorier av fargeleggingsbilder',
      url: base,
      siteName: 'Fargelegg Nå',
      locale: 'nb_NO',
      type: 'website',
    },
    alternates: {
      canonical: '/',
    },
    other: {
      'application/ld+json': JSON.stringify(faqSchema),
    }
  };
}

export default async function Home() {
  const categories: Category[] = await getAllCategories();
  
  // Fetch popular subcategories directly
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
      <Header />
      <FrontpageHero />
      <main className="bg-white">
          <ColoringCategories
            categories={mainCategories.map((cat) => ({
              name: cat.title,
              imageUrl: cat.image?.url || '/images/placeholder-category.png',
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
                  answer="Ja, plattformen tilbyr gratis tilgang til grunnleggende funksjoner. Du kan oppgradere til premium for flere verktøy og ressurser. Utforsk alternativene våre for mer informasjon."
                />
                
                <FAQAccordion 
                  id="faq-3"
                  question="Hvordan lagrer jeg arbeidet?" 
                  answer="Ditt arbeid lagres automatisk når du bruker plattformen. Du kan også lagre det manuelt ved å klikke på &quot;Lagre&quot; knappen. Bruk Dashboard-siden for å se alle lagrede verk."
                />
                
                <FAQAccordion 
                  id="faq-4"
                  question="Kan jeg dele arbeidet?" 
                  answer="Ja, du kan enkelt dele arbeidet ditt på sosiale medier. Klikk på &quot;Del&quot; knappen for å få tilgang til delingsmuligheter. Vi har også innebygd støtte for å venneliste!"
                />
                
                <FAQAccordion 
                  id="faq-5"
                  question="Hva er premium-funksjoner?" 
                  answer="Premium-funksjoner inkluderer tilgang til flere avanserte farger, spesialeffekter, ubegrenset lagring av dine prosjekter, og mulighet til å laste ned høyoppløselige versjoner av arbeidet ditt. Du får også prioritert støtte fra vårt team."
                />
              </div>
              
              <div className="mt-12 text-center">
                <h3 className="text-section font-bold mb-4">Har du fortsatt spørsmål?</h3>
                <p className="text-body mb-6 text-gray-600">Ta kontakt med oss, så hjelper vi deg så raskt som mulig.</p>
                <Link 
                  href="/contact" 
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
