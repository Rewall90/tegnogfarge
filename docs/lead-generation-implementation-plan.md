# Lead Generation Implementation Plan

**Date:** 2025-01-25
**Goal:** Build simple, extensible lead popup system that integrates with tracking infrastructure
**Principle:** KISS - Keep It Simple, Stupid

---

## Project Structure Analysis

### Existing Patterns Found
```
✅ Modal pattern: CookieConsentModal.tsx (fixed overlay, centered, z-50)
✅ Form pattern: NewsletterForm.tsx (email input, loading states)
✅ UI components: Button, Input
✅ Newsletter API: /api/newsletter/subscribe
✅ Client state: useState, localStorage, sessionStorage
✅ Hooks: Custom hooks in src/hooks/
```

### Component Organization
```
src/
├── components/
│   ├── analytics/        # Existing analytics components
│   ├── newsletter/       # Existing newsletter form
│   ├── cookie-consent/   # Modal pattern reference
│   └── lead/            # NEW - Our lead popup components
├── hooks/
│   └── useLeadPopup.ts   # NEW - Popup trigger logic
├── lib/
│   └── leadTracking.ts   # NEW - Tracking functions (from plan)
└── app/
    └── layout.tsx        # Add LeadPopupManager here
```

---

## Architecture: 3 Simple Components

### 1. LeadPopup (Base Component)
**File:** `src/components/lead/LeadPopup.tsx`
**Purpose:** Reusable popup modal with email form
**Props:** Campaign content + callbacks

```typescript
interface LeadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: {
    campaignId: string;
    headline: string;
    description: string;
    ctaText: string;
    dismissText: string;
  };
  onSubmit: (email: string) => Promise<void>;
}
```

**Features:**
- Fixed overlay (same as CookieConsentModal)
- Centered card with emoji + headline
- Email input (reuse Input component)
- Submit button (reuse Button component)
- Dismiss button
- Loading/success/error states
- Close on overlay click

**Does NOT:**
- Handle trigger logic
- Make API calls directly
- Track events (parent handles this)

---

### 2. LeadPopupManager (Smart Component)
**File:** `src/components/lead/LeadPopupManager.tsx`
**Purpose:** Manages which popup to show and when
**Placement:** In root layout.tsx

```typescript
'use client';

export function LeadPopupManager() {
  const { shouldShow, campaign, handleShow, handleDismiss, handleSubmit } = useLeadPopup();

  return (
    <LeadPopup
      isOpen={shouldShow}
      campaign={campaign}
      onClose={handleDismiss}
      onSubmit={handleSubmit}
    />
  );
}
```

**Responsibilities:**
- Use useLeadPopup hook for logic
- Pass data to LeadPopup component
- Handle submit → track + call newsletter API
- Handle dismiss → track + update storage

