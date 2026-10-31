import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import os from 'node:os';
import { OSDetector } from '../src/core/os-detector.js';

describe('OSDetector', () => {
  const originalPlatform = process.platform;
  const originalEnv = { ...process.env };

  afterEach(() => {
    Object.defineProperty(process, 'platform', { value: originalPlatform });
    process.env = { ...originalEnv };
  });

  it('detects Windows platform correctly', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    const detector = new OSDetector();
    expect(detector.getPlatform()).toBe('win32');
    expect(detector.isWindows()).toBe(true);
    expect(detector.isMac()).toBe(false);
    expect(detector.isLinux()).toBe(false);
  });

  it('detects macOS platform correctly', () => {
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    const detector = new OSDetector();
    expect(detector.getPlatform()).toBe('darwin');
    expect(detector.isMac()).toBe(true);
    expect(detector.isWindows()).toBe(false);
  });

  it('detects Linux platform correctly', () => {
    Object.defineProperty(process, 'platform', { value: 'linux' });
    delete process.env.WSL_DISTRO_NAME;
    const detector = new OSDetector();
    expect(detector.getPlatform()).toBe('linux');
    expect(detector.isLinux()).toBe(true);
    expect(detector.isWSL()).toBe(false);
  });

  it('detects WSL platform correctly', () => {
    Object.defineProperty(process, 'platform', { value: 'linux' });
    process.env.WSL_DISTRO_NAME = 'Ubuntu';
    const detector = new OSDetector();
    expect(detector.getPlatform()).toBe('wsl');
    expect(detector.isWSL()).toBe(true);
  });

  it('resolves correct global configuration paths on Windows', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    process.env.APPDATA = 'C:\\Users\\MockUser\\AppData\\Roaming';
    const detector = new OSDetector();
    const paths = detector.resolveConfigPaths('global');

    expect(paths.claudeCodeSettings).toBe(path.join(os.homedir(), '.claude', 'settings.json'));
    expect(paths.claudeDesktopConfig).toBe(
      path.join('C:\\Users\\MockUser\\AppData\\Roaming', 'Claude', 'claude_desktop_config.json')
    );
    expect(paths.skillsDir).toBe(path.join(os.homedir(), '.claude', 'skills'));
    expect(paths.claudeMd).toBe(path.join(os.homedir(), '.claude', 'CLAUDE.md'));
  });

  it('resolves correct global configuration paths on macOS', () => {
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    const detector = new OSDetector();
    const paths = detector.resolveConfigPaths('global');

    expect(paths.claudeDesktopConfig).toBe(
      path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json')
    );
  });

  it('resolves project-scoped configuration paths', () => {
    const mockRoot = path.join(os.tmpdir(), 'mock-project');
    const detector = new OSDetector();
    const paths = detector.resolveConfigPaths('project', mockRoot);

    expect(paths.claudeCodeSettings).toBe(path.join(mockRoot, '.mcp.json'));
    expect(paths.skillsDir).toBe(path.join(mockRoot, '.claude', 'skills'));
    expect(paths.claudeMd).toBe(path.join(mockRoot, 'CLAUDE.md'));
  });
});
