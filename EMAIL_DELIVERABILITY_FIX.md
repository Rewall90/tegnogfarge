# Fix Emails Going to Spam - Complete Guide

## Why Emails Go to Spam

Even with Resend, emails can go to spam if:
1. ❌ **Domain not verified** - Sending from unverified domain
2. ❌ **Missing SPF record** - No sender authentication
3. ❌ **Missing DKIM** - No email signature
4. ❌ **Missing DMARC** - No domain policy
5. ❌ **Poor content** - Spammy words, no plain text version
6. ❌ **No warm-up** - New domain/sender with no history

## Step-by-Step Fix

### 1. Verify Your Domain in Resend

**Critical**: You MUST verify tegnogfarge.no in Resend.

1. Go to Resend Dashboard → Domains
2. Add `tegnogfarge.no`
3. Add ALL DNS records they provide:

```dns
# SPF Record (Sender Policy Framework)
Type: TXT
Name: @ (or tegnogfarge.no)
Value: v=spf1 include:_spf.resend.com ~all

# DKIM Record (Email Signature)
Type: TXT
Name: resend._domainkey (or resend._domainkey.tegnogfarge.no)
Value: [Long string provided by Resend]

# DMARC Record (Domain Policy)
Type: TXT
Name: _dmarc (or _dmarc.tegnogfarge.no)
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@tegnogfarge.no

# Custom Return Path (Optional but recommended)
Type: CNAME
Name: resend (or resend.tegnogfarge.no)
Value: feedback-smtp.resend.com
```

**Wait 10-60 minutes** for DNS propagation, then verify in Resend dashboard.

### 2. Check Current DNS Records

Run these commands to see what's currently set:

```bash
# Check SPF
nslookup -type=TXT tegnogfarge.no

# Check DKIM
nslookup -type=TXT resend._domainkey.tegnogfarge.no

# Check DMARC
nslookup -type=TXT _dmarc.tegnogfarge.no
```

### 3. Fix Email Content

Your current email might trigger spam filters. Here's what to fix:

#### ❌ Problems:
- Only HTML (no plain text version)
- Emoji in subject line can trigger spam filters
- External tracking pixel without proper headers
- Short email with mostly links (looks like phishing)

#### ✅ Solutions:

**A. Add Plain Text Version:**
```typescript
await resend.emails.send({
  from: 'TegnOgFarge <noreply@tegnogfarge.no>',
  to: recipient.email,
  subject: 'Dine ukentlige fargebilder er klare!', // Remove emoji
  html: emailHtml,
  text: emailPlainText, // ADD THIS
});
```

**B. Plain Text Template:**
```typescript
const emailPlainText = collectionSlug ? `
Hei!

Vi har en ny samling med fargebilder klare til deg!

Se alle bildene her:
${baseUrl}/ukentlige-fargebilder/${collectionSlug}

God fornøyelse med fargeleggingen!

---
© 2025 TegnOgFarge.no. Alle rettigheter reservert.

Meld deg av: ${unsubscribeUrl}
` : `
Hei!

Takk for at du meldte deg på for å motta gratis fargebilder ukentlig!
Vi gleder oss til å dele fantastiske tegninger med deg.

Du vil motta nye tegninger hver uke direkte i innboksen din.

Besøk oss: ${baseUrl}

---
© 2025 TegnOgFarge.no. Alle rettigheter reservert.

Meld deg av: ${unsubscribeUrl}
`;
```

**C. Better Subject Lines (No Emoji):**
```typescript
// ❌ Bad (can trigger spam)
subject: 'Dine ukentlige fargebilder er klare! 🎨'

// ✅ Good
subject: 'Dine ukentlige fargebilder er klare'
subject: 'Nye fargebilder til deg fra TegnOgFarge'
subject: 'Ukens fargebilder er her'
```

**D. Add More Text Content:**
Your email is very short and link-heavy. Add more text:

```html
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
  Denne uken har vi samlet spennende motiver som barn elsker å fargelegge.
  Alle bildene er gratis å laste ned og skrive ut så mange ganger du vil.
</p>

<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
  I samlingen finner du:
</p>
<ul style="font-size: 16px; line-height: 1.8; margin-bottom: 20px;">
  <li>Dyr og natur</li>
  <li>Morsomme figurer</li>
  <li>Enkle mønstre for de minste</li>
</ul>
```

