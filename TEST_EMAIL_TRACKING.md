# How to Test Email Tracking

## Why tracking might not work:

1. **Email client blocks images** - Gmail, Outlook, Apple Mail often block external images by default
2. **Privacy protection** - Some clients strip tracking pixels automatically
3. **Image loading disabled** - User has disabled image loading in their email client

## How to verify tracking is working:

### Option 1: Check browser console
1. Open the email in your email client
2. Right-click the email content → "View Source" or "Show Original"
3. Look for the tracking pixel URL: `<img src="https://your-domain/api/email-tracking/open?trackingId=..."`
4. Copy the full URL
5. Paste it directly in your browser
6. You should see a tiny 1x1 pixel image
7. Check `/dashboard/email-stats` - it should now show as opened!

### Option 2: Test the click tracking
1. Click any link in the email (like "Se alle bildene" button)
2. You'll be redirected through `/api/email-tracking/click`
3. Check `/dashboard/email-stats` - clicks are usually more reliable than opens

### Option 3: Enable images in your email client

**Gmail:**
- Look for "Images are not displayed" banner at the top
- Click "Display images below" or "Always display images from tegnogfarge.no"

**Outlook:**
- Click "Download pictures" in the banner

**Apple Mail:**
- Mail → Preferences → Viewing → Check "Load remote content in messages"

## Common Issues:

### "Ikke åpnet" but you opened the email
- The tracking pixel was blocked
- Solution: Try clicking a link instead (more reliable)

### Both opens and clicks not tracked
- Make sure you're testing with the production URL (not localhost)
- The email must use `NEXT_PUBLIC_BASE_URL` for tracking URLs

### Check logs
Look for these log messages in your server console:
- `[Email Tracking] Email opened: { email: 'petter@golfkart.no', campaignId: 'third-download-gate' }`
- `[Email Tracking] Email link clicked: { email: 'petter@golfkart.no', campaignId: 'third-download-gate', destinationUrl: '...' }`

## Manual test URL format:

If your tracking pixel URL looks like this:
```
https://tegnogfarge.no/api/email-tracking/open?trackingId=third-download-gate%3Apetter%40golfkart.no%3A1234567890
```

You can manually visit it in your browser to trigger the tracking.
