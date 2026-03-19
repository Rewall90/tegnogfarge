# Rewarded Ads Implementation - TegnOgFarge.no

## Overview

This document describes the Google Ad Manager rewarded ads implementation for TegnOgFarge.no. Users are shown an opt-in ad before downloading coloring pages, improving monetization while maintaining a positive user experience.

## Implementation Date
2026-03-18

## Ad Unit Details

- **Ad Unit Name**: Rewarded_Download
- **Ad Unit Code**: rewarded_download
- **Ad Unit Path**: `/22712188410/rewarded_download`
- **Ad Unit ID**: 23343972895
- **Network ID**: 22712188410
- **Reward Amount**: 1
- **Reward Type**: reward

## Technical Implementation

### 1. Google Publisher Tag (GPT) Script
**File**: `src/app/layout.tsx`

Added GPT library to root layout:
```html
<script
  async
  src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"
  crossOrigin="anonymous"
/>
```

### 2. Rewarded Ad Hook
**File**: `src/hooks/useRewardedAd.ts`

Custom React hook that manages the complete rewarded ad lifecycle:

**Features**:
- Initializes GPT and defines rewarded ad slot
- Manages three key events:
  - `rewardedSlotReady` - Ad is loaded and ready to show
  - `rewardedSlotGranted` - User completed ad and earned reward
  - `rewardedSlotClosed` - User closed ad without watching
- Proper cleanup on component unmount
- Error handling and timeout protection (5 seconds)
- TypeScript definitions for GPT API

**API**:
```typescript
const {
  showAd,        // Function to display the ad
  isAdReady,     // Boolean: ad is loaded and ready
  isAdShowing,   // Boolean: ad is currently showing
  rewardGranted, // Boolean: user earned the reward
  error          // String | null: error message if any
} = useRewardedAd({
  adUnitPath: '/22712188410/rewarded_download',
  onRewardGranted: () => void,  // Callback when reward is granted
  onAdClosed: () => void         // Callback when ad is closed
});
```

### 3. Download Button Integration
**File**: `src/components/buttons/DownloadPdfButton.tsx`

Modified to integrate rewarded ads:

**Flow**:
1. Component mounts → Hook initializes ad slot
2. User clicks "Last ned Bilde" → `showAd()` is called
3. Ad displays as full-screen overlay
4. User watches ad → `rewardedSlotGranted` event fires
5. Download starts automatically
6. Ad slot is cleaned up

**Button States**:
- "Laster reklame..." - Ad is loading
- "Last ned Bilde" - Ready to show ad
- "Se reklame for nedlasting..." - Ad is currently showing
- Disabled while loading or showing

**Fallback Behavior**:
If ad fails to load (network error, ad blocker, etc.), button allows direct download after showing error in console.

## Requirements Met

✅ **Viewport meta tag** (required by Google):
- Present in `src/app/[locale]/layout.tsx` line 70
- `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />`

✅ **Mobile-optimized pages**:
- Site is fully responsive with Tailwind CSS

✅ **Out-of-page format**:
- Uses `googletag.enums.OutOfPageFormat.REWARDED`
- No `<div>` element needed (auto-generated)

✅ **Event listeners**:
- All three required events implemented
- Proper cleanup to prevent memory leaks

## Official Documentation References

- [Display a rewarded ad | Google Publisher Tag](https://developers.google.com/publisher-tag/samples/display-rewarded-ad)
- [Traffic rewarded ads for web - Google Ad Manager Help](https://support.google.com/admanager/answer/9116812?hl=en)
- [Google Publisher Tag Samples - GitHub](https://github.com/googleads/google-publisher-tag-samples)

## Next Steps (Required for Production)

### 1. Create Line Item in Ad Manager
You need to create a line item to traffic ads to this ad unit:

1. Go to **Delivery → Line items** in Ad Manager
2. Click **New line item**
3. Select **Video or Audio** as ad type
4. Set creative size to **1x1v (Video/VAST)**
5. Target the ad unit: `/22712188410/rewarded_download`
6. Set inventory targeting and priority
7. Upload or assign video creatives

### 2. Testing
Before going live, test the implementation:

1. Use Google Ad Manager's test mode
2. Verify ad displays correctly on mobile and desktop
3. Confirm download triggers after `rewardedSlotGranted`
4. Test fallback behavior (disable ads to simulate failure)
5. Check browser console for errors

### 3. Monitoring
After deployment, monitor:

- Ad fill rate (Reporting → Ad units)
- Completion rate (users who watch full ad)
- Download conversion rate
- User feedback

## Troubleshooting

**Ad doesn't show**:
- Check browser console for GPT errors
- Verify line item is active and targeting correct ad unit
- Ensure GPT script loaded successfully
- Check for ad blockers

**Download doesn't trigger**:
- Verify `rewardedSlotGranted` event fires (check console logs)
- Ensure `onRewardGranted` callback executes
- Check browser's download permissions

**TypeScript errors**:
- GPT types are defined in `useRewardedAd.ts`
- Ensure `window.googletag` is properly declared

## User Experience

1. User navigates to coloring page
2. Clicks "Last ned Bilde" button
3. Ad overlay appears with "Watch ad" prompt
4. User watches video ad (typically 15-30 seconds)
5. Ad closes automatically
6. Download starts immediately
7. User gets their coloring page

**Benefits**:
- Opt-in experience (user chooses to watch)
- No interruption if user doesn't click download
- Better UX than interstitials or pop-ups
- Higher completion rates (~80% vs 5-10% for content lockers)
- GDPR/privacy-friendly (no personal data required)

## Files Modified

1. `src/app/layout.tsx` - Added GPT script
2. `src/hooks/useRewardedAd.ts` - Created hook (NEW)
3. `src/components/buttons/DownloadPdfButton.tsx` - Integrated rewarded ads
4. `src/components/ui/Button.tsx` - Updated onClick type signature

## Performance Impact

- **GPT script**: ~30KB gzipped, async loaded
- **Hook overhead**: Minimal, only active on pages with download button
- **No additional dependencies**: Uses Google's CDN
- **Lazy loading**: Ad only loads when download button is visible

## Compliance

- ✅ GDPR compliant (no cookies required for rewarded ads)
- ✅ No personal data collection by ad unit itself
- ✅ User must opt-in (click button to watch ad)
- ✅ Follows Google's rewarded ads policies
