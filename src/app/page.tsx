"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../../components/shared/Header";
import Footer from "../../components/shared/Footer";
import { useState } from "react";
import { categories, Category } from "../data/categoriesData";
import CategoryCard from "../../components/ui/CategoryCard";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gray-600 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold mb-4">
                Slipp fantasien løs – fargelegg på din måte
              </h1>
              <p className="text-lg mb-8">
                Velkommen til et sted der kreativitet har frihet. Her kan du leke med 
                farger, uttrykke motiver og lage noe helt eget. Alt du trenger å gjøre 
                er å starte – så tar vi deg med videre.
              </p>
              <Link 
                href="/coloring" 
                className="bg-white text-black px-6 py-3 rounded inline-block font-medium hover:bg-gray-100"
                aria-label="Kom i gang med fargelegging"
              >
                Kom i Gang
              </Link>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-16" aria-labelledby="how-it-works-heading">
          <div className="container mx-auto px-4">
            <h2 id="how-it-works-heading" className="sr-only">Slik fungerer det</h2>
            <div className="flex flex-col md:flex-row gap-12">
              <div className="md:w-1/2">
                <div className="flex items-start mb-8">
                  <div className="bg-black text-white p-3 rounded-md mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Slik fungerer det</h3>
                    <p className="text-gray-600">
                      Oppdag en enkel og morsom måte å fargelegge bilder på med vårt verktøy.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start mb-8">
                  <div className="bg-black text-white p-3 rounded-md mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Registrer deg nå</h3>
                    <p className="text-gray-600">
                      Lag en konto for å lagre dine fargelegginger og få tilgang til flere funksjoner.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-black text-white p-3 rounded-md mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Fargelegge bilder</h3>
                    <p className="text-gray-600">
                      Bruk vårt intuitive grensesnitt for å fargelegge bilder med enkel verktøy.
                    </p>
                  </div>
                </div>
                
                <div className="mt-10">
                  <Link 
                    href="/coloring" 
                    className="border border-black px-6 py-3 rounded inline-block font-medium hover:bg-gray-100"
                    aria-label="Start fargelegging nå"
                  >
                    Start fargelegging
                  </Link>
                </div>
              </div>
              
              <div className="md:w-1/2 bg-gray-200 rounded-lg">
                <div className="h-full flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gray-400 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Popular Categories Section */}
        <section className="py-16 bg-gray-50" aria-labelledby="categories-heading">
          <div className="container mx-auto px-4">
            <h2 id="categories-heading" className="text-3xl font-bold text-center mb-4">
              Se på noen av våre mest populære kategorier
            </h2>
            <p className="text-center text-gray-600 mb-12">
              Utforsk vårt utvalg av fargelige bilder.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category: Category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-16" aria-labelledby="testimonials-heading">
          <div className="container mx-auto px-4">
            <h2 id="testimonials-heading" className="text-3xl font-bold mb-12">Kundeanmeldelser</h2>
            <p className="text-gray-600 mb-10">Dette verktøyet har virkelig gjort fargelegging moro!</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="mb-8">
                <div className="flex mb-2" aria-label="5 av 5 stjerner">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-lg font-bold mb-4">"Jeg elsker hvor enkelt det er å bruke!"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3" aria-hidden="true"></div>
                  <div>
                    <p className="font-semibold">Ole Nordmann</p>
                    <p className="text-sm text-gray-600">Designer, Kreativ AS</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <div className="flex mb-2" aria-label="5 av 5 stjerner">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-lg font-bold mb-4">"En fantastisk plattform for alle kunstnere!"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3" aria-hidden="true"></div>
                  <div>
                    <p className="font-semibold">Kari Nordmann</p>
                    <p className="text-sm text-gray-600">Markedsfører, Kunstner</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <div className="flex mb-2" aria-label="5 av 5 stjerner">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-lg font-bold mb-4">"Fargelegging har aldri vært så gøy!"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3" aria-hidden="true"></div>
                  <div>
                    <p className="font-semibold">Per Hansen</p>
                    <p className="text-sm text-gray-600">Utvikler, Tech AS</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
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
                    For å registere deg, klikk på "Registrer deg" knappen på hjemmesiden. Fyll ut skjemaet med nødvendig informasjon. Når du har sendt inn, vil du motta en bekreftelse e-post.
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
                    Ditt arbeid lagres automatisk når du bruker plattformen. Du kan også lagre det manuelt ved å klikke på "Lagre" knappen. Bruk Dashboard-siden for å se alle lagrede verk.
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
                    Ja, du kan enkelt dele arbeidet ditt på sosiale medier. Klikk på "Del" knappen for å få tilgang til delingsmuligheter. Vi har også innebygd støtte for å venneliste!
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
      <Footer />
    </>
  );
}
