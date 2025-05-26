import React from 'react';
import Link from 'next/link';
import { Category } from '../../src/data/categoriesData';

interface RelatedCategoriesSectionProps {
  categories: Category[];
  title?: string;
  className?: string;
}

export default function RelatedCategoriesSection({ 
  categories, 
  title = 'Relaterte kategorier',
  className = ''
}: RelatedCategoriesSectionProps) {
  if (!categories || categories.length === 0) {
    return null;
  }
  
  return (
    <div className={`mb-12 ${className}`}>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link 
            href={`/categories/${category.slug}`}
            key={category.slug}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow text-center"
          >
            <div className="h-20 bg-gray-100 rounded mb-3 flex items-center justify-center overflow-hidden">
              <img 
                src={category.imageUrl} 
                alt={category.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-medium">{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
} 