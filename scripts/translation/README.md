# Translation Script Documentation

Automated Norwegian → Swedish translation using OpenAI GPT-4 and Sanity CMS.

## 📋 Overview

This script translates content for the tegnogfarge.no coloring pages website:
- **~12 categories** (main topics like "Animals", "Nature")
- **~50 subcategories** (specific topics like "Dogs", "Horses")
- **~200 drawings** (individual coloring pages with descriptions)

Uses AI translation with human-reviewed quality checks for efficiency and consistency.

## 🔑 Prerequisites

### 1. Sanity Write Token
Create a token with Editor or Admin permissions:
1. Visit: https://www.sanity.io/manage/personal/tokens
2. Click "Add API token"
3. Name: "Translation Script"
4. Permissions: Editor or Admin
5. Copy the token

### 2. OpenAI API Key
Get your API key:
1. Visit: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name: "Translation Script"
4. Copy the key

**Cost estimate:** ~$10-30 for translating all 260+ documents (depends on content length)

### 3. Environment Setup
Create `.env` file in project root:

```bash
# Sanity Configuration
SANITY_WRITE_TOKEN=your_sanity_token_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_key_here
```

**⚠️ IMPORTANT:** Add `.env` to `.gitignore` to keep API keys secure!

## 🚀 Usage

### Basic Commands

```bash
# Translate all document types (dry run first!)
npm run translate:dry-run

# Actually create translations (after reviewing dry run)
npm run translate

# Translate specific document types
npm run translate:categories      # Only categories (~12 docs)
npm run translate:subcategories   # Only subcategories (~50 docs)
npm run translate:drawings        # Only drawings (~200 docs)

# Test with limited number of documents
npm run translate -- --limit=5 --dry-run
```

### Recommended Workflow

**⚠️ CRITICAL: Translation Order Matters!**

Documents must be translated in this EXACT order:
1. **Categories first** (they have no parent references)
2. **Subcategories second** (they reference categories)
3. **Drawings last** (they reference subcategories)

If you translate out of order, references will break!

---

**Step 1: Translate Categories (REQUIRED FIRST)**
```bash
# Dry run to preview translations
npm run translate:categories -- --dry-run

# If output looks good, create translations
npm run translate:categories
```

**Why first?** Categories have no parent references, so they're safe to translate first.

---

**Step 2: Review & Publish Categories in Sanity**
1. Open Sanity Studio: http://localhost:3334
2. Check translated categories
3. Verify quality, fix any issues
4. **PUBLISH Swedish categories** (important for next step!)

---

**Step 3: Translate Subcategories (AFTER Categories)**
```bash
npm run translate:subcategories -- --dry-run
npm run translate:subcategories
```

**Why second?** Subcategories reference categories. The script will:
- Find the Swedish translation of each parent category
- Update the `parentCategory` reference to point to Swedish version
- Warn if any category hasn't been translated yet

---

**Step 4: Review & Publish Subcategories**
1. Check in Sanity Studio
2. Verify `parentCategory` points to Swedish categories (not Norwegian!)
3. Publish Swedish subcategories

---

**Step 5: Translate Drawings (AFTER Subcategories)**
```bash
# Test with 10 drawings first
npm run translate:drawings -- --limit=10 --dry-run
npm run translate:drawings -- --limit=10

# If quality is good, do all
npm run translate:drawings
```

**Why last?** Drawings reference subcategories. The script will:
- Find the Swedish translation of each subcategory
- Update the `subcategory` reference to Swedish version
- Warn if subcategory hasn't been translated yet

---

**Step 6: Final Review & Publish**
1. Spot-check random drawings
2. Verify all references are correct
3. Bulk publish all Swedish drawings

## 📊 Script Output

The script provides detailed progress tracking:

```
🌐 Translation Script Starting...

✓ Clients initialized

Document types to process: category, subcategory, drawingImage
Mode: LIVE (will create documents)

============================================================

📄 Processing CATEGORY...

Current state:
  Norwegian documents: 12
  Swedish documents: 0
  Missing translations: 12

Processing 12 documents...

[1/12] Dyr
  Translating category "Dyr"...
  ✓ Translated 5 fields
  ✓ Created translation 3f8a9c2e-sv for 3f8a9c2e-no

[2/12] Blomster
  Translating category "Blomster"...
  ✓ Translated 5 fields
  ✓ Created translation 4b7c8d3f-sv for 4b7c8d3f-no

...

============================================================

📊 CATEGORY Translation Complete:
  ✓ Success: 12
  ⊘ Skipped: 0
  ✗ Failed: 0
  ⏱ Duration: 45.3s

============================================================

✅ Translation script complete!
```

## 🎯 What Gets Translated

### Categories
- `title` - Category name
- `description` - Category description
- `seoTitle` - SEO optimized title
- `seoDescription` - SEO optimized description
- `image.alt` - Image alt text

### Subcategories
- `title` - Subcategory name
- `description` - Subcategory description
- `seoTitle` - SEO optimized title
- `seoDescription` - SEO optimized description
- `featuredImage.alt` - Featured image alt text

### Drawings
- `title` - Drawing title
- `description` - Drawing description
- `metaDescription` - Meta description for SEO
- `contextContent` - Rich text content (portable text)
- `displayImage.alt` - Display image alt text
- `thumbnailImage.alt` - Thumbnail image alt text
- `webpImage.alt` - WebP image alt text
- `seo.metaTitle` - SEO meta title
- `seo.metaDescription` - SEO meta description

### What DOES Get Translated ✅
- **Slugs/URLs** - CRITICAL for SEO!
  - Norwegian: `/fargelegge-hund` → Swedish: `/mala-hund`
  - Uses glossary for consistency
  - URL-safe: lowercase, hyphens only
