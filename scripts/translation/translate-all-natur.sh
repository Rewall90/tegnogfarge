#!/bin/bash

# Translate all Natur category subcategories sequentially

echo "🌿 Translating all Natur category subcategories"
echo "=============================================="
echo ""

# Wait for Skjell to complete
echo "⏳ Waiting for Fargelegge Skjell to complete..."
while [ -f .translation-lock ]; do
  sleep 10
done
echo "✅ Skjell complete!"
echo ""

# Translate Sol (21 drawings)
echo "🔄 Starting: Fargelegge Sol (21 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegge Sol"
echo "✅ Sol complete!"
echo ""

# Translate Bondegård (28 drawings)
echo "🔄 Starting: Fargelegg Tegning Av Bondegård (28 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegg Tegning Av Bondegård"
echo "✅ Bondegård complete!"
echo ""

# Translate Blader (34 drawings)
echo "🔄 Starting: Fargelegge Blader (34 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegge Blader"
echo "✅ Blader complete!"
echo ""

# Translate Høstens Motiver (35 drawings)
echo "🔄 Starting: Fargelegg Høstens Motiver (35 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegg Høstens Motiver"
echo "✅ Høstens Motiver complete!"
echo ""

# Translate Vinter (35 drawings)
echo "🔄 Starting: Fargelegge Vinter (35 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegge Vinter"
echo "✅ Vinter complete!"
echo ""

# Translate hjerter (35 drawings)
echo "🔄 Starting: Fargelegge hjerter (35 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegge hjerter"
echo "✅ hjerter complete!"
echo ""

# Translate Tre (38 drawings)
echo "🔄 Starting: Fargelegge Tre (38 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegge Tre"
echo "✅ Tre complete!"
echo ""

# Translate Regnbuen (46 drawings)
echo "🔄 Starting: Fargelegge Regnbuen (46 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegge Regnbuen"
echo "✅ Regnbuen complete!"
echo ""

# Translate Sommeren (51 drawings)
echo "🔄 Starting: Fargelegg Sommeren (51 drawings)"
npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="Fargelegg Sommeren"
echo "✅ Sommeren complete!"
echo ""

echo "🎉 ALL NATUR CATEGORY SUBCATEGORIES COMPLETE! 🎉"
echo "Total: 342 drawings translated"
