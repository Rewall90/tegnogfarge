/**
 * Process lock to prevent concurrent translation runs
 */

import * as fs from 'fs';
import * as path from 'path';

const LOCK_FILE = path.join(process.cwd(), '.translation-lock');
const LOCK_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours

export function acquireLock(): boolean {
  try {
    // Check if lock file exists
    if (fs.existsSync(LOCK_FILE)) {
      const lockData = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf-8'));
      const lockAge = Date.now() - lockData.timestamp;

      // If lock is older than timeout, it's stale - remove it
      if (lockAge > LOCK_TIMEOUT_MS) {
        console.warn('⚠️  Found stale lock file (>2 hours old), removing...');
        fs.unlinkSync(LOCK_FILE);
      } else {
        // Lock is fresh, another process is running
        console.error('\n❌ Translation script is already running!');
        console.error(`   Started: ${new Date(lockData.timestamp).toISOString()}`);
        console.error(`   PID: ${lockData.pid}`);
        console.error(`\n   If you're sure no other process is running, delete: ${LOCK_FILE}\n`);
        return false;
      }
    }

    // Create lock file
    fs.writeFileSync(
      LOCK_FILE,
      JSON.stringify({
        pid: process.pid,
        timestamp: Date.now(),
        started: new Date().toISOString(),
      }, null, 2)
    );

    // Register cleanup on exit
    process.on('exit', releaseLock);
    process.on('SIGINT', () => {
      releaseLock();
      process.exit(130);
    });
    process.on('SIGTERM', () => {
      releaseLock();
      process.exit(143);
    });
    process.on('uncaughtException', (err) => {
      console.error('Uncaught exception:', err);
      releaseLock();
      process.exit(1);
    });

    return true;
  } catch (error) {
    console.error('Error acquiring lock:', error);
    return false;
  }
}

export function releaseLock(): void {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
    }
  } catch (error) {
    // Ignore errors during cleanup
  }
}
