/**
 * Verification Script - Final Migration Results
 *
 * Verifies all documents have the language field and identifies any missing ones
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient()

async function verifyMigration() {
  console.log('\n' + '='.repeat(60))
  console.log('📊 FINAL MIGRATION VERIFICATION')
  console.log('='.repeat(60) + '\n')

  try {
    // Count documents with language field
    const withLanguage = await client.fetch(`count(*[
      _type in ["drawingImage", "category", "subcategory"]
      && defined(language)
    ])`)

    // Count total documents
    const total = await client.fetch(`count(*[
      _type in ["drawingImage", "category", "subcategory"]
    ])`)

    // Breakdown by type
    const drawings = await client.fetch(`count(*[_type == "drawingImage" && defined(language)])`)
    const categories = await client.fetch(`count(*[_type == "category" && defined(language)])`)
    const subcategories = await client.fetch(`count(*[_type == "subcategory" && defined(language)])`)

    console.log(`✅ Documents with language field: ${withLanguage} / ${total}\n`)
    console.log(`   Breakdown:`)
    console.log(`   - Drawings:      ${drawings}`)
    console.log(`   - Categories:    ${categories}`)
    console.log(`   - Subcategories: ${subcategories}`)

    // Find missing documents
    const missing = await client.fetch(`*[
      _type in ["drawingImage", "category", "subcategory"]
      && !defined(language)
    ]{
      _id,
      _type,
      title,
      "isDraft": _id in path("drafts.**")
    }`)

    if (missing.length > 0) {
      console.log(`\n⚠️  Missing language field (${missing.length} document${missing.length > 1 ? 's' : ''}):\n`)
      missing.forEach((doc: any) => {
        const status = doc.isDraft ? 'DRAFT' : 'PUBLISHED'
        const title = doc.title || 'Untitled'
        console.log(`   [${status}] ${doc._type}: ${title}`)
        console.log(`   ID: ${doc._id}\n`)
      })

      console.log('💡 Recommendation:')
      if (missing.some((d: any) => d.isDraft)) {
        console.log('   - Draft documents can be safely ignored or deleted')
        console.log('   - Only published documents need the language field')
      }
      console.log('   - Run migration script again to catch these documents')
      console.log('   - Or manually add language field in Sanity Studio\n')
    } else {
      console.log('\n✅ All documents have the language field!')
      console.log('   Migration is 100% complete!\n')
    }

    console.log('='.repeat(60))
    console.log('📋 Summary:')
    console.log(`   Total documents:        ${total}`)
    console.log(`   Migrated:               ${withLanguage}`)
    console.log(`   Success rate:           ${((withLanguage / total) * 100).toFixed(2)}%`)

    if (missing.length === 0) {
      console.log('\n🎉 Phase 1 (Sanity i18n) - COMPLETE!')
      console.log('   Ready for Next.js i18n setup')
    }

    console.log('='.repeat(60) + '\n')

  } catch (error) {
    console.error('\n❌ Error during verification:', error)
    throw error
  }
}

verifyMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
