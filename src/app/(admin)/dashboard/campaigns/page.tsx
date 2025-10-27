'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Campaign } from '@/lib/campaignService';
import { calculateCampaignPercentage } from '@/lib/campaignService';

interface CampaignWithStats extends Campaign {
  stats: {
    shownCount: number;
    submittedCount: number;
    dismissedCount: number;
    conversionRate: number;
    dismissRate: number;
  };
}

export default function CampaignsListPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load campaigns
  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    try {
      setLoading(true);
      const response = await fetch('/api/lead-campaigns');

      if (!response.ok) {
        throw new Error('Failed to load campaigns');
      }

      const data = await response.json();
      setCampaigns(data);
      setError(null);
    } catch (err) {
      console.error('Error loading campaigns:', err);
      setError('Kunne ikke laste kampanjer');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(campaignId: string) {
    if (!confirm('Er du sikker på at du vil slette denne kampanjen? Statistikk vil bli bevart.')) {
      return;
    }

    try {
      const response = await fetch(`/api/lead-campaigns/${campaignId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete campaign');
      }

      // Reload campaigns
      await loadCampaigns();
    } catch (err) {
      console.error('Error deleting campaign:', err);
      alert('Kunne ikke slette kampanje');
    }
  }

  // Calculate percentages for same-threshold campaigns
  function getWeightPercentage(campaign: Campaign): string {
    const sameThresholdCampaigns = campaigns.filter(
      (c) =>
        c.active &&
        c.trigger.event === campaign.trigger.event &&
        c.trigger.threshold === campaign.trigger.threshold
    );

    if (sameThresholdCampaigns.length <= 1) {
      return '100%';
    }

    const percentage = calculateCampaignPercentage(campaign, sameThresholdCampaigns);
    return `${percentage}%`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Campaigns</h1>
          <p className="mt-2 text-gray-600">
            Administrer popup-kampanjer for lead-generering
          </p>
        </div>
        <Link
          href="/dashboard/campaigns/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ny kampanje
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Feil ved lasting</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Laster kampanjer...</span>
          </div>
        </div>
      ) : campaigns.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ingen kampanjer ennå
          </h3>
          <p className="text-gray-600 mb-6">
            Kom i gang med å lage din første lead-kampanje
          </p>
          <Link
            href="/dashboard/campaigns/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Opprett kampanje
          </Link>
        </div>
      ) : (
        /* Campaigns Table */
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kampanje
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trigger
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vekt
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vist
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sendt inn
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avvist
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Konv. %
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avvis %
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Handlinger
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.campaignId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {campaign.name}
                      </div>
                      <div className="text-sm text-gray-500">{campaign.campaignId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          campaign.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {campaign.active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {campaign.trigger.event === 'pdf_downloaded' && 'PDF nedlastet'}
                        {campaign.trigger.event === 'exit_intent' && 'Exit intent'}
                        {campaign.trigger.event === 'scroll_50_percent' && 'Scroll 50%'}
                      </div>
                      {campaign.trigger.threshold && (
                        <div className="text-sm text-gray-500">
                          Terskel: {campaign.trigger.threshold}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Vekt: {campaign.weight}
                      </div>
                      <div className="text-sm text-gray-500">
                        ({getWeightPercentage(campaign)})
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {campaign.stats.shownCount.toLocaleString('nb-NO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {campaign.stats.submittedCount.toLocaleString('nb-NO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {campaign.stats.dismissedCount.toLocaleString('nb-NO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {(campaign.stats.conversionRate ?? 0).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {(campaign.stats.dismissRate ?? 0).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/campaigns/${campaign.campaignId}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Rediger
                        </Link>
                        <button
                          onClick={() => handleDelete(campaign.campaignId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Slett
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
