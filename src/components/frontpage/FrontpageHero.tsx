"use client";

import Link from "next/link";
import React from "react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { ButtonHeroSection } from "../buttons/ButtonHeroSection";
import { SearchForm } from "../shared/SearchForm";
import { trackImagePerformance } from "@/utils/imageLoadingMetrics";

export function FrontpageHero() {
  // Set up performance tracking for hero image (critical for LCP)
  React.useEffect(() => {
    const cleanup = trackImagePerformance({
      debug: true,
      trackAllImages: false, // Only track LCP for hero
      onMetricsCollected: (metrics) => {
        if (metrics.isLCP) {
          console.log('[Hero LCP] Performance metrics:', metrics);
          // In production, send to analytics service
        }
      }
    });
    
    return cleanup;
  }, []);

  return (
    <section className="bg-[#FEFAF6]" aria-labelledby="hero-heading">
      <div className="max-w-6xl mx-auto">
        <div className="px-6 py-8 md:px-12 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
            <div className="max-w-xl">
              <h1 id="hero-heading" className="text-heading mb-4 text-[#264653] font-bold">
                Fantasien har ingen grenser med våre gratis fargeleggingsark – Perfekt for Barn og Voksne!
              </h1>
              <p className="mb-6 text-[#264653] text-lg">
                Last ned, skriv ut eller fargelegg direkte i nettleseren – våre gratis fargeleggingsark er morsomme, lærerike og kreative. Perfekte til bruk hjemme, i barnehagen eller på skolen. Utforsk <strong className="font-bold">tusenvis</strong> av motiver som inspirerer og engasjerer barn og voksne i alle aldre.
              </p>
              
              <div className="mt-6 max-w-md">
                <SearchForm />
                <ButtonHeroSection />
              </div>
            </div>
            
            <div className="hidden md:block md:-mr-12 md:ml-4 md:h-[535px] relative">
              <OptimizedImage 
                src="/images/hero section/fargelegging-barn-voksne-gratis-motiver.webp"
                alt="Fargelegg og last ned motiver for barn og voksne – helt gratis!"
                fill
                sizes="(max-width: 768px) 0vw, 50vw"
                className="object-cover rounded-l-lg"
                isPriority={true}
                fadeIn={false} // No fade for LCP element
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 