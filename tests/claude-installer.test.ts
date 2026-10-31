import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClaudeInstaller } from '../src/installers/claude-installer.js';
import { OSDetector } from '../src/core/os-detector.js';

describe('ClaudeInstaller', () => {
  let detector: OSDetector;

  beforeEach(() => {
    detector = new OSDetector();
  });

  it('generates correct commands for macOS CLI install in dry-run', async () => {
    vi.spyOn(detector, 'getPlatform').mockReturnValue('darwin');
    const installer = new ClaudeInstaller(detector);

    const result = await installer.install({
      target: 'cli',
      dryRun: true,
    });

    expect(result.dryRun).toBe(true);
    expect(result.commandsExecuted).toContain('curl -fsSL https://claude.ai/install.sh | bash');
    expect(result.installed).toContain('Claude Code CLI');
  });

  it('generates correct commands for Windows CLI install in dry-run', async () => {
    vi.spyOn(detector, 'getPlatform').mockReturnValue('win32');
    const installer = new ClaudeInstaller(detector);

    const result = await installer.install({
      target: 'cli',
      dryRun: true,
    });

    expect(result.dryRun).toBe(true);
    expect(result.commandsExecuted).toContain('irm https://claude.ai/install.ps1 | iex');
  });

  it('generates correct commands for Windows Desktop install in dry-run', async () => {
    vi.spyOn(detector, 'getPlatform').mockReturnValue('win32');
    const installer = new ClaudeInstaller(detector);

    const result = await installer.install({
      target: 'desktop',
      dryRun: true,
    });

    expect(result.dryRun).toBe(true);
    expect(result.commandsExecuted).toContain('winget install Anthropic.Claude --accept-source-agreements --accept-package-agreements');
    expect(result.installed).toContain('Claude Desktop');
  });

  it('generates correct commands for both targets in dry-run', async () => {
    vi.spyOn(detector, 'getPlatform').mockReturnValue('darwin');
    const installer = new ClaudeInstaller(detector);

    const result = await installer.install({
      target: 'both',
      dryRun: true,
    });

    expect(result.installed).toContain('Claude Code CLI');
    expect(result.installed).toContain('Claude Desktop');
    expect(result.commandsExecuted.length).toBeGreaterThanOrEqual(2);
  });
});
