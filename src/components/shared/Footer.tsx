import Link from 'next/link';
import NewsletterForm from '../newsletter/NewsletterForm';
import Image from 'next/image';

// Define the Category type
interface Category {
  _id: string;
  title: string;
  slug: string;
}

// Define the Subcategory type
interface Subcategory {
  _id: string;
  title: string;
  slug: string;
  parentCategory?: {
    slug: string;
  };
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const popularCategories: Category[] = [
    { _id: 'cat-1', title: 'Tegneserier', slug: 'tegneserier' },
    { _id: 'cat-2', title: 'Superhelter', slug: 'superhelter' },
    { _id: 'cat-3', title: 'Vitenskap', slug: 'vitenskap' },
    { _id: 'cat-4', title: 'Kjøretøy', slug: 'kjoretoy' },
    { _id: 'cat-5', title: 'Dyr', slug: 'dyr' },
    { _id: 'cat-6', title: 'Natur', slug: 'natur' },
    { _id: 'cat-7', title: 'Blomster', slug: 'blomster' },
  ];

  const popularSubcategories: Subcategory[] = [
    { _id: 'sub-1', title: 'Enhjørninger', slug: 'fargelegg-enhjorninger', parentCategory: { slug: 'tegneserier' } },
    { _id: 'sub-2', title: 'Sommeren', slug: 'fargelegg-sommeren', parentCategory: { slug: 'natur' } },
    { _id: 'sub-3', title: 'Biler', slug: 'fargelegg-biler', parentCategory: { slug: 'kjoretoy' } },
    { _id: 'sub-4', title: 'Prinsesser', slug: 'fargelegg-prinsesser', parentCategory: { slug: 'tegneserier' } },
    { _id: 'sub-5', title: 'Høstens Motiver', slug: 'fargelegg-hostens-motiver', parentCategory: { slug: 'natur' } },
    { _id: 'sub-6', title: 'Hunder', slug: 'fargelegg-hunder', parentCategory: { slug: 'dyr' } },
    { _id: 'sub-7', title: 'Gresskar', slug: 'fargelegg-gresskar', parentCategory: { slug: 'mat' } },
  ];

