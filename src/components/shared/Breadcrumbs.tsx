import React from 'react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav className={`flex mb-8 text-sm ${className}`} aria-label="Brødsmulesti">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        // Render separator except for the last item
        const separator = !isLast ? (
          <span className="mx-2">/</span>
        ) : null;
        
        // Render item as a link or a span based on if it's the last item or has href
        const element = !isLast && item.href ? (
          <Link href={item.href} className="text-[#FF6F59] hover:underline">
            {item.label}
          </Link>
        ) : (
          <span className={isLast ? "font-medium text-[#264653]" : ""}>{item.label}</span>
        );
        
        return (
          <React.Fragment key={index}>
            {element}
            {separator}
          </React.Fragment>
        );
      })}
    </nav>
  );
} 