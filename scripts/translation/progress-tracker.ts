/**
 * Progress Tracker for Translation Script
 * Saves progress to file to allow resuming after failures
 */

import * as fs from 'fs';
import * as path from 'path';
import type { DocumentType } from './types';

export interface TranslationProgress {
  sessionId: string;
  startTime: string;
  lastUpdate: string;
  documentType: DocumentType;
  targetLanguage: string;
  completed: {
    [documentId: string]: {
      originalId: string;
      translatedId: string;
      title: string;
      timestamp: string;
      glossaryViolations?: number;
    };
  };
  failed: {
    [documentId: string]: {
      title: string;
      error: string;
      errorDetails?: {
        fieldName?: string;
        errorType?: string;
        stack?: string;
      };
      timestamp: string;
      attempts: number;
    };
  };
  glossaryWarnings?: {
    [documentId: string]: {
      title: string;
      violationCount: number;
      violations: Array<{
        fieldName: string;
        norwegianTerm: string;
        expectedSwedish: string;
      }>;
    };
  };
  stats: {
    total: number;
    success: number;
    failed: number;
    skipped: number;
    glossaryViolations?: number;
  };
}

const PROGRESS_DIR = path.join(process.cwd(), '.translation-progress');
const PROGRESS_FILE = path.join(PROGRESS_DIR, 'current-progress.json');

/**
 * Initialize progress tracker
 */
export function initProgressTracker(
  documentType: DocumentType,
  targetLanguage: string = 'sv'
): TranslationProgress {
  // Ensure progress directory exists
  if (!fs.existsSync(PROGRESS_DIR)) {
    fs.mkdirSync(PROGRESS_DIR, { recursive: true });
  }

  const progress: TranslationProgress = {
    sessionId: `${documentType}-${Date.now()}`,
    startTime: new Date().toISOString(),
    lastUpdate: new Date().toISOString(),
    documentType,
    targetLanguage,
    completed: {},
    failed: {},
    stats: {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0,
    },
  };

  return progress;
}

/**
 * Load existing progress from file
 */
export function loadProgress(): TranslationProgress | null {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = fs.readFileSync(PROGRESS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('⚠ Failed to load progress file:', error);
  }
  return null;
}

/**
 * Save progress to file
 */
export function saveProgress(progress: TranslationProgress): void {
  try {
    progress.lastUpdate = new Date().toISOString();
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');
  } catch (error) {
    console.error('✗ Failed to save progress:', error);
  }
}

/**
 * Record successful translation
 */
export function recordSuccess(
  progress: TranslationProgress,
  originalId: string,
  translatedId: string,
  title: string,
  glossaryViolations?: number
): void {
  progress.completed[originalId] = {
    originalId,
    translatedId,
    title,
    timestamp: new Date().toISOString(),
    glossaryViolations,
  };
  progress.stats.success++;

  // Track glossary violations count
  if (glossaryViolations && glossaryViolations > 0) {
    progress.stats.glossaryViolations = (progress.stats.glossaryViolations || 0) + glossaryViolations;
  }

  saveProgress(progress);
}

/**
 * Record glossary warning (non-critical)
 */
export function recordGlossaryWarning(
  progress: TranslationProgress,
  documentId: string,
  title: string,
  violations: Array<{
    fieldName: string;
    norwegianTerm: string;
    expectedSwedish: string;
  }>
): void {
  if (!progress.glossaryWarnings) {
    progress.glossaryWarnings = {};
  }

  progress.glossaryWarnings[documentId] = {
    title,
    violationCount: violations.length,
    violations,
  };

  saveProgress(progress);
}

/**
 * Record failed translation with detailed error information
 */
export function recordFailure(
  progress: TranslationProgress,
  documentId: string,
  title: string,
  error: string,
  attempts: number = 1,
  errorDetails?: {
    fieldName?: string;
    errorType?: string;
    stack?: string;
  }
): void {
  if (progress.failed[documentId]) {
    progress.failed[documentId].attempts++;
    progress.failed[documentId].error = error;
    progress.failed[documentId].timestamp = new Date().toISOString();
    // Update error details if provided
    if (errorDetails) {
      progress.failed[documentId].errorDetails = errorDetails;
    }
  } else {
    progress.failed[documentId] = {
      title,
      error,
      errorDetails,
      timestamp: new Date().toISOString(),
      attempts,
    };
    progress.stats.failed++;
  }
  saveProgress(progress);
}

/**
 * Record skipped document
 */
export function recordSkipped(progress: TranslationProgress): void {
  progress.stats.skipped++;
  saveProgress(progress);
}

/**
 * Check if document was already translated in this session
 */
export function isDocumentCompleted(
  progress: TranslationProgress,
  documentId: string
): boolean {
  return !!progress.completed[documentId];
}

/**
 * Get list of completed document IDs
 */
export function getCompletedIds(progress: TranslationProgress): string[] {
  return Object.keys(progress.completed);
}

/**
 * Get list of failed document IDs
 */
