# Lead Capture System - TegnOgFarge.no

## Overview
A/B testing framework for email capture campaigns with real-time analytics dashboard.

## Goal
Optimize email conversion through data-driven campaign testing.

---

## Campaign Types

### A. First Download Gate
- **Trigger:** After 1st PDF download
- **Expected CVR:** 8-15%
- **Pros:** High volume
- **Cons:** Low trust, high abandon

### B. Third Download Gate
- **Trigger:** After 3rd PDF download
- **Expected CVR:** 30-40%
- **Pros:** High trust, quality leads
- **Cons:** Lower volume

### C. Exit Intent Popup
- **Trigger:** Mouse leaves viewport
- **Expected CVR:** 2-5%
- **Pros:** Zero friction
- **Cons:** Low conversion

### D. Scroll-Triggered
- **Trigger:** User scrolls 50% down page
- **Expected CVR:** 3-8%
- **Pros:** Engaged users
- **Cons:** Medium conversion

---

## Data Model

### MongoDB Collections

#### `leadCampaigns`
```javascript
{
  campaignId: "third-download-gate",
  name: "3rd Download Gate",
  type: "download_gate",
  active: true,
  createdAt: ISODate("2025-01-15")
}
```

#### `leadCampaignEvents`
```javascript
{
  campaignId: "third-download-gate",
  eventType: "shown" | "submitted" | "dismissed" | "ignored",
  userId: "anonymous_xyz",
  email: "user@example.com", // only if submitted
  timestamp: ISODate("2025-01-20T10:30:00"),
  metadata: {
    downloadCount: 3,
    drawingId: "christmas-tree",
    referrer: "google.com"
  }
}
```

---

## API Endpoints

### Track Event
```
POST /api/lead-campaigns/track
Body: {
  campaignId: string,
  eventType: "shown" | "submitted" | "dismissed",
  email?: string,
  metadata?: object
}
```

### Get Campaign Stats
```
GET /api/analytics/lead-campaigns
Response: [{
  campaignId: string,
  shown: number,
  submitted: number,
  dismissed: number,
  conversionRate: number
}]
```

### Get Campaign Details
```
GET /api/analytics/lead-campaigns/:id
Response: {
  stats: { shown, submitted, dismissed, cvr },
  timeSeries: [{ date, shown, submitted }],
  segments: { new: cvr, returning: cvr }
}
```

---

## Dashboard Metrics

### Primary KPIs
- **Shown:** Total popup displays
- **Submitted:** Email captures
- **Dismissed:** User clicked "No thanks"
- **Ignored:** User closed tab
- **CVR:** `(submitted / shown) × 100`
- **Quality Score:** `(CVR × 0.4) + (submitted/shown × 0.3) + ((1 - dismissed/shown) × 0.3)`

### Secondary Metrics
- CVR by day of week
- CVR by time of day
- CVR by user segment (new vs returning)
- CVR by traffic source
- Email quality (open rate, click rate, unsubscribe rate)

---

## Implementation Files

### Core Infrastructure
```
src/lib/leadTracking.ts              # Client-side tracking functions
src/app/api/lead-campaigns/
  └── track/route.ts                 # Event tracking endpoint
  └── stats/route.ts                 # Analytics endpoint
```

### Dashboard Components
```
src/components/analytics/dashboard/
  └── LeadCampaignsTable.tsx         # Campaign performance table
  └── LeadCampaignChart.tsx          # Time-series chart
  └── CampaignCompare.tsx            # A/B test comparison
```

### Lead Capture Components
```
src/components/lead/
  └── LeadCapturePopup.tsx           # Base popup component
  └── FirstDownloadGate.tsx          # Campaign A implementation
  └── ThirdDownloadGate.tsx          # Campaign B implementation
  └── ExitIntentPopup.tsx            # Campaign C implementation
  └── ScrollTriggerPopup.tsx         # Campaign D implementation
```

---

## Usage Example

### Track Campaign Event
```typescript
import { trackLeadCampaign } from '@/lib/leadTracking';

// When popup shown
trackLeadCampaign('third-download-gate', 'shown', {
  metadata: { downloadCount: 3 }
});

// When email submitted
trackLeadCampaign('third-download-gate', 'submitted', {
  email: 'user@example.com',
  metadata: { downloadCount: 3 }
});

// When dismissed
trackLeadCampaign('third-download-gate', 'dismissed');
```

