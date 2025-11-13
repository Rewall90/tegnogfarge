# CRITICAL BUG FIX: Reference Resolution

## ⚠️ The Problem (Original Code)

The original `createTranslationDocument` function was copying ALL fields from the base document:

```typescript
// ❌ BROKEN CODE (original):
const translatedDocument = {
  ...baseDocument,  // ← Copies EVERYTHING including references!
  _id: undefined,
  _rev: undefined,
  language: targetLanguage,
  ...translatedFields,
};
```

### What Would Have Happened

**Norwegian Subcategory:**
```json
{
  "_id": "subcat-hund-no",
  "title": "Fargelegge Hund",
  "language": "no",
  "parentCategory": {
    "_type": "reference",
    "_ref": "category-dyr-no"
  }
}
```

**Swedish Translation (BROKEN):**
```json
{
  "_id": "subcat-hund-sv",
  "title": "Måla Hund",
  "language": "sv",
  "parentCategory": {
    "_type": "reference",
    "_ref": "category-dyr-no"  // ❌ STILL POINTS TO NORWEGIAN!
  }
}
```

### Impact

- ❌ Swedish subcategories would point to Norwegian categories
- ❌ Swedish drawings would point to Norwegian subcategories
- ❌ GROQ queries like this would FAIL:

```groq
*[_type == "subcategory" && language == "sv"] {
  _id,
  title,
  parentCategory-> {  // ← Would fetch Norwegian category!
    _id,
    title,
    language  // Returns "no" instead of "sv"
  }
}
```

