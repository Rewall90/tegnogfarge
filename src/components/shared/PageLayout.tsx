import React from 'react';
import Header from './Header';
import Footer from './Footer';
// import Breadcrumbs, { BreadcrumbItem } from './Breadcrumbs'; // No longer rendered here

interface PageLayoutProps {
  children: React.ReactNode;
  // breadcrumbItems?: BreadcrumbItem[]; // No longer needed here
  className?: string;
  wrapperClassName?: string;
}

export default function PageLayout({ 
  children, 
  // breadcrumbItems,
  className = '',
  wrapperClassName = ''
}: PageLayoutProps) {
  return (
    <>
      <Header />
      <div className={`flex-grow ${wrapperClassName}`}>
        <main className={`container mx-auto px-4 py-8 ${className}`}>
          {/* {breadcrumbItems && <Breadcrumbs items={breadcrumbItems} />} */}
          {children}
        </main>
      </div>
      <Footer />
    </>
  );
} 