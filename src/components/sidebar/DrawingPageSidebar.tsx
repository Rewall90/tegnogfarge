import React from 'react';
import {
  getTrendingSubcategories,
  getPopularSubcategories,
  getNewestSubcategories,
} from '@/lib/sanity';
import { SubcategoryList } from './SubcategoryList';
import { SearchForm } from '../shared/SearchForm';
import { AppDownloadSidebar } from './AppDownloadSidebar';

export async function DrawingPageSidebar() {
  // Fetch all data in parallel
  const [trending, popular, newest] = await Promise.all([
    getTrendingSubcategories(2),
    getPopularSubcategories(7), // This function sorts by the 'order' field
    getNewestSubcategories(7),
  ]);

  return (
    <aside className="w-full md:w-1/4 lg:w-1/4 md:pl-8 mt-8 md:mt-0">
      <div className="sticky top-24 space-y-6">
        {/* App Download Sidebar */}
        <div className="bg-[#FDF2EC] border border-[#2EC4B6]/20 rounded-lg p-6 shadow-sm">
          <div className="mb-6 text-center">
            <h3 className="font-display font-bold text-xl text-[#264653] mb-2">
              Prøv appen vår!
            </h3>
            <p className="text-[#264653] text-sm">
              Scan QR-koden for å laste ned appen
            </p>
          </div>

          <div className="mb-6">
            <div className="flex justify-center items-center p-4 bg-white rounded-lg">
              <a
                href="https://apps.apple.com/no/app/tegn-farge/id6755291484?l=nb"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                aria-label="Last ned Tegn og Farge appen fra App Store - Scan QR kode"
              >
                <img
                  src="/images/qr-code-app.webp"
                  alt="QR kode for å laste ned Tegn og Farge app fra App Store - scan med mobilkamera for å åpne appen direkte"
                  width={160}
                  height={160}
                  className="w-full h-auto"
                />
              </a>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-display font-bold text-lg text-[#264653] mb-3">
              Hjelp oss teste!
            </h4>
            <p className="text-[#264653] text-sm mb-3 italic">
              Vi utvikler appen sammen med deg
            </p>
            <ul className="space-y-2">
              <li className="flex items-start text-[#264653]">
                <span className="text-[#2EC4B6] mr-2">✓</span>
                <span className="text-sm">Bli testbruker</span>
              </li>
              <li className="flex items-start text-[#264653]">
                <span className="text-[#2EC4B6] mr-2">✓</span>
                <span className="text-sm">Gi tilbakemelding</span>
              </li>
              <li className="flex items-start text-[#264653]">
                <span className="text-[#2EC4B6] mr-2">✓</span>
                <span className="text-sm">Påvirk utviklingen</span>
              </li>
            </ul>
          </div>

          <div className="text-center">
            <a
              href="https://apps.apple.com/no/app/tegn-farge/id6755291484?l=nb"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#FF6F59] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#FF6F59]/90 transition-colors text-sm"
            >
              Besøk App Store
            </a>
          </div>
        </div>

        {/* Existing Sidebar Content */}
        <div className="bg-[#FDF2EC] border border-[#2EC4B6]/20 rounded-lg p-6 shadow-sm">
          <div className="mb-8">
            <SearchForm />
          </div>
          <SubcategoryList title="Trending Fargeleggingsark" subcategories={trending} />
          <SubcategoryList
            title="Populære Fargeleggingsark"
            subcategories={popular}
            initialVisibleCount={4}
          />
          <SubcategoryList
            title="Nyeste Fargeleggingsark"
            subcategories={newest}
            initialVisibleCount={4}
          />
        </div>
      </div>
    </aside>
  );
} 