export function getFailedIds(progress: TranslationProgress): string[] {
  return Object.keys(progress.failed);
}

/**
 * Clear progress file (start fresh)
 */
export function clearProgress(): void {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      fs.unlinkSync(PROGRESS_FILE);
      console.log('✓ Cleared previous progress');
    }
  } catch (error) {
    console.error('✗ Failed to clear progress:', error);
  }
}

/**
 * Archive current progress (create backup)
 */
export function archiveProgress(): void {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const progress = loadProgress();
      if (progress) {
        const archiveFile = path.join(
          PROGRESS_DIR,
          `progress-${progress.sessionId}.json`
        );
        fs.copyFileSync(PROGRESS_FILE, archiveFile);
        console.log(`✓ Archived progress to ${path.basename(archiveFile)}`);
      }
    }
  } catch (error) {
    console.error('✗ Failed to archive progress:', error);
  }
}

/**
 * Print progress summary
 */
export function printProgressSummary(progress: TranslationProgress): void {
  const duration =
    new Date().getTime() - new Date(progress.startTime).getTime();
  const durationMinutes = Math.floor(duration / 60000);
  const durationSeconds = Math.floor((duration % 60000) / 1000);

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Progress Summary:');
  console.log(`  Session ID: ${progress.sessionId}`);
  console.log(`  Document Type: ${progress.documentType}`);
  console.log(`  Target Language: ${progress.targetLanguage}`);
  console.log(`  Duration: ${durationMinutes}m ${durationSeconds}s`);
  console.log('\nResults:');
  console.log(`  ✓ Success: ${progress.stats.success}`);
  console.log(`  ⊘ Skipped: ${progress.stats.skipped}`);
  console.log(`  ✗ Failed: ${progress.stats.failed}`);
  if (progress.stats.glossaryViolations) {
    console.log(`  📖 Glossary violations: ${progress.stats.glossaryViolations}`);
  }

  if (progress.stats.failed > 0) {
    console.log('\nFailed Documents:');
    for (const [id, failure] of Object.entries(progress.failed)) {
      console.log(`  - ${failure.title} (${failure.attempts} attempts)`);
      console.log(`    Error: ${failure.error}`);
      if (failure.errorDetails) {
        if (failure.errorDetails.fieldName) {
          console.log(`    Field: ${failure.errorDetails.fieldName}`);
        }
        if (failure.errorDetails.errorType) {
          console.log(`    Type: ${failure.errorDetails.errorType}`);
        }
        if (failure.errorDetails.stack) {
          console.log(`    Stack: ${failure.errorDetails.stack.split('\n')[0]}`);
        }
      }
    }
  }

  // Display glossary warnings
  if (progress.glossaryWarnings && Object.keys(progress.glossaryWarnings).length > 0) {
    console.log('\nGlossary Warnings (Review Recommended):');
    for (const [id, warning] of Object.entries(progress.glossaryWarnings)) {
      console.log(`  - ${warning.title} (${warning.violationCount} violations)`);
      for (const violation of warning.violations.slice(0, 3)) { // Show max 3
        console.log(`    • "${violation.norwegianTerm}" → should be "${violation.expectedSwedish}" (in ${violation.fieldName})`);
      }
      if (warning.violations.length > 3) {
        console.log(`    ... and ${warning.violations.length - 3} more`);
      }
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Check for partial translation state (dangerous!)
 */
export async function checkPartialTranslation(
  getSanityClient: () => any,
  documentType: DocumentType,
  targetLanguage: string = 'sv'
): Promise<{
  hasPartial: boolean;
  norwegianCount: number;
  swedishCount: number;
  message: string;
}> {
  const client = getSanityClient();

  const [norwegianCount, swedishCount] = await Promise.all([
    client.fetch(`count(*[_type == $documentType && language == "no"])`, {
      documentType,
    }),
    client.fetch(`count(*[_type == $documentType && language == $targetLanguage])`, {
      documentType,
      targetLanguage,
    }),
  ]);

  const hasPartial = swedishCount > 0 && swedishCount < norwegianCount;

  let message = '';
  if (hasPartial) {
    message = `⚠️  WARNING: Partial translation detected!
  Norwegian ${documentType}s: ${norwegianCount}
  Swedish ${documentType}s: ${swedishCount}
  Missing: ${norwegianCount - swedishCount}

  This may indicate a previous failed translation run.
  Recommendations:
  1. Resume translation: Script will skip existing and translate missing
  2. Or clean up: Delete Swedish documents and start fresh`;
  }

  return {
    hasPartial,
    norwegianCount,
    swedishCount,
    message,
  };
}

/**
 * Resume prompt - ask user what to do with partial translation
 */
export function shouldResume(): boolean {
  // In non-interactive mode, always resume
  if (!process.stdin.isTTY) {
    return true;
  }

  // For now, auto-resume (can enhance with readline prompt if needed)
  console.log('\n💡 Resuming from previous progress...\n');
  return true;
}
