import os from 'node:os';
import path from 'node:path';
import { execa } from 'execa';

export type PlatformType = 'darwin' | 'linux' | 'win32' | 'wsl';
export type ShellType = 'bash' | 'zsh' | 'powershell' | 'cmd' | 'unknown';

export interface ConfigPaths {
  claudeCodeSettings: string;
  claudeDesktopConfig: string;
  skillsDir: string;
  claudeMd: string;
  backupDir: string;
}

export class OSDetector {
  getPlatform(): PlatformType {
    if (process.platform === 'linux' && Boolean(process.env.WSL_DISTRO_NAME)) {
      return 'wsl';
    }
    return process.platform as PlatformType;
  }

  isWindows(): boolean {
    return this.getPlatform() === 'win32';
  }

  isMac(): boolean {
    return this.getPlatform() === 'darwin';
  }

  isLinux(): boolean {
    return this.getPlatform() === 'linux';
  }

  isWSL(): boolean {
    return this.getPlatform() === 'wsl';
  }

  detectShell(): ShellType {
    const shellEnv = process.env.SHELL || process.env.COMSPEC || '';
    if (shellEnv.includes('zsh')) return 'zsh';
    if (shellEnv.includes('bash')) return 'bash';
    if (shellEnv.includes('powershell') || shellEnv.includes('pwsh') || process.env.PSModulePath) {
      return 'powershell';
    }
    if (shellEnv.includes('cmd.exe')) return 'cmd';
    return 'unknown';
  }

  resolveConfigPaths(scope: 'global' | 'project' = 'global', customProjectRoot?: string): ConfigPaths {
    const home = os.homedir();
    const backupDir = path.join(home, '.claude-bench', 'backups');

    let claudeDesktopConfig: string;
    if (this.isWindows()) {
      const appData = process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
      claudeDesktopConfig = path.join(appData, 'Claude', 'claude_desktop_config.json');
    } else if (this.isMac()) {
      claudeDesktopConfig = path.join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
    } else {
      claudeDesktopConfig = path.join(home, '.config', 'Claude', 'claude_desktop_config.json');
    }

    if (scope === 'project') {
      const projectRoot = customProjectRoot || process.cwd();
      return {
        claudeCodeSettings: path.join(projectRoot, '.mcp.json'),
        claudeDesktopConfig,
        skillsDir: path.join(projectRoot, '.claude', 'skills'),
        claudeMd: path.join(projectRoot, 'CLAUDE.md'),
        backupDir,
      };
    }

    return {
      claudeCodeSettings: path.join(home, '.claude', 'settings.json'),
      claudeDesktopConfig,
      skillsDir: path.join(home, '.claude', 'skills'),
      claudeMd: path.join(home, '.claude', 'CLAUDE.md'),
      backupDir,
    };
  }

  async checkCommandExists(command: string): Promise<boolean> {
    try {
      const checkCmd = this.isWindows() ? 'where' : 'which';
      const result = await execa(checkCmd, [command], { shell: false });
      return result.exitCode === 0;
    } catch {
      return false;
    }
  }
}
