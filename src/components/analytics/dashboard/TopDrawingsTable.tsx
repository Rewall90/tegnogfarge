'use client';

import { useEffect, useState } from 'react';
import { fetchTopDrawings, type TopDrawing, type DateRange } from '@/lib/analytics-api';

interface TopDrawingsTableProps {
  metric?: 'downloads' | 'completions';
  limit?: number;
  dateRange?: DateRange;
}

/**
 * TopDrawingsTable - Display top performing drawings in a table
 * Allows switching between downloads and completions metrics
 * Supports date filtering
 */
export function TopDrawingsTable({ metric = 'downloads', limit = 10, dateRange }: TopDrawingsTableProps) {
  const [drawings, setDrawings] = useState<TopDrawing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<'downloads' | 'completions'>(metric);

  useEffect(() => {
    async function loadTopDrawings() {
      try {
        setLoading(true);
        const data = await fetchTopDrawings(activeMetric, limit, dateRange);
        setDrawings(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load top drawings:', err);
        setError('Kunne ikke laste tegninger');
      } finally {
        setLoading(false);
      }
    }

    loadTopDrawings();
  }, [activeMetric, limit, dateRange]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Feil ved lasting av tegninger</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {/* Header with metric toggle */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Topp tegninger</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveMetric('downloads')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeMetric === 'downloads'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Nedlastninger
            </button>
            <button
              onClick={() => setActiveMetric('completions')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeMetric === 'completions'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Fargelagt online
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tegning
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kategori
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                📄 Nedlastninger
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                🎨 Fargelagt
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="h-4 bg-gray-200 rounded w-12 ml-auto animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="h-4 bg-gray-200 rounded w-12 ml-auto animate-pulse"></div>
                  </td>
                </tr>
              ))
            ) : drawings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Ingen data tilgjengelig
                </td>
              </tr>
            ) : (
              drawings.map((drawing, index) => (
                <tr key={drawing.imageId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{drawing.title}</div>
                    {drawing.subcategory && (
                      <div className="text-sm text-gray-500">{drawing.subcategory}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {drawing.category || 'Ukjent'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    {drawing.downloads.toLocaleString('nb-NO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    {drawing.completions.toLocaleString('nb-NO')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
