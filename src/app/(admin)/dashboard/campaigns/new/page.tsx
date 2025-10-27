'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CampaignForm } from '@/components/campaigns/CampaignForm';
import type { Campaign } from '@/lib/campaignService';

export default function NewCampaignPage() {
  const router = useRouter();

  async function handleSubmit(data: Partial<Campaign>) {
    const response = await fetch('/api/lead-campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create campaign');
    }

    // Redirect to campaigns list with success message
    router.push('/dashboard/campaigns');
  }

  function handleCancel() {
    router.push('/dashboard/campaigns');
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
          <h1 className="text-3xl font-bold text-gray-900">Ny kampanje</h1>
          <p className="mt-2 text-gray-600">
            Opprett en ny lead-kampanje for popup-visning
          </p>
        </div>
      </div>

      {/* Form */}
      <CampaignForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}
