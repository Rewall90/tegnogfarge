import Link from 'next/link';
import Image from 'next/image';
import AuthStatus from '../auth/AuthStatus';
import MobileMenu from './MobileMenu';

export default function Header() {
  return (
    <header className="bg-[#FEFAF6] shadow-sm py-2 relative">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center">
            <Link href="/" className="flex items-center" aria-label="Til forsiden">
              <Image 
                src="/images/logo/tegnogfarge-logo.svg" 
                alt="TegnOgFarge.no Logo" 
                width={200} 
                height={90} 
                priority
                className="h-20 w-auto"
              />
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-8" aria-label="Hovednavigasjon">
            <Link href="/coloring" className="text-[#264653] hover:text-[#1E3A40] text-lg">Fargelegging Verktøy</Link>
            {/* The dashboard link will be conditional within the server component based on a future implementation if needed */}
            <Link href="/blog" className="text-[#264653] hover:text-[#1E3A40] text-lg">Blogg Artikler</Link>
            <Link href="/om-oss" className="text-[#264653] hover:text-[#1E3A40] text-lg">Om Oss</Link>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            <AuthStatus />
          </div>
          
          {/* Mobile menu button */}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
} 