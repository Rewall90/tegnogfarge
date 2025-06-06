import React from "react";
import Link from "next/link";
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { getAllCategories } from '@/lib/sanity';
import { FrontpageHero } from '@/components/frontpage/FrontpageHero';
import { ColoringCategories } from '@/components/frontpage/ColoringCategories';
import Image from 'next/image';
import CategoriesListJsonLd from '@/components/json-ld/CategoriesListJsonLd';

interface Category {
  title: string;
  imageUrl: string;
  slug: string;
  isActive: boolean;
  featured?: boolean;
  order?: number;
}

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata() {
  return {
    title: 'Fargeleggingsbilder Kategorier | Fargelegg Nå',
    description: 'Utforsk alle våre kategorier av fargeleggingsbilder',
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://fargelegg.no'),
  };
}

export default async function Home() {
  const categories: Category[] = await getAllCategories();
  const mainCategories = categories
    .filter((cat) => cat.isActive)
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      if ((a.order ?? 0) !== (b.order ?? 0)) return (a.order ?? 0) - (b.order ?? 0);
      return a.title.localeCompare(b.title);
    })
    .slice(0, 12);

  return (
    <>
      <Header />
      <div className="bg-white">
        <FrontpageHero />
        <main>
          <ColoringCategories
            categories={mainCategories.map((cat) => ({
              name: cat.title,
              imageUrl: cat.imageUrl,
              slug: cat.slug,
            }))}
          />
          
          {/* FAQ Section */}
          <section className="py-16 bg-gray-50" aria-labelledby="faq-heading">
            <div className="container mx-auto px-4 max-w-3xl">
              <h2 id="faq-heading" className="text-3xl font-bold mb-10">Ofte stilte spørsmål</h2>
              <p className="text-gray-600 mb-8">Her finner du svar på vanlige spørsmål om plattformen og hvordan du bruker den.</p>
              
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex justify-between items-center">
                    <h3 id="faq-1" className="text-lg font-semibold">Hvordan registrerer jeg meg?</h3>
                    <button 
                      className="text-gray-500" 
                      aria-expanded="true" 
                      aria-controls="faq-1-content"
                      aria-label="Vis eller skjul svaret på hvordan du registrerer deg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div id="faq-1-content" className="mt-2">
                    <p className="text-gray-600">
                      For å registere deg, klikk på &quot;Registrer deg&quot; knappen på hjemmesiden. Fyll ut skjemaet med nødvendig informasjon. Når du har sendt inn, vil du motta en bekreftelse e-post.
                    </p>
                  </div>
                </div>
                
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex justify-between items-center">
                    <h3 id="faq-2" className="text-lg font-semibold">Er det gratis?</h3>
                    <button 
                      className="text-gray-500" 
                      aria-expanded="true" 
                      aria-controls="faq-2-content"
                      aria-label="Vis eller skjul svaret på om det er gratis"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div id="faq-2-content" className="mt-2">
                    <p className="text-gray-600">
                      Ja, plattformen tilbyr gratis tilgang til grunnleggende funksjoner. Du kan oppgradere til premium for flere verktøy og ressurser. Utforsk alternativene våre for mer informasjon.
                    </p>
                  </div>
                </div>
                
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex justify-between items-center">
                    <h3 id="faq-3" className="text-lg font-semibold">Hvordan lagrer jeg arbeidet?</h3>
                    <button 
                      className="text-gray-500" 
                      aria-expanded="true" 
                      aria-controls="faq-3-content"
                      aria-label="Vis eller skjul svaret på hvordan du lagrer arbeidet"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div id="faq-3-content" className="mt-2">
                    <p className="text-gray-600">
                      Ditt arbeid lagres automatisk når du bruker plattformen. Du kan også lagre det manuelt ved å klikke på &quot;Lagre&quot; knappen. Bruk Dashboard-siden for å se alle lagrede verk.
                    </p>
                  </div>
                </div>
                
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex justify-between items-center">
                    <h3 id="faq-4" className="text-lg font-semibold">Kan jeg dele arbeidet?</h3>
                    <button 
                      className="text-gray-500" 
                      aria-expanded="true" 
                      aria-controls="faq-4-content"
                      aria-label="Vis eller skjul svaret på om du kan dele arbeidet"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div id="faq-4-content" className="mt-2">
                    <p className="text-gray-600">
                      Ja, du kan enkelt dele arbeidet ditt på sosiale medier. Klikk på &quot;Del&quot; knappen for å få tilgang til delingsmuligheter. Vi har også innebygd støtte for å venneliste!
                    </p>
                  </div>
                </div>
                
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex justify-between items-center">
                    <h3 id="faq-5" className="text-lg font-semibold">Hva er premium-funksjoner?</h3>
                    <button 
                      className="text-gray-500" 
                      aria-expanded="true" 
                      aria-controls="faq-5-content"
                      aria-label="Vis eller skjul svaret på hva premium-funksjoner er"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div id="faq-5-content" className="mt-2">
                    <p className="text-gray-600">
                      Premium-funksjoner inkluderer tilgang til flere avanserte farger, spesialeffekter, ubegrenset lagring av dine prosjekter, og mulighet til å laste ned høyoppløselige versjoner av arbeidet ditt. Du får også prioritert støtte fra vårt team.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 text-center">
                <h3 className="text-xl font-bold mb-4">Har du fortsatt spørsmål?</h3>
                <p className="text-gray-600 mb-6">Ta kontakt med oss, så hjelper vi deg så raskt som mulig.</p>
                <Link 
                  href="/contact" 
                  className="border border-black px-6 py-3 rounded inline-block font-medium hover:bg-gray-100"
                  aria-label="Kontakt oss med dine spørsmål"
                >
                  Kontakt oss
                </Link>
              </div>
            </div>
          </section>
          
          {/* Newsletter Section */}
          <section className="py-16 bg-gray-600 text-white" aria-labelledby="newsletter-heading">
            <div className="container mx-auto px-4 max-w-3xl text-center">
              <h2 id="newsletter-heading" className="text-3xl font-bold mb-6">Hold deg oppdatert med nyheter</h2>
              <p className="mb-8">Meld deg på vårt nyhetsbrev for å få de siste oppdateringene og blogginleggene.</p>
              
              <form className="flex flex-col md:flex-row justify-center">
                <input 
                  type="email" 
                  placeholder="Skriv inn e-posten din" 
                  className="px-4 py-3 mb-2 md:mb-0 md:mr-2 rounded-md w-full md:w-auto md:flex-1 text-black focus:outline-none"
                  aria-label="Din e-postadresse"
                  required
                />
                <button 
                  type="submit" 
                  className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800"
                  aria-label="Meld deg på nyhetsbrevet"
                >
                  Meld deg på
                </button>
              </form>
              <p className="text-sm mt-4">Ved å klikke på dette, bekrefter du at du har gyldig e-post.</p>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}