  return (
    <footer className="bg-[#264653] text-white py-10">
      <div className="container mx-auto px-4">
        {/* Newsletter Signup and Links */}
        <div className="flex flex-col md:flex-row items-start justify-center gap-2 md:gap-12 mb-12">
          <div className="mb-8 md:mb-0 md:w-1/4">
            <p className="mb-4 max-w-md text-body">
              Bli med på vårt nyhetsbrev for å holde deg oppdatert om funksjoner og nyheter.
            </p>
            <NewsletterForm />
          </div>
          
          {/* Footer Links */}
          <div className="flex flex-wrap justify-start md:flex-nowrap gap-8 lg:gap-16 md:w-1/2">
            <div className="w-1/2 md:w-auto mb-8 md:mb-0">
              <h3 className="font-display font-bold text-lg mb-4 text-[#F4D35E]">Informasjon</h3>
              <ul className="space-y-2">
                <li><Link href="/om-oss" className="hover:underline">Om TegnOgFarge.no</Link></li>
                <li><Link href="/om-skribenten" className="hover:underline">Om Skribenten</Link></li>
                <li><Link href="/kontakt" className="hover:underline">Kontakt Oss</Link></li>
                <li><Link href="/vilkar-og-betingelser" className="hover:underline">Vilkår og Betingelser</Link></li>
                <li><Link href="/personvernerklaering" className="hover:underline">Personvernerklæring</Link></li>
                <li><Link href="/lisensieringspolicy" className="hover:underline">Lisensieringspolicy</Link></li>
                <li><Link href="/fjerning-av-innhold" className="hover:underline">Fjerning av Innhold</Link></li>
              </ul>
            </div>
            <div className="w-1/2 md:w-auto mb-8 md:mb-0">
              <h3 className="font-display font-bold text-lg mb-4 text-[#F4D35E]">Populære Kategorier</h3>
              <ul>
                {popularCategories.map(category => (
                  <li key={category._id} className="mb-2">
                    <Link href={`/${category.slug}`} className="hover:text-gray-300">
                      {category.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-1/2 md:w-auto mb-8 md:mb-0">
              <h3 className="font-display font-bold text-lg mb-4 text-[#F4D35E]">Populære Sider</h3>
              <ul>
                {popularSubcategories.map(subcategory => (
                  <li key={subcategory._id} className="mb-2">
                    <Link href={`/${subcategory.parentCategory?.slug}/${subcategory.slug}`} className="hover:text-gray-300">
                      {subcategory.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-1/2 md:w-auto">
              <h3 className="font-display font-bold text-lg mb-4 text-[#F4D35E]">Følg oss</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-6">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </span>
                  <Link href="https://www.facebook.com/profile.php?id=61577707270746" className="ml-2 hover:underline" target="_blank" rel="noopener noreferrer">Facebook</Link>
                </li>
                <li className="flex items-center">
                  <span className="w-6">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </span>
                  <Link href="https://www.instagram.com/tegnogfarge.no/" className="ml-2 hover:underline" target="_blank" rel="noopener noreferrer">Instagram</Link>
                </li>
                <li className="flex items-center">
                  <span className="w-6">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </span>
                  <Link href="#" className="ml-2 hover:underline">YouTube</Link>
                </li>
                <li className="flex items-center">
                  <span className="w-6">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 .992.371 1.937.823 2.475.09.102.084.183-.02.282-.102.12-.345.42-.459.562-.124.16-.25.223-.42.152-1.023-.335-1.668-1.55-1.668-2.825 0-2.068 1.48-3.875 4.344-3.875 2.253 0 3.967 1.63 3.967 3.998 0 2.407-1.427 4.288-3.383 4.288-1.121 0-2.074-.916-1.808-2.025.263-1.107.663-2.228.663-2.228s.289-1.187.289-2.612c0-2.285-1.34-4.04-4.028-4.04-2.845 0-4.522 2.165-4.522 4.903 0 1.509.702 2.867 1.753 3.447.081.045.165.19.14.335-.084.45-.317 1.33-.377 1.556-.04.168-.16.27-.335.205-1.348-.385-2.24-1.915-2.24-3.483 0-2.784 2.086-5.223 5.943-5.223 3.107 0 5.562 2.242 5.562 5.144C22.744 18.89 20.816 22 17.64 22c-1.284 0-2.545-.486-3.457-1.348l-.133.435.008.004c-.01.03-.027.05-.035.08-.02.05-.04.1-.06.15l-.01.02c-.01.02-.02.04-.03.06-.02.04-.04.08-.06.12-.02.04-.03.08-.05.12-.02.04-.04.07-.05.1-.02.03-.04.06-.06.09-.02.03-.03.06-.05.08l-.01.02c-.02.03-.03.05-.05.07l-.01.02c-.02.03-.03.05-.04.07l-.01.01c-.02.03-.03.05-.04.07l-.01.01c-.02.03-.03.05-.04.07l-.01.01c-.02.03-.03.05-.04.07l-.01.01c-.02.02-.03.04-.04.06l-.01.01c-.02.02-.03.04-.04.06l-.01.01c-.02.02-.03.04-.04.05l-.01.01c-.02.02-.03.04-.04.05l-.01.01c-.02.02-.03.04-.04.05l-.01.01c-.02.02-.03.04-.04.05l-.01.01c-.02.02-.03.03-.04.05-.02.02-.03.03-.04.04l-.01.01c-.02.02-.03.03-.04.04l-.01.01c-.02.02-.03.03-.04.04l-.01.01c-.02.02-.03.03-.04.04l-.01.01c-.02.02-.03.03-.04.04l-.01.01c-.02.02-.03.03-.04.04l-.01.01c-.02.02-.03.03-.04.04l-.01.01c-.02.02-.03.03-.04.04l-.01.01c-.02.02-.03.03-.04.04l-.01.01c-.02.02-.03.03-.04.04l-.01.01c-.02.02-.03.03-.04.04l-.01.01c-.02.02-.03.03-.04.04l-.01.01c-.02.02-.03.03-.04.04l-.01.01c-.02.02-.03.03-.04.04l-.01.01c-.02.02-.03.03-.04.04l-.01.01c-.02.02-.03.03-.04.04l-.01.01c-.02.02-.03.03-.04.04l-.01.01c-.02.02-.03.03-.04.04l-.01.01c-.02.02-.03.03-.04.04l-.01.01c-.02.02-.03.03-.04.04l-.01.01c-.02.02-.03.03-.04.04l-.01.01c-.02.02-.03.03-.04.04l-.01.01c-.02.02-.03.03-.04.04z" />
                    </svg>
                  </span>
                  <Link href="https://no.pinterest.com/TegnOgFarge/" className="ml-2 hover:underline" target="_blank" rel="noopener noreferrer">Pinterest</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Copyright and Legal Links */}
        <div className="border-t border-gray-700 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-center items-center">
            <p className="text-sm text-gray-300 mb-4 md:mb-0 md:w-1/4">
              &copy; {currentYear} TegnOgFarge.no. Alle rettigheter reservert.
            </p>
            <nav aria-label="Juridisk informasjon" className="md:w-1/2">
              <ul className="flex flex-wrap justify-center space-x-4 text-sm">
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
} 