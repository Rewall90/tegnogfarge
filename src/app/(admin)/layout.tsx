import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export const metadata = {
  title: 'Admin Dashboard | TegnOgFarge.no',
  robots: 'noindex, nofollow',
};

// Force dynamic rendering to prevent build-time static generation
// Admin pages require authentication which is only available at runtime
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
