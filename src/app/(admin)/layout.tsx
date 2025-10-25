import Link from 'next/link';
import AdminGuard from '@/components/auth/AdminGuard';

export const metadata = {
  title: 'Admin Dashboard | TegnOgFarge.no',
  robots: 'noindex, nofollow',
};

/**
 * Admin Layout - Wraps all admin pages with authentication and navigation
 * Uses route group (admin) so URLs remain clean (/dashboard not /admin/dashboard)
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <Link href="/" className="text-xl font-bold text-gray-900">
                  TegnOgFarge <span className="text-blue-600">Admin</span>
                </Link>
                <nav className="flex gap-4">
                  <Link
                    href="/dashboard"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    📊 Dashboard
                  </Link>
                  {/* Future admin pages can be added here */}
                </nav>
              </div>
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Tilbake til siden
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Admin Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-sm text-gray-500">
              Admin Dashboard - Kun for autoriserte brukere
            </p>
          </div>
        </footer>
      </div>
    </AdminGuard>
  );
}
