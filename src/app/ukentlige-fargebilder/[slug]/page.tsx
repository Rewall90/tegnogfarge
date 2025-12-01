import { getWeeklyCollection, getAllWeeklyCollections } from '@/lib/sanity';
import { PortableText } from '@portabletext/react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Revalidate every hour for fresh data
export const revalidate = 3600;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Format date in Norwegian
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default async function WeeklyCollectionPage({ params: paramsPromise }: PageProps) {
  const { slug } = await paramsPromise;
  const collection = await getWeeklyCollection(slug);

  if (!collection) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-navy">
            {collection.title}
          </h1>

          {collection.publishedDate && (
            <p className="text-navy/70 mb-4">
              Publisert: {formatDate(collection.publishedDate)}
            </p>
          )}

          {collection.description && (
            <p className="text-lg text-navy/80 mb-6 max-w-2xl mx-auto">
              {collection.description}
            </p>
          )}
        </div>

        {/* Content - Two Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {collection.content && Array.isArray(collection.content) && collection.content.map((item: any, index: number) => {
            // Rich text block (full width)
            if (item._type === 'block') {
              return (
                <div key={`block-${index}`} className="md:col-span-2 prose prose-lg max-w-none prose-headings:text-navy prose-p:text-navy">
                  <PortableText value={[item]} />
                </div>
              );
            }

            // Email coloring image (grid item)
            if (item._type === 'emailColoringImage') {
              return (
                <div
                  key={`image-${index}-${item._key || index}`}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-navy/10 hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Image */}
                  <div className="relative w-full aspect-[3/4] bg-cream">
                    <Image
                      src={item.imageUrl}
                      alt={item.imageAlt || item.title}
                      fill
                      className="object-contain p-4"
                      placeholder={item.imageLqip ? 'blur' : 'empty'}
                      blurDataURL={item.imageLqip}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6 bg-white">
                    <h3 className="text-xl font-display font-bold mb-2 text-navy">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-navy/70 mb-4 text-sm">
                        {item.description}
                      </p>
                    )}

                    {/* Download button */}
                    {item.pdfUrl && (
                      <a
                        href={item.pdfUrl}
                        download
                        className="inline-block w-full text-center px-6 py-3 bg-link-orange hover:bg-link-orange/90 text-white font-medium rounded-lg transition-colors duration-200"
                      >
                        Last ned PDF
                      </a>
                    )}
                  </div>
                </div>
              );
            }

            // Reference to existing drawingImage (grid item)
            if (item._type === 'drawingImage') {
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-navy/10 hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Image */}
                  <div className="relative w-full aspect-[3/4] bg-cream">
                    {item.thumbnail && (
                      <Image
                        src={item.thumbnail.url}
                        alt={item.thumbnail.alt || item.title}
                        fill
                        className="object-contain p-4"
                        placeholder={item.thumbnail.lqip ? 'blur' : 'empty'}
                        blurDataURL={item.thumbnail.lqip}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 bg-white">
                    <h3 className="text-xl font-display font-bold mb-2 text-navy">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-navy/70 mb-4 text-sm">
                        {item.description}
                      </p>
                    )}

                    {/* Download button */}
                    {item.pdfUrl && (
                      <a
                        href={item.pdfUrl}
                        download
                        className="inline-block w-full text-center px-6 py-3 bg-link-orange hover:bg-link-orange/90 text-white font-medium rounded-lg transition-colors duration-200"
                      >
                        Last ned PDF
                      </a>
                    )}
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-link-orange hover:text-link-orange/80 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Tilbake til forsiden
          </Link>
        </div>
      </div>
    </main>
  );
}

// Don't pre-render any routes at build time - render on-demand with ISR
export async function generateStaticParams() {
  return [];
}

// Generate metadata
export async function generateMetadata({ params: paramsPromise }: PageProps) {
  const { slug } = await paramsPromise;
  const collection = await getWeeklyCollection(slug);

  if (!collection) {
    return {
      title: 'Samling ikke funnet',
    };
  }

  return {
    title: `${collection.title} - TegnOgFarge.no`,
    description: collection.description || 'Ukentlige fargebilder fra TegnOgFarge.no',
  };
}
