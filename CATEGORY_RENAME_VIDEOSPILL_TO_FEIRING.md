# Category Rename: Videospill → Feiring

**Date:** November 10, 2025
**Status:** Ready for Implementation
**Google Best Practices:** ✅ Following official recommendations

---

## 📋 URL Mapping

All URLs will automatically redirect with 301 status:

```
OLD → NEW
/videospill → /feiring
/videospill/fargelegge-vennskap → /feiring/fargelegge-vennskap
/videospill/fargelegge-vennskap/* → /feiring/fargelegge-vennskap/*
```

**Total affected URLs:** 1 category + 1 subcategory + 34 individual pages = **36 redirects**

---

## ✅ Completed Technical Setup

### 1. 301 Redirects ✅
- Implemented in `next.config.js`
- Pattern: `/videospill/:path*` → `/feiring/:path*`
- Status: HTTP 301 Permanent (as per Google recommendations)
- No redirect chains (direct mapping)

### 2. Internal Links ✅
- No hardcoded `/videospill` links found in codebase
- All category links are dynamically generated from Sanity CMS
- Will automatically update after Sanity changes

### 3. Breadcrumbs ✅
- Dynamically generated from Sanity data
- Will automatically display "Feiring" after category rename

---

## 🔧 Required Actions in Sanity CMS

### Step 1: Rename the Category

1. Go to **Sanity Studio**: https://tegnogfarge.sanity.studio
2. Navigate to **Content** → **Categories**
3. Find the category titled **"Videospill"**
4. Click to edit

### Step 2: Update Category Details

Update these fields:

```yaml
Title: "Feiring"  # Changed from "Videospill"
Slug: "feiring"   # Changed from "videospill"
Description: Update to match "Feiring" theme
```

**⚠️ Important:** When you change the slug, Sanity will warn you about breaking URLs. Click **"Yes, change slug"** - the 301 redirects we set up will handle this.

### Step 3: Publish Changes

1. Click **"Publish"** button
2. Wait for changes to propagate (usually 1-2 minutes)

### Step 4: Verify in Production

1. Visit https://tegnogfarge.no/feiring (should load correctly)
2. Visit https://tegnogfarge.no/videospill (should redirect to /feiring)
3. Check breadcrumbs show "Feiring" correctly

---

## 📊 Post-Migration Monitoring Checklist

### Week 1 (Daily Checks)

- [ ] **Day 1:** Verify all redirects working (test 5-10 URLs)
- [ ] **Day 2:** Check Google Search Console for crawl errors
- [ ] **Day 3:** Monitor site traffic in analytics
- [ ] **Day 4:** Check for 404 errors in logs
- [ ] **Day 5:** Verify new URLs appearing in Google Search Console
- [ ] **Day 6:** Check internal search queries
- [ ] **Day 7:** Review first week's analytics data

### Week 2-4 (Weekly Checks)

- [ ] **Week 2:** Submit updated sitemap to Google Search Console
- [ ] **Week 3:** Monitor ranking changes for affected pages
- [ ] **Week 4:** Check old URLs being deindexed, new URLs indexed

### Month 2-3 (Monthly Checks)

- [ ] **Month 2:** Review traffic recovery/growth
- [ ] **Month 3:** Analyze full SEO impact

### After 12 Months

- [ ] Consider if redirects can be removed (Google recommends keeping 1+ year)
- [ ] Review if any external links still point to old URLs

---

## 🎯 Expected Outcomes (Google Guidelines)

### Timeline
- **Week 1-2:** Redirects active, Google begins discovering new URLs
- **Week 2-4:** New URLs indexed, old URLs marked as redirected
- **Month 1-2:** Ranking signals fully transferred
- **Month 2-3:** Traffic normalized to pre-migration levels

### Normal Effects
✅ **Expected:**
- Temporary ranking fluctuation (1-3 weeks)
- Gradual traffic shift from old to new URLs
- Some external links still pointing to old URLs

⚠️ **Monitor for Issues:**
- Increased 404 errors (indicates broken redirects)
- Significant traffic drop beyond week 3
- New URLs not appearing in Search Console

---

## 🔍 Testing the Redirects

### Before Going Live
```bash
# Test locally after deploying
curl -I https://tegnogfarge.no/videospill
# Should return: HTTP/1.1 301 Moved Permanently
# Location: https://tegnogfarge.no/feiring
```

### Manual Test URLs
After Sanity changes are published, test these:

1. https://tegnogfarge.no/videospill → should redirect to /feiring
2. https://tegnogfarge.no/videospill/fargelegge-vennskap → should redirect to /feiring/fargelegge-vennskap
3. https://tegnogfarge.no/videospill/fargelegge-vennskap/barn-koser-med-glad-hund → should redirect to /feiring/fargelegge-vennskap/barn-koser-med-glad-hund

---

## 📈 Google Search Console Actions

### After Sanity Update (Within 24 hours)

1. **Submit New Sitemap**
   - Go to Search Console → Sitemaps
   - Your sitemap auto-updates at: https://tegnogfarge.no/sitemap.xml
   - Click "Fetch sitemap" if needed

2. **Request Indexing (Optional)**
   - Go to URL Inspection tool
   - Enter: https://tegnogfarge.no/feiring
   - Click "Request Indexing"

3. **Monitor Coverage Report**
   - Check "Coverage" section weekly
   - Look for decreasing "Excluded" URLs (old /videospill)
   - Look for increasing "Valid" URLs (new /feiring)

---

## 🚨 Troubleshooting

### Issue: 404 Errors After Rename
**Solution:** Verify Sanity slug changed correctly, check Next.js deployment completed

### Issue: Redirects Not Working
**Solution:** Clear Vercel cache, redeploy if needed

### Issue: Old URLs Still Ranking After 4 Weeks
**Solution:** Normal! Google can take 2-4 weeks to fully transition

### Issue: Traffic Drop > 20%
**Solution:** Check Search Console for crawl errors, verify all redirects working

---

## 💡 Why "Feiring" Makes Sense

The current content under "Videospill" is about:
- **Vennskap (Friendship)** - 34 pages
- Children helping each other, sharing, playing together
- Social skills and cooperation

This content fits better under "Feiring" (Celebration) as:
- Friendship is worth celebrating
- Social activities and bonding
- Positive, joyful themes

---

## ✅ Summary

**Technical Setup:** Complete ✅
**301 Redirects:** Active ✅
**Code Updates:** None needed (dynamic) ✅
**User Action Required:** Update category in Sanity CMS
**Timeline:** 2-4 weeks for full Google transition
**Risk Level:** Low (proper redirects in place)

---

**Questions?** All redirects follow Google's official best practices for permanent URL changes.
