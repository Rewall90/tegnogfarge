'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CampaignForm } from '@/components/campaigns/CampaignForm';
import type { Campaign } from '@/lib/campaignService';

export default function EditCampaignPage({ params }: { params: { campaignId: string } }) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCampaign();
  }, [params.campaignId]);

  async function loadCampaign() {
    try {
      setLoading(true);
      const response = await fetch(`/api/lead-campaigns/${params.campaignId}`);

      if (!response.ok) {
        throw new Error('Failed to load campaign');
      }

      const data = await response.json();
      setCampaign(data);
      setError(null);
    } catch (err) {
      console.error('Error loading campaign:', err);
      setError('Kunne ikke laste kampanje');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(data: Partial<Campaign>) {
    const response = await fetch(`/api/lead-campaigns/${params.campaignId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update campaign');
    }

    // Redirect to campaigns list
    router.push('/dashboard/campaigns');
  }

  function handleCancel() {
    router.push('/dashboard/campaigns');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Laster kampanje...</span>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/campaigns"
            className="text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Feil</h1>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
          <p className="font-medium">Kunne ikke laste kampanje</p>
          <p className="text-sm mt-1">{error}</p>
          <Link
            href="/dashboard/campaigns"
            className="inline-block mt-4 text-sm text-red-800 hover:text-red-900 underline"
          >
            Tilbake til kampanjer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/campaigns"
          className="text-gray-600 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rediger kampanje</h1>
          <p className="mt-2 text-gray-600">
            {campaign.name}
          </p>
        </div>
      </div>

      {/* Form */}
      <CampaignForm
        campaign={campaign}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEditing={true}
      />
    </div>
  );
}
