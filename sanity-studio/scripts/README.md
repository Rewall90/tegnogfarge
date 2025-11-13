# Sanity Migration Scripts

## Language Field Migration

### Overview
This migration adds the `language` field to all existing `drawingImage`, `category`, and `subcategory` documents in your Sanity dataset. This field is required for the `@sanity/document-internationalization` plugin to work properly.

**What it does:**
- Finds all documents without a `language` field
- Sets `language: 'no'` for all Norwegian content
- Processes documents in batches of 100 (safe for large datasets)
- Includes verification step to ensure all documents were updated

---

## 🚨 IMPORTANT: Before Running

### 1. Backup Your Data
```bash
# Export your production dataset as a backup
sanity dataset export production backup-$(date +%Y%m%d-%H%M%S).tar.gz
```

### 2. Test on Development Dataset (Recommended)
If you have a development dataset:
```bash
# Temporarily switch to development dataset in sanity.config.ts
# dataset: 'development',

# Then run migration on dev dataset first
npm run migrate:language:dry
npm run migrate:language
```

---

## 📋 Usage

### Step 1: Preview Changes (DRY RUN)
**Always run this first** to see what will be changed:

```bash
cd sanity-studio
npm run migrate:language:dry
```

**Expected output:**
```
============================================================
🌍 LANGUAGE FIELD MIGRATION
============================================================
📋 Mode: DRY RUN (preview only)
📅 Date: 2025-01-13T10:30:00.000Z
============================================================

🔍 Querying documents without language field...

📊 Found 450 documents to migrate:

   📸 drawingImage:  400
   📁 category:      30
   📂 subcategory:   20

────────────────────────────────────────────────────────────
📋 DRY RUN - Preview of documents to be updated:
────────────────────────────────────────────────────────────

1. drawingImage   → Katt og Mus
2. drawingImage   → Hund i Parken
3. category       → Dyr
...

⚠️  No changes have been made (DRY RUN mode)
💡 To apply these changes, run:
   npm run migrate:language
```

### Step 2: Apply Changes (ACTUAL MIGRATION)

⚠️ **This will modify your production data**

```bash
cd sanity-studio

# Set environment variable to disable DRY_RUN
# Windows CMD:
set DRY_RUN=false && npm run migrate:language

# Windows PowerShell:
$env:DRY_RUN="false"; npm run migrate:language

# macOS/Linux:
DRY_RUN=false npm run migrate:language
```

**Expected output:**
```
============================================================
🌍 LANGUAGE FIELD MIGRATION
============================================================
📋 Mode: ⚠️  LIVE MIGRATION
📅 Date: 2025-01-13T10:35:00.000Z
============================================================

🔍 Querying documents without language field...

📊 Found 450 documents to migrate:

   📸 drawingImage:  400
   📁 category:      30
   📂 subcategory:   20

🚀 Starting migration...

   ✅ Processed 100/450 (22%)
   ✅ Processed 200/450 (44%)
   ✅ Processed 300/450 (67%)
   ✅ Processed 400/450 (89%)
   ✅ Processed 450/450 (100%)

🎉 Migration completed successfully!

🔍 Verifying migration...
✅ Verification passed: All documents now have language field

────────────────────────────────────────────────────────────
📊 Final Statistics:
────────────────────────────────────────────────────────────
   Total documents with language='no': 450
   Documents migrated in this run: 450
────────────────────────────────────────────────────────────

✅ Migration complete! You can now:
   1. Start Sanity Studio: npm run dev
   2. Open any existing document
   3. Look for language selector in top-right
   4. Click "Create Swedish translation" to test
```

---

## 🧪 Verification Steps

### 1. Check Migration Results in Sanity Studio

```bash
# Start Sanity Studio
cd sanity-studio
npm run dev
```

Then in your browser:
1. Open Sanity Studio (http://localhost:3334)
2. Navigate to any existing drawing, category, or subcategory
3. Look for the **language selector** in the top-right corner
4. You should see a badge showing "Norwegian (Bokmål)"
5. Click the language selector → "Create Swedish translation" option should appear

### 2. Verify with GROQ Queries

Open Vision Tool in Sanity Studio and run these queries:

**Check if any documents are missing language field:**
```groq
// Should return 0
count(*[_type in ["drawingImage", "category", "subcategory"] && !defined(language)])
```

**Check all documents have language='no':**
```groq
// Should return total count of your documents
count(*[_type in ["drawingImage", "category", "subcategory"] && language == "no"])
```

**List all languages in use:**
```groq
array::unique(*[_type in ["drawingImage", "category", "subcategory"]].language)
// Should return: ["no"]
```

### 3. Test Translation Creation

1. Open any existing Norwegian document
2. Click language selector (top-right)
3. Click "Create Swedish translation"
4. A new document should open with:
   - `language: 'sv'`
   - Empty/copied fields ready for Swedish content
   - Link back to Norwegian original

---

## ⚠️ Troubleshooting

### Error: "Cannot find module 'sanity/cli'"
```bash
# Reinstall dependencies
cd sanity-studio
npm install
```

### Error: "Unauthorized" or "Permission denied"
```bash
# Make sure you're logged in to Sanity
sanity login

# Check your current project
sanity projects list
```

### Migration runs but documents still missing language field
```bash
# Check if there were any errors in the output
# Try running the migration again
DRY_RUN=false npm run migrate:language
```

### Want to revert changes?
If you need to remove the language field:

```typescript
// Create a new script: scripts/remove-language-field.ts
// Copy structure from migrate-language-field.ts
// Change the patch to:
transaction = transaction.patch(doc._id, patch => patch.unset(['language']))
```

---

## 📊 What Happens During Migration

1. **Query:** Script queries all documents lacking `language` field
2. **Count:** Displays breakdown by document type
3. **Batch Process:** Updates documents in batches of 100
4. **Transaction Safety:** Each batch is an atomic transaction (all-or-nothing)
5. **Progress:** Shows real-time progress percentage
6. **Verification:** Confirms all documents were updated
7. **Statistics:** Displays final counts and success metrics

---

## 🔒 Safety Features

- ✅ **Dry-run mode** - Preview changes before applying
- ✅ **Batch processing** - Prevents overwhelming the API
- ✅ **Atomic transactions** - All-or-nothing per batch
- ✅ **Verification step** - Confirms success
- ✅ **Conditional updates** - Only touches documents missing the field
- ✅ **Progress tracking** - Real-time feedback
- ✅ **Error handling** - Clear error messages

---

## 📚 Additional Resources

- [Sanity Document Internationalization Plugin](https://www.sanity.io/plugins/document-internationalization)
- [Sanity CLI Documentation](https://www.sanity.io/docs/cli)
- [GROQ Query Language](https://www.sanity.io/docs/groq)

---

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review the migration script output for specific errors
3. Verify your Sanity credentials and permissions
4. Ensure you have the latest version of `@sanity/cli`
