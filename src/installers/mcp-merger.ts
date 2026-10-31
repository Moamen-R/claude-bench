import fs from 'node:fs/promises';
import path from 'node:path';
import { BackupManager } from '../core/backup-manager.js';
import type { MCPServerConfig } from '../core/schema.js';

export interface MergeOptions {
  dryRun?: boolean;
}

export interface MergeResult {
  success: boolean;
  targetPath: string;
  serversAdded: string[];
  dryRun: boolean;
  error?: string;
}

export class MCPConfigMerger {
  constructor(private backupManager: BackupManager = new BackupManager()) {}

  async mergeServers(
    targetFilePath: string,
    newServers: Record<string, MCPServerConfig>,
    options: MergeOptions = {}
  ): Promise<MergeResult> {
    const { dryRun = false } = options;
    const serversAdded = Object.keys(newServers);

    if (dryRun) {
      return {
        success: true,
        targetPath: targetFilePath,
        serversAdded,
        dryRun: true,
      };
    }

    try {
      // 1. Atomic backup of target config if it exists
      await this.backupManager.createBackup(targetFilePath);

      // 2. Read existing content or initialize
      let config: Record<string, any> = {};
      try {
        const content = await fs.readFile(targetFilePath, 'utf8');
        config = JSON.parse(content);
      } catch {
        config = {};
      }

      // 3. Ensure mcpServers object exists
      if (!config.mcpServers || typeof config.mcpServers !== 'object') {
        config.mcpServers = {};
      }

      // 4. Lossless merge new servers
      for (const [name, serverDef] of Object.entries(newServers)) {
        config.mcpServers[name] = serverDef;
      }

      // 5. Write back to disk
      await fs.mkdir(path.dirname(targetFilePath), { recursive: true });
      await fs.writeFile(targetFilePath, JSON.stringify(config, null, 2), 'utf8');

      return {
        success: true,
        targetPath: targetFilePath,
        serversAdded,
        dryRun: false,
      };
    } catch (err: any) {
      return {
        success: false,
        targetPath: targetFilePath,
        serversAdded: [],
        dryRun,
        error: err.message,
      };
    }
  }
}
