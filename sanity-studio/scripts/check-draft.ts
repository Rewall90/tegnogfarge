import {getCliClient} from 'sanity/cli'

const client = getCliClient()

async function checkDraft() {
  const draftId = 'drafts.drawingImage-sol-og-blomster-om-sommeren-1750335798'
  const publishedId = 'drawingImage-sol-og-blomster-om-sommeren-1750335798'

  const draft = await client.fetch(`*[_id == $id][0]{_id, title, language}`, {id: draftId})
  const published = await client.fetch(`*[_id == $id][0]{_id, title, language}`, {
    id: publishedId,
  })

  console.log('\n📄 Document Status Check:\n')
  console.log('Draft version:', draft ? `Exists (language: ${draft.language || 'NOT SET'})` : 'Does not exist')
  console.log(
    'Published version:',
    published ? `Exists (language: ${published.language || 'NOT SET'})` : 'Does not exist',
  )

  if (draft && !published) {
    console.log('\n✅ SAFE TO IGNORE: Only draft exists, no published version')
  } else if (draft && published) {
    if (!published.language) {
      console.log('\n⚠️  ISSUE: Published version missing language field!')
    } else {
      console.log('\n✅ OK: Published version has language field')
    }
  }
}

checkDraft()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err)
    process.exit(1)
  })
