'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AdminGuard - Protects routes that require admin role
 * Redirects to login if not authenticated or to home if not admin
 */
export default function AdminGuard({ children, fallback }: AdminGuardProps) {
  const sessionData = useSession();
  const session = sessionData?.data;
  const status = sessionData?.status || 'loading';
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      // Not logged in - redirect to login with return URL
      const currentPath = encodeURIComponent(window.location.pathname);
      router.push(`/login?redirect=${currentPath}`);
      return;
    }

    // Logged in but not admin - redirect to home
    if (session.user.role !== 'admin') {
      router.push('/');
    }
  }, [session, status, router]);

  // Loading state
  if (status === 'loading') {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laster inn...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return null;
  }

  // Not admin
  if (session.user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ingen tilgang</h1>
          <p className="text-gray-600 mb-6">Du har ikke tilgang til denne siden.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Gå til forsiden
          </button>
        </div>
      </div>
    );
  }

  // Is admin - show content
  return <>{children}</>;
}
