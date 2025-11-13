# Domain & Email Configuration Comparison

**Generated:** 2025-11-12
**Investigation:** Email deliverability analysis for tegnogfarge.no vs golfkart.no

---

## Overview

This document compares the email and DNS configuration across all domains in the Vercel account to understand why golfkart.no emails go to spam while tegnogfarge.no emails do not.

---

## Domain Inventory

| Domain | Nameservers | Status | Project | Age |
|--------|-------------|--------|---------|-----|
| **tegnogfarge.no** | Vercel DNS | ✓ Active | tegnogfarge-w19j | 159 days |
| **golfkart.no** | Vercel DNS | ✓ Active | golf-directory | 9 days |
| **goflkart.no** | Not configured | ⚠️ Not resolving | golf-directory | 9 days |
| **coloringvault.com** | Cloudflare | ✓ Active | mysite | 90 days |

---

## Email Configuration Comparison

### tegnogfarge.no ✅ (Good Deliverability)

#### DNS Records
```
MX:     mail.tegnogfarge.no → 91.189.176.14 (Dedia)
SPF:    v=spf1 a mx ip4:91.189.176.14 ~all
DKIM:   default._domainkey (Dedia key)
DMARC:  v=DMARC1; p=quarantine; pct=10; rua=mailto:rapporter@tegnogfarge.no;
```

#### Resend Configuration (send subdomain)
```
Subdomain:  send.tegnogfarge.no
MX:         10 feedback-smtp.us-east-1.amazonses.com
SPF:        v=spf1 include:amazonses.com ~all
DKIM:       resend._domainkey (Resend key via Amazon SES)
```

#### Application Configuration
```
RESEND_API_KEY:   Configured
EMAIL_FROM:       noreply@tegnogfarge.no ⚠️
EMAIL_FROM_NAME:  Tegnogfarge.no
Email Service:    Resend API
```

**⚠️ Issue Found:** Application sends from `noreply@tegnogfarge.no` but should use `noreply@send.tegnogfarge.no` for proper DKIM alignment with Resend.

#### Domain Reputation
- **Age:** 159 days (established)
- **Email Reputation:** Built up over 5+ months
- **Result:** Emails deliver to inbox

---

### golfkart.no ⚠️ (Spam Issues)

#### DNS Records (BEFORE fixes)
```
MX:     mail.golfkart.no → 91.189.176.14 (Dedia)
SPF:    v=spf1 +a +mx +ip4:91.189.176.14 ~all
DKIM:   default._domainkey (Dedia key - different from tegnogfarge.no)
DMARC:  v=DMARC1; p=none;  ❌ NO ENFORCEMENT
```

#### DNS Records (AFTER fixes - 2025-11-12)
```
MX:     mail.golfkart.no → 91.189.176.14 (Dedia)
SPF:    v=spf1 +a +mx +ip4:91.189.176.14 ~all
DKIM:   default._domainkey (Dedia key)
DMARC:  v=DMARC1; p=quarantine; pct=10; rua=mailto:rapporter@golfkart.no; ✓ UPDATED
```

#### Resend Configuration
```
Status: NOT CONFIGURED
No send subdomain
No Resend DKIM records
```

#### Application Configuration
```
RESEND_API_KEY:   Not configured for golf-directory project
EMAIL_FROM:       Not configured
Email Service:    None (no email sending from this application)
```

#### Domain Reputation
- **Age:** 9 days (brand new) ❌
- **Email Reputation:** None
- **Result:** Emails go to spam

---

## Root Cause Analysis: Why golfkart.no Goes to Spam

### 1. 🆕 **Domain Age (Primary Factor)**
- **tegnogfarge.no:** 159 days old - established reputation
- **golfkart.no:** 9 days old - no reputation
- **Impact:** Email providers don't trust new domains
- **Solution:** Time (30-60 days minimum) + consistent legitimate sending

### 2. ❌ **Weak DMARC Policy (Fixed)**
- **Before:** `p=none` - no enforcement, signals lack of email security
- **After:** `p=quarantine; pct=10` - matches tegnogfarge.no
- **Impact:** Shows email providers you take authentication seriously

### 3. ❌ **No DMARC Reporting (Fixed)**
- **Before:** No reporting configured
- **After:** Reports to `rapporter@golfkart.no`
- **Action Required:** Create `rapporter@golfkart.no` email address in Dedia

### 4. ℹ️ **Different DKIM Keys**
- Each domain has its own DKIM key from Dedia (expected behavior)
- Both are valid, but different public keys

---

## Email Sending Infrastructure

### Current Setup

**tegnogfarge.no Application:**
- Uses Resend API for sending
- Configured with API key
- Has dedicated `send.tegnogfarge.no` subdomain for Resend
- ⚠️ Issue: Sends from `@tegnogfarge.no` instead of `@send.tegnogfarge.no`

**golfkart.no Application:**
- Does not send emails programmatically
- No Resend configuration
- Uses Dedia mail server only

**Dedia Mail Server (91.189.176.14):**
- Handles incoming mail for both domains
- Configured as MX record for both
- Used for `rapporter@` DMARC reporting addresses

---

## Recommendations

### Immediate Actions

