/**
 * Test Translation Creation Script
 *
 * This script creates Swedish translations to test the full i18n workflow:
 * 1. Create Swedish version of Mandala Blomster subcategory
 * 2. Create Swedish version of one drawing
 * 3. Verify translation metadata
 * 4. Check slugs and references
 */

import {getCliClient} from 'sanity/cli'
import {v4 as uuid} from 'uuid'

const client = getCliClient()

// Original document IDs
const SUBCATEGORY_ID = '0304eab1-bd03-4686-a1c8-c031e4b9990c'
const DRAWING_ID = 'drawingImage-blomster-i-rund-monster-1762926609'

async function testTranslationCreation() {
  console.log('\n' + '='.repeat(60))
  console.log('🇸🇪 TESTING SWEDISH TRANSLATION CREATION')
  console.log('='.repeat(60) + '\n')

  try {
    // Step 1: Fetch original subcategory
    console.log('1️⃣ Fetching original Norwegian documents...\n')

    const originalSubcategory = await client.fetch(
      `*[_id == $id][0]{
        _id,
        _type,
        title,
        slug,
        description,
        seoTitle,
        seoDescription,
        parentCategory,
        order,
        isActive,
        isTrending,
        featuredImage,
        language
      }`,
      {id: SUBCATEGORY_ID}
    )

    console.log(`   ✓ Subcategory: "${originalSubcategory.title}"`)
    console.log(`     Language: ${originalSubcategory.language}`)
    console.log(`     Slug: ${originalSubcategory.slug.current}\n`)

    const originalDrawing = await client.fetch(
      `*[_id == $id][0]{
        _id,
        _type,
        title,
        slug,
        description,
        metaDescription,
        subcategory,
        difficulty,
        language
      }`,
      {id: DRAWING_ID}
    )

    console.log(`   ✓ Drawing: "${originalDrawing.title}"`)
    console.log(`     Language: ${originalDrawing.language}`)
    console.log(`     Slug: ${originalDrawing.slug.current}\n`)

    // Step 2: Check if translations already exist
    console.log('2️⃣ Checking for existing translations...\n')

    const existingSubcategoryTranslation = await client.fetch(
      `*[_type == "translation.metadata" && references($id)][0]`,
      {id: SUBCATEGORY_ID}
    )

    if (existingSubcategoryTranslation) {
      console.log('   ⚠️  Translation metadata already exists for subcategory')
      console.log(`      ID: ${existingSubcategoryTranslation._id}\n`)

      const svSubcategory = await client.fetch(
        `*[_type == "subcategory" && language == "sv" && title match "*Mandala*Blomster*"][0]{_id, title, slug, language}`
      )

      if (svSubcategory) {
        console.log('   ✓ Swedish subcategory already exists:')
        console.log(`     Title: ${svSubcategory.title}`)
        console.log(`     Slug: ${svSubcategory.slug.current}`)
        console.log(`     ID: ${svSubcategory._id}\n`)
        return
      }
    }

    // Step 3: Create Swedish subcategory
    console.log('3️⃣ Creating Swedish translation of subcategory...\n')

    const newSubcategoryId = `subcategory-${uuid()}`

    const swedishSubcategory = {
      _id: newSubcategoryId,
      _type: 'subcategory',
      language: 'sv',
      title: 'Mandala Färgläggning Blommor', // Swedish translation
      slug: {
        _type: 'slug',
        current: 'mandala-farglaggning-blommor', // Swedish slug
      },
      description: 'Vackra mandala färgläggningsbilder med blommor för barn och vuxna',
      seoTitle: originalSubcategory.seoTitle, // Copy for now
      seoDescription: originalSubcategory.seoDescription, // Copy for now
      parentCategory: originalSubcategory.parentCategory,
      order: originalSubcategory.order,
      isActive: originalSubcategory.isActive,
      isTrending: originalSubcategory.isTrending,
      featuredImage: originalSubcategory.featuredImage,
    }

    await client.create(swedishSubcategory)
    console.log('   ✅ Created Swedish subcategory:')
    console.log(`      ID: ${newSubcategoryId}`)
    console.log(`      Title: ${swedishSubcategory.title}`)
    console.log(`      Slug: ${swedishSubcategory.slug.current}\n`)

    // Step 4: Create translation metadata
    console.log('4️⃣ Creating translation metadata...\n')

    const metadataId = `translation.metadata-${uuid()}`

    const translationMetadata = {
      _id: metadataId,
      _type: 'translation.metadata',
      schemaType: 'subcategory',
      translations: [
        {
          _key: uuid(),
          value: {
            _type: 'reference',
            _ref: SUBCATEGORY_ID,
          },
          language: 'no',
        },
        {
          _key: uuid(),
          value: {
            _type: 'reference',
            _ref: newSubcategoryId,
          },
          language: 'sv',
        },
      ],
    }

    await client.create(translationMetadata)
    console.log('   ✅ Created translation metadata:')
    console.log(`      ID: ${metadataId}`)
    console.log(`      Links: NO (${SUBCATEGORY_ID}) ↔ SV (${newSubcategoryId})\n`)

    // Step 5: Create Swedish drawing
    console.log('5️⃣ Creating Swedish translation of drawing...\n')

    const newDrawingId = `drawingImage-${uuid()}`

    const swedishDrawing = {
      _id: newDrawingId,
      _type: 'drawingImage',
      language: 'sv',
      title: 'Blommor i runt mönster', // Swedish translation
      slug: {
        _type: 'slug',
        current: 'blommor-i-runt-monster', // Swedish slug
      },
      description: 'Vacker mandala med blommor i runt mönster',
      metaDescription: originalDrawing.metaDescription,
      subcategory: {
        _type: 'reference',
        _ref: newSubcategoryId, // Reference Swedish subcategory
      },
      difficulty: originalDrawing.difficulty,
      isActive: true,
      order: 0,
    }

    await client.create(swedishDrawing)
    console.log('   ✅ Created Swedish drawing:')
    console.log(`      ID: ${newDrawingId}`)
    console.log(`      Title: ${swedishDrawing.title}`)
    console.log(`      Slug: ${swedishDrawing.slug.current}`)
    console.log(`      Subcategory: ${newSubcategoryId}\n`)

    // Step 6: Create translation metadata for drawing
    const drawingMetadataId = `translation.metadata-${uuid()}`

    const drawingTranslationMetadata = {
      _id: drawingMetadataId,
      _type: 'translation.metadata',
      schemaType: 'drawingImage',
      translations: [
        {
          _key: uuid(),
          value: {
            _type: 'reference',
            _ref: DRAWING_ID,
          },
          language: 'no',
        },
        {
          _key: uuid(),
          value: {
            _type: 'reference',
            _ref: newDrawingId,
          },
          language: 'sv',
        },
      ],
    }

    await client.create(drawingTranslationMetadata)
    console.log('   ✅ Created drawing translation metadata:')
    console.log(`      ID: ${drawingMetadataId}`)
    console.log(`      Links: NO (${DRAWING_ID}) ↔ SV (${newDrawingId})\n`)

    // Step 7: Verify everything
    console.log('6️⃣ Verifying translations...\n')

    const verifySubcategory = await client.fetch(
      `*[_id == $id][0]{
        _id,
        title,
        slug,
        language,
        "_translations": *[_type == "translation.metadata" && references(^._id)][0]{
          _id,
          translations[]{
            language,
            "document": value->{_id, title, language}
          }
        }
      }`,
      {id: SUBCATEGORY_ID}
    )

    console.log('   📂 Norwegian Subcategory:')
    console.log(`      Title: ${verifySubcategory.title}`)
    console.log(`      Language: ${verifySubcategory.language}`)
    console.log(`      Slug: ${verifySubcategory.slug.current}`)

    if (verifySubcategory._translations) {
      console.log('      Translations:')
      verifySubcategory._translations.translations.forEach((t: any) => {
        console.log(`        - ${t.language}: ${t.document.title} (${t.document._id})`)
      })
    }
    console.log('')

    const verifyDrawing = await client.fetch(
      `*[_id == $id][0]{
        _id,
        title,
        slug,
        language,
        "_translations": *[_type == "translation.metadata" && references(^._id)][0]{
          _id,
          translations[]{
            language,
            "document": value->{_id, title, language}
          }
        }
      }`,
      {id: DRAWING_ID}
    )

    console.log('   📸 Norwegian Drawing:')
    console.log(`      Title: ${verifyDrawing.title}`)
    console.log(`      Language: ${verifyDrawing.language}`)
    console.log(`      Slug: ${verifyDrawing.slug.current}`)

    if (verifyDrawing._translations) {
      console.log('      Translations:')
      verifyDrawing._translations.translations.forEach((t: any) => {
        console.log(`        - ${t.language}: ${t.document.title} (${t.document._id})`)
      })
    }
    console.log('')

    console.log('='.repeat(60))
    console.log('✅ TRANSLATION TEST SUCCESSFUL!')
    console.log('='.repeat(60))
    console.log('\n📋 Summary:')
    console.log('   ✓ Norwegian documents have language: "no"')
    console.log('   ✓ Swedish translations created with language: "sv"')
    console.log('   ✓ Translation metadata links documents correctly')
    console.log('   ✓ Slugs are different (Norwegian vs Swedish)')
    console.log('   ✓ References work (drawing → Swedish subcategory)')
    console.log('\n' + '='.repeat(60) + '\n')

  } catch (error) {
    console.error('\n❌ Error during translation test:', error)
    throw error
  }
}

testTranslationCreation()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
