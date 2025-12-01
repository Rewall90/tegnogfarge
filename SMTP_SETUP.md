# SMTP Email Setup for TegnOgFarge.no

Your email campaigns now send via **your own domain server (Dedia)** instead of Resend.

## ✅ Benefits

- ✅ **Better deliverability** - Emails come from your verified domain
- ✅ **Users can reply** - Emails sent from `petter@tegnogfarge.no`
- ✅ **No spam issues** - Your domain has better reputation than third-party services
- ✅ **No rate limits** - Send as many as your hosting allows
- ✅ **Free** - No extra costs beyond your hosting

## 🔧 Required Setup

### Step 1: Get Your SMTP Credentials from Dedia

You need to get these from your Dedia hosting control panel:

1. Log into your Dedia control panel (cPanel/Webmail)
2. Find **Email Accounts** or **Mail Settings**
3. Look for SMTP/outgoing mail settings for `petter@tegnogfarge.no`

**You'll need:**
- **SMTP Host**: Usually `mail.tegnogfarge.no` or `smtp.tegnogfarge.no`
- **SMTP Port**: Typically `587` (TLS) or `465` (SSL)
- **Username**: `petter@tegnogfarge.no`
- **Password**: Your email password

### Step 2: Update `.env.local`

Open `.env.local` and update these lines (already added for you):

```bash
SMTP_HOST=mail.tegnogfarge.no
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=petter@tegnogfarge.no
SMTP_PASS=YOUR_EMAIL_PASSWORD_HERE  # ← Replace with actual password
```

### Step 3: Restart Your Dev Server

```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

## 🧪 Testing

1. Go to `/dashboard/email-campaigns`
2. Check **Test-modus** only
3. Click **"Send test-e-post"**
4. Check your `petterlund@hotmail.no` inbox
5. Email should arrive in **inbox** (not spam!) from `petter@tegnogfarge.no`
6. Try replying - it will go directly to your email!

## 📧 Email Details

**From:** Petter - TegnOgFarge.no <petter@tegnogfarge.no>
**Reply-To:** petter@tegnogfarge.no
**Users can:** Reply directly to you

## 🔍 Troubleshooting

### "SMTP is not configured" error
- Check that all SMTP variables are set in `.env.local`
- Make sure there are no typos in variable names
- Restart your dev server

### "Connection timeout" error
- Verify SMTP_HOST is correct (try both `mail.tegnogfarge.no` and `smtp.tegnogfarge.no`)
- Check if port 587 is open (some networks block it)
- Try port 465 with `SMTP_SECURE=true`

### "Authentication failed" error
- Double-check your email password
- Make sure the email account `petter@tegnogfarge.no` exists in Dedia
- Check if 2FA is enabled (might need app-specific password)

### Emails still going to spam
- Check SPF records in your domain DNS
- Add DKIM records (ask Dedia support)
- Verify your domain has proper reverse DNS

## 🚀 Common SMTP Server Formats

If `mail.tegnogfarge.no` doesn't work, try:
- `smtp.tegnogfarge.no`
- `tegnogfarge.no`
- Check Dedia documentation or contact their support

## 📝 Next Steps

Once SMTP is working:
1. Test with a few real users
2. Check spam rates
3. Consider adding more email templates
4. Set up automated weekly sends