1. ✅ **COMPLETED:** Update golfkart.no DMARC policy to match tegnogfarge.no
2. ⏳ **PENDING:** Create `rapporter@golfkart.no` email address in Dedia control panel
3. ⚠️ **RECOMMENDED:** Fix tegnogfarge.no email FROM address

### tegnogfarge.no Email Fix

**Current (incorrect):**
```
EMAIL_FROM=noreply@tegnogfarge.no
```

**Should be:**
```
EMAIL_FROM=noreply@send.tegnogfarge.no
```

**Why:** Resend sends via Amazon SES, but `@tegnogfarge.no` DNS points to Dedia. This creates SPF/DKIM misalignment and can cause spam issues.

**To fix:**
```bash
vercel env rm EMAIL_FROM production
vercel env add EMAIL_FROM production
# Enter value: noreply@send.tegnogfarge.no
```

### Optional: Configure Resend for golfkart.no

If you plan to send emails from the golf-directory application:

1. Add Resend API key to environment variables
2. Configure `send.golfkart.no` subdomain:
   ```bash
   # Get DKIM key from Resend dashboard
   vercel dns add golfkart.no 'resend._domainkey' TXT 'p=<RESEND_DKIM_KEY>'

   # Add send subdomain MX
   vercel dns add golfkart.no 'send' MX '10 feedback-smtp.us-east-1.amazonses.com.'

   # Add send subdomain SPF
   vercel dns add golfkart.no 'send' TXT 'v=spf1 include:amazonses.com ~all'
   ```
3. Set environment variables:
   ```
   RESEND_API_KEY=<key>
   EMAIL_FROM=noreply@send.golfkart.no
   EMAIL_FROM_NAME=Golfkart.no
   ```

### Long-term: Domain Reputation Building

For golfkart.no to achieve inbox delivery:

1. **Time:** Minimum 30-60 days of consistent sending
2. **Volume:** Start low, gradually increase (email "warm-up")
3. **Quality:**
   - Low bounce rates (<2%)
   - Low complaint rates (<0.1%)
   - High engagement (opens, clicks)
4. **Authentication:** Keep all records (SPF, DKIM, DMARC) properly configured
5. **Monitoring:** Check DMARC reports at `rapporter@golfkart.no`

---

## DNS Record Reference

### Complete tegnogfarge.no Email Records

```
# Main domain - Dedia
MX      @                   10 mail.tegnogfarge.no.
A       mail                91.189.176.14
TXT     @                   v=spf1 a mx ip4:91.189.176.14 ~all
TXT     default._domainkey  v=DKIM1; k=rsa; p=<DEDIA_KEY>
TXT     _dmarc              v=DMARC1; p=quarantine; pct=10; rua=mailto:rapporter@tegnogfarge.no;

# Send subdomain - Resend
MX      send                10 feedback-smtp.us-east-1.amazonses.com.
TXT     send                v=spf1 include:amazonses.com ~all
TXT     resend._domainkey   p=<RESEND_KEY>
```

### Complete golfkart.no Email Records (After Update)

```
# Main domain - Dedia only
MX      @                   10 mail.golfkart.no.
A       mail                91.189.176.14
TXT     @                   v=spf1 +a +mx +ip4:91.189.176.14 ~all
TXT     default._domainkey  v=DKIM1; k=rsa; p=<DEDIA_KEY>
TXT     _dmarc              v=DMARC1; p=quarantine; pct=10; rua=mailto:rapporter@golfkart.no;

# No send subdomain configured
```

---

## Verification Commands

```bash
# Check nameservers
nslookup -type=NS tegnogfarge.no
nslookup -type=NS golfkart.no

# Check MX records
nslookup -type=MX tegnogfarge.no
nslookup -type=MX golfkart.no

# Check SPF
nslookup -type=TXT tegnogfarge.no | grep spf
nslookup -type=TXT golfkart.no | grep spf

# Check DKIM (Dedia)
nslookup -type=TXT default._domainkey.tegnogfarge.no
nslookup -type=TXT default._domainkey.golfkart.no

# Check DKIM (Resend)
nslookup -type=TXT resend._domainkey.tegnogfarge.no
nslookup -type=TXT resend._domainkey.golfkart.no

# Check DMARC
nslookup -type=TXT _dmarc.tegnogfarge.no
nslookup -type=TXT _dmarc.golfkart.no

# Check send subdomain
nslookup -type=MX send.tegnogfarge.no
nslookup -type=TXT send.tegnogfarge.no
```

---

## Summary

| Factor | tegnogfarge.no | golfkart.no (before) | golfkart.no (after) |
|--------|----------------|---------------------|---------------------|
| **Domain Age** | 159 days ✓ | 9 days ❌ | 9 days ❌ |
| **DMARC Policy** | p=quarantine ✓ | p=none ❌ | p=quarantine ✓ |
| **DMARC Reporting** | rapporter@ ✓ | None ❌ | rapporter@ ✓ |
| **Resend Setup** | Configured ✓ | None - | None - |
| **Email Reputation** | Established ✓ | None ❌ | Building... ⏳ |
| **Deliverability** | Inbox ✓ | Spam ❌ | Improving... ⏳ |

**Key Takeaway:** The primary issue with golfkart.no is domain age. DMARC improvements will help, but the domain needs 30-60 days of consistent, legitimate email sending to build reputation with email providers.
