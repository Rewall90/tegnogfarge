// Test script to verify Sanity query
const { createClient } = require('next-sanity');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
});

async function testQuery() {
  try {
    console.log('Testing weekly collection query...');

    // First, get all collections
    const allCollections = await client.fetch(`
      *[_type == "weeklyCollection"] {
        _id,
        title,
        "slug": slug.current,
        isActive
      }
    `);

    console.log('\nAll weekly collections:', JSON.stringify(allCollections, null, 2));

    // Then try to get the specific one
    const slug = 'uke-1-fargebilder-desember-2025';
    const collection = await client.fetch(`
      *[_type == "weeklyCollection" && slug.current == $slug && isActive == true][0] {
        _id,
        title,
        "slug": slug.current,
        description,
        publishedDate,
        emailSentDate,
        isActive,
        content[] {
          ...,
          _type == "reference" => @->{
            _id,
            title,
            "slug": slug.current,
            description,
            "thumbnail": {
              "url": thumbnailImage.asset->url,
              "alt": thumbnailImage.alt,
              "lqip": thumbnailImage.asset->metadata.lqip
            },
            "pdfUrl": downloadFile.asset->url
          },
          _type == "emailColoringImage" => {
            title,
            description,
            "imageUrl": image.asset->url,
            "imageAlt": image.alt,
            "imageLqip": image.asset->metadata.lqip,
            "pdfUrl": pdfFile.asset->url
          }
        }
      }
    `, { slug });

    console.log('\nSpecific collection:', JSON.stringify(collection, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
}

testQuery();
