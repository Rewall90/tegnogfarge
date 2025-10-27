/**
 * Campaign Service
 *
 * Abstraction layer for lead campaign data.
 *
 * PHASE 1 (Current): Returns hardcoded campaigns
 * PHASE 2 (Future): Fetches from MongoDB API
 *
 * The rest of the app doesn't know or care which phase we're in!
 */

// ============================================================================
// TYPE DEFINITIONS (MATCHES MONGODB SCHEMA EXACTLY)
// ============================================================================

export interface Campaign {
  campaignId: string;
  name: string;
  type: 'download_gate' | 'exit_intent' | 'scroll' | 'other';
  active: boolean;
  trigger: {
    event: 'pdf_downloaded' | 'exit_intent' | 'scroll_50_percent';
    threshold?: number; // e.g., 3 for "3rd download"
  };
  content: {
    headline: string;
    description: string;
    imageUrl?: string; // Optional Sanity CDN URL for popup image
    imageAlt?: string; // Alt text for accessibility
    ctaText: string;
    dismissText: string;
    // Thank you page content (after email submission)
    thankYouHeadline?: string;
    thankYouDescription?: string;
    thankYouButtonText?: string;
  };
  styling?: {
    buttonPulse?: boolean; // Enable pulse animation on CTA button
  };
  weight: number; // For A/B testing - Weight determines % viewrate (e.g., weight 3 + weight 7 = 30%/70% split)
  deleted?: boolean; // Soft delete flag - campaigns with stats should never be hard deleted
  featureFlagKey?: string; // PostHog feature flag key (optional) - for remote on/off control
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// PHASE 1: HARDCODED CAMPAIGNS
// ============================================================================

const HARDCODED_CAMPAIGNS: Campaign[] = [
  {
    campaignId: 'third-download-gate',
    name: '3rd Download Gate',
    type: 'download_gate',
    active: true,
    trigger: {
      event: 'pdf_downloaded',
      threshold: 3,
    },
    content: {
      headline: '🎉 Du har lastet ned 3 tegninger!',
      description: 'Få 10 bonus tegninger hver 14. dag',
      // Optional: Add image from Sanity Studio (Pop-up bilder)
      // 1. Upload image to Sanity Studio under "Pop-up bilder"
      // 2. Copy the CDN URL from the image
      // 3. Paste URL below and add alt text
      imageUrl: undefined, // Example: 'https://cdn.sanity.io/images/fn0kjvlp/production/[image-id].webp'
      imageAlt: undefined, // Example: 'Illustrasjon av bonus tegninger'
      ctaText: 'Send meg tegninger!',
      dismissText: 'Nei takk',
      // Thank you page (shown after email submission)
      thankYouHeadline: 'Velkommen!',
      thankYouDescription: 'Sjekk innboksen din for å bekrefte abonnementet.',
      thankYouButtonText: 'Ta meg til tegningen',
    },
    weight: 1,
  },
];

// ============================================================================
// PUBLIC API (SAME FOR BOTH PHASES)
// ============================================================================

/**
 * Get all active campaigns
 *
 * PHASE 2: Fetches from /api/lead-campaigns/active
 */
export async function getActiveCampaigns(): Promise<Campaign[]> {
  // PHASE 2 (Active):
  try {
    const response = await fetch('/api/lead-campaigns/active', {
      cache: 'no-store', // Always get fresh campaign data
    });

    if (!response.ok) {
      console.error('[campaignService] Failed to fetch campaigns from API');
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('[campaignService] Error fetching active campaigns:', error);
    return [];
  }
}

/**
 * Get a specific campaign by ID
 *
 * PHASE 2: Fetches from API
 */
export async function getCampaign(
  campaignId: string
): Promise<Campaign | null> {
  // PHASE 2 (Active):
  try {
    const response = await fetch(`/api/lead-campaigns/${campaignId}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`[campaignService] Failed to fetch campaign ${campaignId}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`[campaignService] Error fetching campaign ${campaignId}:`, error);
    return null;
  }
}

/**
 * Get campaigns by trigger type
 * Useful for listening to specific events
 */
export async function getCampaignsByTrigger(
  event: Campaign['trigger']['event']
): Promise<Campaign[]> {
  const campaigns = await getActiveCampaigns();
  return campaigns.filter((c) => c.trigger.event === event);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a campaign should be shown based on trigger conditions
 */
export function shouldTriggerCampaign(
  campaign: Campaign,
  context: { downloadCount?: number; scrollPercent?: number }
): boolean {
  const { trigger } = campaign;

  switch (trigger.event) {
    case 'pdf_downloaded':
      return context.downloadCount === trigger.threshold;
    case 'scroll_50_percent':
      return (context.scrollPercent ?? 0) >= 50;
    case 'exit_intent':
      return true; // Always trigger on exit intent event
    default:
      return false;
  }
}

/**
 * Select a campaign from multiple options (for A/B testing)
 * Uses weighted random selection based on campaign.weight
 *
 * Example: Campaign A (weight: 3) and Campaign B (weight: 7)
 * Results in 30% chance for A, 70% chance for B
 */
export function selectCampaign(campaigns: Campaign[]): Campaign | null {
  if (campaigns.length === 0) return null;
  if (campaigns.length === 1) return campaigns[0];

  // Calculate total weight
  const totalWeight = campaigns.reduce((sum, campaign) => sum + (campaign.weight || 1), 0);

  // Generate random number between 0 and totalWeight
  let random = Math.random() * totalWeight;

  // Select campaign based on weighted probability
  for (const campaign of campaigns) {
    random -= (campaign.weight || 1);
    if (random <= 0) {
      return campaign;
    }
  }

  // Fallback (should never reach here)
  return campaigns[0];
}

/**
 * Calculate percentage for a campaign based on its weight
 * Used for displaying % in dashboard
 */
export function calculateCampaignPercentage(campaign: Campaign, allCampaigns: Campaign[]): number {
  const totalWeight = allCampaigns.reduce((sum, c) => sum + (c.weight || 1), 0);
  const percentage = ((campaign.weight || 1) / totalWeight) * 100;
  return Math.round(percentage * 10) / 10; // Round to 1 decimal place
}
