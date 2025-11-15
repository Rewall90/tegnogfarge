# Cloudflare Turnstile Setup Guide

This guide explains how to configure and use Cloudflare Turnstile spam protection for the contact form.

## Overview

Cloudflare Turnstile is a privacy-friendly CAPTCHA alternative that protects forms from spam and bot submissions without requiring users to solve puzzles.

**Features Implemented:**
- ✅ Cloudflare Turnstile CAPTCHA verification
- ✅ Honeypot field for catching simple bots
- ✅ Server-side token validation
- ✅ Client-side integration with React

## Architecture

```
src/
├── lib/
│   └── turnstile.ts                    # Server-side validation logic
├── components/
│   └── contact/
│       ├── ContactForm.tsx             # Updated form with Turnstile
│       └── TurnstileWidget.tsx         # Reusable Turnstile component
└── app/
    └── api/
        └── contact/
            └── route.ts                # API route with validation
```

## Setup Instructions

### Step 1: Get Cloudflare Turnstile Keys

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Turnstile** section
3. Click **"Add a site"**
4. Fill out the form:
   - **Site name**: tegnogfarge.no Contact Form
   - **Domain**: tegnogfarge.no (or localhost for development)
   - **Widget Mode**: Managed (recommended)
5. Click **Create**
6. Copy your **Site Key** and **Secret Key**

### Step 2: Add Environment Variables

Add these variables to your `.env.local` file:

```bash
# Public site key (exposed to browser)
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=your_site_key_here

# Secret key (server-side only)
CLOUDFLARE_TURNSTILE_SECRET_KEY=your_secret_key_here
```

**Important:**
- Never commit the secret key to git
- Use different keys for production and development environments
- The `NEXT_PUBLIC_*` prefix makes the site key available to the browser

### Step 3: Deploy to Production

Add the environment variables to your Vercel project:

```bash
# Using Vercel CLI
vercel env add NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY production
vercel env add CLOUDFLARE_TURNSTILE_SECRET_KEY production

# Or via Vercel Dashboard:
# 1. Go to your project settings
# 2. Navigate to Environment Variables
# 3. Add both variables
# 4. Redeploy your project
```

### Step 4: Test the Implementation

#### Testing with Test Keys (Development)

Cloudflare provides test keys for development:

```bash
# Always passes
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
CLOUDFLARE_TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA

# Always fails
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=2x00000000000000000000AB
CLOUDFLARE_TURNSTILE_SECRET_KEY=2x0000000000000000000000000000000AA

# Forces interactive challenge
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=3x00000000000000000000FF
CLOUDFLARE_TURNSTILE_SECRET_KEY=3x0000000000000000000000000000000AA
```

#### Testing Checklist

- [ ] Widget loads on contact page
- [ ] Form submission requires CAPTCHA completion
- [ ] Successful submissions send emails
- [ ] Failed CAPTCHA shows error message
- [ ] Honeypot catches bot submissions
- [ ] Token expiration (5 minutes) is handled correctly

## How It Works

### Client-Side Flow

1. User loads contact form
2. Cloudflare Turnstile widget renders automatically
3. Turnstile performs background verification
4. Upon successful verification, a token is generated
5. Token is included in form submission

### Server-Side Flow

1. API receives form data with Turnstile token
2. **Honeypot Validation**: Check if hidden field is empty
3. **Turnstile Validation**: Verify token with Cloudflare API
4. If validation passes, send email
5. If validation fails, return error

### Security Layers

1. **Cloudflare Turnstile** - Primary bot detection
2. **Honeypot Field** - Catches simple bots
3. **Zod Schema Validation** - Input sanitization
4. **Server-side Verification** - Mandatory token check

## File Descriptions

### `src/lib/turnstile.ts`

Server-side validation utility:
- `validateTurnstileToken()` - Verifies token with Cloudflare API
- `validateHoneypot()` - Checks honeypot field
- Error code reference

### `src/components/contact/TurnstileWidget.tsx`

Reusable React component:
- Loads Cloudflare script
- Renders Turnstile widget
- Handles callbacks (verify, expire, error)
- Automatic cleanup

### `src/components/contact/ContactForm.tsx`

Updated contact form:
- Integrated Turnstile widget
- Honeypot field (hidden from users)
- Token state management
- Form submission with validation

### `src/app/api/contact/route.ts`

API route with validation:
- Zod schema validation
- Honeypot check
- Turnstile token verification
- Email sending

## Best Practices

### Security

✅ **Always validate server-side** - Client-side validation is not secure
✅ **Use HTTPS in production** - Required for Turnstile
✅ **Rotate keys regularly** - Update keys every 6-12 months
✅ **Monitor analytics** - Check Cloudflare dashboard for unusual patterns
✅ **Never expose secret keys** - Keep them in environment variables

### User Experience

✅ **Invisible challenges** - Most users won't see a CAPTCHA
✅ **Fast verification** - Typically completes in < 1 second
✅ **Accessible** - Works with screen readers
✅ **Mobile-friendly** - Responsive design
✅ **Error handling** - Clear feedback messages

## Troubleshooting

### Widget Not Loading

**Problem**: Turnstile widget doesn't appear

**Solutions**:
- Check environment variable is set: `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY`
- Verify site key is correct
- Check browser console for errors
- Ensure domain is authorized in Cloudflare dashboard

### Validation Always Fails

**Problem**: Server-side validation fails with valid tokens

**Solutions**:
- Verify secret key is correct
- Check token hasn't expired (5-minute limit)
- Ensure tokens aren't being reused
- Check Cloudflare API status

### Honeypot Triggering False Positives

**Problem**: Legitimate users blocked by honeypot

**Solutions**:
- Ensure honeypot field has `tabIndex={-1}`
- Verify field is truly hidden (`className="hidden"`)
- Check autocomplete is disabled
- Review bot detection logic

## Monitoring

### Cloudflare Dashboard

Monitor your Turnstile usage:
1. Go to Cloudflare Dashboard
2. Navigate to Turnstile
3. Select your site
4. View analytics:
   - Total challenges
   - Solve rates
   - Top countries
   - Traffic patterns

### Server Logs

Check your server logs for:
- Failed validation attempts
- Honeypot triggers
- Token expiration issues
- API errors

## Additional Resources

- [Cloudflare Turnstile Docs](https://developers.cloudflare.com/turnstile/)
- [Server-side Validation Guide](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Next.js Example](https://github.com/vercel/next.js/tree/canary/examples/cloudflare-turnstile)
- [Error Codes Reference](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/#error-codes)

## Support

If you encounter issues:
1. Check this documentation
2. Review Cloudflare Turnstile documentation
3. Check server logs for detailed error messages
4. Verify environment variables are correctly set
