import React from 'react';
import {
  getTrendingSubcategories,
  getPopularSubcategories,
  getNewestSubcategories,
} from '@/lib/sanity';
import { SubcategoryList } from './SubcategoryList';
import { SearchForm } from '../shared/SearchForm';
import { AppDownloadSidebar } from './AppDownloadSidebar';
import { sidebarListingsTranslations } from '@/i18n/translations/sidebarListings';
import type { Locale } from '@/i18n';

interface DrawingPageSidebarProps {
  locale?: Locale;
}

export async function DrawingPageSidebar({ locale = 'no' }: DrawingPageSidebarProps) {
  // Fetch all data in parallel
  const [trending, popular, newest] = await Promise.all([
    getTrendingSubcategories(2),
    getPopularSubcategories(7), // This function sorts by the 'order' field
    getNewestSubcategories(7),
  ]);

  const t = sidebarListingsTranslations[locale] || sidebarListingsTranslations.no;

  return (
    <aside className="w-full md:w-1/4 lg:w-1/4 md:pl-8 mt-8 md:mt-0">
      <div className="sticky top-24 space-y-6">
        {/* App Download Sidebar */}
        <div className="bg-[#FDF2EC] border border-[#2EC4B6]/20 rounded-lg p-6 shadow-sm">
          <AppDownloadSidebar locale={locale} />
        </div>

        {/* Existing Sidebar Content */}
        <div className="bg-[#FDF2EC] border border-[#2EC4B6]/20 rounded-lg p-6 shadow-sm">
          <div className="mb-8">
            <SearchForm />
          </div>
          <SubcategoryList title={t.trending} subcategories={trending} />
          <SubcategoryList
            title={t.popular}
            subcategories={popular}
            initialVisibleCount={4}
          />
          <SubcategoryList
            title={t.newest}
            subcategories={newest}
            initialVisibleCount={4}
          />
        </div>
      </div>
    </aside>
  );
} 