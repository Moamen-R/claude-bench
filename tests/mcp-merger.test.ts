import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { MCPConfigMerger } from '../src/installers/mcp-merger.js';
import { BackupManager } from '../src/core/backup-manager.js';
import type { MCPServerConfig } from '../src/core/schema.js';

describe('MCPConfigMerger', () => {
  let tempBaseDir: string;
  let targetConfigFile: string;
  let backupDir: string;
  let backupManager: BackupManager;

  beforeEach(async () => {
    tempBaseDir = await fs.mkdtemp(path.join(os.tmpdir(), 'claude-bench-mcp-'));
    targetConfigFile = path.join(tempBaseDir, 'settings.json');
    backupDir = path.join(tempBaseDir, 'backups');
    backupManager = new BackupManager(backupDir);

    // Seed existing config with prior user servers and settings
    await fs.writeFile(
      targetConfigFile,
      JSON.stringify(
        {
          permissions: { allow: ['bash'] },
          mcpServers: {
            existingServer: {
              command: 'node',
              args: ['existing.js'],
            },
          },
        },
        null,
        2
      )
    );
  });

  afterEach(async () => {
    await fs.rm(tempBaseDir, { recursive: true, force: true });
  });

  it('performs lossless deep merge of new MCP servers into target config', async () => {
    const merger = new MCPConfigMerger(backupManager);
    const newServers: Record<string, MCPServerConfig> = {
      playwright: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-playwright'],
      },
    };

    const result = await merger.mergeServers(targetConfigFile, newServers, { dryRun: false });

    expect(result.success).toBe(true);
    expect(result.serversAdded).toContain('playwright');

    const updated = JSON.parse(await fs.readFile(targetConfigFile, 'utf8'));
    // Preserves existing permissions
    expect(updated.permissions).toEqual({ allow: ['bash'] });
    // Preserves existing server
    expect(updated.mcpServers.existingServer).toBeDefined();
    // Adds new server
    expect(updated.mcpServers.playwright).toEqual({
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-playwright'],
    });

    // Check backup was created
    const snapshots = await backupManager.listSnapshots();
    expect(snapshots.length).toBeGreaterThan(0);
  });

  it('dry-run reports changes without touching filesystem or creating backup', async () => {
    const merger = new MCPConfigMerger(backupManager);
    const newServers: Record<string, MCPServerConfig> = {
      postgres: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-postgres'],
      },
    };

    const result = await merger.mergeServers(targetConfigFile, newServers, { dryRun: true });

    expect(result.dryRun).toBe(true);
    expect(result.serversAdded).toContain('postgres');

    const content = JSON.parse(await fs.readFile(targetConfigFile, 'utf8'));
    expect(content.mcpServers.postgres).toBeUndefined();

    const snapshots = await backupManager.listSnapshots();
    expect(snapshots.length).toBe(0);
  });
});
