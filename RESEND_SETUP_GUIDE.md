# Switch from SMTP to Resend for Better Deliverability

## Why Resend?

- ✅ **100 emails/day free** (3,000/month)
- ✅ **Excellent deliverability** - No blocklist issues
- ✅ **Simple API** - Easy to integrate
- ✅ **Email tracking built-in** - Opens and clicks
- ✅ **Domain verification** - Send from @tegnogfarge.no

## Step 1: Sign Up for Resend

1. Go to https://resend.com
2. Sign up with your email
3. Verify your account

## Step 2: Get API Key

1. In Resend dashboard, go to "API Keys"
2. Click "Create API Key"
3. Name it: "TegnOgFarge Production"
4. Copy the API key (starts with `re_`)

## Step 3: Verify Your Domain

1. In Resend dashboard, go to "Domains"
2. Click "Add Domain"
3. Enter: `tegnogfarge.no`
4. Follow instructions to add DNS records:
   - Add the provided TXT, MX, and CNAME records to your domain DNS
   - Wait 10-60 minutes for verification

**DNS Records Example:**
```
Type: TXT
Name: _resend
Value: resend-verification=xxxxxx

Type: MX
Name: @
Value: feedback-smtp.resend.com (Priority: 10)

Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@tegnogfarge.no
```

## Step 4: Update Environment Variables

Add to `.env.local`:

```env
# Remove or comment out old SMTP settings
# SMTP_HOST=...
# SMTP_PORT=...
# SMTP_USER=...
# SMTP_PASS=...

# Add Resend API key
RESEND_API_KEY=re_your_api_key_here
```

## Step 5: Install Resend SDK

```bash
npm install resend
```

## Step 6: Update Email Service Code

The code changes are minimal - replace SMTP with Resend API.

### Before (SMTP):
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

await transporter.sendMail({
  from: 'TegnOgFarge <noreply@tegnogfarge.no>',
  to: recipient.email,
  subject: 'Email subject',
  html: emailHtml,
});
```

### After (Resend):
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'TegnOgFarge <noreply@tegnogfarge.no>',
  to: recipient.email,
  subject: 'Email subject',
  html: emailHtml,
  headers: {
    'List-Unsubscribe': `<${unsubscribeUrl}>`,
  },
});
```

## Step 7: Benefits After Migration

1. **No more blocklist issues** - Resend maintains IP reputation
2. **Better deliverability** - Higher inbox placement rate
3. **Built-in analytics** - Track opens/clicks without custom code
4. **Automatic retry** - Failed sends are retried automatically
5. **Webhook support** - Get notified of bounces, complaints, opens, clicks

## Testing After Setup

1. Send test email to Hotmail/Outlook address
2. Check if it arrives in inbox (not spam)
3. Verify tracking works
4. Test unsubscribe link

## Monitoring

Resend dashboard shows:
- Emails sent/delivered/bounced
- Open rates
- Click rates
- Spam complaints
- Unsubscribe requests

## Cost

- **Free tier**: 100 emails/day, 3,000/month
- **Paid tier**: $20/month for 50,000 emails
- **No per-email cost** for paid tier

For your use case (weekly emails to ~24 subscribers):
- **Current usage**: ~100 emails/month
- **Free tier is enough!**

## Alternative: Keep SMTP as Fallback

You can implement dual-mode:
1. Try Resend first
2. Fall back to SMTP if Resend fails
3. This gives you redundancy

## Need Help?

If you want me to implement the Resend integration, I can:
1. Create new email service with Resend
2. Update send-campaign route
3. Add fallback to SMTP
4. Test with your Hotmail recipient

Just let me know!
