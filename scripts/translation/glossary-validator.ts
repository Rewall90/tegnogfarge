/**
 * Glossary Validator
 * Verifies that translations follow the glossary terms
 */

import { TRANSLATION_GLOSSARY } from './glossary';

export interface GlossaryViolation {
  norwegianTerm: string;
  expectedSwedish: string;
  foundInNorwegian: boolean;
  foundInSwedish: boolean;
  context?: string;
}

export interface GlossaryValidationResult {
  isValid: boolean;
  violations: GlossaryViolation[];
  totalTermsFound: number;
  termsValidated: number;
}

/**
 * Normalize text for comparison
 * Lowercase, trim, remove extra whitespace
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Check if a term appears in text (case-insensitive, word boundary aware)
 */
function containsTerm(text: string, term: string): boolean {
  const normalized = normalizeText(text);
  const normalizedTerm = normalizeText(term);

  // Word boundary regex to avoid partial matches
  // e.g., "fargelegg" should match but "fargelegen" should not
  const regex = new RegExp(`\\b${normalizedTerm}\\b`, 'i');
  return regex.test(normalized);
}

/**
 * Validate a single field translation against glossary
 */
export function validateFieldTranslation(
  norwegianText: string,
  swedishText: string,
  fieldName?: string
): GlossaryValidationResult {
  const violations: GlossaryViolation[] = [];
  let totalTermsFound = 0;
  let termsValidated = 0;

  // Check each glossary entry
  for (const [norwegianTerm, expectedSwedish] of Object.entries(TRANSLATION_GLOSSARY)) {
    // Check if Norwegian term appears in original text
    const foundInNorwegian = containsTerm(norwegianText, norwegianTerm);

    if (foundInNorwegian) {
      totalTermsFound++;

      // Check if expected Swedish term appears in translation
      const foundInSwedish = containsTerm(swedishText, expectedSwedish);

      if (foundInSwedish) {
        termsValidated++;
      } else {
        // Glossary violation: Norwegian term was in source but Swedish equivalent not in translation
        violations.push({
          norwegianTerm,
          expectedSwedish,
          foundInNorwegian: true,
          foundInSwedish: false,
          context: fieldName,
        });
      }
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
    totalTermsFound,
    termsValidated,
  };
}

/**
 * Validate entire document translation against glossary
 */
export function validateDocumentTranslation(
  originalFields: Record<string, any>,
  translatedFields: Record<string, any>
): {
  isValid: boolean;
  fieldResults: Record<string, GlossaryValidationResult>;
  totalViolations: number;
} {
  const fieldResults: Record<string, GlossaryValidationResult> = {};
  let totalViolations = 0;

  // Check each translated field
  for (const [fieldName, translatedValue] of Object.entries(translatedFields)) {
    const originalValue = originalFields[fieldName];

    // Only validate string fields
    if (typeof originalValue === 'string' && typeof translatedValue === 'string') {
      const result = validateFieldTranslation(originalValue, translatedValue, fieldName);
      fieldResults[fieldName] = result;
      totalViolations += result.violations.length;
    }
  }

  return {
    isValid: totalViolations === 0,
    fieldResults,
    totalViolations,
  };
}

/**
 * Format glossary violation for logging
 */
export function formatViolation(violation: GlossaryViolation): string {
  let message = `"${violation.norwegianTerm}" should translate to "${violation.expectedSwedish}"`;

  if (violation.context) {
    message += ` (in field: ${violation.context})`;
  }

  return message;
}

/**
 * Print validation summary
 */
export function printValidationSummary(
  documentTitle: string,
  results: { isValid: boolean; fieldResults: Record<string, GlossaryValidationResult>; totalViolations: number }
): void {
  if (results.isValid) {
    console.log(`  ✓ Glossary compliance: All terms validated`);
    return;
  }

  console.log(`  ⚠️  Glossary violations found (${results.totalViolations}):`);

  for (const [fieldName, fieldResult] of Object.entries(results.fieldResults)) {
    if (fieldResult.violations.length > 0) {
      console.log(`    Field: ${fieldName}`);
      for (const violation of fieldResult.violations) {
        console.log(`      - ${formatViolation(violation)}`);
      }
    }
  }
}

/**
 * Get glossary terms that appear in Norwegian text
 * Useful for debugging and analysis
 */
export function findGlossaryTermsInText(text: string): Array<{
  norwegianTerm: string;
  swedishTerm: string;
}> {
  const found: Array<{ norwegianTerm: string; swedishTerm: string }> = [];

  for (const [norwegianTerm, swedishTerm] of Object.entries(TRANSLATION_GLOSSARY)) {
    if (containsTerm(text, norwegianTerm)) {
      found.push({ norwegianTerm, swedishTerm });
    }
  }

  return found;
}
