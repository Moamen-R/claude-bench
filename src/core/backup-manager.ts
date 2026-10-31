import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';

export interface BackupRecord {
  id: string;
  originalPath: string;
  backupPath: string;
  timestamp: string;
  hash: string;
}

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  records: BackupRecord[];
}

export class BackupManager {
  private baseDir: string;

  constructor(customBaseDir?: string) {
    this.baseDir = customBaseDir || path.join(os.homedir(), '.claude-forge', 'backups');
  }

  async createBackup(targetFilePath: string): Promise<BackupRecord | null> {
    try {
      await fs.access(targetFilePath);
    } catch {
      return null;
    }

    const content = await fs.readFile(targetFilePath);
    const hash = crypto.createHash('sha256').update(content).digest('hex');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const snapshotId = `snapshot-${timestamp}`;
    const snapshotDir = path.join(this.baseDir, snapshotId);
    await fs.mkdir(snapshotDir, { recursive: true });

    const fileName = path.basename(targetFilePath);
    const backupFilePath = path.join(snapshotDir, fileName);

    await fs.writeFile(backupFilePath, content);

    const record: BackupRecord = {
      id: snapshotId,
      originalPath: path.resolve(targetFilePath),
      backupPath: backupFilePath,
      timestamp: new Date().toISOString(),
      hash,
    };

    const manifestPath = path.join(snapshotDir, 'manifest.json');
    let snapshot: BackupSnapshot;
    try {
      const existing = await fs.readFile(manifestPath, 'utf8');
      snapshot = JSON.parse(existing);
      snapshot.records.push(record);
    } catch {
      snapshot = {
        id: snapshotId,
        timestamp: new Date().toISOString(),
        records: [record],
      };
    }
    await fs.writeFile(manifestPath, JSON.stringify(snapshot, null, 2));

    return record;
  }

  async listSnapshots(): Promise<BackupSnapshot[]> {
    try {
      const entries = await fs.readdir(this.baseDir, { withFileTypes: true });
      const snapshots: BackupSnapshot[] = [];

      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith('snapshot-')) {
          const manifestPath = path.join(this.baseDir, entry.name, 'manifest.json');
          try {
            const content = await fs.readFile(manifestPath, 'utf8');
            snapshots.push(JSON.parse(content));
          } catch {
            // ignore corrupted or incomplete snapshot
          }
        }
      }

      return snapshots.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    } catch {
      return [];
    }
  }

  async rollbackLatest(): Promise<string[]> {
    const snapshots = await this.listSnapshots();
    if (snapshots.length === 0) {
      throw new Error('No backup snapshots available for rollback.');
    }

    const latest = snapshots[0];
    const restoredPaths: string[] = [];

    for (const record of latest.records) {
      const content = await fs.readFile(record.backupPath);
      await fs.mkdir(path.dirname(record.originalPath), { recursive: true });
      await fs.writeFile(record.originalPath, content);
      restoredPaths.push(record.originalPath);
    }

    return restoredPaths;
  }
}
