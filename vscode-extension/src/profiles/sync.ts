/**
 * Profile synchronization with browser extension
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ProfileManager } from './manager';

export class ProfileSyncManager {
  private context: vscode.ExtensionContext;
  private profileManager: ProfileManager;
  private watcher: vscode.FileSystemWatcher | undefined;
  private syncFilePath: string;

  constructor(context: vscode.ExtensionContext, profileManager: ProfileManager) {
    this.context = context;
    this.profileManager = profileManager;

    // Get sync file path from settings or use default
    const config = vscode.workspace.getConfiguration('promptiply');
    const customPath = config.get<string>('sync.filePath');

    if (customPath) {
      this.syncFilePath = customPath;
    } else {
      // Default to user's home directory
      const homeDir = process.env.HOME || process.env.USERPROFILE || '';
      this.syncFilePath = path.join(homeDir, '.promptiply-profiles.json');
    }
  }

  /**
   * Enable automatic sync
   */
  async enableSync(): Promise<void> {
    // Export current profiles to sync file
    await this.exportToSyncFile();

    // Watch for changes to the sync file
    this.watcher = vscode.workspace.createFileSystemWatcher(this.syncFilePath);

    this.watcher.onDidChange(async () => {
      await this.importFromSyncFile();
    });

    this.context.subscriptions.push(this.watcher);

    vscode.window.showInformationMessage(
      `Profile sync enabled! Sync file: ${this.syncFilePath}`
    );
  }

  /**
   * Disable automatic sync
   */
  async disableSync(): Promise<void> {
    if (this.watcher) {
      this.watcher.dispose();
      this.watcher = undefined;
    }

    vscode.window.showInformationMessage('Profile sync disabled');
  }

  /**
   * Check if sync is enabled
   */
  isSyncEnabled(): boolean {
    const config = vscode.workspace.getConfiguration('promptiply');
    return config.get<boolean>('sync.enabled', false);
  }

  /**
   * Export profiles to sync file
   */
  async exportToSyncFile(): Promise<void> {
    try {
      const json = await this.profileManager.exportProfiles();

      // Ensure directory exists
      const dir = path.dirname(this.syncFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write to file
      fs.writeFileSync(this.syncFilePath, json, 'utf-8');

      vscode.window.showInformationMessage(
        `Profiles exported to: ${this.syncFilePath}`
      );
    } catch (error: any) {
      vscode.window.showErrorMessage(`Export failed: ${error.message}`);
    }
  }

  /**
   * Import profiles from sync file
   */
  async importFromSyncFile(): Promise<void> {
    try {
      if (!fs.existsSync(this.syncFilePath)) {
        vscode.window.showWarningMessage('Sync file not found');
        return;
      }

      const json = fs.readFileSync(this.syncFilePath, 'utf-8');
      const count = await this.profileManager.importProfiles(json);

      vscode.window.showInformationMessage(
        `Imported ${count} profile${count !== 1 ? 's' : ''} from sync file`
      );
    } catch (error: any) {
      vscode.window.showErrorMessage(`Import failed: ${error.message}`);
    }
  }

  /**
   * Get sync file path
   */
  getSyncFilePath(): string {
    return this.syncFilePath;
  }

  /**
   * Set sync file path
   */
  async setSyncFilePath(filePath: string): Promise<void> {
    this.syncFilePath = filePath;

    const config = vscode.workspace.getConfiguration('promptiply');
    await config.update('sync.filePath', filePath, vscode.ConfigurationTarget.Global);

    vscode.window.showInformationMessage(`Sync file updated: ${filePath}`);
  }

  /**
   * Sync now (manual sync)
   */
  async syncNow(): Promise<void> {
    const action = await vscode.window.showQuickPick(
      [
        { label: '📤 Export to Sync File', value: 'export' },
        { label: '📥 Import from Sync File', value: 'import' },
        { label: '🔄 Two-Way Sync (Merge)', value: 'merge' },
      ],
      { placeHolder: 'Choose sync direction' }
    );

    if (!action) {
      return;
    }

    switch (action.value) {
      case 'export':
        await this.exportToSyncFile();
        break;
      case 'import':
        await this.importFromSyncFile();
        break;
      case 'merge':
        await this.mergeProfiles();
        break;
    }
  }

  /**
   * Merge profiles from sync file with local profiles
   */
  private async mergeProfiles(): Promise<void> {
    try {
      if (!fs.existsSync(this.syncFilePath)) {
        vscode.window.showWarningMessage('Sync file not found. Creating new one...');
        await this.exportToSyncFile();
        return;
      }

      // Read sync file
      const json = fs.readFileSync(this.syncFilePath, 'utf-8');
      const syncProfiles = JSON.parse(json);

      // Get local profiles
      const localConfig = await this.profileManager.getProfiles();

      // Merge logic: use most recent version of each profile
      const merged = new Map();

      // Add all local profiles
      for (const profile of localConfig.list) {
        merged.set(profile.id, profile);
      }

      // Add/update from sync file
      let added = 0;
      let updated = 0;

      for (const syncProfile of syncProfiles) {
        if (merged.has(syncProfile.id)) {
          // Profile exists - check which is newer
          const local = merged.get(syncProfile.id);
          const localUsage = local.evolving_profile?.usageCount || 0;
          const syncUsage = syncProfile.evolving_profile?.usageCount || 0;

          if (syncUsage > localUsage) {
            merged.set(syncProfile.id, syncProfile);
            updated++;
          }
        } else {
          // New profile from sync
          merged.set(syncProfile.id, syncProfile);
          added++;
        }
      }

      // Save merged profiles
      const mergedArray = Array.from(merged.values());
      const mergedJson = JSON.stringify(mergedArray, null, 2);

      // Update both local and sync file
      await this.profileManager.importProfiles(mergedJson);
      fs.writeFileSync(this.syncFilePath, mergedJson, 'utf-8');

      vscode.window.showInformationMessage(
        `Sync complete! Added: ${added}, Updated: ${updated}`
      );
    } catch (error: any) {
      vscode.window.showErrorMessage(`Merge failed: ${error.message}`);
    }
  }
}