**Does NOT:**
- Contain trigger logic (that's in the hook)
- Contain UI (that's in LeadPopup)

---

### 3. useLeadPopup (Custom Hook)
**File:** `src/hooks/useLeadPopup.ts`
**Purpose:** All trigger logic and state management

```typescript
interface UseLeadPopupReturn {
  shouldShow: boolean;
  campaign: Campaign | null;
  handleShow: () => void;
  handleDismiss: () => void;
  handleSubmit: (email: string) => Promise<void>;
}

export function useLeadPopup(): UseLeadPopupReturn {
  // State
  const [shouldShow, setShouldShow] = useState(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [downloadCount, setDownloadCount] = useState(0);

  // Check display rules
  useEffect(() => {
    if (!canShowPopup()) return;

    // Listen for trigger events
    const handleDownload = () => {
      setDownloadCount(prev => prev + 1);
    };

    window.addEventListener('pdf_downloaded', handleDownload);
    return () => window.removeEventListener('pdf_downloaded', handleDownload);
  }, []);

  // Check if download count matches campaign trigger
  useEffect(() => {
    if (downloadCount === 3) {  // Example: 3rd download
      showPopup('third-download-gate');
    }
  }, [downloadCount]);

  return { shouldShow, campaign, handleShow, handleDismiss, handleSubmit };
}
```

**Responsibilities:**
- Check localStorage/sessionStorage rules
- Listen for trigger events
- Determine which campaign to show
- Track events via leadTracking.ts
- Update storage on dismiss/submit

---

## Trigger System Design

### Event-Based Architecture

**Problem:** How do different parts of the app trigger popups?

**Solution:** Custom browser events

```typescript
// In DownloadPdfButton.tsx
function handleDownload() {
  // ... existing download logic ...

  // Dispatch custom event
  window.dispatchEvent(new CustomEvent('pdf_downloaded', {
    detail: { imageId, imageTitle }
  }));
}

// In useLeadPopup.ts
useEffect(() => {
  function handleDownload(e: CustomEvent) {
    const count = incrementDownloadCount();
    checkTriggers(count);
  }

  window.addEventListener('pdf_downloaded', handleDownload);
  return () => window.removeEventListener('pdf_downloaded', handleDownload);
}, []);
```

**Supported Events:**
```typescript
// Download tracking
window.dispatchEvent(new CustomEvent('pdf_downloaded'));

// Scroll tracking
window.dispatchEvent(new CustomEvent('scroll_50_percent'));

// Exit intent
window.dispatchEvent(new CustomEvent('exit_intent'));

// Coloring complete
window.dispatchEvent(new CustomEvent('coloring_complete'));
```

---

## Campaign Configuration

### Where to Store Campaign Config?

**Option 1: MongoDB (Future)**
- Fetch from `/api/lead-campaigns/active`
- Dynamic, can change without deploy
- Requires admin UI to manage

**Option 2: Hardcoded (Initial - RECOMMENDED)**
- Simple const in `useLeadPopup.ts`
- Fast, no API calls
- Easy to iterate

```typescript
// src/hooks/useLeadPopup.ts

const CAMPAIGNS = {
  'third-download-gate': {
    campaignId: 'third-download-gate',
    headline: '🎉 Du har lastet ned 3 tegninger!',
    description: 'Få 10 bonus tegninger hver 14. dag',
    ctaText: 'Send meg tegninger!',
    dismissText: 'Nei takk',
    trigger: {
      event: 'pdf_downloaded',
      threshold: 3
    }
  },
  'first-download-gate': {
    campaignId: 'first-download-gate',
    headline: '🎨 Elsker du å fargelegge?',
    description: 'Få nye tegninger direkte i innboksen din',
    ctaText: 'Ja, meld meg på!',
    dismissText: 'Kanskje senere',
    trigger: {
      event: 'pdf_downloaded',
      threshold: 1
    }
  }
  // Add more campaigns as needed
};
```

**Start with hardcoded, migrate to MongoDB in Phase 2**

---

## Storage Strategy

### localStorage (Persistent)
```javascript
{
  "leadEmailSubmitted": "true",           // Never show again
  "leadDismissedCount": "3",             // Number of dismissals
  "leadLastDismissed": "1706180400000",  // Timestamp
  "leadDownloadCount": "5"               // Tracks downloads across sessions
}
```

### sessionStorage (Session-only)
```javascript
{
  "leadPopupShown": "true",              // Only one popup per session
  "leadAssignedCampaign": "third-download-gate"  // A/B assignment
}
```

**Why both?**
- **localStorage:** Long-term behavior (don't annoy users)
- **sessionStorage:** Short-term behavior (one popup per visit)

---

## API Integration

### Reuse Existing Newsletter API

**Good news:** You already have `/api/newsletter/subscribe`

**Lead popup just calls it:**
```typescript
async function handleSubmit(email: string) {
  // 1. Track event
  await trackLeadCampaign(campaign.campaignId, 'submitted', {
    email,
    metadata: { downloadCount }
  });

  // 2. Subscribe to newsletter (existing API)
  const response = await fetch('/api/newsletter/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  // 3. Mark as submitted
  localStorage.setItem('leadEmailSubmitted', 'true');

  // 4. Close popup
  onClose();
}
```

**No new API needed for MVP!**

---

## 🔑 Future-Proofing: Ready for MongoDB Migration

### Why Build with Migration in Mind?

We're starting with hardcoded campaigns for speed, but we want to easily switch to MongoDB + admin UI later. The key is **abstraction**: code shouldn't know or care where campaigns come from.

### Campaign Service Layer (Abstraction)

**File:** `src/lib/campaignService.ts`

This file is the **single source of truth** for campaign data. Everything goes through it.

```typescript
/**
 * Campaign Service
 *
 * Abstraction layer for campaign data.
 *
 * Phase 1: Returns hardcoded campaigns
 * Phase 2: Fetches from MongoDB API
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
    threshold?: number;  // e.g., 3 for "3rd download"
  };
  content: {
    headline: string;
    description: string;
    ctaText: string;
    dismissText: string;
  };
  weight?: number;  // For A/B testing (1 = equal weight)
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
      threshold: 3
    },
    content: {
      headline: '🎉 Du har lastet ned 3 tegninger!',
      description: 'Få 10 bonus tegninger hver 14. dag',
      ctaText: 'Send meg tegninger!',
      dismissText: 'Nei takk'
    },
    weight: 1
  },
  {
    campaignId: 'first-download-gate',
    name: 'First Download Gate',
    type: 'download_gate',
    active: false,  // Inactive for now
    trigger: {
      event: 'pdf_downloaded',
      threshold: 1
    },
    content: {
      headline: '🎨 Elsker du å fargelegge?',
      description: 'Få nye tegninger direkte i innboksen din',
      ctaText: 'Ja, meld meg på!',
      dismissText: 'Kanskje senere'
    },
    weight: 1
  }
];

// ============================================================================
// PUBLIC API (SAME FOR BOTH PHASES)
// ============================================================================

/**
 * Get all active campaigns
 *
 * PHASE 1: Returns filtered hardcoded campaigns
 * PHASE 2: Fetches from /api/lead-campaigns/active
 */
export async function getActiveCampaigns(): Promise<Campaign[]> {
  // TODO: Swap this implementation when moving to MongoDB

  // PHASE 1 (Current):
  return HARDCODED_CAMPAIGNS.filter(c => c.active);

  // PHASE 2 (Future - uncomment when ready):
  // const response = await fetch('/api/lead-campaigns/active');
  // return await response.json();
}

/**
 * Get a specific campaign by ID
 *
 * PHASE 1: Searches hardcoded array
 * PHASE 2: Fetches from API
 */
export async function getCampaign(campaignId: string): Promise<Campaign | null> {
  // TODO: Swap this implementation when moving to MongoDB

  // PHASE 1 (Current):
  return HARDCODED_CAMPAIGNS.find(c => c.campaignId === campaignId) || null;

  // PHASE 2 (Future - uncomment when ready):
  // const response = await fetch(`/api/lead-campaigns/${campaignId}`);
  // if (!response.ok) return null;
  // return await response.json();
}

/**
 * Get campaigns by trigger type
 * Useful for listening to specific events
 */
export async function getCampaignsByTrigger(
  event: Campaign['trigger']['event']
): Promise<Campaign[]> {
  const campaigns = await getActiveCampaigns();
  return campaigns.filter(c => c.trigger.event === event);
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
 * Uses weighted random selection
 */
export function selectCampaign(campaigns: Campaign[]): Campaign | null {
  if (campaigns.length === 0) return null;
  if (campaigns.length === 1) return campaigns[0];

  // For now, simple random selection
  // Later: implement proper weighted selection based on campaign.weight
  const randomIndex = Math.floor(Math.random() * campaigns.length);
  return campaigns[randomIndex];
}
```

### How useLeadPopup Uses It

**Instead of hardcoding campaigns in the hook, it fetches through the service:**

```typescript
// src/hooks/useLeadPopup.ts

import { getActiveCampaigns, getCampaignsByTrigger, shouldTriggerCampaign } from '@/lib/campaignService';

export function useLeadPopup() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [downloadCount, setDownloadCount] = useState(0);

  // Load campaigns on mount
  useEffect(() => {
    async function loadCampaigns() {
      const active = await getActiveCampaigns();
      setCampaigns(active);
    }
    loadCampaigns();
  }, []);

  // Listen for downloads
  useEffect(() => {
    async function handleDownload() {
      const newCount = downloadCount + 1;
      setDownloadCount(newCount);

      // Find campaigns that match this trigger
      const downloadCampaigns = await getCampaignsByTrigger('pdf_downloaded');

      // Check if any should trigger
      const triggered = downloadCampaigns.find(campaign =>
        shouldTriggerCampaign(campaign, { downloadCount: newCount })
      );

      if (triggered) {
        showPopup(triggered);
      }
    }

    window.addEventListener('pdf_downloaded', handleDownload);
    return () => window.removeEventListener('pdf_downloaded', handleDownload);
  }, [downloadCount, campaigns]);

  // ... rest of hook
}
```

**Notice:** The hook doesn't know if campaigns are hardcoded or from API!

### Migration Path: Hardcoded → MongoDB

**When you're ready to move to MongoDB, here's the exact process:**

#### Step 1: Build the API Routes (2 hours)

```typescript
// src/app/api/lead-campaigns/active/route.ts

export async function GET() {
  const db = await getDb();
  const campaigns = await db.collection('leadCampaigns')
    .find({ active: true })
    .toArray();

  return NextResponse.json(campaigns);
}

// src/app/api/lead-campaigns/[id]/route.ts

export async function GET(request: Request, { params }) {
  const db = await getDb();
  const campaign = await db.collection('leadCampaigns')
    .findOne({ campaignId: params.id });

  return NextResponse.json(campaign);
}
```

#### Step 2: Migrate Data to MongoDB

```javascript
// Run this in MongoDB Compass or shell

db.leadCampaigns.insertMany([
  {
    campaignId: "third-download-gate",
    name: "3rd Download Gate",
    type: "download_gate",
    active: true,
    trigger: {
      event: "pdf_downloaded",
      threshold: 3
    },
    content: {
      headline: "🎉 Du har lastet ned 3 tegninger!",
      description: "Få 10 bonus tegninger hver 14. dag",
      ctaText: "Send meg tegninger!",
      dismissText: "Nei takk"
    },
    weight: 1,
    createdAt: new Date()
  },
  // ... other campaigns
]);
```

#### Step 3: Swap Implementation (5 minutes!)

**File:** `src/lib/campaignService.ts`

```typescript
// Comment out Phase 1, uncomment Phase 2

export async function getActiveCampaigns(): Promise<Campaign[]> {
  // PHASE 1 (Old - comment out):
  // return HARDCODED_CAMPAIGNS.filter(c => c.active);

  // PHASE 2 (New - uncomment):
  const response = await fetch('/api/lead-campaigns/active');
  return await response.json();
}
```

**That's it.** No changes anywhere else in the codebase!

#### Step 4: Build Admin UI (4-5 hours)

Now you can build the CRUD interface to manage campaigns through the dashboard.

### Type Safety: Guaranteed Compatibility

The `Campaign` interface is designed to match the MongoDB schema **exactly**. This means:

✅ TypeScript will catch any mismatches
✅ Data shape is consistent everywhere
✅ Easy to validate against schema
✅ Auto-completion in your editor

```typescript
// This interface lives in campaignService.ts
// Use it everywhere that deals with campaigns

import type { Campaign } from '@/lib/campaignService';

// In components:
function LeadPopup({ campaign }: { campaign: Campaign }) {
  return <div>{campaign.content.headline}</div>  // ✅ Type-safe!
}

// In hooks:
const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);

// In API routes:
const campaigns: Campaign[] = await db.collection('leadCampaigns').find().toArray();
```

### Testing the Migration

**Before going live, test the API in dev:**

```typescript
// Temporarily modify campaignService.ts

export async function getActiveCampaigns(): Promise<Campaign[]> {
  try {
    // Try API first
    const response = await fetch('/api/lead-campaigns/active');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('API failed, falling back to hardcoded campaigns');
  }

  // Fallback to hardcoded if API fails
  return HARDCODED_CAMPAIGNS.filter(c => c.active);
}
```

**This gives you safety during migration!**

### Benefits of This Approach

✅ **Start simple** - Hardcoded campaigns for quick iteration
✅ **Easy migration** - Swap 1 file, no other changes needed
✅ **Type safety** - TypeScript prevents bugs
✅ **Flexible** - Can add features without breaking things
✅ **Testable** - Can mock the service in tests
✅ **No over-engineering** - Build complexity only when needed

### What This Future-Proofs

**Ready for:**
- ✅ MongoDB storage
- ✅ Admin CRUD UI
- ✅ Real-time campaign updates (no deploy needed)
- ✅ A/B testing framework
- ✅ Campaign scheduling (start/end dates)
- ✅ Targeting rules (by user segment, device, etc.)
- ✅ Campaign versioning
- ✅ Preview/test modes

**All without changing the core popup components!**

---

## File Structure

```
src/
├── components/
│   └── lead/
│       ├── LeadPopup.tsx              # Base popup component (dumb)
│       └── LeadPopupManager.tsx       # Manager component (smart)
│
├── hooks/
│   └── useLeadPopup.ts                # Trigger logic + state
│
├── lib/
│   ├── leadTracking.ts                # Tracking functions
│   ├── leadStorage.ts                 # localStorage/sessionStorage helpers
│   └── campaignService.ts             # 🔑 Campaign data abstraction layer
│
└── app/
    └── layout.tsx                     # Add <LeadPopupManager />
```

**Total: 6 new files** (added campaignService.ts for future-proofing)

---

## Implementation Steps

### Phase 1: Core Infrastructure (2-3 hours)

1. **Create campaign service** ⭐ IMPORTANT FOR FUTURE-PROOFING
   ```bash
   src/lib/campaignService.ts
   ```
   - Campaign type definitions
   - Hardcoded campaigns (Phase 1)
   - `getActiveCampaigns()` function
   - Helper functions (shouldTriggerCampaign, etc.)
   - Ready for MongoDB swap (Phase 2)

2. **Create tracking & storage libraries**
   ```bash
   src/lib/leadTracking.ts
   src/lib/leadStorage.ts
   ```
   - `trackLeadCampaign()` function
   - `shouldShowLeadPopup()` check
   - Storage helpers

3. **Create base component**
   ```bash
   src/components/lead/LeadPopup.tsx
   ```
   - Modal UI (copy CookieConsentModal pattern)
   - Email form
   - Loading states

4. **Create hook**
   ```bash
   src/hooks/useLeadPopup.ts
   ```
   - Import from campaignService (not hardcoded!)
   - Download counter
   - Trigger logic for ONE campaign (3rd download)

5. **Create manager**
   ```bash
   src/components/lead/LeadPopupManager.tsx
   ```
   - Use the hook
   - Pass data to LeadPopup

6. **Add to layout**
   ```typescript
   // src/app/layout.tsx
   import { LeadPopupManager } from '@/components/lead/LeadPopupManager';

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <LeadPopupManager />  {/* Add here */}
         </body>
       </html>
     );
   }
   ```

7. **Dispatch events from download button**
   ```typescript
   // src/components/buttons/DownloadPdfButton.tsx
   window.dispatchEvent(new CustomEvent('pdf_downloaded'));
   ```

---

### Phase 2: Multiple Campaigns (1-2 hours)

1. **Add more campaigns to config**
   - First download gate
   - Exit intent (requires mouse listener)
   - Scroll 50% (requires scroll listener)

2. **Add A/B assignment logic**
   - Random campaign selection
   - Store in sessionStorage

3. **Add more trigger listeners**
   - Exit intent listener
   - Scroll listener

---

### Phase 3: Admin & Analytics (planned separately)

- Build tracking APIs
- Create dashboard components
- Add campaign management UI

---

## Testing Plan

### Manual Testing Checklist

**Test 1: Basic Display**
- [ ] Download 3 PDFs
- [ ] Popup appears on 3rd download
- [ ] Content displays correctly
- [ ] Can enter email
- [ ] Can dismiss

**Test 2: Storage**
- [ ] Dismiss popup
- [ ] Refresh page, download 3 more PDFs
- [ ] Popup doesn't show (already shown in session)
- [ ] Open new tab, download 3 PDFs
- [ ] Popup shows (new session)

**Test 3: Email Submit**
- [ ] Enter email and submit
- [ ] Success message shows
- [ ] Popup closes
- [ ] Refresh and download more PDFs
- [ ] Popup never shows again (localStorage)

**Test 4: Dismiss Limit**
- [ ] Dismiss popup 3 times (across sessions)
- [ ] Popup doesn't show for 30 days
- [ ] Clear localStorage
- [ ] Popup shows again

---

## Design: Simple & Clean

### Visual Style (Match Existing)
- Use existing color palette:
  - Primary: `#FF6F59` (orange from buttons)
  - Background: `white`
  - Text: `#264653` (dark teal)
  - Border: `gray-200`
- Match CookieConsentModal spacing
- Mobile-first responsive
- Smooth animations (fade in)

### User Experience Rules
1. **One popup per session** - Not annoying
2. **Dismissible** - Always let users close it
3. **Fast** - No loading spinners on open
4. **Accessible** - Keyboard navigation, ARIA labels
5. **Mobile-friendly** - Works on small screens

---

## Future Enhancements (Not MVP)

### Phase 2+
- [ ] Fetch campaigns from MongoDB API
- [ ] Admin UI to create/edit campaigns
- [ ] A/B test different content
- [ ] Add images/GIFs to popup
- [ ] Multi-step forms
- [ ] Social proof ("1,247 parents subscribed")
- [ ] Countdown timers
- [ ] Seasonal campaigns

### Nice to Have
- [ ] Animation library (Framer Motion)
- [ ] Preview mode for testing
- [ ] Analytics dashboard integration
- [ ] Email validation (check if already exists)
- [ ] GDPR export feature

---

## Key Decisions

### ✅ What We're Doing
- Single base component (LeadPopup)
- Event-driven triggers
- Hardcoded campaigns initially
- Reuse existing newsletter API
- localStorage + sessionStorage for rules
- Start with 1 campaign (3rd download)

### ❌ What We're NOT Doing (Yet)
- MongoDB campaign storage
- Admin campaign builder UI
- Multiple variants per campaign
- Advanced targeting rules
- Email validation against database
- Complex animations

---

## Success Criteria (MVP)

### Must Have
- ✅ Popup displays after 3rd download
- ✅ Email submits successfully
- ✅ Tracking events fire correctly
- ✅ Storage rules prevent spam
- ✅ Works on mobile + desktop
- ✅ Matches site design

### Nice to Have
- Smooth fade-in animation
- Loading state on submit
- Success message before close
- Preview mode in dev

---

## Estimated Timeline

**Phase 1 (Core):** 2-3 hours
- campaignService.ts: 30 min ⭐ NEW
- leadTracking.ts: 30 min
- leadStorage.ts: 15 min
- LeadPopup.tsx: 45 min
- useLeadPopup.ts: 45 min (uses campaignService)
- LeadPopupManager.tsx: 15 min
- Integration: 30 min
- Testing: 30 min

**Phase 2 (Multiple Campaigns):** 1-2 hours
- Additional campaigns: 30 min
- A/B logic: 30 min
- More triggers: 30 min
- Testing: 30 min

**Total MVP: 3-5 hours**

---

## Code Examples

### Example: Complete useLeadPopup Hook (Simplified)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { trackLeadCampaign } from '@/lib/leadTracking';

const CAMPAIGNS = {
  'third-download-gate': {
    campaignId: 'third-download-gate',
    headline: '🎉 Du har lastet ned 3 tegninger!',
    description: 'Få 10 bonus tegninger hver 14. dag',
    ctaText: 'Send meg tegninger!',
    dismissText: 'Nei takk',
  }
};

export function useLeadPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    // Check if we should show popup
    const emailSubmitted = localStorage.getItem('leadEmailSubmitted');
    const popupShown = sessionStorage.getItem('leadPopupShown');

    if (emailSubmitted || popupShown) return;

    // Listen for download events
    let downloadCount = parseInt(localStorage.getItem('leadDownloadCount') || '0');

    function handleDownload() {
      downloadCount++;
      localStorage.setItem('leadDownloadCount', String(downloadCount));

      if (downloadCount === 3) {
        setCampaign(CAMPAIGNS['third-download-gate']);
        setIsOpen(true);
        sessionStorage.setItem('leadPopupShown', 'true');
        trackLeadCampaign('third-download-gate', 'shown');
      }
    }

    window.addEventListener('pdf_downloaded', handleDownload);
    return () => window.removeEventListener('pdf_downloaded', handleDownload);
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    trackLeadCampaign(campaign.campaignId, 'dismissed');

    // Increment dismiss count
    const dismissCount = parseInt(localStorage.getItem('leadDismissedCount') || '0');
    localStorage.setItem('leadDismissedCount', String(dismissCount + 1));
  };

  const handleSubmit = async (email: string) => {
    await trackLeadCampaign(campaign.campaignId, 'submitted', { email });

    // Call newsletter API
    await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    localStorage.setItem('leadEmailSubmitted', 'true');
    setIsOpen(false);
  };

  return { isOpen, campaign, handleDismiss, handleSubmit };
}
```

### Example: LeadPopup Component (Simplified)

```typescript
'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

export function LeadPopup({ isOpen, campaign, onClose, onSubmit }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !campaign) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(email);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {campaign.headline}
        </h2>
        <p className="text-gray-600 mb-6">
          {campaign.description}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="din@epost.no"
            className="w-full px-4 py-2 border rounded mb-4"
            required
          />

          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Sender...' : campaign.ctaText}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              {campaign.dismissText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## Next Steps

1. **Review this plan** with team
2. **Approve approach** (simple hardcoded vs. complex dynamic)
3. **Start Phase 1** implementation
4. **Test with 3rd download gate**
5. **Iterate based on data**

---

## Questions to Answer

- [ ] Which campaign to launch first? (Recommend: 3rd download gate)
- [ ] Do we want animation library or plain CSS?
- [ ] Should we add email validation against existing subscribers?
- [ ] Desktop-only for initial launch or mobile too?

---

**Bottom Line:** This is the simplest possible implementation that can scale. We can always add complexity later based on data.
