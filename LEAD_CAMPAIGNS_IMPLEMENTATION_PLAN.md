# Lead Campaigns Implementation Plan

## Current Newsletter Structure Analysis

### Database: `newsletter.subscribers`

**Document Structure:**
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "isVerified": false,
  "subscribedAt": Date,
  "verifiedAt": Date | null,
  "unsubscribedAt": Date | null,
  "unsubscribeToken": "uuid-v4-token"
}
```

### Verification Flow:

1. **Subscribe** (`/api/newsletter/subscribe`)
   - Creates subscriber with `isVerified: false`
   - Generates `unsubscribeToken` (UUID)
   - Stores in `newsletter.subscribers`
   - Sends verification email with token

2. **Verification Tokens** (stored in `fargeleggingsapp.verification_tokens`)
   ```json
   {
     "email": "user@example.com",
     "token": "uuid-v4",
     "type": "newsletter_verification",
     "expiresAt": Date (72 hours),
     "used": false,
     "createdAt": Date
   }
   ```

3. **Verify** (`/api/newsletter/verify?token=xxx`)
   - Validates token from `verification_tokens`
   - Marks token as `used: true`
   - Updates subscriber: `isVerified: true`, `verifiedAt: Date`

4. **Unsubscribe** (`/api/newsletter/unsubscribe?token=xxx`)
   - Uses `unsubscribeToken` from subscriber
   - Sets `isVerified: false`, `unsubscribedAt: Date`

---

## New Lead Campaigns Structure

### Database: `fargeleggingsapp.lead_submissions`

**Document Structure:**
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "campaignId": "third-download-gate",
  "isVerified": false,
  "submittedAt": Date,
  "verifiedAt": Date | null,
  "unsubscribedAt": Date | null,
  "unsubscribeToken": "uuid-v4-token",
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "downloadUrl": "/path/to/file.pdf",
    "trigger": {
      "event": "pdf_downloaded",
      "threshold": 3
    }
  }
}
```

### Verification Flow (Same as Newsletter):

1. **Submit Lead** (`/api/lead-campaigns/submit`)
   - Creates submission with `isVerified: false`
   - Generates `unsubscribeToken` (UUID)
   - Stores in `fargeleggingsapp.lead_submissions`
   - Sends verification email with token
   - Tracks event in `lead_campaign_events`
   - Increments `lead_campaign_stats.submittedCount`

2. **Verification Tokens** (reuse `fargeleggingsapp.verification_tokens`)
   ```json
   {
     "email": "user@example.com",
     "token": "uuid-v4",
     "type": "lead_campaign_verification",  // New type
     "expiresAt": Date (72 hours),
     "used": false,
     "createdAt": Date,
     "metadata": {
       "campaignId": "third-download-gate"  // Track which campaign
     }
   }
   ```

3. **Verify** (`/api/lead-campaigns/verify?token=xxx`)
   - Validates token from `verification_tokens`
   - Marks token as `used: true`
   - Updates submission: `isVerified: true`, `verifiedAt: Date`

4. **Unsubscribe** (`/api/lead-campaigns/unsubscribe?token=xxx`)
   - Uses `unsubscribeToken` from submission
   - Sets `isVerified: false`, `unsubscribedAt: Date`

---

## Implementation Checklist

### Phase 1: Database & API Structure
- [ ] Create `fargeleggingsapp.lead_submissions` collection
- [ ] Create `/api/lead-campaigns/submit` endpoint (POST)
- [ ] Create `/api/lead-campaigns/verify` endpoint (GET/POST)
- [ ] Create `/api/lead-campaigns/unsubscribe` endpoint (GET/POST)
- [ ] Add verification email template for lead campaigns

### Phase 2: Email Service Updates
- [ ] Add `sendLeadCampaignVerificationEmail()` method
- [ ] Support new token type: `lead_campaign_verification`
- [ ] Create lead campaign email template

### Phase 3: Frontend Updates
- [ ] Update `LeadPopupManager` to use new submit endpoint
- [ ] Create verification success page
- [ ] Create unsubscribe confirmation page

### Phase 4: Dashboard Updates
- [ ] Create new "Leads" page in dashboard
- [ ] Show lead submissions per campaign
- [ ] Stats: total, verified, pending, unsubscribed
- [ ] Export to CSV functionality
- [ ] Search and filter by campaign

### Phase 5: Migration
- [ ] Create migration script to move existing popup emails from `newsletter.subscribers` to `lead_submissions`
- [ ] Add `source` field to identify migration data

---

## Key Differences from Newsletter

| Feature | Newsletter | Lead Campaigns |
|---------|-----------|----------------|
| Database | `newsletter.subscribers` | `fargeleggingsapp.lead_submissions` |
| Token Type | `newsletter_verification` | `lead_campaign_verification` |
| Additional Fields | - | `campaignId`, `metadata` |
| Dashboard Page | `/dashboard/subscribers` | `/dashboard/leads` |
| Purpose | General newsletter | Campaign-specific lead capture |

---

## Benefits

1. **Separation of Concerns**: Newsletter vs lead captures
2. **Campaign Attribution**: Know which campaign generated each lead
3. **Better Analytics**: Per-campaign conversion rates
4. **Targeted Follow-ups**: Different email sequences per campaign
5. **Clean Data**: No mixing of newsletter and lead data

---

## Email Template Differences

### Newsletter Verification Email
- Subject: "Bekreft nyhetsbrev-abonnement"
- Content: Generic newsletter signup confirmation
- CTA: "Bekreft abonnement"

### Lead Campaign Verification Email
- Subject: "Bekreft din e-post - få tilgang til [Campaign Benefit]"
- Content: Campaign-specific messaging (e.g., "få 10 bonus tegninger")
- CTA: "Bekreft og få tilgang"
- Include download link after verification

---

## Notes

- Reuse existing `EmailService.verifyToken()` - it already supports multiple types
- Reuse `verification_tokens` collection - just add new type
- Follow exact same verification flow as newsletter for consistency
- All timestamps use `Date` objects (not strings)
- All boolean flags default to `false`
- UUIDs generated with `uuid.v4()`
