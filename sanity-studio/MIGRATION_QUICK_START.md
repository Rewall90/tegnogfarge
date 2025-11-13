# 🚀 Quick Start: Language Field Migration

## TL;DR - Quick Commands

### 1. Preview Changes (Safe - No Changes Made)
```bash
cd sanity-studio
npm run migrate:language:dry
```

### 2. Backup Production Data
```bash
cd sanity-studio
sanity dataset export production backup-before-language-migration.tar.gz
```

### 3. Run Migration (Windows)
```bash
cd sanity-studio
set DRY_RUN=false && npm run migrate:language
```

### 4. Verify in Studio
```bash
cd sanity-studio
npm run dev
```
Then open http://localhost:3334 and check any document for language selector.

---

## ✅ What This Fixes

**Problem:** Existing documents don't have `language` field → Translation plugin doesn't work

**Solution:** Adds `language: 'no'` to all existing Norwegian content

**Result:** You can now create Swedish translations in Sanity Studio

---

## 📋 Checklist

- [ ] Run dry-run to preview: `npm run migrate:language:dry`
- [ ] Backup production: `sanity dataset export production backup.tar.gz`
- [ ] Run migration: `set DRY_RUN=false && npm run migrate:language`
- [ ] Verify: Open Sanity Studio → check language selector appears
- [ ] Test: Create a Swedish translation of any document

---

## 🔗 Full Documentation

See `scripts/README.md` for detailed instructions, troubleshooting, and verification steps.
