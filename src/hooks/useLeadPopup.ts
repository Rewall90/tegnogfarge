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
        console.log('[useLeadPopup] Cannot show popup (storage rules)');

        // No popup, so open PDF directly
        if (customEvent.detail?.downloadUrl) {
          console.log('[useLeadPopup] Opening PDF directly (no popup)');
          window.open(customEvent.detail.downloadUrl, '_blank');
        }
        return;
      }

      // Increment download count
      const newCount = incrementDownloadCount();
      setDownloadCount(newCount);

      console.log('[useLeadPopup] Download count:', newCount);

      // Get campaigns that match this trigger
      const downloadCampaigns = await getCampaignsByTrigger('pdf_downloaded');

      if (downloadCampaigns.length === 0) {
        console.log('[useLeadPopup] No active download campaigns found');

        // No popup, so open PDF directly
        if (customEvent.detail?.downloadUrl) {
          console.log('[useLeadPopup] Opening PDF directly (no campaigns)');
          window.open(customEvent.detail.downloadUrl, '_blank');
        }
        return;
      }

      // Check if any campaign should trigger
      const triggeredCampaigns = downloadCampaigns.filter((camp) =>
        shouldTriggerCampaign(camp, { downloadCount: newCount })
      );

      if (triggeredCampaigns.length === 0) {
        console.log(
          '[useLeadPopup] No campaigns triggered for count:',
          newCount
        );

        // No popup, so open PDF directly
        if (customEvent.detail?.downloadUrl) {
          console.log('[useLeadPopup] Opening PDF directly (threshold not met)');
          window.open(customEvent.detail.downloadUrl, '_blank');
        }
        return;
      }

      // Select one campaign (for A/B testing - currently just picks first or random)
      const selectedCampaign = selectCampaign(triggeredCampaigns);

      if (selectedCampaign) {
        console.log('[useLeadPopup] Showing popup for campaign:', selectedCampaign.campaignId);

        // Store download URL for later use
        if (customEvent.detail?.downloadUrl) {
          setDownloadUrl(customEvent.detail.downloadUrl);
          console.log('[useLeadPopup] Download URL stored:', customEvent.detail.downloadUrl);
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

    console.log('[useLeadPopup] Popup dismissed');

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
      console.log('[useLeadPopup] Opening PDF after dismiss:', downloadUrl);
      window.open(downloadUrl, '_blank');
      setDownloadUrl(null); // Clear for next time
    }
  };

  // Handle email submit
  const handleSubmit = async (email: string) => {
    if (!campaign) return;

    console.log('[useLeadPopup] Email submitted');

    // Track submit event
    await trackEmailSubmitted(campaign.campaignId, email, {
      downloadCount,
    });

    // Submit to newsletter API (existing endpoint)
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Subscription failed');
      }

      // Mark email as submitted (never show popup again)
      markEmailSubmitted();

      console.log('[useLeadPopup] Email submitted successfully');

      // Don't auto-open PDF - user will click download button in thank you page
    } catch (error) {
      console.error('[useLeadPopup] Newsletter subscription error:', error);
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
