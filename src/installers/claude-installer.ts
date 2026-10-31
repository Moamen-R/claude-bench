import { execa } from 'execa';
import { OSDetector } from '../core/os-detector.js';
import type { InstallationTarget } from '../core/schema.js';

export interface ClaudeInstallOptions {
  target: InstallationTarget;
  dryRun?: boolean;
}

export interface ClaudeInstallResult {
  success: boolean;
  installed: string[];
  commandsExecuted: string[];
  dryRun: boolean;
  version?: string;
  error?: string;
}

export class ClaudeInstaller {
  constructor(private detector: OSDetector = new OSDetector()) {}

  async install(options: ClaudeInstallOptions): Promise<ClaudeInstallResult> {
    const { target, dryRun = false } = options;
    const installed: string[] = [];
    const commandsExecuted: string[] = [];
    const platform = this.detector.getPlatform();

    try {
      // 1. Install CLI if requested
      if (target === 'cli' || target === 'both') {
        const cliCommand =
          platform === 'win32'
            ? 'irm https://claude.ai/install.ps1 | iex'
            : 'curl -fsSL https://claude.ai/install.sh | bash';

        commandsExecuted.push(cliCommand);
        if (!dryRun) {
          if (platform === 'win32') {
            await execa('powershell', ['-NoProfile', '-Command', cliCommand], { shell: false });
          } else {
            await execa('bash', ['-c', cliCommand], { shell: false });
          }
        }
        installed.push('Claude Code CLI');
      }

      // 2. Install Desktop if requested
      if (target === 'desktop' || target === 'both') {
        let desktopCmd = '';
        if (platform === 'darwin') {
          desktopCmd = 'brew install --cask claude';
        } else if (platform === 'win32') {
          desktopCmd = 'winget install Anthropic.Claude --accept-source-agreements --accept-package-agreements';
        } else {
          desktopCmd = 'echo "Claude Desktop is officially supported on macOS and Windows. Use Claude Code CLI on Linux."';
        }

        commandsExecuted.push(desktopCmd);
        if (!dryRun) {
          if (platform === 'darwin') {
            await execa('brew', ['install', '--cask', 'claude'], { shell: false });
          } else if (platform === 'win32') {
            await execa(
              'winget',
              ['install', 'Anthropic.Claude', '--accept-source-agreements', '--accept-package-agreements'],
              { shell: false }
            );
          }
        }
        installed.push('Claude Desktop');
      }

      // Check version if CLI was installed and not dry-run
      let version: string | undefined;
      if (!dryRun && (target === 'cli' || target === 'both')) {
        try {
          const versionRes = await execa('claude', ['--version'], { shell: false });
          version = versionRes.stdout.trim();
        } catch {
          version = 'installed (path refresh required)';
        }
      }

      return {
        success: true,
        installed,
        commandsExecuted,
        dryRun,
        version,
      };
    } catch (err: any) {
      return {
        success: false,
        installed,
        commandsExecuted,
        dryRun,
        error: err.message,
      };
    }
  }
}
