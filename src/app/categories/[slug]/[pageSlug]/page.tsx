import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';
import PageLayout from '../../../../../components/shared/PageLayout';
import { BreadcrumbItem } from '../../../../../components/shared/Breadcrumbs';
import ShareButtons from '../../../../../components/ui/ShareButtons';
import Button from '../../../../../components/ui/Button';
import { getCategoryBySlug, getCategoryPages, categories } from '../../../../data/categoriesData';

interface ColoringPageProps {
  params: {
    slug: string;
    pageSlug: string;
  };
}

// Generate metadata for each coloring page
export async function generateMetadata(
  { params }: ColoringPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug, pageSlug } = params;
  const category = getCategoryBySlug(slug);
  
  if (!category) {
    return {
      title: 'Side ikke funnet',
      description: 'Beklager, denne siden eksisterer ikke'
    };
  }
  
  const pages = getCategoryPages(slug);
  const page = pages.find(p => p.slug === pageSlug);
  
  if (!page) {
    return {
      title: 'Side ikke funnet',
      description: 'Beklager, denne siden eksisterer ikke'
    };
  }

  return {
    title: `${page.title} Fargeleggingsbilder | ${category.name} | Fargelegg Nå`,
    description: `Last ned gratis ${page.title.toLowerCase()} fargeleggingsbilde. Perfekt for barn og voksne. Print ut og start å fargelegge nå!`,
    keywords: [`${page.title.toLowerCase()}`, `${category.name.toLowerCase()}`, 'fargelegging', 'utskrift', 'gratis'],
    openGraph: {
      title: `${page.title} Fargeleggingsbilder | ${category.name}`,
      description: `Last ned gratis ${page.title.toLowerCase()} fargeleggingsbilde. Perfekt for barn og voksne.`,
      url: `categories/${slug}/${pageSlug}`,
      siteName: 'Fargelegg Nå',
      images: [
        {
          url: page.imageUrl,
          width: 1200,
          height: 630,
          alt: `${page.title} fargeleggingsbilde`
        }
      ],
      locale: 'nb_NO',
      type: 'website',
    }
  };
}

