'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Type for the subcategories we receive as props
interface SidebarSubcategory {
  _id: string;
  title: string;
  slug: string;
  parentCategory: {
    slug: string;
  };
}

interface SubcategoryListProps {
  title: string;
  subcategories: SidebarSubcategory[];
  initialVisibleCount?: number;
}

export function SubcategoryList({
  title,
  subcategories,
  initialVisibleCount = 100, // Default to a high number to show all
}: SubcategoryListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (subcategories.length === 0) {
    return null;
  }

  const canBeExpanded = subcategories.length > initialVisibleCount;
  const visibleSubcategories = canBeExpanded && !isExpanded
    ? subcategories.slice(0, initialVisibleCount)
    : subcategories;

  return (
    <div className="mb-8">
      <h3 className="font-bold text-lg text-navy mb-3">{title}</h3>
      <ul>
        {visibleSubcategories.map((sub) => (
          <li key={sub._id} className="mb-2">
            <Link
              href={`/${sub.parentCategory.slug}/${sub.slug}`}
              className="text-body hover:text-blue-600 hover:underline transition-colors"
            >
              {sub.title}
            </Link>
          </li>
        ))}
      </ul>
      {canBeExpanded && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 font-semibold hover:underline text-sm mt-2"
        >
          {isExpanded ? 'Vis mindre' : 'Vis mer'}
        </button>
      )}
    </div>
  );
} 