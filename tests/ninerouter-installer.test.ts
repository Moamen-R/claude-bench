import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { NineRouterInstaller } from '../src/installers/ninerouter-installer.js';

describe('NineRouterInstaller', () => {
  let tempBaseDir: string;
  let settingsFile: string;

  beforeEach(async () => {
    tempBaseDir = await fs.mkdtemp(path.join(os.tmpdir(), 'claude-bench-9router-'));
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

  it('generates dry-run commands for 9router setup without mutating filesystem', async () => {
    const installer = new NineRouterInstaller(settingsFile);
    const result = await installer.setup({
      port: 4000,
      dryRun: true,
    });

    expect(result.dryRun).toBe(true);
    expect(result.commandsExecuted).toContain('npm install -g 9router');

    // Verify settings was NOT modified in dry-run
    const content = JSON.parse(await fs.readFile(settingsFile, 'utf8'));
    expect(content.env.ANTHROPIC_BASE_URL).toBeUndefined();
  });

  it('merges ANTHROPIC_BASE_URL into settings.json without overwriting existing keys', async () => {
    const installer = new NineRouterInstaller(settingsFile);
    const result = await installer.configureGatewayRoute('9router', 4000, false);

    expect(result.success).toBe(true);
    expect(result.gateway).toBe('9router');

    const content = JSON.parse(await fs.readFile(settingsFile, 'utf8'));
    expect(content.permissions).toEqual({ allow: ['read'] });
    expect(content.env.EXISTING_KEY).toBe('keep-me');
    expect(content.env.ANTHROPIC_BASE_URL).toBe('http://127.0.0.1:4000');
  });

  it('removes ANTHROPIC_BASE_URL when switching back to official mode', async () => {
    const installer = new NineRouterInstaller(settingsFile);
    // Set to 9router first
    await installer.configureGatewayRoute('9router', 4000, false);
    // Switch to official
    const result = await installer.configureGatewayRoute('official', undefined, false);

    expect(result.success).toBe(true);
    expect(result.gateway).toBe('official');

    const content = JSON.parse(await fs.readFile(settingsFile, 'utf8'));
    expect(content.env.EXISTING_KEY).toBe('keep-me');
    expect(content.env.ANTHROPIC_BASE_URL).toBeUndefined();
  });

  it('rejects invalid ports gracefully', async () => {
    const installer = new NineRouterInstaller(settingsFile);
    const result = await installer.setup({ port: 70000, dryRun: true });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid port');
  });

  it('returns failure on malformed settings JSON without destroying file', async () => {
    await fs.writeFile(settingsFile, '{ bad json');
    const installer = new NineRouterInstaller(settingsFile);
    const result = await installer.configureGatewayRoute('9router', 4000, false);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to parse existing settings JSON');

    const content = await fs.readFile(settingsFile, 'utf8');
    expect(content).toBe('{ bad json');
  });

  it('returns failure when settings JSON is not an object', async () => {
    await fs.writeFile(settingsFile, '["an", "array"]');
    const installer = new NineRouterInstaller(settingsFile);
    const result = await installer.configureGatewayRoute('9router', 4000, false);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid settings JSON shape');
  });
});
