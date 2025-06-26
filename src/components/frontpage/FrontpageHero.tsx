"use client";

import Link from "next/link";
import React from "react";
import Image from "next/image";
import { ButtonHeroSection } from "../buttons/ButtonHeroSection";
import { SearchForm } from "../shared/SearchForm";

export function FrontpageHero() {
  return (
    <section className="bg-[#FEFAF6]" aria-labelledby="hero-heading">
      <div className="max-w-6xl mx-auto">
        <div className="px-6 py-8 md:px-12 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
            <div className="max-w-xl">
              <h1 id="hero-heading" className="text-heading mb-4 text-[#264653] font-bold">
                Imagination has no limits with our free coloring pages that inspire creativity and endless fun.
              </h1>
              <p className="text-body mb-6 text-[#264653]">
                Download and print free coloring pages to spark creativity and fun.
                Perfect for home or classroom use, our collection is designed to inspire
                endless imagination.
              </p>
              
              <div className="mt-6 max-w-md">
                <SearchForm />
                <ButtonHeroSection />
              </div>
            </div>
            
            <div className="hidden md:block md:-mr-12 md:ml-4 md:h-[400px] relative">
              <Image 
                src="/images/hero section/test bildet.png"
                alt="Children coloring together"
                fill
                className="object-cover rounded-l-lg"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 