### Implement Campaign
```typescript
<LeadCapturePopup
  campaignId="third-download-gate"
  trigger={{ event: 'download', count: 3 }}
  onSubmit={(email) => submitToNewsletter(email)}
>
  <h2>🎉 You've downloaded 3 drawings!</h2>
  <p>Get 10 bonus drawings every 14 days</p>
  <EmailForm />
</LeadCapturePopup>
```

---

## A/B Testing Process

### 1. Setup (Week 1)
- Create 2-4 campaigns
- Implement tracking
- Deploy to production

### 2. Collect Data (Week 2-3)
- Minimum 1,000 impressions per campaign
- Minimum 50 conversions per campaign
- Track for 14 days

### 3. Analyze (Week 4)
- Calculate CVR for each campaign
- Calculate statistical significance
- Check email quality metrics

### 4. Decision (Week 4)
- Ship winner if >95% confidence
- Continue testing if inconclusive
- Iterate on losing campaigns

---

## Statistical Significance

### Formula
```
z-score = (CVR₁ - CVR₂) / √(SE₁² + SE₂²)
p-value = 2 × (1 - Φ(|z|))
significant = p-value < 0.05
```

### Requirements
- Minimum 1,000 impressions per variant
- Minimum 50 conversions per variant
- p-value < 0.05 (95% confidence)
- Test duration: 14-30 days

---

## Email Bi-Weekly Newsletter

### Content Structure
```
Email 1: Welcome (Immediate)
  - 10 bonus drawings (PDF)
  - Set expectations
  - First theme preview

Email 2+: Bi-weekly Theme Bundle
  - 7-10 themed drawings
  - 1 off-screen activity
  - 1 parenting tip
  - Preview next theme
```

### Theme Rotation (Example)
```
Week  1-2:  Winter & Christmas
Week  3-4:  Animals & Nature
Week  5-6:  Vehicles & Transport
Week  7-8:  Fantasy & Princesses
Week  9-10: Food & Cooking
Week 11-12: Sports & Activities
```

---

## Implementation Timeline

### Sprint 1 (Week 1): Core Tracking
- [ ] Create MongoDB schema
- [ ] Build tracking API
- [ ] Create base LeadCapturePopup component
- [ ] Add dashboard table
- [ ] Deploy 2 test campaigns

### Sprint 2 (Week 2): Additional Campaigns
- [ ] Add 2 more campaigns
- [ ] Improve dashboard with charts
- [ ] Add time-series analysis
- [ ] Track user segments

### Sprint 3 (Week 3-4): Advanced Analytics
- [ ] Statistical significance calculator
- [ ] Email quality tracking
- [ ] A/B test comparison UI
- [ ] Export reports

---

## Success Criteria

### Minimum Viable Product
- ✅ 2+ campaigns running
- ✅ Dashboard shows CVR
- ✅ Tracking 1,000+ events/week
- ✅ Email capture working

### Full Feature Set
- ✅ 4+ campaigns running
- ✅ Statistical significance calculator
- ✅ Time-series charts
- ✅ Segment analysis
- ✅ Email quality tracking
- ✅ A/B test recommendations

---

## Expected Results

### Baseline (No System)
- Email capture: ~50/month
- CVR: Unknown
- Email quality: Unknown

### With System (Optimized)
- Email capture: ~500-1,000/month
- CVR: 20-35% (3rd download gate)
- Email quality: High (proven engagement)
- ROI: 10-20x improvement

---

## Tech Stack

- **Frontend:** Next.js 14, React, TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** MongoDB
- **Analytics:** Custom (MongoDB aggregation)
- **Charts:** Recharts or Chart.js (TBD)
- **Email:** Resend API (existing)

---

## Notes

- Start with 2 campaigns, expand gradually
- Collect minimum 14 days of data before decisions
- Focus on CVR AND email quality, not just CVR
- 3rd download gate likely winner (industry data)
- Soft gate > hard gate (better UX)
- Track anonymous users with cookies
- GDPR compliant (anonymous tracking)

---

## Related Docs

- [Analytics Dashboard](./hybrid-analytics-phase1-complete.md)
- [Email Templates](../src/lib/email-templates.ts)
- [MongoDB Schema](../src/lib/db.ts)
