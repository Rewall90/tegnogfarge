# Lead Popup Tracking Plan - TegnOgFarge.no

**Planning Date:** 2025-01-25
**Goal:** Design tracking infrastructure for simultaneous A/B testing of lead capture campaigns

---

## Overview

This document outlines the tracking infrastructure needed BEFORE building the actual popup components. We're designing a system that:
- Tracks 4 different campaign types simultaneously
- Enables real-time A/B test comparison
- Integrates with existing MongoDB + GA4 analytics
- Provides statistical significance calculations
- Prevents users from seeing multiple popups

---

## Campaign Types to Test

### A. First Download Gate
- **Trigger:** After 1st PDF download
- **Expected CVR:** 8-15%
- **Campaign ID:** `first-download-gate`

### B. Third Download Gate
- **Trigger:** After 3rd PDF download
- **Expected CVR:** 30-40%
- **Campaign ID:** `third-download-gate`

### C. Exit Intent Popup
- **Trigger:** Mouse leaves viewport
- **Expected CVR:** 2-5%
- **Campaign ID:** `exit-intent`

### D. Scroll-Triggered
- **Trigger:** User scrolls 50% down page
- **Expected CVR:** 3-8%
- **Campaign ID:** `scroll-50`

---

## MongoDB Data Model

### Collection 1: `leadCampaigns`
**Purpose:** Campaign configuration and metadata

```javascript
{
  _id: ObjectId("..."),
  campaignId: "third-download-gate",        // Unique string ID
  name: "3rd Download Gate",                 // Display name
  type: "download_gate",                     // Type: download_gate, exit_intent, scroll
  active: true,                              // Can be toggled on/off
  trigger: {
    event: "download",                       // download, exit, scroll
    threshold: 3                             // 3rd download, 50% scroll, etc.
  },
  content: {
    headline: "🎉 You've downloaded 3 drawings!",
    description: "Get 10 bonus drawings every 14 days",
    ctaText: "Send me drawings!",
    dismissText: "No thanks"
  },
  weight: 1,                                 // For A/B distribution (1 = equal weight)
  createdAt: ISODate("2025-01-25"),
  updatedAt: ISODate("2025-01-25")
}
```

**Indexes:**
```javascript
db.leadCampaigns.createIndex({ campaignId: 1 }, { unique: true })
db.leadCampaigns.createIndex({ active: 1, type: 1 })
```

---

### Collection 2: `leadCampaignEvents`
**Purpose:** Individual event tracking (shown, submitted, dismissed)

```javascript
{
  _id: ObjectId("..."),
  campaignId: "third-download-gate",
  eventType: "shown",                        // shown, submitted, dismissed
  userId: "anon_fp_abc123xyz",               // Anonymous fingerprint
  sessionId: "sess_xyz789",                  // Browser session
  email: "user@example.com",                 // Only if submitted
  timestamp: ISODate("2025-01-25T10:30:00"),
  metadata: {
    downloadCount: 3,                        // Context at time of event
    drawingId: "christmas-tree",
    drawingTitle: "Christmas Tree",
    referrer: "google.com",
    deviceType: "mobile",                    // mobile, tablet, desktop
    browserLanguage: "nb-NO"
  }
}
```

**Indexes:**
```javascript
db.leadCampaignEvents.createIndex({ campaignId: 1, eventType: 1 })
db.leadCampaignEvents.createIndex({ userId: 1, timestamp: -1 })
db.leadCampaignEvents.createIndex({ sessionId: 1 })
db.leadCampaignEvents.createIndex({ timestamp: -1 })
db.leadCampaignEvents.createIndex({ email: 1 })  // For deduplication
```

---

### Collection 3: `leadCampaignCounters`
**Purpose:** Real-time aggregated counts (for dashboard performance)

```javascript
{
  _id: ObjectId("..."),
  campaignId: "third-download-gate",
  shown: 1247,
  submitted: 412,
  dismissed: 523,
  ignored: 312,                              // shown - (submitted + dismissed)
  lastUpdated: ISODate("2025-01-25T10:35:00")
}
```

**Indexes:**
```javascript
db.leadCampaignCounters.createIndex({ campaignId: 1 }, { unique: true })
```

**Why both events AND counters?**
- **Events:** Detailed analytics, user-level tracking, time-series
- **Counters:** Fast dashboard queries, real-time metrics

---

## A/B Test Assignment Logic

