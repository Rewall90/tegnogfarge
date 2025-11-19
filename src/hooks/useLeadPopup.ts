'use client';

import { useState, useEffect } from 'react';
import type { Campaign } from '@/lib/campaignService';
import {
  getActiveCampaigns,
  getCampaignsByTrigger,
  shouldTriggerCampaign,
  selectCampaign,
} from '@/lib/campaignService';
import {
  canShowPopup,
  markPopupShownInSession,
  incrementDownloadCount,
  getDownloadCount,
  markEmailSubmitted,
  incrementDismissCount,
} from '@/lib/leadStorage';
import {
  trackPopupShown,
  trackEmailSubmitted,
  trackPopupDismissed,
} from '@/lib/leadTracking';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface UseLeadPopupReturn {
  isOpen: boolean;
  campaign: Campaign | null;
  downloadUrl: string | null;
  handleDismiss: () => void;
  handleSubmit: (email: string) => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useLeadPopup(): UseLeadPopupReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [downloadCount, setDownloadCount] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Initialize download count from storage
  useEffect(() => {
    const count = getDownloadCount();
    setDownloadCount(count);
  }, []);

  // Listen for PDF download events
  useEffect(() => {
    async function handleDownload(event: Event) {
      const customEvent = event as CustomEvent<{
        imageId: string;
        imageTitle: string;
        downloadUrl: string;
      }>;

      // Check if we can show popup at all
      if (!canShowPopup()) {
        // No popup, so open PDF directly
        if (customEvent.detail?.downloadUrl) {
          window.open(customEvent.detail.downloadUrl, '_blank');
        }
        return;
      }

      // Increment download count
      const newCount = incrementDownloadCount();
      setDownloadCount(newCount);

      // Get campaigns that match this trigger
      const downloadCampaigns = await getCampaignsByTrigger('pdf_downloaded');

      if (downloadCampaigns.length === 0) {
        // No popup, so open PDF directly
        if (customEvent.detail?.downloadUrl) {
          window.open(customEvent.detail.downloadUrl, '_blank');
        }
        return;
      }

      // Check if any campaign should trigger
      const triggeredCampaigns = downloadCampaigns.filter((camp) =>
        shouldTriggerCampaign(camp, { downloadCount: newCount })
      );

      if (triggeredCampaigns.length === 0) {
        // No popup, so open PDF directly
        if (customEvent.detail?.downloadUrl) {
          window.open(customEvent.detail.downloadUrl, '_blank');
        }
        return;
      }

      // Select one campaign (for A/B testing - currently just picks first or random)
      const selectedCampaign = selectCampaign(triggeredCampaigns);

      if (selectedCampaign) {
        // Store download URL for later use
        if (customEvent.detail?.downloadUrl) {
          setDownloadUrl(customEvent.detail.downloadUrl);
        }

        // Mark as shown in session
        markPopupShownInSession();

        // Show popup IMMEDIATELY (don't wait for tracking!)
        setCampaign(selectedCampaign);
        setIsOpen(true);

        // Track event in background (fire and forget - no await)
        trackPopupShown(selectedCampaign.campaignId, {
          downloadCount: newCount,
          triggerThreshold: selectedCampaign.trigger.threshold,
        });
      }
    }

    // Add event listener
    window.addEventListener('pdf_downloaded', handleDownload);

    // Cleanup
    return () => {
      window.removeEventListener('pdf_downloaded', handleDownload);
    };
  }, [downloadCount]); // Re-run when downloadCount changes

  // Handle dismiss (close button or "No thanks")
  const handleDismiss = () => {
    if (!campaign) return;

    // Track dismiss event
    trackPopupDismissed(campaign.campaignId, {
      downloadCount,
    });

    // Increment dismiss count in storage
    incrementDismissCount();

    // Close popup
    setIsOpen(false);

    // Open PDF in new tab after popup closes
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
      setDownloadUrl(null); // Clear for next time
    }
  };

  // Handle email submit
  const handleSubmit = async (email: string) => {
    console.log('[useLeadPopup] handleSubmit called with email:', email);

    if (!campaign) {
      console.error('[useLeadPopup] No campaign available!');
      return;
    }

    console.log('[useLeadPopup] Campaign:', campaign.campaignId);

    // Track submit event
    console.log('[useLeadPopup] Tracking email submitted event...');
    await trackEmailSubmitted(campaign.campaignId, email, {
      downloadCount,
    });
    console.log('[useLeadPopup] Event tracked');

    // Submit to lead campaigns API
    try {
      console.log('[useLeadPopup] Making API call to /api/lead-campaigns/submit...');
      console.log('[useLeadPopup] Request body:', {
        email,
        campaignId: campaign.campaignId,
        metadata: {
          downloadCount,
          trigger: campaign.trigger.type,
          triggerThreshold: campaign.trigger.threshold,
          campaignName: campaign.name,
        },
      });

      const response = await fetch('/api/lead-campaigns/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          campaignId: campaign.campaignId,
          metadata: {
            downloadCount,
            trigger: campaign.trigger.type,
            triggerThreshold: campaign.trigger.threshold,
            campaignName: campaign.name,
          },
        }),
      });

      console.log('[useLeadPopup] API response status:', response.status);
      console.log('[useLeadPopup] API response ok:', response.ok);

      if (!response.ok) {
        const data = await response.json();
        console.error('[useLeadPopup] API error response:', data);
        throw new Error(data.message || 'Submission failed');
      }

      const responseData = await response.json();
      console.log('[useLeadPopup] API success response:', responseData);

      // Mark email as submitted (never show popup again)
      markEmailSubmitted();
      console.log('[useLeadPopup] Email marked as submitted');

      // Don't auto-open PDF - user will click download button in thank you page
    } catch (error) {
      console.error('[useLeadPopup] Lead submission error:', error);
      throw error; // Re-throw to let component handle error state
    }
  };

  return {
    isOpen,
    campaign,
    downloadUrl,
    handleDismiss,
    handleSubmit,
  };
}
