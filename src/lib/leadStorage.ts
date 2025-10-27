/**
 * Lead Storage Utilities
 *
 * Manages localStorage and sessionStorage for lead popup behavior.
 *
 * localStorage: Long-term user preferences (never show again, dismiss count)
 * sessionStorage: Short-term session state (one popup per session)
 */

// ============================================================================
// STORAGE KEYS
// ============================================================================

const KEYS = {
  // localStorage keys (persistent across sessions)
  EMAIL_SUBMITTED: 'leadEmailSubmitted',
  DISMISSED_COUNT: 'leadDismissedCount',
  LAST_DISMISSED: 'leadLastDismissed',
  DOWNLOAD_COUNT: 'leadDownloadCount',

  // sessionStorage keys (cleared on tab close)
  POPUP_SHOWN: 'leadPopupShown',
  ASSIGNED_CAMPAIGN: 'leadAssignedCampaign',
} as const;

// ============================================================================
// PERSISTENT STORAGE (localStorage)
// ============================================================================

/**
 * Check if user has already submitted their email
 */
export function hasSubmittedEmail(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(KEYS.EMAIL_SUBMITTED) === 'true';
}

/**
 * Mark that user submitted their email (never show popup again)
 */
export function markEmailSubmitted(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.EMAIL_SUBMITTED, 'true');
}

/**
 * Get number of times user has dismissed the popup
 */
export function getDismissedCount(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(KEYS.DISMISSED_COUNT) || '0', 10);
}

/**
 * Increment dismiss count and update last dismissed timestamp
 */
export function incrementDismissCount(): void {
  if (typeof window === 'undefined') return;
  const count = getDismissedCount();
  localStorage.setItem(KEYS.DISMISSED_COUNT, String(count + 1));
  localStorage.setItem(KEYS.LAST_DISMISSED, String(Date.now()));
}

/**
 * Check if user is in cooldown period after dismissing too many times
 * @param maxDismissals Maximum number of dismissals before cooldown (default: 3)
 * @param cooldownDays Number of days for cooldown (default: 30)
 */
export function isInDismissCooldown(
  maxDismissals: number = 3,
  cooldownDays: number = 30
): boolean {
  if (typeof window === 'undefined') return false;

  const dismissCount = getDismissedCount();
  if (dismissCount < maxDismissals) return false;

  const lastDismissed = localStorage.getItem(KEYS.LAST_DISMISSED);
  if (!lastDismissed) return false;

  const daysSince =
    (Date.now() - parseInt(lastDismissed, 10)) / (1000 * 60 * 60 * 24);
  return daysSince < cooldownDays;
}

/**
 * Get download count for trigger tracking
 */
export function getDownloadCount(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(KEYS.DOWNLOAD_COUNT) || '0', 10);
}

/**
 * Increment download count
 */
export function incrementDownloadCount(): number {
  if (typeof window === 'undefined') return 0;
  const count = getDownloadCount() + 1;
  localStorage.setItem(KEYS.DOWNLOAD_COUNT, String(count));
  return count;
}

/**
 * Reset download count (for testing)
 */
export function resetDownloadCount(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.DOWNLOAD_COUNT, '0');
}

// ============================================================================
// SESSION STORAGE (sessionStorage)
// ============================================================================

/**
 * Check if popup has already been shown in this session
 */
export function hasShownPopupInSession(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(KEYS.POPUP_SHOWN) === 'true';
}

/**
 * Mark that popup has been shown in this session
 */
export function markPopupShownInSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(KEYS.POPUP_SHOWN, 'true');
}

/**
 * Get assigned campaign for this session (for A/B testing)
 */
export function getAssignedCampaign(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(KEYS.ASSIGNED_CAMPAIGN);
}

/**
 * Set assigned campaign for this session (for A/B testing)
 */
export function setAssignedCampaign(campaignId: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(KEYS.ASSIGNED_CAMPAIGN, campaignId);
}

// ============================================================================
// COMPOSITE CHECKS
// ============================================================================

/**
 * Check if popup should be shown based on all storage rules
 */
export function canShowPopup(): boolean {
  // Never show if email already submitted
  if (hasSubmittedEmail()) {
    return false;
  }

  // Don't show if in cooldown period
  if (isInDismissCooldown()) {
    return false;
  }

  // Only one popup per session
  if (hasShownPopupInSession()) {
    return false;
  }

  return true;
}

// ============================================================================
// DEBUG/TESTING UTILITIES
// ============================================================================

/**
 * Clear all lead-related storage (for testing)
 */
export function clearAllLeadStorage(): void {
  if (typeof window === 'undefined') return;

  // Clear localStorage
  localStorage.removeItem(KEYS.EMAIL_SUBMITTED);
  localStorage.removeItem(KEYS.DISMISSED_COUNT);
  localStorage.removeItem(KEYS.LAST_DISMISSED);
  localStorage.removeItem(KEYS.DOWNLOAD_COUNT);

  // Clear sessionStorage
  sessionStorage.removeItem(KEYS.POPUP_SHOWN);
  sessionStorage.removeItem(KEYS.ASSIGNED_CAMPAIGN);
}

/**
 * Get all lead storage values (for debugging)
 */
export function getLeadStorageDebug(): Record<string, string | null> {
  if (typeof window === 'undefined') return {};

  return {
    emailSubmitted: localStorage.getItem(KEYS.EMAIL_SUBMITTED),
    dismissedCount: localStorage.getItem(KEYS.DISMISSED_COUNT),
    lastDismissed: localStorage.getItem(KEYS.LAST_DISMISSED),
    downloadCount: localStorage.getItem(KEYS.DOWNLOAD_COUNT),
    popupShown: sessionStorage.getItem(KEYS.POPUP_SHOWN),
    assignedCampaign: sessionStorage.getItem(KEYS.ASSIGNED_CAMPAIGN),
  };
}
