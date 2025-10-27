'use client';

import { useState } from 'react';
import { OverviewCards } from '@/components/analytics/dashboard/OverviewCards';
import { TopDrawingsTable } from '@/components/analytics/dashboard/TopDrawingsTable';
import { DateFilter, type DateRange } from '@/components/analytics/dashboard/DateFilter';

/**
 * Dashboard Page - Main analytics dashboard
 * Displays real-time metrics from MongoDB with date filtering
 *
 * URL: /dashboard (clean URL thanks to (admin) route group)
 */
export default function DashboardPage() {
  // Calculate default date range (last 7 days)
  const getDefaultDateRange = (): DateRange => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Format dates in local timezone to avoid timezone conversion issues
    const formatLocalDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      preset: 'last7days',
      startDate: formatLocalDate(sevenDaysAgo),
      endDate: formatLocalDate(today),
    };
  };

  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Sanntidsstatistikk fra MongoDB - nedlastninger og online fargelegging
        </p>
      </div>

      {/* Date Filter */}
      <section>
        <DateFilter value={dateRange} onChange={setDateRange} />
      </section>

      {/* Overview Cards */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Oversikt</h2>
        <OverviewCards dateRange={dateRange} />
      </section>

      {/* Top Drawings Table */}
      <section>
        <TopDrawingsTable limit={10} dateRange={dateRange} />
      </section>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          📊 Om denne dashboarden
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Data kilde:</strong> MongoDB (unike nedlastninger per bruker)
          </p>
          <p>
            <strong>Periode:</strong> Velg tidsperiode med filteret over
          </p>
          <p>
            <strong>Unike brukere:</strong> Teller hver bruker én gang per bilde (email eller fingerprint)
          </p>
          <p className="pt-2 border-t border-blue-300 mt-3">
            <strong>Kommende:</strong> Sammenligning med forrige periode og trenddiagrammer
          </p>
        </div>
      </div>
    </div>
  );
}
