import React from 'react';
import Link from 'next/link';
import { Category } from '../../src/data/categoriesData';

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export default function CategoryCard({ category, className = '' }: CategoryCardProps) {
  return (
    <div 
      key={category.id} 
      className={`block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${className}`}
    >
      <div 
        className="h-40 relative bg-cover bg-center" 
        style={{ backgroundImage: `url(${category.imageUrl})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white p-2">
          <h2 className="text-lg font-bold mb-2 text-center">
            {category.icon && <span className="mr-2">{category.icon}</span>}
            {category.name}
          </h2>
          <Link 
            href={`/categories/${category.slug}`}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded-md transition-colors text-sm"
          >
            Vis mer
          </Link>
        </div>
      </div>
      <div className="p-2">
        <p className="text-gray-600 text-sm">{category.count} tegninger</p>
      </div>
    </div>
  );
} 