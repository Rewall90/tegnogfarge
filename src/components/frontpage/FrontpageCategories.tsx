import React from 'react';
import type { Category } from '../../../models/category';
import Link from 'next/link';

interface FrontpageCategoriesProps {
  categories: Pick<Category, 'name' | 'imageUrl' | 'slug'>[];
}

export function FrontpageCategories({ categories }: FrontpageCategoriesProps) {
  return (
    <section className="flex flex-col w-full py-8 px-4 md:px-12 xl:px-32 bg-[#f8fafc] rounded-2xl shadow-md">
      <h1 className="text-[#101618] text-3xl md:text-4xl font-extrabold leading-tight text-center mb-2">Coloring Fun</h1>
      <h2 className="text-[#101618] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-6 pt-2">
        Explore Our Coloring Categories
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
        {categories.map((cat) => (
          <div key={cat.slug} className="flex flex-col items-center">
            <Link href={`/categories/${cat.slug}`} className="block w-full">
              <div className="relative w-full aspect-[4/5] bg-[#2EC4B6] rounded-[32px] shadow-lg flex flex-col items-center justify-center overflow-hidden transition-transform duration-200 hover:scale-105 hover:shadow-xl">
                {/* Kategori-bilde */}
                {cat.imageUrl && (
                  <img src={cat.imageUrl} alt={cat.name} className="w-36 h-36 object-contain mb-4 mt-10" />
                )}
                {/* Kategori-navn */}
                <div className="mt-auto mb-10 text-white text-2xl font-bold text-center w-full drop-shadow-sm">
                  {cat.name}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
} 