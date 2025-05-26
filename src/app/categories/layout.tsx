import React from 'react';
import { Metadata } from 'next';

// Metadata for hovedkategorisiden
export const metadata: Metadata = {
  title: 'Alle Kategorier | Fargelegg Nå',
  description: 'Utforsk alle våre kategorier med fargeleggingsbilder. Vi har tegninger for alle aldre og interesser.',
  keywords: ['kategorier', 'fargelegging', 'tegninger', 'kreativitet', 'hobby'],
  openGraph: {
    title: 'Alle Kategorier | Fargelegg Nå',
    description: 'Utforsk alle våre kategorier med fargeleggingsbilder. Vi har tegninger for alle aldre og interesser.',
    url: 'categories',
    siteName: 'Fargelegg Nå',
    images: [
      {
        url: '/images/categories-overview.jpg',
        width: 1200,
        height: 630,
        alt: 'Oversikt over alle kategorier'
      }
    ],
    locale: 'nb_NO',
    type: 'website',
  }
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  );
} 