### User Identification
```javascript
// Generate anonymous user ID (browser fingerprint + localStorage)
const userId = getUserId();  // Format: "anon_fp_[hash]"

// Session ID (new on each browser session)
const sessionId = getSessionId();  // Format: "sess_[timestamp]_[random]"
```

### Campaign Assignment Strategy

**Option 1: User-Level Assignment (Consistent)**
```javascript
// Hash user ID to deterministically assign campaign
function assignCampaign(userId, activeCampaigns) {
  const hash = hashString(userId);
  const index = hash % activeCampaigns.length;
  return activeCampaigns[index];
}
```

**Pros:** User always sees same campaign (better UX)
**Cons:** Can't switch campaigns mid-test

**Option 2: Session-Level Assignment (More flexible)**
```javascript
// Assign randomly on first popup trigger, store in session
function assignCampaign(sessionId, activeCampaigns) {
  const stored = sessionStorage.getItem('leadCampaign');
  if (stored) return stored;

  const random = Math.floor(Math.random() * activeCampaigns.length);
  const campaign = activeCampaigns[random];
  sessionStorage.setItem('leadCampaign', campaign.campaignId);
  return campaign;
}
```

**Pros:** More flexible, fresher test data
**Cons:** Same user could see different campaigns over time

**RECOMMENDATION:** Use Session-Level (Option 2)

### Popup Display Rules

**Per Session:**
- Max 1 popup per session
- Track in `sessionStorage.leadPopupShown = true`
- Track in `sessionStorage.leadPopupDismissed = true` (if dismissed)

**Per User (localStorage):**
- If user submits email, never show again: `localStorage.leadEmailSubmitted = true`
- If user dismisses 3 times, don't show for 30 days: `localStorage.leadDismissedCount = 3`

```javascript
// Check if we should show popup
function shouldShowPopup() {
  // Never show if email already submitted
  if (localStorage.getItem('leadEmailSubmitted') === 'true') {
    return false;
  }

  // Check dismiss cooldown
  const dismissedCount = parseInt(localStorage.getItem('leadDismissedCount') || '0');
  const lastDismissed = localStorage.getItem('leadLastDismissed');

  if (dismissedCount >= 3 && lastDismissed) {
    const daysSince = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
    if (daysSince < 30) {
      return false;
    }
  }

  // Only one popup per session
  if (sessionStorage.getItem('leadPopupShown') === 'true') {
    return false;
  }

  return true;
}
```

---

## API Endpoints

### 1. Track Lead Event
```
POST /api/lead-campaigns/track

Body:
{
  campaignId: "third-download-gate",
  eventType: "shown" | "submitted" | "dismissed",
  email?: "user@example.com",              // Only for submitted
  metadata?: {
    downloadCount: 3,
    drawingId: "christmas-tree",
    drawingTitle: "Christmas Tree",
    referrer: "google.com"
  }
}

Response:
{
  success: true,
  eventId: "evt_abc123"
}

Response (error):
{
  success: false,
  error: "Email already exists"
}
```

**Implementation:**
1. Validate campaign exists and is active
2. Generate userId and sessionId
3. Insert event into `leadCampaignEvents`
4. Increment counter in `leadCampaignCounters`
5. If email submitted, add to newsletter (existing integration)
6. Track in GA4 for detailed analysis

---

### 2. Get Active Campaigns
```
GET /api/lead-campaigns/active

Response:
[
  {
    campaignId: "third-download-gate",
    name: "3rd Download Gate",
    type: "download_gate",
    trigger: { event: "download", threshold: 3 },
    content: { ... },
    weight: 1
  },
  ...
]
```

**Use:** Client fetches on page load to know which campaigns are running

---

### 3. Get Campaign Stats (Admin)
```
GET /api/analytics/lead-campaigns

Response:
[
  {
    campaignId: "third-download-gate",
    name: "3rd Download Gate",
    shown: 1247,
    submitted: 412,
    dismissed: 523,
    ignored: 312,
    conversionRate: 33.0,                    // (submitted / shown) * 100
    dismissalRate: 41.9,                     // (dismissed / shown) * 100
    qualityScore: 72.3                       // Custom scoring formula
  },
  ...
]
```

---

