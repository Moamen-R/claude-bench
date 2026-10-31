import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { OmniRouteInstaller } from '../src/installers/omniroute-installer.js';

describe('OmniRouteInstaller', () => {
  let tempBaseDir: string;
  let settingsFile: string;

  beforeEach(async () => {
    tempBaseDir = await fs.mkdtemp(path.join(os.tmpdir(), 'claude-forge-omniroute-'));
    settingsFile = path.join(tempBaseDir, 'settings.json');
    // Seed initial settings
    await fs.writeFile(
      settingsFile,
      JSON.stringify(
        {
          permissions: { allow: ['read'] },
          env: { EXISTING_KEY: 'keep-me' },
        },
        null,
        2
      )
    );
  });

  afterEach(async () => {
    await fs.rm(tempBaseDir, { recursive: true, force: true });
  });

  it('generates dry-run commands for OmniRoute setup without mutating filesystem', async () => {
    const installer = new OmniRouteInstaller(settingsFile);
    const result = await installer.setup({
      port: 4000,
      dryRun: true,
    });

    expect(result.dryRun).toBe(true);
    expect(result.commandsExecuted).toContain('npm install -g omniroute');
    expect(result.commandsExecuted.some((cmd) => cmd.includes('diegosouzapw/OmniRoute'))).toBe(true);
    expect(result.commandsExecuted.some((cmd) => cmd.includes('mayankjain1815-commits/OmniRoute'))).toBe(true);

    // Verify settings was NOT modified in dry-run
    const content = JSON.parse(await fs.readFile(settingsFile, 'utf8'));
    expect(content.env.ANTHROPIC_BASE_URL).toBeUndefined();
  });

  it('merges ANTHROPIC_BASE_URL into settings.json without overwriting existing keys', async () => {
    const installer = new OmniRouteInstaller(settingsFile);
    const result = await installer.configureGatewayRoute('omniroute', 4000, false);

    expect(result.success).toBe(true);
    expect(result.gateway).toBe('omniroute');

    const content = JSON.parse(await fs.readFile(settingsFile, 'utf8'));
    expect(content.permissions).toEqual({ allow: ['read'] });
    expect(content.env.EXISTING_KEY).toBe('keep-me');
    expect(content.env.ANTHROPIC_BASE_URL).toBe('http://127.0.0.1:4000');
  });

  it('removes ANTHROPIC_BASE_URL when switching back to official mode', async () => {
    const installer = new OmniRouteInstaller(settingsFile);
    // Set to omniroute first
    await installer.configureGatewayRoute('omniroute', 4000, false);
    // Switch to official
    const result = await installer.configureGatewayRoute('official', undefined, false);

    expect(result.success).toBe(true);
    expect(result.gateway).toBe('official');

    const content = JSON.parse(await fs.readFile(settingsFile, 'utf8'));
    expect(content.env.EXISTING_KEY).toBe('keep-me');
    expect(content.env.ANTHROPIC_BASE_URL).toBeUndefined();
  });
});
