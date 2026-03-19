# Translate New Subcategory to Swedish

## Overview
Step-by-step guide to translate a new Norwegian subcategory and its drawings to Swedish.

## Prerequisites
- Subcategory exists in Norwegian with `isActive: true`
- Parent category already has Swedish translation
- All subcategory fields filled out (title, slug, description, seoTitle, seoDescription, featuredImage.alt)

## Steps

### 1. Verify Subcategory is Ready
```bash
node -e "
const { createClient } = require('@sanity/client');
require('dotenv').config();
const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-01-13',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});
client.fetch(\"*[_type == 'subcategory' && language == 'no' && title match '*SUBCATEGORY_NAME*'][0]{title, 'slug': slug.current, description, seoTitle, seoDescription, 'featuredImageAlt': featuredImage.alt, 'parentCategory': parentCategory->title}\").then(r => console.log(JSON.stringify(r, null, 2)));
"
```
Replace `SUBCATEGORY_NAME` with the subcategory name (e.g., "Elg").

### 2. Translate Subcategory
```bash
npm run translate -- --type=subcategory --name="SUBCATEGORY_NAME"
```

### 3. Translate All Drawings in Subcategory
```bash
npm run translate:by-subcategory -- --subcategory="SUBCATEGORY_NAME"
```

## Example: Translating "Fargelegge Elg"

```bash
# Step 1: Verify (check all fields are populated)
# Step 2: Translate subcategory
npm run translate -- --type=subcategory --name="Elg"

# Step 3: Translate drawings
npm run translate:by-subcategory -- --subcategory="Elg"
```

## What Gets Translated

### Subcategory Fields
- title
- slug.current
- description
- seoTitle
- seoDescription
- featuredImage.alt

### Drawing Fields
- title
- slug.current
- description
- metaDescription
- contextContent (rich text)
- displayImage.alt
- thumbnailImage.alt
- webpImage.alt
- seo.metaTitle
- seo.metaDescription

## Notes
- The `--name` filter uses case-insensitive partial matching
- Subcategory reference is automatically updated to Swedish version
- Image/file assets are shared (no translation needed)
- Use `--dry-run` flag to preview without creating documents
