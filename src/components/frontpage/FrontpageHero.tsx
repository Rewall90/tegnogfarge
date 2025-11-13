"use client";

import Link from "next/link";
import React from "react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { ButtonHeroSection } from "../buttons/ButtonHeroSection";
import { SearchForm } from "../shared/SearchForm";
import { trackImagePerformance } from "@/utils/imageLoadingMetrics";

interface FrontpageHeroProps {
  dailyDrawingUrl?: string;
}

export function FrontpageHero({ dailyDrawingUrl }: FrontpageHeroProps) {
  // Lazy load performance tracking after initial paint to reduce JavaScript evaluation time
  React.useEffect(() => {
    // Use requestIdleCallback for better performance, fallback to setTimeout
    const loadPerformanceTracking = () => {
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
    };

    let cleanup: (() => void) | undefined;
    
    if ('requestIdleCallback' in window) {
      const idleCallbackId = window.requestIdleCallback(() => {
        cleanup = loadPerformanceTracking();
      });
      
      return () => {
        window.cancelIdleCallback(idleCallbackId);
        cleanup?.();
      };
    } else {
      // Fallback for browsers without requestIdleCallback
      const timeoutId = setTimeout(() => {
        cleanup = loadPerformanceTracking();
      }, 1);
      
      return () => {
        clearTimeout(timeoutId);
        cleanup?.();
      };
    }
  }, []);

  return (
    <section className="bg-[#FEFAF6] min-h-screen flex flex-col justify-start relative" aria-labelledby="hero-heading">
      <div className="max-w-6xl mx-auto px-4">
        <div className="py-8 md:py-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-center">
            <div className="max-w-xl md:col-span-2">
              <h1 id="hero-heading" className="text-heading md:text-[3.50rem] md:leading-tight mb-4 text-[#264653] font-bold">
                Gratis Fargeleggingsark For Barn og Voksne
              </h1>
              <p className="mb-6 text-[#264653] text-lg md:text-xl">
                <span className="md:hidden">Last ned, skriv ut eller fargelegg direkte i nettleseren</span>
                <span className="hidden md:block">Perfekt for hjemme, barnehage og skole. For barn og voksne i alle aldre!</span>
              </p>
              
              <div className="mt-6 max-w-md">
                <SearchForm />
                <ButtonHeroSection dailyDrawingUrl={dailyDrawingUrl} />
              </div>
            </div>
            
            <div className="hidden md:block relative w-full max-w-[800px] h-[800px] mx-auto md:col-span-3">
              <OptimizedImage 
                src="/images/hero section/fargelegging-barn-voksne-gratis-motiver.webp"
                alt="Fargelegg og last ned motiver for barn og voksne – helt gratis!"
                fill
                sizes="(max-width: 768px) 0vw, 50vw"
                className="object-contain rounded-lg"
                isPriority={true}
                fadeIn={false} // No fade for LCP element
              />
            </div>
          </div>
          
          {/* Stats Grid - 3 columns */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 mt-16 text-center">
            <div className="flex flex-col items-center">
              <OptimizedImage 
                src="/images/hero section/antall-nedlastninger.png" 
                alt="Ikon som viser antall nedlastninger av fargeleggingsark - over 6000 nedlastninger" 
                width={80}
                height={80}
                className="mb-3"
                loading="lazy"
              />
              <p className="text-[30px] font-bold text-[#264653] mb-1 font-quicksand">6000+</p>
              <p className="text-[20px] text-[#264653]/70 font-quicksand">Nedlastninger</p>
            </div>
            
            <div className="flex flex-col items-center">
              <OptimizedImage 
                src="/images/hero section/timer-fargelagt.png" 
                alt="Ikon som viser timer brukt på fargelegging - over 5780 timer aktivitet" 
                width={80}
                height={80}
                className="mb-3"
                loading="lazy"
              />
              <p className="text-[30px] font-bold text-[#264653] mb-1 font-quicksand">5780+</p>
              <p className="text-[20px] text-[#264653]/70 font-quicksand">Timer Fargelagt</p>
            </div>
            
            <div className="flex flex-col items-center">
              <OptimizedImage 
                src="/images/hero section/registrerte-brukere.png" 
                alt="Ikon som viser antall registrerte brukere av fargeleggingsplattformen - 670 aktive brukere" 
                width={80}
                height={80}
                className="mb-3"
                loading="lazy"
              />
              <p className="text-[30px] font-bold text-[#264653] mb-1 font-quicksand">670+</p>
              <p className="text-[20px] text-[#264653]/70 font-quicksand">Brukere</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 