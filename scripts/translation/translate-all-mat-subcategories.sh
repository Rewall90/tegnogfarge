#!/bin/bash

# Translate all remaining Mat subcategories sequentially with progress monitoring

echo "🌐 Translating all Mat category subcategories"
echo "=============================================="
echo ""

# Wait for current Muffin translation to complete
echo "⏳ Waiting for Fargelegg Muffin to complete..."
while [ -f .translation-lock ]; do
  sleep 10
done

echo "✅ Muffin complete!"
echo ""

# Translate Egg (38 drawings)
echo "🔄 Starting: Fargelegge Egg (38 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegge Egg"
echo "✅ Egg complete!"
echo ""

# Translate Epler (32 drawings)
echo "🔄 Starting: Fargelegge Epler (32 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegge Epler"
echo "✅ Epler complete!"
echo ""

# Translate Gulrot (44 drawings)
echo "🔄 Starting: Fargelegge Gulrot (44 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegge Gulrot"
echo "✅ Gulrot complete!"
echo ""

# Translate Kaker (22 drawings)
echo "🔄 Starting: Fargelegge Kaker (22 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegge Kaker"
echo "✅ Kaker complete!"
echo ""

echo "🎉 ALL MAT CATEGORY SUBCATEGORIES COMPLETE! 🎉"
echo "Total: 228 drawings translated"
