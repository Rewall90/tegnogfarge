/**
 * Migration Script: Add language field to existing documents
 *
 * This script adds the 'language' field with value 'no' to all existing
 * drawingImage, category, and subcategory documents that don't have it.
 *
 * Required for @sanity/document-internationalization plugin to work.
 *
 * USAGE:
 *   DRY RUN (preview only):  npm run migrate:language:dry
 *   ACTUAL RUN:              npm run migrate:language
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient()

// Dry run flag - defaults to true for safety
const DRY_RUN = process.env.DRY_RUN !== 'false'

interface Document {
  _id: string
  _type: string
  title?: string
  language?: string
}

async function migrateLanguageField() {
  console.log('\n' + '='.repeat(60))
  console.log('🌍 LANGUAGE FIELD MIGRATION')
  console.log('='.repeat(60))
  console.log(`📋 Mode: ${DRY_RUN ? 'DRY RUN (preview only)' : '⚠️  LIVE MIGRATION'}`)
  console.log(`📅 Date: ${new Date().toISOString()}`)
  console.log('='.repeat(60) + '\n')

  try {
    // Fetch all documents that need migration
    const query = `*[
      _type in ["drawingImage", "category", "subcategory"]
      && !defined(language)
    ] {_id, _type, title}`

    console.log('🔍 Querying documents without language field...')
    const documents: Document[] = await client.fetch(query)

    if (documents.length === 0) {
      console.log('✅ No documents need migration - all documents already have language field')
      console.log('\n' + '='.repeat(60))
      return
    }

    // Count by type
    const counts = {
      drawingImage: documents.filter((d) => d._type === 'drawingImage').length,
      category: documents.filter((d) => d._type === 'category').length,
      subcategory: documents.filter((d) => d._type === 'subcategory').length,
    }

    console.log(`\n📊 Found ${documents.length} documents to migrate:\n`)
    console.log(`   📸 drawingImage:  ${counts.drawingImage}`)
    console.log(`   📁 category:      ${counts.category}`)
    console.log(`   📂 subcategory:   ${counts.subcategory}`)
    console.log('')

    if (DRY_RUN) {
      console.log('─'.repeat(60))
      console.log('📋 DRY RUN - Preview of documents to be updated:')
      console.log('─'.repeat(60) + '\n')

      // Show first 10 documents as preview
      const preview = documents.slice(0, 10)
      preview.forEach((doc, index) => {
        const title = doc.title || '(no title)'
        const truncatedTitle = title.length > 40 ? title.substring(0, 40) + '...' : title
        console.log(`${index + 1}. ${doc._type.padEnd(15)} → ${truncatedTitle}`)
      })

      if (documents.length > 10) {
        console.log(`   ... and ${documents.length - 10} more documents`)
      }

      console.log('\n' + '─'.repeat(60))
      console.log('⚠️  No changes have been made (DRY RUN mode)')
      console.log('─'.repeat(60))
      console.log('\n💡 To apply these changes, run:')
      console.log('   npm run migrate:language\n')
      console.log('='.repeat(60) + '\n')
      return
    }

    // --- ACTUAL MIGRATION ---
    console.log('🚀 Starting migration...\n')

    // Process in batches of 100 for safety
    const BATCH_SIZE = 100
    let processed = 0

    for (let i = 0; i < documents.length; i += BATCH_SIZE) {
      const batch = documents.slice(i, i + BATCH_SIZE)

      // Create transaction for this batch
      let transaction = client.transaction()

      batch.forEach((doc) => {
        transaction = transaction.patch(doc._id, (patch) => patch.setIfMissing({language: 'no'}))
      })

      // Commit the transaction
      try {
        await transaction.commit()
        processed += batch.length
        const progress = Math.round((processed / documents.length) * 100)
        console.log(`   ✅ Processed ${processed}/${documents.length} (${progress}%)`)
      } catch (error) {
        console.error(`   ❌ Error processing batch ${i}-${i + batch.length}:`, error)
        throw error
      }
    }

    console.log('\n🎉 Migration completed successfully!')

    // --- VERIFICATION ---
    console.log('\n🔍 Verifying migration...')

    const remainingQuery = `count(*[
      _type in ["drawingImage", "category", "subcategory"]
      && !defined(language)
    ])`

    const remaining = await client.fetch(remainingQuery)

    if (remaining > 0) {
      console.warn(`\n⚠️  WARNING: ${remaining} documents still missing language field`)
      console.warn('   Please run the migration again or investigate manually.\n')
    } else {
      console.log('✅ Verification passed: All documents now have language field\n')
    }

    // Show final statistics
    const totalWithLanguage = await client.fetch(
      `count(*[_type in ["drawingImage", "category", "subcategory"] && language == "no"])`
    )

    console.log('─'.repeat(60))
    console.log('📊 Final Statistics:')
    console.log('─'.repeat(60))
    console.log(`   Total documents with language='no': ${totalWithLanguage}`)
    console.log(`   Documents migrated in this run: ${processed}`)
    console.log('─'.repeat(60) + '\n')

    console.log('✅ Migration complete! You can now:')
    console.log('   1. Start Sanity Studio: npm run dev')
    console.log('   2. Open any existing document')
    console.log('   3. Look for language selector in top-right')
    console.log('   4. Click "Create Swedish translation" to test\n')
    console.log('='.repeat(60) + '\n')
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    console.log('\n💡 Troubleshooting:')
    console.log('   - Check your Sanity credentials in .env')
    console.log('   - Ensure you have write access to the dataset')
    console.log('   - Try running in DRY_RUN mode first: npm run migrate:language:dry')
    console.log('='.repeat(60) + '\n')
    throw error
  }
}

// Run the migration
migrateLanguageField()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
