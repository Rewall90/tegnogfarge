"use client";

import Link from "next/link";
import React from "react";

export function FrontpageHero() {
  return (
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
  );
} 