### 4. Get Campaign Details (Admin)
```
GET /api/analytics/lead-campaigns/:campaignId

Response:
{
  campaign: { campaignId, name, ... },
  stats: {
    shown: 1247,
    submitted: 412,
    dismissed: 523,
    conversionRate: 33.0
  },
  timeSeries: [
    { date: "2025-01-20", shown: 45, submitted: 15, dismissed: 20 },
    { date: "2025-01-21", shown: 52, submitted: 18, dismissed: 23 },
    ...
  ],
  hourlyDistribution: {
    "0": 5, "1": 3, ..., "23": 12           // CVR by hour of day
  },
  deviceBreakdown: {
    mobile: { shown: 800, submitted: 250 },
    desktop: { shown: 400, submitted: 150 },
    tablet: { shown: 47, submitted: 12 }
  }
}
```

---

### 5. Compare Campaigns (Admin)
```
GET /api/analytics/lead-campaigns/compare

Query params:
?campaignIds=first-download-gate,third-download-gate
&startDate=2025-01-20
&endDate=2025-01-27

Response:
{
  campaigns: [
    {
      campaignId: "first-download-gate",
      shown: 2341,
      submitted: 234,
      cvr: 10.0
    },
    {
      campaignId: "third-download-gate",
      shown: 1247,
      submitted: 412,
      cvr: 33.0
    }
  ],
  statisticalSignificance: {
    zScore: 15.7,
    pValue: 0.0001,
    significant: true,                       // p < 0.05
    confidence: 99.99,
    winner: "third-download-gate"
  }
}
```

---

## Client-Side Tracking Library

### File: `src/lib/leadTracking.ts`

```typescript
/**
 * Track lead campaign event
 */
export async function trackLeadCampaign(
  campaignId: string,
  eventType: 'shown' | 'submitted' | 'dismissed',
  options?: {
    email?: string;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  // Track in MongoDB (custom system)
  await fetch('/api/lead-campaigns/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      campaignId,
      eventType,
      email: options?.email,
      metadata: options?.metadata
    })
  });

  // ALSO track in Google Analytics (for backup analysis)
  if (window.gtag) {
    window.gtag('event', 'lead_campaign', {
      campaign_id: campaignId,
      event_type: eventType,
      event_category: 'Lead Generation',
      ...options?.metadata
    });
  }
}

/**
 * Get user's assigned campaign for this session
 */
export function getAssignedCampaign(): string | null {
  return sessionStorage.getItem('leadCampaign');
}

/**
 * Check if popup should be shown
 */
export function shouldShowLeadPopup(): boolean {
  // Email already submitted
  if (localStorage.getItem('leadEmailSubmitted') === 'true') {
    return false;
  }

  // Dismissed 3+ times and within cooldown
  const dismissedCount = parseInt(localStorage.getItem('leadDismissedCount') || '0');
  const lastDismissed = localStorage.getItem('leadLastDismissed');

  if (dismissedCount >= 3 && lastDismissed) {
    const daysSince = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
    if (daysSince < 30) {
      return false;
    }
  }

  // Already shown in this session
  if (sessionStorage.getItem('leadPopupShown') === 'true') {
    return false;
  }

  return true;
}

/**
 * Mark popup as shown
 */
export function markLeadPopupShown(): void {
  sessionStorage.setItem('leadPopupShown', 'true');
}

/**
 * Mark email as submitted
 */
export function markEmailSubmitted(): void {
  localStorage.setItem('leadEmailSubmitted', 'true');
}

/**
 * Increment dismiss count
 */
export function incrementDismissCount(): void {
  const count = parseInt(localStorage.getItem('leadDismissedCount') || '0');
  localStorage.setItem('leadDismissedCount', String(count + 1));
  localStorage.setItem('leadLastDismissed', String(Date.now()));
}
```

---

## Dashboard Integration

### New Dashboard Section: Lead Campaigns

**Location:** `/dashboard` (add new section)

**Components:**

1. **LeadCampaignOverview.tsx**
   - Total campaigns active
   - Total emails captured (all campaigns)
   - Average CVR across campaigns
   - Best performing campaign

2. **LeadCampaignsTable.tsx**
   - List all campaigns with metrics
   - Show/hide/edit campaigns
   - Real-time CVR updates
   - Sort by various metrics

3. **CampaignComparison.tsx**
   - Side-by-side A/B test comparison
   - Statistical significance calculator
   - Winner recommendation
   - Visual charts (bar, line)

4. **CampaignDetailView.tsx**
   - Detailed breakdown for single campaign
   - Time-series chart (conversions over time)
   - Hourly CVR distribution
   - Device breakdown
   - Sample emails captured

---

## Statistical Significance Calculation

