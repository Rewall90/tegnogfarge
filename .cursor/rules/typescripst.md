# Google Indexing Fix: WWW/Non-WWW Issue Resolution Guide

## **🔍 STEP 1: Diagnose the Current Situation (Today)**

### **Check if Google still has www versions indexed:**
1. **Go to Google.com**
2. **Search for**: `site:www.tegnogfarge.no`
3. **Search for**: `site:tegnogfarge.no`
4. **Compare results** - if you see www results, that's the problem!

### **Check your Search Console:**
1. **Open Google Search Console**
2. **Look for both properties**:
   - `https://www.tegnogfarge.no`
   - `https://tegnogfarge.no`
3. **Note which one has more indexed pages**

---

## **🛠️ STEP 2: Clean Up Google's Index (Day 1-2)**

### **If you have www pages in Google's index:**

**A. In Google Search Console:**
1. **Go to your www.tegnogfarge.no property** (if it exists)
2. **Navigate to**: Indexing → Removals
3. **Click "New request"**
4. **Select "Remove URL"**
5. **Enter**: `https://www.tegnogfarge.no/`
6. **Click "Submit"**
7. **Repeat for major pages**:
   - `https://www.tegnogfarge.no/hoved-kategori`
   - `https://www.tegnogfarge.no/alle-underkategorier`
   - Any other important www URLs you found

**B. Submit preferred domain:**
1. **In your main property** (tegnogfarge.no)
2. **Go to Settings → Crawl → Preferred domain**
3. **Select**: "Don't set a preferred domain" (since you're using redirects)

---

## **🎯 STEP 3: Strengthen Your Canonical Signals (Day 2-3)**

### **Force Google to recognize your preference:**

1. **Test your redirects**:
   - Visit: `https://www.tegnogfarge.no/`
   - **Confirm it redirects to**: `https://tegnogfarge.no/`
   - **Check redirect status**: Should be 301 (permanent)

2. **Check a few random pages**:
   - `https://www.tegnogfarge.no/hoved-kategori`
   - `https://www.tegnogfarge.no/natur`
   - Confirm they all redirect properly

---

## **📋 STEP 4: Resubmit Clean Sitemaps (Day 3-4)**

### **Clean up your sitemaps:**
1. **In Search Console**: Go to Sitemaps
2. **Check your current sitemaps**:
   - `https://tegnogfarge.no/sitemap.xml`
   - `https://tegnogfarge.no/pages-sitemap.xml`
   - `https://tegnogfarge.no/image-sitemap.xml`
3. **Verify they only contain non-www URLs**
4. **If they contain www URLs**: Remove and resubmit
5. **Click "Submit" for each sitemap**

---

## **🔄 STEP 5: Request Re-indexing (Day 4-5)**

### **Tell Google about your preferred pages:**
1. **In Search Console**: Go to URL Inspection
2. **Test your most important pages**:
   - `https://tegnogfarge.no/`
   - `https://tegnogfarge.no/hoved-kategori`
   - `https://tegnogfarge.no/alle-underkategorier`
3. **For each page**: Click "Request Indexing"
4. **Repeat for 10-20 of your most important pages**

---

## **📊 STEP 6: Monitor and Verify (Week 1-2)**

### **Daily monitoring:**
1. **Check Search Console daily**:
   - Index Coverage report
   - Look for reduction in "Discovered - currently not indexed"
   - Monitor for new indexing activity

2. **Weekly verification**:
   - Search: `site:www.tegnogfarge.no` (should show fewer results)
   - Search: `site:tegnogfarge.no` (should show more results)
   - Check your indexing chart for improvements

---

## **🚨 STEP 7: Escalate if Needed (Week 2-3)**

### **If no improvement after 2 weeks:**
1. **Submit a reconsideration request** in Search Console
2. **Explain the www/non-www consolidation** in the request
3. **Provide evidence** of your 301 redirects
4. **Request priority indexing** for your clean URLs

---

## **📈 STEP 8: Long-term Monitoring (Month 1-2)**

### **Monthly checks:**
1. **Monitor indexing progress**
2. **Track improvement in "Discovered - currently not indexed"**
3. **Verify no new www URLs appear**
4. **Check that new pages index faster**

---

## **⚡ Quick Start Checklist:**

**Today:**
- [ ] Search `site:www.tegnogfarge.no` and `site:tegnogfarge.no`
- [ ] Check both properties in Search Console

**Tomorrow:**
- [ ] Submit removal requests for www URLs
- [ ] Verify redirects are working
- [ ] Test URL inspection tool

**This Week:**
- [ ] Resubmit clean sitemaps
- [ ] Request indexing for top 20 pages
- [ ] Monitor daily progress

---

## **🔧 Technical Background:**

### **Why This Issue Occurred:**
- Google initially discovered both www and non-www versions
- Duplicate content confused Google's algorithm
- Crawl budget was split between both versions
- Authority signals were diluted

### **How the Fix Works:**
- 301 redirects consolidate authority to one version
- Canonical tags reinforce the preferred version
- Removal requests clean up Google's index
- Fresh sitemaps guide Google to correct URLs

### **Expected Timeline:**
- **Week 1-2**: Index cleanup begins
- **Week 3-4**: Indexing should accelerate
- **Month 2-3**: Full recovery and normal indexing pace

---

## **📝 Progress Tracking:**

### **Week 1 Results:**
- Date: ___________
- WWW pages in Google: ___________
- Non-WWW pages in Google: ___________
- Removal requests submitted: ___________
- Notes: ___________

### **Week 2 Results:**
- Date: ___________
- WWW pages in Google: ___________
- Non-WWW pages in Google: ___________
- New pages indexed: ___________
- Notes: ___________

### **Week 3 Results:**
- Date: ___________
- WWW pages in Google: ___________
- Non-WWW pages in Google: ___________
- "Discovered - not indexed" count: ___________
- Notes: ___________

---

## **🆘 Troubleshooting:**

### **If redirects aren't working:**
1. Check middleware.ts configuration
2. Verify production environment settings
3. Test with multiple browsers
4. Check for caching issues

### **If removals are rejected:**
1. Verify you own both properties
2. Check that redirects are active
3. Resubmit with explanation
4. Contact Google Search Console support

### **If indexing doesn't improve:**
1. Check for other technical issues
2. Verify content quality
3. Consider manual indexing requests
4. Review crawl budget allocation
