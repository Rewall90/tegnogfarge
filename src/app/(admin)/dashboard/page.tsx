import { OverviewCards } from '@/components/analytics/dashboard/OverviewCards';
import { TopDrawingsTable } from '@/components/analytics/dashboard/TopDrawingsTable';

export const metadata = {
  title: 'Analytics Dashboard | TegnOgFarge.no',
  description: 'Real-time analytics dashboard for TegnOgFarge.no',
};

/**
 * Dashboard Page - Main analytics dashboard
 * Displays real-time metrics from MongoDB
 *
 * URL: /dashboard (clean URL thanks to (admin) route group)
 */
export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Sanntidsstatistikk fra MongoDB - nedlastninger og online fargelegging
        </p>
      </div>

      {/* Overview Cards */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Oversikt</h2>
        <OverviewCards />
      </section>

      {/* Top Drawings Table */}
      <section>
        <TopDrawingsTable limit={10} />
      </section>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          📊 Om denne dashboarden
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Data kilde:</strong> MongoDB (sanntidsdata fra brukere)
          </p>
          <p>
            <strong>Oppdatering:</strong> Data oppdateres automatisk hver 60. sekund
          </p>
          <p>
            <strong>Hybrid tracking:</strong> MongoDB for visning + Google Analytics 4 for detaljert analyse
          </p>
          <p className="pt-2 border-t border-blue-300 mt-3">
            <strong>Fase 2B (kommende):</strong> GA4 integrasjon med tidsserier, brukerflyt, og avanserte diagrammer
          </p>
        </div>
      </div>
    </div>
  );
}
