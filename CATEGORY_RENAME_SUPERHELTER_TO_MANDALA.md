# Category Rename: Superhelter → Mandala

**Date:** November 11, 2025
**Status:** Ready for Implementation
**Google Best Practices:** ✅ Following official recommendations

---

## 📋 URL Mapping

All URLs will automatically redirect with 301 status:

```
OLD → NEW
/superhelter → /mandala
/superhelter/* → /mandala/*
```

**Total affected URLs:** **1 URL** (main category page only)

**Note:** Category currently has no subcategories or drawings, making this a clean migration.

---

## ✅ Completed Technical Setup

### 1. 301 Redirects ✅
- Implemented in `next.config.js`
- Pattern: `/superhelter/:path*` → `/mandala/:path*`
- Status: HTTP 301 Permanent (as per Google recommendations)
- No redirect chains (direct mapping)

### 2. Internal Links ✅
- No hardcoded `/superhelter` links found in codebase
- All category links are dynamically generated from Sanity CMS
- Will automatically update after Sanity changes

### 3. Breadcrumbs ✅
- Dynamically generated from Sanity data
- Will automatically display "Mandala" after category rename

---

## 🎨 Content Strategy: Superhelter → Mandala

### Why This Change Makes Sense

**Old Theme (Superhelter):**
- Action heroes, comic characters
- All copyrighted content removed (Deadpool, Mario, Spiderman, etc.)
- Category left empty with 0 drawings
- SEO description no longer matched available content

**New Theme (Mandala):**
- Meditative, pattern-based geometric art
- Calming, creative, and educational
- Age-appropriate for all skill levels
- No copyright issues
- Growing popularity in children's activities
- Supports mindfulness and concentration skills

---

## 🔧 Required Actions in Sanity CMS

### Step 1: Rename the Category

1. Go to **Sanity Studio**: https://tegnogfarge.sanity.studio
2. Navigate to **Content** → **Categories**
3. Find the category titled **"Superhelter"**
4. Click to edit

### Step 2: Update Category Details

Update these fields:

```yaml
Title: "Mandala"  # Changed from "Superhelter"
Slug: "mandala"   # Changed from "superhelter"
Description: "Velkommen til Mandala, en kreativ kategori full av vakre mønstre og former! Her finner du tegninger med symmetriske design, geometriske mønstre og detaljerte mandalamotiver som både inspirerer til ro og kreativitet. Motivene varierer fra enkle sirkelmønstre for de minste barna til mer komplekse og detaljerte mandalategninger for de eldre barna som ønsker en utfordring. Alle tegningene er helt gratis og kan enten lastes ned som høyoppløselige PDF-er klare for utskrift i A4 eller A3, eller fargelegges direkte i nettleseren. Dette er perfekt for rolige stunder, fokusøvelser i skolen, eller som en avslappende aktivitet hjemme. Gi barna friheten til å eksperimentere med farger og mønstre mens de utvikler finmotorikk og konsentrasjon!"
SEO Title: "Fargelegg mandala – Vakre mønstre og geometriske design for barn. Tegn online eller last ned gratis fargeleggingsark."
SEO Description: "Utforsk vår samling av mandala-tegninger for barn! Fra enkle mønstre til detaljerte design. Fargelegg online eller last ned gratis PDF-er i A4/A3 – perfekt for rolige stunder og kreativ utfoldelse."
```

**⚠️ Important:** When you change the slug, Sanity will warn you about breaking URLs. Click **"Yes, change slug"** - the 301 redirects we set up will handle this.

### Step 3: Publish Changes

1. Click **"Publish"** button
2. Wait for changes to propagate (usually 1-2 minutes)

### Step 4: Verify in Production

**⏱️ Wait 2-3 minutes** after publishing for changes to propagate, then test:

1. Visit https://tegnogfarge.no/mandala (should load the renamed category)
2. Visit https://tegnogfarge.no/superhelter (should **301 redirect** to /mandala)
3. Check breadcrumbs show "Mandala" correctly
4. Verify category appears in navigation with new name

**How to verify it's a 301 redirect:**
- Browser devtools → Network tab → should show "301 Moved Permanently"
- Or use: `curl -I https://tegnogfarge.no/superhelter` (should show HTTP 301)

**Note:** The redirect activates automatically once the old Sanity slug no longer exists. Next.js will detect the 404 and apply the redirect rule.

---

## 📊 Post-Migration Monitoring Checklist

### Week 1 (Daily Checks)

- [ ] **Day 1:** Verify redirect working (test main URL)
- [ ] **Day 2:** Check Google Search Console for crawl errors
- [ ] **Day 3:** Monitor site traffic in analytics
- [ ] **Day 4:** Check for 404 errors in logs
- [ ] **Day 5:** Verify new URL appearing in Google Search Console
- [ ] **Day 6:** Add new mandala subcategories/content
- [ ] **Day 7:** Review first week's analytics data

### Week 2-4 (Weekly Checks)

