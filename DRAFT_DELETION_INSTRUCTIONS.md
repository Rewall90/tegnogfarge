# Instructions to Delete Draft Duplicates

## Problem
The script cannot delete drafts because `SANITY_API_READ_TOKEN` only has read permissions, not write permissions.

## Solutions

### Option 1: Get Write Token and Run Script (Recommended)

1. **Get a write token from Sanity:**
   - Go to: https://www.sanity.io/manage/project/fn0kjvlp/api#tokens
   - Click "Add API token"
   - Name: "Write Token for Scripts"
   - Permissions: **Editor** (or higher)
   - Copy the token

2. **Add to `.env.local`:**
   ```bash
   SANITY_API_TOKEN="your-write-token-here"
   ```

3. **Run the deletion script:**
   ```bash
   node delete-draft-duplicates.js
   ```

---

### Option 2: Delete Manually in Sanity Studio

Go to Sanity Studio and delete these 21 draft documents:

#### Drafts to Delete:

1. `drafts.drawingImage-bamse-husker-med-bokstaven-u-1750912951` - Bamse husker med bokstaven U
2. `drafts.drawingImage-flagget-til-aland-1763395444` - Flagget til Åland
3. `drafts.drawingImage-flagget-til-algerie-1763390361` - Flagget til Algerie
4. `drafts.drawingImage-glad-skjell-med-krone-1751886309` - Glad skjell med krone
5. `drafts.drawingImage-grisen-kjorer-traktor-pa-garden-1751791941` - Grisen kjører traktor på gården
6. `drafts.drawingImage-gul-taxi-klar-for-tur-1750853696` - Gul taxi klar for tur
7. `drafts.drawingImage-gulrotter-med-sloyfe-sammen-1758270821` - Gulrøtter med sløyfe sammen
8. `drafts.drawingImage-kul-bil-fra-nascar-lop-1759378488` - Kul bil fra NASCAR-løp
9. `drafts.drawingImage-monstertruck-hopper-over-bakken-1750410174` - Monstertruck hopper over bakken
10. `drafts.drawingImage-mustanghest-loper-fort-ute-1758031706` - Mustanghest løper fort ute
11. `drafts.drawingImage-nissen-kommer-med-gave-1761199776` - Nissen kommer med gave
12. `drafts.drawingImage-robot-gir-vann-til-blomster-1754397213` - Robot gir vann til blomster
13. `drafts.drawingImage-robot-kjorer-pa-rullebrett-1754397235` - Robot kjører på rullebrett
14. `drafts.drawingImage-snill-prinsesse-med-tryllestav-1750486490` - Snill prinsesse med tryllestav
15. `drafts.drawingImage-sommerfugl-med-stort-smil-1750694498` - Sommerfugl med stort smil
16. `drafts.drawingImage-stor-lastebil-med-tommerstokker-1758357678` - Stor lastebil med tømmerstokker
17. `drafts.drawingImage-stor-scania-lastebil-pa-veien-1758357905` - Stor Scania lastebil på veien
18. `drafts.drawingImage-tegn-og-lr-om-planeten-merkur-1750149005` - Tegn og lær om planeten Merkur
19. `drafts.drawingImage-traktor-kjrer-i-byen-1750410193` - Traktor kjører i byen
20. `drafts.drawingImage-trikk-kjorer-under-regnbuen-1760509227` - Trikk kjører under regnbuen
21. `drafts.drawingImage-ulv-gar-langs-togskinnene-1761717133` - Ulv går langs togskinnene

#### How to delete in Studio:

1. Open Sanity Studio (likely at `/studio` on your site)
2. In the Vision tool or use the desk, search for each title
3. Find the draft version (will show as "Draft")
4. Click "Discard draft" or delete the draft

---

### Option 3: Use Sanity CLI

If you have Sanity CLI installed:

```bash
# Delete one by one (example)
sanity documents delete drafts.drawingImage-bamse-husker-med-bokstaven-u-1750912951
```

---

## Why This Matters

These 21 drafts are causing duplicate URLs in your sitemap because both the draft AND published versions have the same slug, creating:
- Same exact URL appearing twice
- Google seeing conflicting signals
- "Duplicate, Google chose different canonical than user" errors

Deleting them will fix **21 out of 65** duplicate issues immediately!
