#!/usr/bin/env ts-node

import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-01-13',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

interface QAIssue {
  documentId: string;
  documentTitle: string;
  category: string;
  subcategory: string;
  issueType: string;
  field: string;
  details: string;
}

async function comprehensiveQACheck() {
  console.log('🔍 COMPREHENSIVE QUALITY ASSURANCE CHECK\n');
  console.log('='.repeat(80));
  console.log('\nChecking all Swedish translations for completeness and quality...\n');

  const issues: QAIssue[] = [];

  // Get all Norwegian categories
  const categories = await client.fetch(`
    *[_type == "category" && language == "no" && isActive == true] | order(title asc) {
      _id,
      title
    }
  `);

  let totalDrawings = 0;
  let totalTranslated = 0;
  let totalMissing = 0;

  for (const category of categories) {
    console.log(`\n📂 Checking: ${category.title}`);

    // Get all subcategories
    const subcategories = await client.fetch(`
      *[_type == "subcategory" && language == "no" && parentCategory._ref == $categoryId && isActive == true] {
        _id,
        title
      }
    `, { categoryId: category._id });

    for (const subcategory of subcategories) {
      // Get all Norwegian drawings
      const norwegianDrawings = await client.fetch(`
        *[_type == "drawingImage" && language == "no" && isActive == true && subcategory._ref == $subcategoryId && !(_id in path("drafts.**"))] {
          _id,
          title,
          description,
          metaDescription,
          contextContent
        }
      `, { subcategoryId: subcategory._id });

      totalDrawings += norwegianDrawings.length;

      for (const norDrawing of norwegianDrawings) {
        // Find Swedish translation
        const swedishDrawing = await client.fetch(`
          *[_type == "drawingImage" && language == "sv" && baseDocumentId == $baseId][0] {
            _id,
            title,
            description,
            metaDescription,
            contextContent,
            slug
          }
        `, { baseId: norDrawing._id });

        if (!swedishDrawing) {
          totalMissing++;
          issues.push({
            documentId: norDrawing._id,
            documentTitle: norDrawing.title,
            category: category.title,
            subcategory: subcategory.title,
            issueType: 'MISSING_TRANSLATION',
            field: 'all',
            details: 'No Swedish translation exists'
          });
          continue;
        }

        totalTranslated++;

        // Check required fields
        if (!swedishDrawing.title || swedishDrawing.title.trim() === '') {
          issues.push({
            documentId: swedishDrawing._id,
            documentTitle: norDrawing.title,
            category: category.title,
            subcategory: subcategory.title,
            issueType: 'EMPTY_FIELD',
            field: 'title',
            details: 'Title is empty'
          });
        }

        if (!swedishDrawing.description || swedishDrawing.description.trim() === '') {
          issues.push({
            documentId: swedishDrawing._id,
            documentTitle: norDrawing.title,
            category: category.title,
            subcategory: subcategory.title,
            issueType: 'EMPTY_FIELD',
            field: 'description',
            details: 'Description is empty'
          });
        }

        if (!swedishDrawing.metaDescription || swedishDrawing.metaDescription.trim() === '') {
          issues.push({
            documentId: swedishDrawing._id,
            documentTitle: norDrawing.title,
            category: category.title,
            subcategory: subcategory.title,
            issueType: 'EMPTY_FIELD',
            field: 'metaDescription',
            details: 'Meta description is empty'
          });
        }

        // Check if slug exists
        if (!swedishDrawing.slug || !swedishDrawing.slug.current) {
          issues.push({
            documentId: swedishDrawing._id,
            documentTitle: norDrawing.title,
            category: category.title,
            subcategory: subcategory.title,
            issueType: 'EMPTY_FIELD',
            field: 'slug',
            details: 'Slug is missing'
          });
        }

        // Check contextContent if original has it
        if (norDrawing.contextContent && norDrawing.contextContent.length > 0) {
          if (!swedishDrawing.contextContent || swedishDrawing.contextContent.length === 0) {
            issues.push({
              documentId: swedishDrawing._id,
              documentTitle: norDrawing.title,
              category: category.title,
              subcategory: subcategory.title,
              issueType: 'EMPTY_FIELD',
              field: 'contextContent',
              details: 'Context content is missing but exists in Norwegian version'
            });
          }
        }
      }
    }
  }

  // Print Summary
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 QA CHECK SUMMARY\n');
  console.log(`Total Norwegian drawings: ${totalDrawings}`);
  console.log(`Translated to Swedish: ${totalTranslated}`);
  console.log(`Missing translations: ${totalMissing}`);
  console.log(`Translation coverage: ${((totalTranslated / totalDrawings) * 100).toFixed(2)}%\n`);

  if (issues.length === 0) {
    console.log('✅ ✅ ✅ PERFECT! NO ISSUES FOUND! ✅ ✅ ✅\n');
    console.log('All drawings are translated and all required fields are filled out correctly!\n');
  } else {
    console.log(`⚠️  Found ${issues.length} issues:\n`);

    // Group by issue type
    const missingTranslations = issues.filter(i => i.issueType === 'MISSING_TRANSLATION');
    const emptyFields = issues.filter(i => i.issueType === 'EMPTY_FIELD');

    if (missingTranslations.length > 0) {
      console.log(`\n🔴 MISSING TRANSLATIONS (${missingTranslations.length}):\n`);
      missingTranslations.forEach(issue => {
        console.log(`  • ${issue.category} > ${issue.subcategory} > "${issue.documentTitle}"`);
        console.log(`    ID: ${issue.documentId}`);
      });
    }

    if (emptyFields.length > 0) {
      console.log(`\n⚠️  EMPTY FIELDS (${emptyFields.length}):\n`);

      // Group by field
      const fieldGroups = emptyFields.reduce((acc, issue) => {
        if (!acc[issue.field]) acc[issue.field] = [];
        acc[issue.field].push(issue);
        return acc;
      }, {} as Record<string, QAIssue[]>);

      Object.entries(fieldGroups).forEach(([field, fieldIssues]) => {
        console.log(`  📝 Empty ${field} (${fieldIssues.length} drawings):`);
        fieldIssues.slice(0, 10).forEach(issue => {
          console.log(`    • ${issue.category} > ${issue.subcategory} > "${issue.documentTitle}"`);
          console.log(`      ID: ${issue.documentId}`);
        });
        if (fieldIssues.length > 10) {
          console.log(`    ... and ${fieldIssues.length - 10} more`);
        }
        console.log('');
      });
    }
  }

  console.log('='.repeat(80));
  console.log('\n✅ QA Check Complete!\n');
}

comprehensiveQACheck().catch(console.error);
