/**
 * Targeted Migration Script: Mandala Fargelegging Blomster
 *
 * This script adds the 'language' field ONLY to:
 * - The "Mandala Fargelegging Blomster" subcategory
 * - All 37 drawings that belong to this subcategory
 *
 * USAGE:
 *   DRY RUN:    npm run migrate:mandala:dry
 *   ACTUAL:     npm run migrate:mandala
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient()

// Dry run flag
const DRY_RUN = process.env.DRY_RUN !== 'false'

// Mandala Blomster subcategory ID
const SUBCATEGORY_ID = '0304eab1-bd03-4686-a1c8-c031e4b9990c'

interface Document {
  _id: string
  _type: string
  title?: string
  language?: string
}

async function migrateMandalaBlomster() {
  console.log('\n' + '='.repeat(60))
  console.log('🌸 MANDALA BLOMSTER - TARGETED MIGRATION')
  console.log('='.repeat(60))
  console.log(`📋 Mode: ${DRY_RUN ? 'DRY RUN (preview only)' : '⚠️  LIVE MIGRATION'}`)
  console.log(`📅 Date: ${new Date().toISOString()}`)
  console.log('='.repeat(60) + '\n')

  try {
    // Query the subcategory
    const subcategoryQuery = `*[_id == $subcategoryId && !defined(language)][0]{
      _id,
      _type,
      title
    }`

    console.log('🔍 Checking subcategory...')
    const subcategory: Document | null = await client.fetch(subcategoryQuery, {
      subcategoryId: SUBCATEGORY_ID,
    })

    // Query drawings belonging to this subcategory
    const drawingsQuery = `*[
      _type == "drawingImage"
      && references($subcategoryId)
      && !defined(language)
    ]{
      _id,
      _type,
      title
    }`

    console.log('🔍 Checking drawings in subcategory...\n')
    const drawings: Document[] = await client.fetch(drawingsQuery, {
      subcategoryId: SUBCATEGORY_ID,
    })

    // Collect all documents
    const documents: Document[] = []
    if (subcategory) {
      documents.push(subcategory)
    }
    documents.push(...drawings)

    if (documents.length === 0) {
      console.log('✅ No documents need migration')
      console.log('   - Subcategory already has language field ✓')
      console.log('   - All drawings already have language field ✓\n')
      console.log('='.repeat(60) + '\n')
      return
    }

    // Display summary
    console.log('📊 Found documents to migrate:\n')
    if (subcategory) {
      console.log(`   📂 Subcategory: "${subcategory.title}"`)
    } else {
      console.log('   📂 Subcategory: Already migrated ✓')
    }
    console.log(`   📸 Drawings: ${drawings.length}`)
    console.log(`   📍 Total: ${documents.length}\n`)

    if (DRY_RUN) {
      console.log('─'.repeat(60))
      console.log('📋 DRY RUN - Documents to be updated:')
      console.log('─'.repeat(60) + '\n')

      if (subcategory) {
        console.log(`✓ Subcategory: ${subcategory.title}`)
      }

      if (drawings.length > 0) {
        console.log(`\n✓ Drawings (${drawings.length} total):`)
        drawings.slice(0, 10).forEach((doc, i) => {
          const title = doc.title || '(no title)'
          console.log(`   ${i + 1}. ${title}`)
        })
        if (drawings.length > 10) {
          console.log(`   ... and ${drawings.length - 10} more drawings`)
        }
      }

      console.log('\n' + '─'.repeat(60))
      console.log('⚠️  No changes have been made (DRY RUN mode)')
      console.log('─'.repeat(60))
      console.log('\n💡 To apply these changes, run:')
      console.log('   npm run migrate:mandala\n')
      console.log('='.repeat(60) + '\n')
      return
    }

    // --- ACTUAL MIGRATION ---
    console.log('🚀 Starting targeted migration...\n')

    // Create single transaction for all documents
    let transaction = client.transaction()

    documents.forEach((doc) => {
      transaction = transaction.patch(doc._id, (patch) => patch.setIfMissing({language: 'no'}))
    })

    // Commit the transaction
    try {
      await transaction.commit()
      console.log(`   ✅ Migrated ${documents.length} documents successfully!`)
    } catch (error) {
      console.error('   ❌ Error during migration:', error)
      throw error
    }

    console.log('\n🎉 Migration completed!\n')

    // --- VERIFICATION ---
    console.log('🔍 Verifying migration...\n')

    // Check subcategory
    const verifySubcategory = await client.fetch(
      `*[_id == $subcategoryId][0]{_id, title, language}`,
      {subcategoryId: SUBCATEGORY_ID}
    )

    if (verifySubcategory?.language === 'no') {
      console.log('   ✅ Subcategory: language = "no"')
    } else {
      console.warn('   ⚠️  Subcategory: Missing language field')
    }

    // Check drawings
    const verifyDrawings = await client.fetch(
      `count(*[_type == "drawingImage" && references($subcategoryId) && language == "no"])`,
      {subcategoryId: SUBCATEGORY_ID}
    )

    console.log(`   ✅ Drawings: ${verifyDrawings} with language = "no"\n`)

    console.log('─'.repeat(60))
    console.log('📊 Migration Complete!')
    console.log('─'.repeat(60))
    console.log(`   Subcategory: Mandala Fargelegging Blomster`)
    console.log(`   Drawings migrated: ${drawings.length}`)
    console.log(`   Total documents: ${documents.length}`)
    console.log('─'.repeat(60) + '\n')

    console.log('✅ Next Steps:')
    console.log('   1. Start Sanity Studio: npm run dev')
    console.log('   2. Open "Mandala Fargelegging Blomster" subcategory')
    console.log('   3. Look for language selector in top-right')
    console.log('   4. Click "Create Swedish translation" to test')
    console.log('   5. Open any drawing from this subcategory')
    console.log('   6. Verify language selector also appears on drawings\n')
    console.log('='.repeat(60) + '\n')
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    console.log('\n='.repeat(60) + '\n')
    throw error
  }
}

// Run the migration
migrateMandalaBlomster()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
