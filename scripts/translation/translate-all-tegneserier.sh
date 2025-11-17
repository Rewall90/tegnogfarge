#!/bin/bash

# Translate all Tegneserier category subcategories sequentially

echo "🎨 Translating all Tegneserier category subcategories"
echo "=============================================="
echo ""

# Translate Fargelegge Bamse (26 drawings)
echo "🔄 Starting: Fargelegge Bamse (26 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegge Bamse"
echo "✅ Bamse complete!"
echo ""

# Translate Kawaii Tegninger For Fargelegging (25 drawings)
echo "🔄 Starting: Kawaii Tegninger For Fargelegging (25 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Kawaii Tegninger For Fargelegging"
echo "✅ Kawaii complete!"
echo ""

# Translate Fargelegge Troll (22 drawings)
echo "🔄 Starting: Fargelegge Troll (22 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegge Troll"
echo "✅ Troll complete!"
echo ""

# Translate Fargelegge Fotball (20 drawings)
echo "🔄 Starting: Fargelegge Fotball (20 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegge Fotball"
echo "✅ Fotball complete!"
echo ""

# Translate Fargelegge Robot (20 drawings)
echo "🔄 Starting: Fargelegge Robot (20 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegge Robot"
echo "✅ Robot complete!"
echo ""

# Translate Fargelegge Heks (19 drawings)
echo "🔄 Starting: Fargelegge Heks (19 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegge Heks"
echo "✅ Heks complete!"
echo ""

echo "🎉 ALL TEGNESERIER CATEGORY SUBCATEGORIES COMPLETE! 🎉"
echo "Total: ~132 drawings translated"
echo ""
echo "Note: Fargelegg Enhjørninger and Fargelegg Prinsesser were already 100% complete"
