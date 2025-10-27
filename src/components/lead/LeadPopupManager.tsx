'use client';

import { useLeadPopup } from '@/hooks/useLeadPopup';
import { LeadPopup } from './LeadPopup';

/**
 * LeadPopupManager
 *
 * Smart component that manages lead popup state and behavior.
 * Place this in root layout.tsx to enable lead capture site-wide.
 */
export function LeadPopupManager() {
  const { isOpen, campaign, downloadUrl, handleDismiss, handleSubmit } = useLeadPopup();

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
