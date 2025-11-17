#!/bin/bash

# Translate all Vitenskap category subcategories sequentially

echo "🔬 Translating all Vitenskap category subcategories"
echo "=============================================="
echo ""

# Translate Fargelegg Bokstaver Og Alfabetet (30 drawings)
echo "🔄 Starting: Fargelegg Bokstaver Og Alfabetet (30 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegg Bokstaver Og Alfabetet"
echo "✅ Bokstaver Og Alfabetet complete!"
echo ""

# Translate Fargelegge Hus (32 drawings)
echo "🔄 Starting: Fargelegge Hus (32 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegge Hus"
echo "✅ Hus complete!"
echo ""

# Translate Fargelegge Jordkloden (35 drawings)
echo "🔄 Starting: Fargelegge Jordkloden (35 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegge Jordkloden"
echo "✅ Jordkloden complete!"
echo ""

# Translate Fargelegge Romskip (21 remaining out of 23 drawings)
echo "🔄 Starting: Fargelegge Romskip (21 remaining)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegge Romskip"
echo "✅ Romskip complete!"
echo ""

# Translate Fargelegge Romvesen (33 drawings)
echo "🔄 Starting: Fargelegge Romvesen (33 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegge Romvesen"
echo "✅ Romvesen complete!"
echo ""

# Translate Fargelegge Tall (40 drawings)
echo "🔄 Starting: Fargelegge Tall (40 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegge Tall"
echo "✅ Tall complete!"
echo ""

# Translate Fargelegging Av Jenter (25 drawings)
echo "🔄 Starting: Fargelegging Av Jenter (25 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegging Av Jenter"
echo "✅ Jenter complete!"
echo ""

echo "🎉 ALL VITENSKAP CATEGORY SUBCATEGORIES COMPLETE! 🎉"
echo "Total: ~216 drawings translated"
echo ""
echo "Note: Fargelegg Solsystemet, Fargelegg Stjernetegn, and Fargelegg Verdensrommet were already 100% complete"
