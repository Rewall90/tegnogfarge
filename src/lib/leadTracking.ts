/**
 * Lead Campaign Tracking
 *
 * Tracks lead popup events to Google Analytics, PostHog, and MongoDB API.
 *
 * DUAL TRACKING:
 * - GA4: Historical tracking
 * - PostHog: Session replay, funnels, conversion analysis
 * - MongoDB: Custom dashboard, real-time stats
 */

import { trackPostHogEvent, identifyPostHogUser } from './posthog';

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type LeadEventType = 'shown' | 'submitted' | 'dismissed';

export interface LeadTrackingOptions {
  email?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// GOOGLE ANALYTICS TRACKING (PHASE 1)
// ============================================================================

/**
 * Track lead campaign event to Google Analytics
 */
async function trackToGA(
  campaignId: string,
  eventType: LeadEventType,
  options?: LeadTrackingOptions
): Promise<void> {
  // Skip if not in browser
  if (typeof window === 'undefined') return;

  // Wait for gtag to be available (with timeout)
  let attempts = 0;
  while (!window.gtag && attempts < 50) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    attempts++;
  }

  if (!window.gtag) {
    return;
  }

  try {
    window.gtag('event', 'lead_campaign', {
      campaign_id: campaignId,
      event_type: eventType,
      event_category: 'Lead Generation',
      event_label: campaignId,
      ...options?.metadata,
    });
  } catch (error) {
    console.error('[Lead Tracking] GA4 tracking error:', error);
  }
}

// ============================================================================
// MONGODB API TRACKING (PHASE 2 - FUTURE)
// ============================================================================

/**
 * Track lead campaign event to MongoDB API
 *
 * PHASE 2: Now active - Sends to /api/lead-campaigns/track
 */
async function trackToAPI(
  campaignId: string,
  eventType: LeadEventType,
  options?: LeadTrackingOptions
): Promise<void> {
  // Skip if not in browser
  if (typeof window === 'undefined') return;

  try {
    console.log('[Lead Tracking] Calling API to track event:', { campaignId, eventType, metadata: options?.metadata });
    const response = await fetch('/api/lead-campaigns/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId,
        eventType,
        email: options?.email,
        metadata: options?.metadata,
      }),
    });

    console.log('[Lead Tracking] API response status:', response.status, response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Lead Tracking] API tracking failed:', response.statusText, errorText);
    } else {
      const data = await response.json();
      console.log('[Lead Tracking] API tracking success:', data);
    }
  } catch (error) {
    console.error('[Lead Tracking] API tracking error:', error);
    // Don't throw - tracking failures shouldn't break user experience
  }
}

// ============================================================================
// POSTHOG TRACKING
// ============================================================================

/**
 * Track lead campaign event to PostHog
 */
async function trackToPostHog(
  campaignId: string,
  eventType: LeadEventType,
  options?: LeadTrackingOptions
): Promise<void> {
  // Skip if not in browser
  if (typeof window === 'undefined') return;

  try {
    await trackPostHogEvent('lead_campaign', {
      campaign_id: campaignId,
      event_type: eventType,
      email: options?.email ? '[REDACTED]' : undefined, // Don't send email to PostHog events (only identify)
      ...options?.metadata,
    });
  } catch (error) {
    console.error('[Lead Tracking] PostHog tracking error:', error);
    // Don't throw - tracking failures shouldn't break user experience
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Track lead campaign event
 *
 * Tracks to Google Analytics, PostHog, and MongoDB API (all systems in parallel)
 */
export async function trackLeadCampaign(
  campaignId: string,
  eventType: LeadEventType,
  options?: LeadTrackingOptions
): Promise<void> {
  // Track to all three systems in parallel
  await Promise.all([
    trackToGA(campaignId, eventType, options),
    trackToAPI(campaignId, eventType, options),
    trackToPostHog(campaignId, eventType, options),
  ]);

  // If email submitted, identify user in PostHog
  if (eventType === 'submitted' && options?.email) {
    identifyPostHogUser(options.email, {
      campaign_id: campaignId,
      signup_source: 'lead_popup',
      ...options.metadata,
    });
  }
}

// ============================================================================
// SPECIALIZED TRACKING FUNCTIONS
// ============================================================================

/**
 * Track popup shown event
 */
export async function trackPopupShown(
  campaignId: string,
  metadata?: Record<string, any>
): Promise<void> {
  return trackLeadCampaign(campaignId, 'shown', { metadata });
}

/**
 * Track email submitted event
 */
export async function trackEmailSubmitted(
  campaignId: string,
  email: string,
  metadata?: Record<string, any>
): Promise<void> {
  return trackLeadCampaign(campaignId, 'submitted', { email, metadata });
}

/**
 * Track popup dismissed event
 */
export async function trackPopupDismissed(
  campaignId: string,
  metadata?: Record<string, any>
): Promise<void> {
  return trackLeadCampaign(campaignId, 'dismissed', { metadata });
}