export default function ColoringPage({ params }: ColoringPageProps) {
  const { slug, pageSlug } = params;
  const category = getCategoryBySlug(slug);
  
  if (!category) {
    notFound();
  }
  
  const pages = getCategoryPages(slug);
  const page = pages.find(p => p.slug === pageSlug);
  
  if (!page) {
    notFound();
  }
  
  // Create sample coloring images for this page (in a real app, these would come from the database)
  let coloringImages = [];
  
  // Special handling for bursdag page to use the actual PDF file
  if (pageSlug === 'bursdag' && slug === 'feiringer') {
    coloringImages = [
      {
        id: `${page.id}-1`,
        title: `Happy Birthday Coloring Page`,
        imageUrl: `/categories%20downloadable%20images/feiringer/bursdag/images-for-background/happy-birthday-coloring-page-768x1075.avif`,
        description: `En tre-etasjes kake med roser og dryppende glasur. "HAPPY BIRTHDAY" står skrevet over kaken.`,
        downloadUrl: `/categories%20downloadable%20images/feiringer/bursdag/happy-birthday-coloring-page.pdf`,
        buttonText: `Last ned bursdagskake (PDF)`
      },
      {
        id: `${page.id}-2`,
        title: `Happy Birthday Dad Coloring Page`,
        imageUrl: `/categories%20downloadable%20images/feiringer/bursdag/images-for-background/happy-birthday-dad-coloring-pages-768x1075.avif`,
        description: `En fin bursdagstegning til pappa. Perfekt for barn som vil feire sin far.`,
        downloadUrl: `/categories%20downloadable%20images/feiringer/bursdag/happy-birthday-dad-coloring-pages.pdf`,
        buttonText: `Last ned pappa-bursdagsbilde (PDF)`
      }
    ];
  } else {
    // Default coloring images for other pages
    coloringImages.push(
      {
        id: `${page.id}-1`,
        title: `${page.title} 1`,
        imageUrl: page.imageUrl,
        description: `En fin ${page.title.toLowerCase()} tegning perfekt for fargelegging.`,
        downloadUrl: `/images/download/${page.slug}-1.pdf`,
        buttonText: 'Last ned PDF'
      },
      {
        id: `${page.id}-2`,
        title: `${page.title} 2`,
        imageUrl: page.imageUrl,
        description: `En annen versjon av ${page.title.toLowerCase()} for kreativ fargelegging.`,
        downloadUrl: `/images/download/${page.slug}-2.pdf`,
        buttonText: 'Last ned PDF'
      },
      {
        id: `${page.id}-3`,
        title: `${page.title} 3`,
        imageUrl: page.imageUrl,
        description: `Enda en flott ${page.title.toLowerCase()} tegning for alle aldre.`,
        downloadUrl: `/images/download/${page.slug}-3.pdf`,
        buttonText: 'Last ned PDF'
      },
      {
        id: `${page.id}-4`,
        title: `${page.title} 4`,
        imageUrl: page.imageUrl,
        description: `Prøv denne ${page.difficulty?.toLowerCase() || 'fine'} ${page.title.toLowerCase()} tegningen.`,
        downloadUrl: `/images/download/${page.slug}-4.pdf`,
        buttonText: 'Last ned PDF'
      }
    );
  }
  
  // Set up breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Hjem', href: '/' },
    { label: 'Kategorier', href: '/categories' },
    { label: category.name, href: `/categories/${category.slug}` },
    { label: page.title },
  ];

  // Current page URL for sharing
  const pageUrl = `/categories/${slug}/${pageSlug}`;

  // Find related pages from the same category (excluding current page)
  const relatedPages = pages
    .filter(p => p.slug !== pageSlug)
    .slice(0, 4);

  return (
    <PageLayout breadcrumbItems={breadcrumbItems}>
      <div className="max-w-5xl mx-auto">
        {/* Page Header with Title */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            {page.title} Fargeleggingsbilder
          </h1>
          
          {/* Share Buttons - Centered below title */}
          <div className="flex justify-center mb-6">
            <ShareButtons 
              url={pageUrl} 
              title={`${page.title} Fargeleggingsbilder | Fargelegg Nå`} 
            />
          </div>
          
          {/* Introduction */}
          <div className="mb-10 max-w-3xl mx-auto">
            <p className="text-lg text-gray-700">
              Velkommen til vår samling av {page.title.toLowerCase()} fargeleggingsbilder. Her finner du høykvalitets tegninger som er klare for utskrift. Disse bildene er designet for å bringe kreativitet og glede til både barn og voksne. Bare last ned, skriv ut, og begynn å fargelegge!
            </p>
          </div>
        </div>

        {/* Related Pages - Small link cards */}
        {relatedPages.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Du kan også like disse sidene</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedPages.map((relatedPage) => (
                <a 
                  key={relatedPage.id}
                  href={`/categories/${category.slug}/${relatedPage.slug}`}
                  className="block bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div 
                    className="h-32 bg-cover bg-center" 
                    style={{ backgroundImage: `url(${relatedPage.imageUrl})` }}
                  />
                  <div className="p-3 text-center">
                    <h3 className="font-medium text-sm">{relatedPage.title}</h3>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Downloadable Coloring Images */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">{page.title} Fargeleggingsbilder</h2>
          
          {/* Special message for bursdag page */}
          {pageSlug === 'bursdag' && slug === 'feiringer' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-center">
              <p className="text-blue-800">
                Vi har spesielle bursdagsbilder som du kan laste ned og skrive ut. 
                Disse bildene er perfekte for barn som ønsker å fargelegge bursdagstegninger!
              </p>
            </div>
          )}
          
          <div className={`grid grid-cols-1 ${pageSlug === 'bursdag' && slug === 'feiringer' ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-2'} gap-6`}>
            {coloringImages.map((img) => (
              <div 
                key={img.id} 
                className={`border rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow ${pageSlug === 'bursdag' && slug === 'feiringer' ? 'bg-white' : ''}`}
              >
                {pageSlug === 'bursdag' && slug === 'feiringer' ? (
                  <>
                    <div className="pb-0">
                      <img 
                        src={img.imageUrl} 
                        alt={img.title}
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="bg-black px-6 pb-6 pt-4 text-center">
                      <p className="text-blue-300 text-sm mb-4">{img.description}</p>
                      <a 
                        href={img.downloadUrl}
                        className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded transition-colors"
                        download
                      >
                        {img.buttonText}
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <div 
                      className="h-[300px] bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${img.imageUrl})` }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white bg-opacity-80 px-6 py-2 rounded-lg">
                          <h3 className="font-bold text-lg">{img.title}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-gray-600 mb-5">{img.description}</p>
                      <div className="text-center">
                        <Button 
                          href={img.downloadUrl}
                          variant="primary"
                          ariaLabel={`Last ned ${img.title}`}
                          className="w-full py-3 text-base"
                        >
                          {pageSlug === 'bursdag' && slug === 'feiringer' ? 
                            // @ts-ignore - buttonText exists on bursdag images
                            img.buttonText : 'Last ned PDF'
                          }
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tips for Coloring Section */}
        <div className="mb-16 bg-gray-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Tips for fargelegging</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            <p>Her er noen tips for å få mest mulig ut av dine fargeleggingsbilder:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Skriv ut på tykt papir for best resultat</li>
              <li>Prøv forskjellige materialer: fargeblyanter, tusjer, akvarellmaling</li>
              <li>Start med de lyseste fargene og jobb deg mot de mørkere</li>
              <li>Ta pauser for å hvile øynene og hånden</li>
              <li>Lag en kopi i tilfelle du ønsker å prøve forskjellige fargekombinasjoner</li>
            </ul>
          </div>
        </div>

        {/* Return to Category Button */}
        <div className="text-center mb-12">
          <Button 
            href={`/categories/${category.slug}`}
            variant="outline"
            ariaLabel={`Tilbake til ${category.name} kategorien`}
            className="px-8 py-3"
          >
            Tilbake til {category.name}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}

// Generate static paths for all pages
export async function generateStaticParams() {
  const paths = [];
  
  // Loop through all categories
  for (const category of categories) {
    // Get pages for this category
    const pages = getCategoryPages(category.slug);
    
    // Add each page path
    for (const page of pages) {
      paths.push({
        slug: category.slug,
        pageSlug: page.slug
      });
    }
  }
  
  return paths;
} 