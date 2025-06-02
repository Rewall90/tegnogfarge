// Dette scriptet må kjøres lokalt med Node.js
const sharp = require('sharp');
const { createClient } = require('@sanity/client');
const imageUrlBuilder = require('@sanity/image-url');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  token: process.env.SANITY_WRITE_TOKEN, // Trenger skrivetilgang
  useCdn: false
});

const builder = imageUrlBuilder(client);

async function migrateImages() {
  // Hent alle bilder som har digital coloring
  const images = await client.fetch(`
    *[_type == "drawingImage" && hasDigitalColoring == true && !defined(webpImage)] {
      _id,
      title,
      mainImage
    }
  `);

  console.log(`Fant ${images.length} bilder som må konverteres`);

  for (const image of images) {
    try {
      // Hent original bilde
      const imageUrl = builder.image(image.mainImage).url();
      // Last ned og konverter til WebP
      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();
      const webpBuffer = await sharp(Buffer.from(buffer))
        .webp({ quality: 90 })
        .toBuffer();
      // Last opp WebP til Sanity
      const asset = await client.assets.upload('image', webpBuffer, {
        filename: `${image.title.replace(/\s+/g, '-').toLowerCase()}.webp`,
        contentType: 'image/webp'
      });
      // Oppdater dokument med WebP referanse
      await client
        .patch(image._id)
        .set({
          webpImage: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: asset._id
            }
          }
        })
        .commit();
      console.log(`✓ Konvertert: ${image.title}`);
    } catch (error) {
      console.error(`✗ Feil ved konvertering av ${image.title}:`, error);
    }
  }
}

migrateImages(); 