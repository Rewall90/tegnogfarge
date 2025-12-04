'use client';

import { useLeadPopup } from '@/hooks/useLeadPopup';
import { LeadPopup } from './LeadPopup';
import { PhotoColoringPopup } from './PhotoColoringPopup';
import { trackEmailSubmitted, trackLeadCampaign } from '@/lib/leadTracking';

/**
 * LeadPopupManager
 *
 * Smart component that manages lead popup state and behavior.
 * Place this in root layout.tsx to enable lead capture site-wide.
 *
 * Renders different popup components based on campaign type:
 * - photo_to_coloring: PhotoColoringPopup (AI image conversion)
 * - default: LeadPopup (standard email capture)
 */
export function LeadPopupManager() {
  const { isOpen, campaign, downloadUrl, handleDismiss, handleSubmit } = useLeadPopup();

  // Handle email submit for PhotoColoringPopup
  // This is called AFTER the image has been sent via email
  const handlePhotoColoringEmailSubmit = async (email: string) => {
    if (!campaign) return;

    // Track email submission to GA4, PostHog, and MongoDB
    await trackEmailSubmitted(campaign.campaignId, email, {
      source: 'photo_to_coloring',
      feature: 'ai_coloring_page',
    });

    // Submit to lead campaigns API (stores in lead_submissions collection)
    const response = await fetch('/api/lead-campaigns/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        campaignId: campaign.campaignId,
        metadata: {
          source: 'photo_to_coloring',
          campaignName: campaign.name,
          feature: 'ai_coloring_page',
        },
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Submission failed');
    }
  };

  // Handle upload attempt tracking for PhotoColoringPopup
  const handleUploadAttempt = () => {
    if (!campaign) return;

    // Track that user attempted to upload a photo
    // This is our key metric for validating interest
    fetch('/api/lead-campaigns/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: campaign.campaignId,
        eventType: 'shown', // Count upload attempt as "shown" for conversion tracking
        metadata: {
          action: 'photo_upload_attempted',
        },
      }),
    }).catch(console.error);
  };

  // Handle generation complete tracking
  const handleGenerationComplete = () => {
    if (!campaign) return;

    fetch('/api/lead-campaigns/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: campaign.campaignId,
        eventType: 'shown', // Track as additional shown event
        metadata: {
          action: 'photo_generated',
        },
      }),
    }).catch(console.error);
  };

  // Render PhotoColoringPopup for photo_to_coloring campaigns
  if (campaign?.type === 'photo_to_coloring') {
    return (
      <PhotoColoringPopup
        isOpen={isOpen}
        onClose={handleDismiss}
        onEmailSubmit={handlePhotoColoringEmailSubmit}
        onUploadAttempt={handleUploadAttempt}
        onGenerationComplete={handleGenerationComplete}
        campaignId={campaign.campaignId}
      />
    );
  }

  // Default: Render standard LeadPopup
  return (
    <LeadPopup
      isOpen={isOpen}
      campaign={campaign}
      downloadUrl={downloadUrl}
      onClose={handleDismiss}
      onSubmit={handleSubmit}
    />
  );
}
