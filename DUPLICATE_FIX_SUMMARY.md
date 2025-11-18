# Duplicate URL Fix - Complete Summary

## Original Problem

Google Search Console reported: **"Duplicate, Google chose different canonical than user"**

Affected URLs were primarily in:
- `/feiring/fargelegge-vennskap/`
- `/hoytider/fargelegge-julenissen/`

## Root Cause Analysis

The investigation revealed **3 main problems**:

### Problem 1: Same-URL Duplicates (CRITICAL ✅ FIXED)
- **74 drawings** had multiple active documents with identical URLs
- **21 were drafts** with same URL as published versions
- **53 were duplicate published versions** created at different times
- Caused sitemap to include same URL multiple times
- **Direct cause** of the Google canonical error

### Problem 2: Different-Category Duplicates (NOT A PROBLEM ✅ VERIFIED)
- **2 drawings** with same slug in different categories
- These have **different URLs** (different category/subcategory paths)
- Not causing Google errors - these are intentional content placements
- Example: "Isbjørn står på isen" appears in both "Winter" and "Bears" categories

### Problem 3: Broken Hreflang Matching (MINOR ✅ FIXED)
- Sitemap was matching NO/SV versions by `_id` (always failed - 0% match rate)
- Norwegian and Swedish drawings are separate documents, not translations
- Fixed by matching on full URL path (category + subcategory + slug)
- **Only 2 drawings** (0.06%) have Swedish translations with matching paths
- Most content is language-specific, not translated

## Fixes Implemented

### 1. Deleted 21 Draft Duplicates ✅
**Script:** `delete-draft-duplicates.js`

Removed draft versions that had same URL as published versions:
- `drafts.drawingImage-bamse-husker-med-bokstaven-u-1750912951`
- `drafts.drawingImage-flagget-til-aland-1763395444`
- ... (19 more)

**Impact:** Removed 21 duplicate URLs from sitemap

### 2. Renamed 64 Duplicate Pages ✅
**Scripts:**
- `fix-same-url-duplicates.js` (55 duplicates)
- `fix-remaining-8-duplicates.js` (9 duplicates)

Strategy:
- Keep newest version with original slug
- Rename older versions with `-2`, `-3` suffixes

Examples:
- `barn-kledd-ut-til-halloween` → kept
- `barn-kledd-ut-til-halloween-2` → renamed (older version)
- `barn-lager-snomann-sammen` → kept
- `barn-lager-snomann-sammen-2` → renamed
- `barn-lager-snomann-sammen-3` → renamed

**Impact:** Changed 64 duplicate URLs to unique URLs

### 3. Fixed Hreflang Matching ✅
**File:** `src/app/pages-sitemap.xml/route.ts`

**Before (line 266-267):**
```typescript
const svDrawing = swedishData.drawings?.find(
  (sv: SitemapDrawing) => sv._id === noDrawing._id
);
```

**After (line 266-271):**
```typescript
const svDrawing = swedishData.drawings?.find(
  (sv: SitemapDrawing) =>
    sv.slug === noDrawing.slug &&
    sv.subcategorySlug === noDrawing.subcategorySlug &&
    sv.parentCategorySlug === noDrawing.parentCategorySlug
);
```

Also updated categories (line 192-194) and subcategories (line 229-233) matching logic.

**Impact:**
- Correctly matches 2 bilingual drawing pairs
- Prevents incorrect hreflang links
- Improves international SEO

## Final Results

### Sitemap Status
```
Total Norwegian drawings: 3,277
Unique URLs: 3,277 (100%)
Duplicate URLs: 0 ✅
```

### Before vs After

| Metric | Before | After |
|--------|--------|-------|
| Same-URL duplicates | 74 | 0 ✅ |
| Draft duplicates | 21 | 0 ✅ |
| Sitemap uniqueness | ~97.7% | 100% ✅ |
| Hreflang match rate (by _id) | 0% | N/A |
| Hreflang match rate (by path) | N/A | 0.06% (2 matches) ✅ |

## Files Created/Modified

### Scripts Created:
1. `investigate-duplicate-issue.js` - Initial investigation
2. `investigate-duplicates-deeper.js` - Deep analysis
3. `analyze-same-language-duplicates.js` - Categorized duplicates
4. `delete-draft-duplicates.js` - Deleted 21 drafts
5. `deactivate-older-duplicates.js` - Initially deactivated (later reversed)
6. `reactivate-deactivated-pages.js` - Reversed incorrect deactivations
7. `fix-same-url-duplicates.js` - Renamed 55 duplicates
8. `fix-remaining-8-duplicates.js` - Renamed 9 remaining duplicates
9. `verify-sitemap-duplicates.js` - Verified no duplicates
10. `check-hreflang-matching.js` - Analyzed hreflang matching
11. `verify-hreflang-fix.js` - Verified hreflang fix

### Reports Generated:
1. `duplicate-analysis-report.json` - Complete duplicate analysis
2. `redirects-for-duplicates.json` - Redirect rules (not needed)
3. `DRAFT_DELETION_INSTRUCTIONS.md` - Manual deletion instructions

### Code Modified:
1. `src/app/pages-sitemap.xml/route.ts` - Fixed hreflang matching logic

## Google Search Console Impact

### Expected Results:
1. **Sitemap will regenerate** with 100% unique URLs on next access
2. **Duplicate canonical errors will resolve** over 1-2 weeks as Google re-crawls
3. **Bilingual SEO improved** with correct hreflang links (though limited translations)
4. **No redirects needed** - renamed pages were never indexed

### Action Required:
1. ✅ Fixes are complete and applied
2. 🔄 **Resubmit sitemap** to Google Search Console:
   - Go to: https://search.google.com/search-console
   - Navigate to: Sitemaps
   - Submit: `https://tegnogfarge.no/sitemap.xml`
3. ⏳ **Wait 1-2 weeks** for Google to re-crawl
4. ✅ **Verify errors resolved** in Search Console

## Lessons Learned

1. **Duplicate content creation:** Multiple drawings were created with same slug in same category
   - Likely caused by content generation workflow
   - Consider adding uniqueness validation in Sanity Studio

2. **Draft management:** 21 drafts were left unpublished
   - Consider periodic cleanup of old drafts
   - Or automatic draft expiration

3. **Translation workflow:** NO/SV content is mostly independent, not translated
   - Hreflang is less critical than initially thought
   - Only 2 true translation pairs exist

4. **Different-category duplicates:** Intentional and valuable
   - Same drawing in multiple relevant categories
   - Not causing SEO issues (different URLs)
   - Keep as-is

## Maintenance Recommendations

### Prevent Future Duplicates:
1. **Add slug uniqueness validation** in Sanity Studio schema
2. **Implement draft cleanup** workflow (monthly review)
3. **Monitor sitemap uniqueness** with `verify-sitemap-duplicates.js`

### Monitor SEO:
1. **Check Google Search Console** monthly for duplicate warnings
2. **Review sitemap** after bulk content additions
3. **Track hreflang coverage** if translation strategy changes

---

**Fix Completed:** 2025-11-18
**Google Canonical Errors:** Expected to resolve within 1-2 weeks
**Status:** ✅ All critical issues resolved
