/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 8, 2026
 * @file backend/src/infrastructure/scheduler/backup.config.ts
 * @desc Persistent runtime configuration for backup schedule and Dropbox sync.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import { promises as fs } from 'fs';
import path from 'path';

export type BackupFrequency = 'daily' | 'weekly' | 'monthly' | 'disabled';

/**
 * Runtime configuration for the backup subsystem.
 *
 * Note: This is stored on the server (not per-user) because backups are
 * an infrastructure/admin concern.
 */
export interface BackupRuntimeConfig {
  /**
   * Schedule frequency.
   */
  frequency: BackupFrequency;

  /**
   * Backup time in HH:MM (24h).
   */
  time: string;

  /**
   * Retention in days.
   */
  retentionDays: number;

  /**
   * Whether Dropbox backup sync is enabled.
   * Requires server-side Dropbox credentials.
   */
  dropboxSyncEnabled: boolean;

  /**
   * Last successful Dropbox sync timestamp.
   */
  lastDropboxSyncAt: string | null;
}

const DEFAULT_BACKUP_CONFIG: BackupRuntimeConfig = {
  frequency: 'daily',
  time: '02:00',
  retentionDays: 30,
  dropboxSyncEnabled: false,
  lastDropboxSyncAt: null,
};

function getBackupDir(): string {
  return path.join(process.cwd(), 'backups');
}

function getConfigPath(): string {
  return path.join(getBackupDir(), 'backup.config.json');
}

function isValidTime(time: unknown): time is string {
  if (typeof time !== 'string') return false;
  // HH:MM 24h
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

function clampRetentionDays(retentionDays: unknown): number {
  const parsed = typeof retentionDays === 'number' ? retentionDays : Number(retentionDays);
  if (!Number.isFinite(parsed)) return DEFAULT_BACKUP_CONFIG.retentionDays;
  return Math.min(365, Math.max(1, Math.floor(parsed)));
}

function isValidFrequency(frequency: unknown): frequency is BackupFrequency {
  return (
    frequency === 'daily' ||
    frequency === 'weekly' ||
    frequency === 'monthly' ||
    frequency === 'disabled'
  );
}

function normalizeConfig(input: Partial<BackupRuntimeConfig> | null | undefined): BackupRuntimeConfig {
  const merged: BackupRuntimeConfig = {
    ...DEFAULT_BACKUP_CONFIG,
    ...(input ?? {}),
  };

  if (!isValidFrequency(merged.frequency)) {
    merged.frequency = DEFAULT_BACKUP_CONFIG.frequency;
  }
  if (!isValidTime(merged.time)) {
    merged.time = DEFAULT_BACKUP_CONFIG.time;
  }
  merged.retentionDays = clampRetentionDays(merged.retentionDays);

  merged.dropboxSyncEnabled = Boolean(merged.dropboxSyncEnabled);
  merged.lastDropboxSyncAt =
    typeof merged.lastDropboxSyncAt === 'string' || merged.lastDropboxSyncAt === null
      ? merged.lastDropboxSyncAt
      : null;

  return merged;
}

/**
 * Load backup runtime configuration from disk.
 * If the config file does not exist or is invalid, returns defaults.
 */
export async function loadBackupRuntimeConfig(): Promise<BackupRuntimeConfig> {
  await fs.mkdir(getBackupDir(), { recursive: true });

  try {
    const raw = await fs.readFile(getConfigPath(), 'utf8');
    const parsed = JSON.parse(raw) as Partial<BackupRuntimeConfig>;
    return normalizeConfig(parsed);
  } catch {
    return { ...DEFAULT_BACKUP_CONFIG };
  }
}

/**
 * Persist backup runtime configuration to disk.
 */
export async function saveBackupRuntimeConfig(config: BackupRuntimeConfig): Promise<void> {
  await fs.mkdir(getBackupDir(), { recursive: true });
  const normalized = normalizeConfig(config);
  await fs.writeFile(getConfigPath(), JSON.stringify(normalized, null, 2), 'utf8');
}

/**
 * Update only a subset of runtime config fields and persist.
 */
export async function updateBackupRuntimeConfig(
  patch: Partial<BackupRuntimeConfig>
): Promise<BackupRuntimeConfig> {
  const current = await loadBackupRuntimeConfig();
  const next = normalizeConfig({ ...current, ...patch });
  await saveBackupRuntimeConfig(next);
  return next;
}
