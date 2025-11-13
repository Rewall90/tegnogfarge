# Multi-Language Implementation Roadmap
**Goal:** Achieve supercoloring.com's internationalization standard

---

## ✅ PHASE 1: Sanity CMS Setup (CURRENT)
**Timeline:** Week 1
**Status:** 75% Complete

### Completed Tasks
- ✅ Installed @sanity/document-internationalization plugin
- ✅ Configured plugin in sanity.config.ts for Norwegian (no) and Swedish (sv)
- ✅ Added language field to drawingImage, category, subcategory schemas
- ✅ Updated slugify function to support Swedish characters (ä, ö)

### Remaining Tasks
- 🔄 **CRITICAL:** Run migration script to set `language='no'` on all existing documents
- ⏳ Verify in Sanity Studio that all documents show language field
- ⏳ Test creating a Swedish translation in Studio

**Deliverable:** All existing content is language-aware and ready for translation

---

## 📋 PHASE 2: Next.js Routing Structure
**Timeline:** Week 1-2
**Status:** 0% Complete

### Tasks
1. **Install and configure next-intl**
   - Already installed (v4.5.2)
   - Create `i18n.ts` config file
   - Configure locales: ['no', 'sv']
   - Set default locale: 'no'

2. **Create middleware for locale detection**
   - Create `middleware.ts` at project root
   - Configure locale detection (manual selection only, no auto-detect)
   - Set up locale prefix routing

3. **Restructure app directory**
   ```
   app/
   ├── [locale]/
   │   ├── layout.tsx              # Root layout with locale
   │   ├── page.tsx                # Home page
   │   ├── [categorySlug]/
   │   │   ├── page.tsx            # Category page
   │   │   └── [subcategorySlug]/
   │   │       ├── page.tsx        # Subcategory page
   │   │       └── [drawingSlug]/
   │   │           └── page.tsx    # Drawing page
   ```

4. **Update all page components**
   - Add locale param to all page functions
   - Update Sanity queries to filter by language
   - Update all internal links to include locale prefix

5. **Create locale-aware data fetching utilities**
   - Helper functions to fetch content by locale
   - Fallback logic if translation doesn't exist

**Key Technical Details:**
- URLs will be: `tegnogfarge.no/no/...` and `tegnogfarge.no/sv/...`
- All slugs are fully translated (not just prefix)
- Example: `/no/jul/farglegg-nisse` vs `/sv/jul/farglaegg-tomte`

**Deliverable:** Complete URL routing structure supporting both languages

---

## 🔍 PHASE 3: SEO Implementation
**Timeline:** Week 2
**Status:** 0% Complete

### Tasks
1. **Add hreflang tags to all pages**
   - Add to `<head>` on every page
   - Include all language versions + x-default
   - Example:
   ```html
   <link rel="alternate" hreflang="no" href="https://tegnogfarge.no/no/jul/farglegg-nisse" />
   <link rel="alternate" hreflang="sv" href="https://tegnogfarge.no/sv/jul/farglaegg-tomte" />
   <link rel="alternate" hreflang="x-default" href="https://tegnogfarge.no/no/jul/farglegg-nisse" />
   ```

2. **Create translated metadata**
   - Separate metadata for each language
   - Use next-intl for translations
   - Update all meta titles and descriptions
   - Implement Open Graph tags per language

3. **Add JSON-LD structured data**
   - Add breadcrumb schema with translated paths
   - Add ImageObject schema for drawings
   - Ensure all structured data respects language

4. **Create sitemap.xml with language support**
   - Generate separate entries for each language version
   - Include hreflang annotations in sitemap

**Deliverable:** Complete SEO structure matching supercoloring.com standard

---

## 🤖 PHASE 4: Translation Workflow
**Timeline:** Week 2-3
**Status:** 0% Complete

### Tasks
1. **Identify top 50 drawings**
   - Use analytics to determine most popular
   - Create priority list

2. **Create AI translation script**
   - Use OpenAI/Claude API for translations
   - Translate title, description, metaDescription, contextContent
   - Generate Swedish-appropriate slugs

3. **Translate taxonomy (Categories & Subcategories)**
   - Translate all active categories
   - Translate all subcategories under those categories
   - Ensure Swedish slugs follow same structure