### 4. Proper Email Headers

Add these headers to improve deliverability:

```typescript
headers: {
  'List-Unsubscribe': `<${unsubscribeUrl}>`,
  'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  'X-Entity-Ref-ID': campaignId,
  'Precedence': 'bulk',
  'List-ID': `<${campaignId}.tegnogfarge.no>`,
}
```

### 5. Warm Up Your Sending

If this is a new domain/sender:

**Week 1**: Send to 10-20 engaged users
**Week 2**: Send to 30-40 users
**Week 3**: Send to 60-80 users
**Week 4+**: Send to all users

This builds sender reputation gradually.

### 6. Ask Recipients to Whitelist

In your welcome email, add:

```html
<div style="background: #f0f9ff; padding: 16px; border-radius: 8px; margin: 20px 0;">
  <p style="font-size: 14px; color: #1e40af; margin: 0;">
    💡 <strong>Tips:</strong> Legg til noreply@tegnogfarge.no i kontaktlisten din
    for å sikre at våre e-poster havner i innboksen.
  </p>
</div>
```

### 7. Monitor and Test

**Test Your Email:**
1. https://www.mail-tester.com/ - Get spam score
2. Send test to Gmail, Outlook, Yahoo
3. Check spam folder vs inbox placement

**What to Look For:**
- Spam score should be < 3 (lower is better)
- Green checkmarks for SPF, DKIM, DMARC
- No blocklist warnings

**Monitor in Resend:**
- Bounce rate (should be < 2%)
- Complaint rate (should be < 0.1%)
- Open rate (20-30% is good for newsletters)

### 8. Content Guidelines

**✅ DO:**
- Use plain, simple language
- Include physical address (not required for Norway, but helps)
- Make unsubscribe obvious and easy
- Send valuable content
- Be consistent (same day/time each week)
- Personal tone ("Vi", "deg")

**❌ DON'T:**
- ALL CAPS IN SUBJECT
- Multiple exclamation marks!!!
- Words like "FREE", "CLICK HERE", "ACT NOW"
- Too many links (keep to 1-2 main links)
- Attachments (use web links instead)
- Send from gmail.com or personal domains

### 9. Technical Checklist

Before sending bulk emails, verify:

- [ ] Domain verified in Resend (green checkmark)
- [ ] SPF record exists and includes Resend
- [ ] DKIM record exists (from Resend)
- [ ] DMARC record exists
- [ ] Sending from @tegnogfarge.no (not @gmail.com)
- [ ] Plain text version included
- [ ] Proper unsubscribe headers
- [ ] Tested on mail-tester.com (score > 8/10)
- [ ] Tested delivery to Gmail, Outlook, Yahoo

### 10. Emergency Fixes

**If emails still go to spam:**

1. **Check DNS propagation:**
   ```
   https://dnschecker.org/
   ```
   Enter: tegnogfarge.no
   Check TXT records worldwide

2. **Check sender reputation:**
   ```
   https://www.senderscore.org/
   ```
   Score should be > 80

3. **Check if domain is blacklisted:**
   ```
   https://mxtoolbox.com/blacklists.aspx
   ```
   Enter: tegnogfarge.no

4. **Contact Resend support:**
   They can check their logs and help fix issues

## Current Issue: SMTP vs Resend

You have TWO problems:

1. **SMTP to Hotmail**: BLOCKED (error 550 5.7.1)
   - Solution: Don't use SMTP, use Resend

2. **Resend emails**: Going to SPAM
   - Solution: Follow steps above (especially DNS records)

## Quick Win Solution

The fastest way to fix BOTH issues:

1. ✅ Use Resend (fixes blocklist)
2. ✅ Verify domain with ALL DNS records (fixes spam folder)
3. ✅ Add plain text version (improves deliverability)
4. ✅ Remove emoji from subject (reduces spam score)
5. ✅ Add more text content (less spammy)

## What I Can Do Right Now

I can update your email service to:
1. Create better email templates with plain text versions
2. Remove emojis from subjects
3. Add more content to emails
4. Add proper headers
5. Implement Resend properly

Would you like me to do this?
