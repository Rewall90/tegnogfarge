/**
 * ViewportStatePersistence - State persistence for toggle mode system
 * Handles saving and restoring zoom state across sessions
 */

import type { ViewportState, ViewportMode } from './types';

interface PersistedViewportState {
  scale: number;
  panX: number;
  panY: number;
  mode: ViewportMode;
  timestamp: number;
  version: string;
}

export class ViewportStatePersistence {
  private readonly STORAGE_KEY = 'tegnogfarge_viewport_state';
  private readonly STATE_VERSION = '1.0';
  private readonly MAX_AGE_HOURS = 24; // State expires after 24 hours
  private readonly STORAGE_ENABLED = typeof Storage !== 'undefined';

  /**
   * Save viewport state to localStorage
   */
  saveState(state: ViewportState): boolean {
    if (!this.STORAGE_ENABLED) {
      console.warn('localStorage not available, cannot save viewport state');
      return false;
    }

    try {
      const stateToSave: PersistedViewportState = {
        scale: state.scale,
        panX: state.panX,
        panY: state.panY,
        mode: state.mode,
        timestamp: Date.now(),
        version: this.STATE_VERSION
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateToSave));
      return true;
    } catch (error) {
      console.error('Failed to save viewport state:', error);
      return false;
    }
  }

  /**
   * Load viewport state from localStorage
   */
  loadState(): ViewportState | null {
    if (!this.STORAGE_ENABLED) {
      return null;
    }

    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      if (!savedData) {
        return null;
      }

      const parsed: PersistedViewportState = JSON.parse(savedData);

      // Validate state structure and version
      if (!this.isValidPersistedState(parsed)) {
        console.warn('Invalid persisted viewport state, ignoring');
        this.clearState();
        return null;
      }

      // Check if state is too old
      if (this.isStateExpired(parsed)) {
        console.info('Persisted viewport state is expired, ignoring');
        this.clearState();
        return null;
      }

      // Validate state values
      if (!this.isStateValueValid(parsed)) {
        console.warn('Persisted viewport state has invalid values, ignoring');
        this.clearState();
        return null;
      }

      return {
        scale: parsed.scale,
        panX: parsed.panX,
        panY: parsed.panY,
        mode: parsed.mode
      };
    } catch (error) {
      console.error('Failed to load viewport state:', error);
      this.clearState(); // Clear corrupted state
      return null;
    }
  }

  /**
   * Save only zoom state (used when switching from zoom to draw mode)
   */
  saveZoomState(state: ViewportState): boolean {
    if (!this.STORAGE_ENABLED) return false;

    try {
      const zoomState = {
        scale: state.scale,
        panX: state.panX,
        panY: state.panY,
        timestamp: Date.now(),
        version: this.STATE_VERSION
      };

      localStorage.setItem(`${this.STORAGE_KEY}_zoom`, JSON.stringify(zoomState));
      return true;
    } catch (error) {
      console.error('Failed to save zoom state:', error);
      return false;
    }
  }

  /**
   * Load only zoom state (used when switching from draw to zoom mode)
   */
  loadZoomState(): Partial<ViewportState> | null {
    if (!this.STORAGE_ENABLED) return null;

    try {
      const savedData = localStorage.getItem(`${this.STORAGE_KEY}_zoom`);
      if (!savedData) return null;

      const parsed = JSON.parse(savedData);

      // Basic validation
      if (!parsed.scale || !parsed.timestamp || !parsed.version) {
        return null;
      }

      // Check expiration (zoom state expires in 1 hour)
      if (Date.now() - parsed.timestamp > 3600000) {
        localStorage.removeItem(`${this.STORAGE_KEY}_zoom`);
        return null;
      }

      return {
        scale: parsed.scale,
        panX: parsed.panX,
        panY: parsed.panY
      };
    } catch (error) {
      console.error('Failed to load zoom state:', error);
      return null;
    }
  }

  /**
   * Clear all persisted state
   */
  clearState(): void {
    if (!this.STORAGE_ENABLED) return;

    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(`${this.STORAGE_KEY}_zoom`);
    } catch (error) {
      console.error('Failed to clear viewport state:', error);
    }
  }

  /**
   * Get state metadata
   */
  getStateMetadata(): {
    hasState: boolean;
    hasZoomState: boolean;
    stateAge?: number;
    zoomStateAge?: number;
  } {
    const metadata = {
      hasState: false,
      hasZoomState: false,
      stateAge: undefined as number | undefined,
      zoomStateAge: undefined as number | undefined
    };

    if (!this.STORAGE_ENABLED) return metadata;

    try {
      // Check main state
      const mainState = localStorage.getItem(this.STORAGE_KEY);
      if (mainState) {
        const parsed = JSON.parse(mainState);
        metadata.hasState = true;
        metadata.stateAge = Date.now() - parsed.timestamp;
      }

      // Check zoom state
      const zoomState = localStorage.getItem(`${this.STORAGE_KEY}_zoom`);
      if (zoomState) {
        const parsed = JSON.parse(zoomState);
        metadata.hasZoomState = true;
        metadata.zoomStateAge = Date.now() - parsed.timestamp;
      }
    } catch (error) {
      console.error('Failed to get state metadata:', error);
    }

    return metadata;
  }

  /**
   * Validate persisted state structure
   */
  private isValidPersistedState(state: any): state is PersistedViewportState {
    return (
      typeof state === 'object' &&
      state !== null &&
      typeof state.scale === 'number' &&
      typeof state.panX === 'number' &&
      typeof state.panY === 'number' &&
      typeof state.mode === 'string' &&
      typeof state.timestamp === 'number' &&
      typeof state.version === 'string' &&
      (state.mode === 'zoom' || state.mode === 'draw')
    );
  }

  /**
   * Check if state is expired
   */
  private isStateExpired(state: PersistedViewportState): boolean {
    const maxAge = this.MAX_AGE_HOURS * 60 * 60 * 1000; // Convert to milliseconds
    return Date.now() - state.timestamp > maxAge;
  }

  /**
   * Validate state values are within acceptable ranges
   */
  private isStateValueValid(state: PersistedViewportState): boolean {
    // Validate scale is within bounds
    if (state.scale < 0.1 || state.scale > 10) {
      return false;
    }

    // Validate pan values are reasonable (not NaN or infinity)
    if (!Number.isFinite(state.panX) || !Number.isFinite(state.panY)) {
      return false;
    }

    // Validate pan values are within reasonable bounds (-10000 to 10000)
    if (Math.abs(state.panX) > 10000 || Math.abs(state.panY) > 10000) {
      return false;
    }

    return true;
  }

  /**
   * Create a state backup before making changes
   */
  createBackup(state: ViewportState): string | null {
    if (!this.STORAGE_ENABLED) return null;

    try {
      const backupKey = `${this.STORAGE_KEY}_backup_${Date.now()}`;
      const backup: PersistedViewportState = {
        scale: state.scale,
        panX: state.panX,
        panY: state.panY,
        mode: state.mode,
        timestamp: Date.now(),
        version: this.STATE_VERSION
      };

      localStorage.setItem(backupKey, JSON.stringify(backup));
      return backupKey;
    } catch (error) {
      console.error('Failed to create state backup:', error);
      return null;
    }
  }

  /**
   * Restore from backup
   */
  restoreFromBackup(backupKey: string): ViewportState | null {
    if (!this.STORAGE_ENABLED) return null;

    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) return null;

      const parsed: PersistedViewportState = JSON.parse(backupData);
      
      if (!this.isValidPersistedState(parsed)) {
        return null;
      }

      return {
        scale: parsed.scale,
        panX: parsed.panX,
        panY: parsed.panY,
        mode: parsed.mode
      };
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      return null;
    }
  }

  /**
   * Clean up old backups (keep only last 5)
   */
  cleanupBackups(): void {
    if (!this.STORAGE_ENABLED) return;

    try {
      const backupKeys: string[] = [];
      
      // Find all backup keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${this.STORAGE_KEY}_backup_`)) {
          backupKeys.push(key);
        }
      }

      // Sort by timestamp (newest first)
      backupKeys.sort((a, b) => {
        const timestampA = parseInt(a.split('_').pop() || '0');
        const timestampB = parseInt(b.split('_').pop() || '0');
        return timestampB - timestampA;
      });

      // Remove old backups (keep only 5 most recent)
      if (backupKeys.length > 5) {
        for (let i = 5; i < backupKeys.length; i++) {
          localStorage.removeItem(backupKeys[i]);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup backups:', error);
    }
  }

  /**
   * Export state for debugging or migration
   */
  exportState(): string | null {
    const state = this.loadState();
    const zoomState = this.loadZoomState();
    const metadata = this.getStateMetadata();

    if (!state && !zoomState) return null;

    const exportData = {
      mainState: state,
      zoomState: zoomState,
      metadata: metadata,
      exportTimestamp: Date.now(),
      version: this.STATE_VERSION
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import state from exported data
   */
  importState(exportedData: string): boolean {
    try {
      const data = JSON.parse(exportedData);
      
      if (data.mainState) {
        this.saveState(data.mainState);
      }

      if (data.zoomState) {
        // Create a temporary state to save zoom state
        const tempState: ViewportState = {
          scale: data.zoomState.scale,
          panX: data.zoomState.panX,
          panY: data.zoomState.panY,
          mode: 'zoom'
        };
        this.saveZoomState(tempState);
      }

      return true;
    } catch (error) {
      console.error('Failed to import state:', error);
      return false;
    }
  }

  /**
   * Check if storage is available and working
   */
  isStorageAvailable(): boolean {
    if (!this.STORAGE_ENABLED) return false;

    try {
      const testKey = `${this.STORAGE_KEY}_test`;
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}