- [ ] **Week 2:** Submit updated sitemap to Google Search Console
- [ ] **Week 3:** Monitor any ranking changes
- [ ] **Week 4:** Check old URL being deindexed, new URL indexed

### Month 2-3 (Monthly Checks)

- [ ] **Month 2:** Review traffic and indexing status
- [ ] **Month 3:** Analyze SEO impact of new content

### After 12 Months

- [ ] Consider if redirect can be removed (Google recommends keeping 1+ year)
- [ ] Review if any external links still point to old URL

---

## 🎯 Expected Outcomes (Google Guidelines)

### Timeline
- **Week 1-2:** Redirect active, Google discovers new URL
- **Week 2-4:** New URL indexed, old URL marked as redirected
- **Month 1-2:** New content added, category begins ranking
- **Month 2-3:** Fresh start with mandala content

### Normal Effects
✅ **Expected:**
- Minimal SEO impact (category was empty)
- Fresh start for new content strategy
- Old URL gracefully redirects to new theme

⚠️ **Monitor for Issues:**
- 404 errors (indicates broken redirect)
- New URL not appearing in Search Console
- Navigation not updating to "Mandala"

---

## 🔍 Testing the Redirect

### Before Going Live
```bash
# Test locally after deploying
curl -I https://tegnogfarge.no/superhelter
# Should return: HTTP/1.1 301 Moved Permanently
# Location: https://tegnogfarge.no/mandala
```

### Manual Test URLs
After Sanity changes are published, test:

1. https://tegnogfarge.no/superhelter → should redirect to /mandala
2. Any future subcategories will auto-redirect (e.g., /superhelter/noe → /mandala/noe)

---

## 📈 Google Search Console Actions

### After Sanity Update (Within 24 hours)

1. **Submit New Sitemap**
   - Go to Search Console → Sitemaps
   - Your sitemap auto-updates at: https://tegnogfarge.no/sitemap.xml
   - Click "Fetch sitemap" if needed

2. **Request Indexing (Optional)**
   - Go to URL Inspection tool
   - Enter: https://tegnogfarge.no/mandala
   - Click "Request Indexing"

3. **Monitor Coverage Report**
   - Check "Coverage" section weekly
   - Look for decreasing "Excluded" URLs (old /superhelter)
   - Look for increasing "Valid" URLs (new /mandala)

---

## 🚨 Troubleshooting

### Issue: 404 Errors After Rename
**Solution:** Verify Sanity slug changed correctly, check Next.js deployment completed

### Issue: Redirect Not Working
**Solution:** Clear Vercel cache, redeploy if needed

### Issue: Old URL Still in Search Results
**Solution:** Normal! Google can take 2-4 weeks to update their index

### Issue: Navigation Still Shows "Superhelter"
**Solution:** Clear browser cache, verify Sanity publish completed, check if category is cached

---

## 💡 Content Recommendations for Mandala Category

### Suggested Subcategories:
1. **"Enkle Mandalaer"** (Simple Mandalas) - Basic circular patterns for young children
2. **"Geometriske Mønstre"** (Geometric Patterns) - Angular and mathematical designs
3. **"Blomster Mandalaer"** (Flower Mandalas) - Nature-inspired circular designs
4. **"Dyre Mandalaer"** (Animal Mandalas) - Animals integrated into mandala patterns
5. **"Komplekse Mandalaer"** (Complex Mandalas) - Detailed designs for older children

### Age Ranges:
- **3-5 years:** Large, simple patterns with few details
- **6-8 years:** Medium complexity with clear sections
- **9-12 years:** Intricate patterns with fine details

### Educational Benefits to Highlight:
- ✨ Improves concentration and focus
- ✨ Develops fine motor skills
- ✨ Teaches symmetry and patterns
- ✨ Promotes mindfulness and calm
- ✨ Encourages color theory exploration
- ✨ Boosts creativity and self-expression

---

## ✅ Summary

**Technical Setup:** Complete ✅
**301 Redirect:** Active ✅
**Code Updates:** None needed (dynamic) ✅
**User Action Required:** Update category in Sanity CMS
**Timeline:** 2-4 weeks for full Google transition
**Risk Level:** Very Low (empty category, clean slate)
**SEO Impact:** Minimal (no existing content to lose)
**Opportunity:** Fresh start with new, engaging content theme

---

## 📝 Comparison with Yesterday's Migration

| Aspect | Videospill → Feiring | Superhelter → Mandala |
|--------|---------------------|----------------------|
| Affected URLs | 36 URLs | 1 URL |
| Subcategories | 1 subcategory | 0 subcategories |
| Drawings | 34 drawings | 0 drawings |
| SEO Risk | Low-Medium | Very Low |
| Complexity | Medium | Very Simple |
| Content Transition | Keep existing | Build from scratch |

---

**Questions?** All redirects follow Google's official best practices for permanent URL changes. This is one of the simplest possible category migrations! 🎨
