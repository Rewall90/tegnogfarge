import Link from "next/link";
import React from "react";

interface BreadcrumbsProps {
  parentSlug: string;
  parentTitle: string;
  currentTitle: string;
}

export function Breadcrumbs({ parentSlug, parentTitle, currentTitle }: BreadcrumbsProps) {
  return (
    <nav className="mb-6 text-sm">
      <Link href="/categories" className="text-blue-600 hover:underline">
        Alle kategorier
      </Link>
      <span className="mx-2">/</span>
      <Link href={`/categories/${parentSlug}`} className="text-blue-600 hover:underline">
        {parentTitle}
      </Link>
      <span className="mx-2">/</span>
      <span className="text-gray-500">{currentTitle}</span>
    </nav>
  );
} 