4. **Create Swedish content in Sanity**
   - Use Sanity API to create translation documents
   - Link translations using i18n plugin's structure
   - Verify translation metadata documents

5. **Manual review process**
   - Review AI translations for accuracy
   - Adjust Swedish-specific terminology
   - Ensure cultural appropriateness

**Key Considerations:**
- Swedish uses different terminology for some concepts
- Some category names may need cultural adaptation
- Slugs should be natural Swedish, not direct translations

**Deliverable:** 50 fully translated drawings with complete taxonomy in Swedish

---

## 🎨 PHASE 5: UI Components & User Experience
**Timeline:** Week 3
**Status:** 0% Complete

### Tasks
1. **Create language switcher component**
   - Flag icons for Norway 🇳🇴 and Sweden 🇸🇪
   - Dropdown or toggle design
   - Place in header/navigation
   - Persist language preference in cookie

2. **Update navigation components**
   - Make all links language-aware using next-intl
   - Update breadcrumbs with translated paths
   - Ensure smooth navigation between languages

3. **Add language indicators**
   - Show current language in UI
   - Add visual feedback when switching

4. **Update footer and static pages**
   - Translate all UI text (buttons, labels, etc.)
   - Update footer links per language
   - Translate privacy policy, terms, about pages

5. **Handle missing translations gracefully**
   - Show fallback to Norwegian if Swedish doesn't exist
   - Add "Translation unavailable" notice
   - Don't break page if translation is missing

**Deliverable:** Complete user interface supporting seamless language switching

---

## ✅ PHASE 6: Testing, Validation & Launch
**Timeline:** Week 3-4
**Status:** 0% Complete

### Tasks
1. **Functional Testing**
   - Test all Norwegian routes still work (no regression)
   - Test all Swedish routes load correctly
   - Verify language switcher works on all pages
   - Test fallback behavior for missing translations

2. **SEO Validation**
   - Verify hreflang tags on all pages
   - Check sitemaps are generated correctly
   - Submit sitemaps to Google Search Console
   - Monitor for indexing errors

3. **Performance Testing**
   - Verify no performance degradation
   - Check bundle sizes haven't increased significantly
   - Test loading times for both languages

4. **Cross-browser Testing**
   - Test on Chrome, Firefox, Safari, Edge
   - Test on mobile devices
   - Verify cookie persistence works

5. **Analytics Setup**
   - Configure analytics to track language usage
   - Set up conversion tracking per language
   - Monitor user behavior across languages

6. **Staged Rollout**
   - Deploy to staging environment first
   - Test with limited users
   - Fix any critical issues
   - Deploy to production
   - Monitor error logs closely

7. **Google Search Console Monitoring**
   - Submit both language versions
   - Monitor for hreflang errors
   - Watch indexing status for Swedish pages
   - Track rankings in Swedish market

**Deliverable:** Production-ready multi-language site with monitoring in place

---

## 📊 Success Metrics

### Technical Metrics
- Zero hreflang errors in Google Search Console
- All Swedish pages indexed within 2 weeks
- No increase in page load time (< 100ms difference)
- Zero critical bugs in first week

### Business Metrics
- Swedish organic traffic growth within 30 days
- Swedish rankings for target keywords within 60 days
- User engagement metrics comparable between languages
- Conversion rates similar across languages

### Monitoring
- Weekly review of Google Search Console data
- Bi-weekly ranking checks for Swedish keywords
- Monthly traffic analysis by language
- Quarterly review of translation quality

---

## 🚨 Critical Success Factors

1. **Migration Script MUST Run First**
   - Without language='no' on existing docs, nothing works
   - This is the blocker for everything else

2. **URL Structure Must Match supercoloring.com**
   - Full path translation, not just prefix
   - Consistent slug patterns across languages

3. **Hreflang Tags Must Be Perfect**
   - Wrong implementation = SEO disaster
   - Every page needs all variants linked

4. **No Auto-Detection**
   - Manual language selection only
   - Respect user preference via cookie

5. **Quality Over Speed**
   - Better to launch with 50 perfect translations
   - Than 500 poor-quality ones

---

## Next Immediate Steps

1. ✅ Complete Phase 1 by running migration script
2. ⏳ Verify migration in Sanity Studio
3. ⏳ Begin Phase 2: Next.js routing configuration

**Current Blocker:** Migration script needs to run to complete Phase 1
