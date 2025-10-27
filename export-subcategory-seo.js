import { createClient } from '@sanity/client';
import { writeFileSync } from 'fs';

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function exportSubcategorySEO() {
  console.log('Fetching all subcategories from Sanity...');

  const subcategories = await client.fetch(`
    *[_type == "subcategory"] | order(title asc) {
      _id,
      title,
      "slug": slug.current,
      seoTitle,
      seoDescription,
      "parentCategory": parentCategory->title,
      isActive
    }
  `);

  console.log(`Found ${subcategories.length} subcategories`);

  // Create CSV header
  const csvHeader = 'Tittel,Slug,SEO Tittel,SEO Beskrivelse,Hovedkategori,Aktiv\n';

  // Create CSV rows
  const csvRows = subcategories.map(sub => {
    const title = escapeCSV(sub.title || '');
    const slug = escapeCSV(sub.slug || '');
    const seoTitle = escapeCSV(sub.seoTitle || '');
    const seoDescription = escapeCSV(sub.seoDescription || '');
    const parentCategory = escapeCSV(sub.parentCategory || '');
    const isActive = sub.isActive ? 'Ja' : 'Nei';

    return `${title},${slug},${seoTitle},${seoDescription},${parentCategory},${isActive}`;
  }).join('\n');

  const csvContent = csvHeader + csvRows;

  // Write to file
  const filename = 'underkategori-seo-export.csv';
  writeFileSync(filename, csvContent, 'utf-8');

  console.log(`\nCSV file created: ${filename}`);
  console.log(`Total subcategories exported: ${subcategories.length}`);

  // Show some statistics
  const withSeoTitle = subcategories.filter(s => s.seoTitle).length;
  const withSeoDescription = subcategories.filter(s => s.seoDescription).length;
  const activeSubcategories = subcategories.filter(s => s.isActive).length;

  console.log(`\nStatistics:`);
  console.log(`- Active subcategories: ${activeSubcategories}`);
  console.log(`- With SEO Title: ${withSeoTitle}`);
  console.log(`- With SEO Description: ${withSeoDescription}`);
  console.log(`- Missing SEO Title: ${subcategories.length - withSeoTitle}`);
  console.log(`- Missing SEO Description: ${subcategories.length - withSeoDescription}`);
}

// Helper function to escape CSV fields
function escapeCSV(field) {
  if (field === null || field === undefined) return '';

  // Convert to string
  field = String(field);

  // If field contains comma, newline, or quote, wrap in quotes and escape quotes
  if (field.includes(',') || field.includes('\n') || field.includes('"')) {
    return `"${field.replace(/"/g, '""')}"`;
  }

  return field;
}

exportSubcategorySEO().catch(console.error);