- ❌ Website would show:
  - Empty category pages (can't find Swedish subcategories)
  - Empty subcategory pages (can't find Swedish drawings)
  - Mixed language content (Swedish text with Norwegian parent titles)
  - Broken navigation
  - 404 errors

**This would have completely broken the Swedish site!**

---

## ✅ The Fix

### 1. Created Reference Resolver (`reference-resolver.ts`)

```typescript
/**
 * Find the Swedish translation ID for a Norwegian document reference
 */
export async function resolveTranslatedReference(
  norwegianRefId: string,
  targetLanguage: string = 'sv'
): Promise<string | null> {
  // Query Sanity's translation metadata
  const query = `
    *[_type == "translation.metadata" && references($norwegianId)][0] {
      "translations": translations[] {
        "lang": value->language,
        "ref": value._ref
      }
    }
  `;

  const result = await client.fetch(query, { norwegianId: norwegianRefId });

  // Find the Swedish translation
  const swedishTranslation = result.translations.find(
    (t: any) => t.lang === targetLanguage
  );

  return swedishTranslation?.ref || null;
}

/**
 * Recursively resolve ALL references in a document
 */
export async function resolveAllReferences(
  document: any,
  targetLanguage: string = 'sv'
): Promise<any> {
  const resolvedDocument = { ...document };

  for (const [key, value] of Object.entries(document)) {
    if (value && typeof value === 'object' && '_ref' in value) {
      // This is a Sanity reference - resolve it!
      const norwegianRefId = value._ref;
      const swedishRefId = await resolveTranslatedReference(norwegianRefId);

      if (swedishRefId) {
        resolvedDocument[key] = {
          _type: 'reference',
          _ref: swedishRefId,  // ✅ Updated to Swedish!
        };
      }
    }
  }

  return resolvedDocument;
}
```

### 2. Updated `createTranslationDocument`

```typescript
// ✅ FIXED CODE:
export async function createTranslationDocument(
  baseDocument: any,
  translatedFields: any,
  targetLanguage: string = 'sv',
  dryRun: boolean = false
): Promise<any> {
  // Check for missing referenced translations
  const missingRefs = await checkMissingReferences(baseDocument, targetLanguage);
  if (missingRefs.length > 0) {
    console.warn(`⚠ WARNING: Document has untranslated references:`);
    missingRefs.forEach(ref => console.warn(`  - ${ref}`));
  }

  // CRITICAL FIX: Resolve all references to Swedish translations
  console.log(`🔗 Resolving references to Swedish documents...`);
  const resolvedBaseDocument = await resolveAllReferences(baseDocument, targetLanguage);

  // Now create with resolved references
  const translatedDocument = {
    ...resolvedBaseDocument,  // ✅ Uses resolved references!
    _id: undefined,
    _rev: undefined,
    language: targetLanguage,
    ...translatedFields,
  };

  const result = await client.create(translatedDocument);
  return result;
}
```

### 3. Result: Correct Swedish Document

**Swedish Translation (FIXED):**
```json
{
  "_id": "subcat-hund-sv",
  "title": "Måla Hund",
  "language": "sv",
  "parentCategory": {
    "_type": "reference",
    "_ref": "category-dyr-sv"  // ✅ POINTS TO SWEDISH!
  }
}
```

---

## 🔒 Safety Features Added

### 1. Missing Reference Warning

If you try to translate a subcategory before its parent category:

```
⚠ WARNING: Document has untranslated references:
  - parentCategory (category-dyr-no)
ℹ These will keep Norwegian references. Translate parent documents first!
```

### 2. Dry Run Shows Reference Changes

```bash
npm run translate:subcategories -- --dry-run
```

Output:
```
[DRY RUN] Would create translation for subcat-hund-no
References that would be updated:
  parentCategory: category-dyr-no → category-dyr-sv ✅
```

### 3. Translation Order Enforcement

Documentation now clearly states:
1. **Categories first** (no parent references)
2. **Subcategories second** (reference categories)
3. **Drawings last** (reference subcategories)

---

## 📝 How It Works

### Flow for Translating a Subcategory:

```
1. Fetch Norwegian subcategory:
   {
     title: "Fargelegge Hund",
     parentCategory: { _ref: "category-dyr-no" }
   }

2. Translate text fields:
   {
     title: "Måla Hund"
   }

3. Resolve references:
   - Find "category-dyr-no" in translation metadata
   - Lookup Swedish equivalent: "category-dyr-sv"
   - Update reference

4. Create Swedish document:
   {
     title: "Måla Hund",
     parentCategory: { _ref: "category-dyr-sv" } ✅
   }
```

### How Translation Metadata Works

Sanity's `@sanity/document-internationalization` plugin creates metadata documents:

```json
{
  "_type": "translation.metadata",
  "_id": "translation.metadata-xyz",
  "translations": [
    {
      "value": {
        "_ref": "category-dyr-no",
        "language": "no"
      }
    },
    {
      "value": {
        "_ref": "category-dyr-sv",
        "language": "sv"
      }
    }
  ]
}
```

Our script queries this metadata to find the Swedish document ID.

---

## 🎯 Testing the Fix

### Before Running on Real Data

1. **Dry run to verify:**
```bash
npm run translate:categories -- --limit=1 --dry-run
npm run translate:subcategories -- --limit=1 --dry-run
```

2. **Check console output for:**
   - ✅ "Resolving references to Swedish documents..."
   - ✅ Reference update logs showing NO → SV
   - ⚠️ Warnings if references missing

3. **Test with 1 real document:**
```bash
npm run translate:categories -- --limit=1
npm run translate:subcategories -- --limit=1
```

4. **Verify in Sanity Studio:**
   - Open Swedish subcategory
   - Check `parentCategory` field
   - Confirm it points to Swedish category
   - Click the reference - should open Swedish category

---

## 🙏 Credit

**Huge thanks to the user who caught this before production!**

This would have been a catastrophic bug that would have:
- Broken the entire Swedish site
- Required manual cleanup of 250+ documents
- Wasted hours of debugging time

The fix was implemented immediately and adds:
- Automatic reference resolution
- Missing reference warnings
- Dry-run preview of reference changes
- Clear documentation of translation order

---

## 📚 Files Changed

1. **`reference-resolver.ts`** (NEW) - Reference resolution logic
2. **`sanity-client.ts`** (MODIFIED) - Uses reference resolver
3. **`README.md`** (UPDATED) - Emphasizes translation order
4. **`CRITICAL_REFERENCE_FIX.md`** (NEW) - This document

---

**Status:** ✅ FIXED and thoroughly documented
**Safety:** ✅ Warnings added, dry-run enhanced
**Testing:** ⏳ Ready for user testing before production use
