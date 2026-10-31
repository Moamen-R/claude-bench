import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { BackupManager } from '../src/core/backup-manager.js';

describe('BackupManager', () => {
  let tempBaseDir: string;
  let tempTargetFile: string;
  let backupDir: string;

  beforeEach(async () => {
    tempBaseDir = await fs.mkdtemp(path.join(os.tmpdir(), 'claude-forge-test-'));
    tempTargetFile = path.join(tempBaseDir, 'settings.json');
    backupDir = path.join(tempBaseDir, 'backups');
    await fs.writeFile(tempTargetFile, JSON.stringify({ mcpServers: { oldServer: {} } }, null, 2));
  });

  afterEach(async () => {
    await fs.rm(tempBaseDir, { recursive: true, force: true });
  });

  it('creates a timestamped backup of an existing file', async () => {
    const manager = new BackupManager(backupDir);
    const backupRecord = await manager.createBackup(tempTargetFile);

    expect(backupRecord).not.toBeNull();
    expect(backupRecord?.originalPath).toBe(tempTargetFile);
    expect(await fs.stat(backupRecord!.backupPath)).toBeDefined();

    const backedUpContent = await fs.readFile(backupRecord!.backupPath, 'utf8');
    expect(JSON.parse(backedUpContent)).toEqual({ mcpServers: { oldServer: {} } });
  });

  it('returns null when backing up a non-existent file', async () => {
    const manager = new BackupManager(backupDir);
    const nonExistent = path.join(tempBaseDir, 'does-not-exist.json');
    const backupRecord = await manager.createBackup(nonExistent);

    expect(backupRecord).toBeNull();
  });

  it('rolls back to previous backup successfully', async () => {
    const manager = new BackupManager(backupDir);
    await manager.createBackup(tempTargetFile);

    // Mutate the target file
    await fs.writeFile(tempTargetFile, JSON.stringify({ mcpServers: { corrupted: true } }, null, 2));

    // Perform rollback
    const restored = await manager.rollbackLatest();
    expect(restored).toContain(tempTargetFile);

    // Verify restored content
    const restoredContent = await fs.readFile(tempTargetFile, 'utf8');
    expect(JSON.parse(restoredContent)).toEqual({ mcpServers: { oldServer: {} } });
  });
});
