import Link from 'next/link';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { SearchForm } from '@/components/shared/SearchForm';
import NotFoundJsonLd from '@/components/json-ld/NotFoundJsonLd';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Siden ble ikke funnet - 404 | TegnOgFarge.no',
  description: 'Siden du leter etter eksisterer ikke eller har blitt flyttet. Bruk søket for å finne fargeleggingsark, eller gå tilbake til hovedsiden.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    noimageindex: true,
  },
};

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <NotFoundJsonLd />
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center max-w-2xl px-4">
          <h1 className="text-6xl font-bold text-navy mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-navy mb-6">
            Siden ble ikke funnet
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Siden du leter etter eksisterer ikke eller har blitt flyttet.
          </p>
          
          <div className="space-y-6">
            <div className="bg-cream p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-navy mb-4">
                Søk etter fargeleggingsark
              </h3>
              <SearchForm />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/"
                className="bg-[#FFA69E] text-white px-6 py-3 rounded-lg hover:bg-[#FF8A80] transition-colors"
              >
                Tilbake til forsiden
              </Link>
              <Link
                href="/hoved-kategori"
                className="bg-[#AED6F1] text-navy px-6 py-3 rounded-lg hover:bg-[#85C1E9] transition-colors"
              >
                Se alle kategorier
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 