- All text content (titles, descriptions, SEO)
- Image alt texts
- Rich text content

### What Does NOT Get Translated ❌
- Images (same image files for both languages)
- Tags (if any)
- Metadata (dates, flags, order numbers)

### How References Are Handled 🔗

**The Problem:**
- Subcategories reference their parent category
- Drawings reference their subcategory
- Norwegian documents reference Norwegian parents
- Swedish documents need to reference Swedish parents!

**Our Solution:**
The script automatically resolves references before creating translations:

```typescript
// Norwegian subcategory:
{
  title: "Fargelegge Hund",
  parentCategory: { _ref: "category-dyr-no" }  // Norwegian category
}

// Script creates Swedish subcategory:
{
  title: "Måla Hund",
  parentCategory: { _ref: "category-dyr-sv" }  // ✅ Swedish category!
}
```

**Reference Resolution Process:**
1. Script detects all `_ref` fields in the document
2. Queries Sanity's translation metadata to find Swedish equivalent
3. Updates reference to point to Swedish document
4. Warns if referenced document hasn't been translated yet

**This is why order matters!** You must translate parents before children.

## 🔧 Configuration

Edit `config.ts` to customize:

```typescript
// AI model settings
OPENAI_MODEL: 'gpt-4o',           // Model to use
OPENAI_TEMPERATURE: 0.3,          // Lower = more consistent
OPENAI_MAX_TOKENS: 2000,          // Max response length

// Processing settings
BATCH_SIZE: 5,                    // Documents per batch
DELAY_BETWEEN_BATCHES_MS: 2000,   // Wait between batches
DELAY_BETWEEN_REQUESTS_MS: 500,   // Wait between API calls
MAX_RETRIES: 3,                   // Retry failed translations
```

## 📝 Translation Glossary

The script uses a curated glossary for consistent terminology (`glossary.ts`):

```typescript
'fargelegg' → 'färglägg'
'tegning' → 'teckning'
'barn' → 'barn'
'voksne' → 'vuxna'
// ...and 100+ more terms
```

**Add new terms** to ensure consistency across all translations.

## 🔍 Quality Assurance

### AI Translation Quality
- **GPT-4o** provides 85-95% quality translations
- Context-aware (knows it's a children's website)
- Culturally adapted (Norwegian holidays → Swedish equivalents)
- SEO optimized (natural Swedish search terms)

### Manual Review Checklist
After running the script, review:

1. **Category Names** - Are they natural Swedish terms?
2. **SEO Titles** - Do they include good Swedish keywords?
3. **Image Alt Texts** - Are they descriptive and accessible?
4. **Cultural References** - Are Norwegian-specific terms adapted?
5. **Consistency** - Is terminology consistent across documents?

### Common Issues to Check
- ❌ "17. mai" should be "6 juni" (national days differ)
- ❌ Mixed Norwegian/Swedish in one document
- ❌ Overly literal translations that sound unnatural
- ✅ Natural, flowing Swedish text
- ✅ SEO keywords that Swedes actually search for

## 🐛 Troubleshooting

### Error: "SANITY_WRITE_TOKEN environment variable is required"
**Solution:** Add your Sanity token to `.env` file

### Error: "OPENAI_API_KEY environment variable is required"
**Solution:** Add your OpenAI key to `.env` file

### Error: "Failed to create translation"
**Possible causes:**
- Invalid Sanity token (check permissions)
- Network issues (retry)
- Sanity API rate limits (wait and retry)

### Error: "Empty translation received from OpenAI"
**Possible causes:**
- OpenAI API rate limit reached
- Source text is empty or invalid
- API key insufficient credits

**Solution:** Check OpenAI usage dashboard, add credits if needed

### Translations Look Wrong
1. Check `glossary.ts` - add missing terms
2. Review `openai-client.ts` system prompts
3. Adjust `OPENAI_TEMPERATURE` (lower = more consistent)
4. Test with `--dry-run` before creating documents

## 📈 Progress Tracking

The script automatically:
- ✅ Checks if translations already exist (skips duplicates)
- ✅ Shows progress per document type
- ✅ Reports success/failure/skipped counts
- ✅ Calculates processing time
- ✅ Handles batch delays to avoid rate limits

## 🔄 Re-running the Script

Safe to re-run multiple times:
- **Existing translations are skipped** (no duplicates)
- **Only new/missing translations are created**
- **No data is overwritten**

To **re-translate** existing documents:
1. Delete Swedish documents in Sanity Studio
2. Re-run the translation script

## 💰 Cost Estimation

Based on OpenAI GPT-4o pricing ($2.50 per 1M input tokens, $10 per 1M output tokens):

| Document Type | Count | Est. Input | Est. Output | Cost |
|---|---|---|---|---|
| Categories | 12 | 10K tokens | 5K tokens | ~$0.08 |
| Subcategories | 50 | 50K tokens | 25K tokens | ~$0.38 |
| Drawings | 200 | 400K tokens | 200K tokens | ~$3.00 |
| **Total** | **262** | **460K tokens** | **230K tokens** | **~$3.50** |

*Actual costs may vary based on content length and complexity.*

## 🎓 Next Steps After Translation

1. **Review & Edit** - Manually improve key pages in Sanity Studio
2. **SEO Optimization** - Review Swedish keywords and meta descriptions
3. **Publish** - Bulk publish all Swedish translations
4. **Test** - Visit `/sv` on your website to verify
5. **Monitor** - Track Swedish traffic and user feedback

## 📚 Additional Resources

- [Sanity Document Internationalization](https://www.sanity.io/plugins/sanity-plugin-internationalized-array)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Norwegian → Swedish Translation Guide](https://www.sprakradet.no)

---

**Questions or Issues?**
Check the main project documentation or review the script source code in `scripts/translation/`.
