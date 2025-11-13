# PHASE 4: Translation Workflow Options

**Goal:** Create Swedish translations for 50 top drawings + taxonomy

---

## How Sanity Translations Work

Sanity's `@sanity/document-internationalization` plugin provides:
1. ✅ **Studio UI** - Click "Swedish" button to create translation
2. ✅ **Automatic linking** - Connects documents via `translation.metadata`
3. ✅ **Separate documents** - Each language is a complete document with `language` field

When you create a Swedish translation:
- New document ID is created
- `language: 'sv'` is set
- Original Norwegian document is linked
- You fill in Swedish-specific fields (title, slug, description, etc.)

---

## Option A: Manual Translation via Studio UI

### Process
1. Open Sanity Studio
2. Navigate to a Norwegian drawing document
3. Click the "Swedish" language selector/button
4. Fill in Swedish content:
   - Title (e.g., "Färglägg Tomte")
   - Slug (e.g., "farglaegg-tomte")
   - Description
   - Meta description
   - Context content (Portable Text)
5. Save and publish

### Pros
- ✅ Full control over translations
- ✅ Review each translation before publishing
- ✅ No coding required
- ✅ Can use human translators or AI (copy-paste)

### Cons
- ❌ Time-consuming (50 drawings × ~5 minutes = 4+ hours)
- ❌ Repetitive clicking
- ❌ Manual slug generation
- ❌ Easy to miss fields

### Best For
- Small content volumes (<20 documents)
- High-quality human translations
- When content needs cultural adaptation

**Estimated Time:** 4-6 hours for 50 drawings

---

## Option B: Automated Bulk Translation via API + AI

### Process
1. Create a translation script that:
   - Queries all Norwegian drawings from Sanity
   - Uses AI (OpenAI/Claude) to translate text fields
   - Generates Swedish slugs automatically
   - Creates Swedish documents via Sanity API
   - Links translations using plugin's structure

2. Run script: `npm run translate -- --limit 50`

3. Review in Studio:
   - Check AI translations for accuracy
   - Edit any awkward phrasing
   - Verify slugs are SEO-friendly

### Sample Script Structure
```typescript
// scripts/translate-to-swedish.ts
import { createClient } from '@sanity/client';
import OpenAI from 'openai';

const sanityClient = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function translateDrawing(norwegianDoc) {
  // 1. Translate text fields via AI
  const swedishContent = await translateWithAI({
    title: norwegianDoc.title,
    description: norwegianDoc.description,
    metaDescription: norwegianDoc.metaDescription,
    // ... other text fields
  });

  // 2. Generate Swedish slug
  const swedishSlug = generateSwedishSlug(swedishContent.title);

  // 3. Create Swedish document
  const swedishDoc = {
    _type: 'drawingImage',
    language: 'sv',
    title: swedishContent.title,
    slug: { current: swedishSlug },
    description: swedishContent.description,
    // ... copy images, references, etc. from Norwegian doc
  };

  // 4. Create document in Sanity
  const created = await sanityClient.create(swedishDoc);

  // 5. Link translation using plugin's structure
  await linkTranslations(norwegianDoc._id, created._id);
}
```

### Pros
- ✅ Fast (50 drawings in ~30 minutes)
- ✅ Consistent translation quality
- ✅ Automatic slug generation
- ✅ No repetitive clicking
- ✅ Easy to re-run if needed

### Cons
- ❌ Requires scripting
- ❌ AI translations need review
- ❌ Upfront development time (~2-3 hours)

### Best For
- Large content volumes (>20 documents)
- Speed is priority
- Technical team available

**Estimated Time:**
- Script development: 2-3 hours
- Running script: 30 minutes
- Review translations: 2-3 hours
- **Total: 5-6 hours**

---

## Option C: Hybrid Approach (RECOMMENDED)

### Process
1. **Automated:** Use API script for bulk fields
   - Title
   - Description
   - Meta description
   - Generate slugs

2. **Manual:** Review and edit in Studio UI
   - Fix awkward AI translations
   - Culturally adapt content
   - Verify Swedish slugs are natural

3. **Manual:** Translate rich content in Studio
   - Context Content (Portable Text blocks)
   - Easier to edit in Studio than via API

### Pros
- ✅ Speed of automation
- ✅ Quality of human review
- ✅ Balance of efficiency and accuracy

### Cons
- ⚠️ Still requires scripting
- ⚠️ Two-step process

### Best For
- Most scenarios
- Your use case (50 drawings)

**Estimated Time:**
- Script development: 2-3 hours
- Running script: 30 minutes
- Review + manual edits: 3-4 hours
- **Total: 6-7 hours**

---

## Recommendation for Your Project

**Use Option C: Hybrid Approach**

### Why?
1. You have 50 drawings - too many for fully manual
2. Swedish is close to Norwegian - AI will do well
3. Quality matters for SEO - human review essential
4. Can batch process categories/subcategories too

### Implementation Plan

#### Week 2: Script Development
- Create translation script with AI integration
- Test on 2-3 drawings first
- Refine based on results

#### Week 3: Bulk Translation
- Run script for top 50 drawings
- Translate all categories (5-10 items)
- Translate all subcategories (~20 items)

#### Week 3-4: Quality Review
- Review AI translations in Studio
- Edit awkward phrasing
- Verify Swedish slugs
- Add cultural adaptations

---

## Translation Quality Checklist

For each Swedish translation, verify:

### Content
- [ ] Title is natural Swedish (not literal translation)
- [ ] Description flows well in Swedish
- [ ] Meta description is SEO-optimized
- [ ] Context content is culturally appropriate

### Technical
- [ ] Slug is URL-friendly Swedish
- [ ] Slug is unique (no conflicts)
- [ ] Language field is 'sv'
- [ ] Document is published (not draft)

### SEO
- [ ] Meta title <60 characters
- [ ] Meta description ~150 characters
- [ ] Keywords are Swedish search terms
- [ ] Alt text for images is in Swedish

---

## Swedish Translation Considerations

### Terminology Differences
- Norwegian: "Fargelegging" → Swedish: "Färgläggning" or "Målarbilder"
- Norwegian: "Jul" → Swedish: "Jul" (same)
- Norwegian: "Dyr" → Swedish: "Djur"
- Norwegian: "Barn" → Swedish: "Barn" (same)

### URL Structure Examples
```
Norwegian: /no/jul/farglegg-nisse
Swedish:   /sv/jul/farglaegg-tomte

Norwegian: /no/dyr/farglegg-hund
Swedish:   /sv/djur/farglaegg-hund

Norwegian: /no/halloween/farglegg-heks
Swedish:   /sv/halloween/farglaegg-haxa
```

### Search Intent Differences
- Swedes search "målarbilder" more than "färgläggning"
- Consider adding Swedish-specific keywords
- Swedish metadata should target Swedish search behavior

---

## Next Steps

After Phase 2 (Routing) is complete:

1. **Decide approach:**
   - Fully manual (Option A)
   - Fully automated (Option B)
   - Hybrid (Option C) ← Recommended

2. **If automated/hybrid:**
   - Set up OpenAI/Claude API key
   - Create translation script
   - Test on 3 drawings

3. **Execute translations:**
   - Run bulk translation
   - Review in Studio
   - Publish Swedish content

4. **Verify:**
   - Check URLs work: `/sv/jul/farglaegg-tomte`
   - Test fallback for untranslated content
   - Monitor for errors
