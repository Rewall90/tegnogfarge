import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Innhold fjernet - TegnOgFarge.no',
  description: 'Dette innholdet har blitt permanent fjernet av juridiske årsaker.',
  robots: 'noindex, nofollow',
};

export default function GonePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FEFAF6]">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="max-w-2xl mx-auto text-center px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-navy mb-4 font-display">
              Innhold fjernet
            </h1>
            <div className="text-6xl mb-6">⚠️</div>
            <p className="text-lg text-gray-600 mb-6">
              Dette innholdet har blitt permanent fjernet av juridiske årsaker knyttet til opphavsrett.
            </p>
            <p className="text-base text-gray-500 mb-8">
              Vi beklager for eventuelle ulemper dette måtte medføre.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block bg-[#E76F51] text-white px-6 py-3 rounded-lg hover:bg-[#D4634B] transition-colors font-medium"
            >
              Gå til forsiden
            </Link>
            <div className="text-sm text-gray-500">
              <Link href="/hoved-kategori" className="text-[#E76F51] hover:underline">
                Utforsk alle kategorier
              </Link>
              {' eller '}
              <Link href="/search" className="text-[#E76F51] hover:underline">
                søk etter andre tegninger
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}