### Formula
```javascript
function calculateSignificance(campaignA, campaignB) {
  // Conversion rates
  const cvrA = campaignA.submitted / campaignA.shown;
  const cvrB = campaignB.submitted / campaignB.shown;

  // Standard errors
  const seA = Math.sqrt((cvrA * (1 - cvrA)) / campaignA.shown);
  const seB = Math.sqrt((cvrB * (1 - cvrB)) / campaignB.shown);

  // Z-score
  const zScore = (cvrA - cvrB) / Math.sqrt(seA ** 2 + seB ** 2);

  // P-value (two-tailed test)
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));

  // Significant if p < 0.05 (95% confidence)
  const significant = pValue < 0.05;

  // Confidence percentage
  const confidence = (1 - pValue) * 100;

  return {
    zScore,
    pValue,
    significant,
    confidence,
    winner: cvrA > cvrB ? campaignA.campaignId : campaignB.campaignId
  };
}

// Requirements for valid test
function isTestValid(campaign) {
  return (
    campaign.shown >= 1000 &&     // Minimum 1000 impressions
    campaign.submitted >= 50 &&   // Minimum 50 conversions
    getDaysSince(campaign.createdAt) >= 7  // Minimum 7 days
  );
}
```

---

## Quality Score Formula

Evaluates overall campaign performance beyond just CVR:

```javascript
function calculateQualityScore(stats) {
  const cvr = stats.submitted / stats.shown;
  const dismissalRate = stats.dismissed / stats.shown;
  const engagementRate = (stats.submitted + stats.dismissed) / stats.shown;

  // Weighted formula
  const score = (
    (cvr * 0.5) +                           // 50% weight on conversions
    ((1 - dismissalRate) * 0.3) +           // 30% weight on low dismissals
    (engagementRate * 0.2)                  // 20% weight on engagement
  ) * 100;

  return Math.round(score);
}
```

**Score ranges:**
- 0-40: Poor
- 41-60: Fair
- 61-75: Good
- 76-90: Excellent
- 91-100: Outstanding

---

## Testing Plan Timeline

### Phase 1: Infrastructure (Week 1)
- [ ] Create MongoDB collections and indexes
- [ ] Build tracking API endpoints
- [ ] Create leadTracking.ts library
- [ ] Add dashboard sections
- [ ] Deploy and test tracking

### Phase 2: Initial Test (Week 2-3)
- [ ] Launch 2 campaigns (First Gate + Third Gate)
- [ ] Collect minimum 1,000 impressions each
- [ ] Monitor daily metrics
- [ ] Debug any issues

### Phase 3: Expand Testing (Week 4)
- [ ] Add 2 more campaigns (Exit Intent + Scroll)
- [ ] Continue data collection
- [ ] Analyze which triggers work best

### Phase 4: Analysis (Week 5)
- [ ] Calculate statistical significance
- [ ] Determine winner
- [ ] Ship winning campaign to 100% traffic
- [ ] Iterate on losing campaigns

---

## Success Metrics

### Minimum Viable Test
- ✅ 1,000+ impressions per campaign
- ✅ 50+ conversions per campaign
- ✅ 7+ days of data collection
- ✅ p-value < 0.05 (95% confidence)

### Expected Outcomes
- **Baseline:** ~50 emails/month (no system)
- **With optimized campaign:** 500-1,000 emails/month
- **CVR target:** 20-35% (third download gate likely winner)
- **ROI:** 10-20x improvement

---

## Privacy & GDPR Compliance

### Anonymous Tracking
- User IDs are browser fingerprints, not personal data
- No tracking before consent
- Can clear data on request

### Email Storage
- Emails stored securely in MongoDB
- Used only for newsletter (explicit consent)
- Unsubscribe link in all emails
- Can export/delete user data

### Cookie Notice
- Update cookie notice to mention lead tracking
- User can opt out of analytics cookies
- Respect Do Not Track headers

---

## Next Steps

1. **Review this plan** - Ensure it meets requirements
2. **Approve data model** - Finalize MongoDB schema
3. **Build infrastructure** - API + tracking library
4. **Create dashboard components** - Admin analytics UI
5. **Test tracking** - Verify data flows correctly
6. **Build popups** - Create actual popup components
7. **Launch test** - Start with 2 campaigns
8. **Analyze & iterate** - Use data to optimize

---

## Notes

- Start simple: 2 campaigns first, then expand
- Collect minimum 14 days of data before decisions
- Focus on CVR AND quality (not just CVR)
- 3rd download gate likely winner based on industry data
- Use soft gates (dismissible) for better UX
- Track in both MongoDB (real-time) and GA4 (backup)
