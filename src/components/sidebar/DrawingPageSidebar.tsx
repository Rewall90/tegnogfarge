import React from 'react';
import {
  getTrendingSubcategories,
  getPopularSubcategories,
  getNewestSubcategories,
} from '@/lib/sanity';
import { SubcategoryList } from './SubcategoryList';
import { SearchForm } from '../shared/SearchForm';

export async function DrawingPageSidebar() {
  // Fetch all data in parallel
  const [trending, popular, newest] = await Promise.all([
    getTrendingSubcategories(2),
    getPopularSubcategories(7), // This function sorts by the 'order' field
    getNewestSubcategories(7),
  ]);

  return (
    <aside className="w-full md:w-1/4 lg:w-1/4 md:pl-8 mt-8 md:mt-0">
      <div className="sticky top-24">
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