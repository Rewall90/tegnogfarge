import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Breadcrumbs, { BreadcrumbItem } from './Breadcrumbs';

interface PageLayoutProps {
  children: React.ReactNode;
  breadcrumbItems?: BreadcrumbItem[];
  className?: string;
}

export default function PageLayout({ 
  children, 
  breadcrumbItems,
  className = '' 
}: PageLayoutProps) {
  return (
    <>
      <Header />
      <main className={`container mx-auto px-4 py-8 flex-grow ${className}`}>
        {breadcrumbItems && <Breadcrumbs items={breadcrumbItems} />}
        {children}
      </main>
      <Footer />
    </>
  );
} 