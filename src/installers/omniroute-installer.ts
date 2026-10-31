import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execa } from 'execa';
import type { GatewayMode } from '../core/schema.js';

export interface OmniRouteSetupOptions {
  port?: number;
  dryRun?: boolean;
}

export interface OmniRouteSetupResult {
  success: boolean;
  gateway: GatewayMode;
  commandsExecuted: string[];
  dryRun: boolean;
  daemonUrl?: string;
  error?: string;
}

export class OmniRouteInstaller {
  private settingsFilePath: string;

  constructor(customSettingsPath?: string) {
    this.settingsFilePath =
      customSettingsPath || path.join(os.homedir(), '.claude', 'settings.json');
  }

  async setup(options: OmniRouteSetupOptions = {}): Promise<OmniRouteSetupResult> {
    const { port = 4000, dryRun = false } = options;
    const commandsExecuted: string[] = [];
    const daemonUrl = `http://127.0.0.1:${port}`;

    try {
      // 1. Install OmniRoute CLI globally if not present
      const installCmd = 'npm install -g omniroute';
      commandsExecuted.push(installCmd);
      if (!dryRun) {
        await execa('npm', ['install', '-g', 'omniroute'], { shell: false });
      }

      // 2. Install official OmniRoute skills into Claude Code
      const skill1 = 'npx -y skills add diegosouzapw/OmniRoute --skill cli-serve --agent claude-code';
      const skill2 = 'npx -y skills add mayankjain1815-commits/OmniRoute --skill cli-models --agent claude-code';
      commandsExecuted.push(skill1, skill2);

      if (!dryRun) {
        await execa(
          'npx',
          ['-y', 'skills', 'add', 'diegosouzapw/OmniRoute', '--skill', 'cli-serve', '--agent', 'claude-code'],
          { shell: false }
        );
        await execa(
          'npx',
          [
            '-y',
            'skills',
            'add',
            'mayankjain1815-commits/OmniRoute',
            '--skill',
            'cli-models',
            '--agent',
            'claude-code',
          ],
          { shell: false }
        );
      }

      // 3. Configure settings.json route
      await this.configureGatewayRoute('omniroute', port, dryRun);

      return {
        success: true,
        gateway: 'omniroute',
        commandsExecuted,
        dryRun,
        daemonUrl,
      };
    } catch (err: any) {
      return {
        success: false,
        gateway: 'omniroute',
        commandsExecuted,
        dryRun,
        error: err.message,
      };
    }
  }

  async configureGatewayRoute(
    mode: GatewayMode,
    port = 4000,
    dryRun = false
  ): Promise<OmniRouteSetupResult> {
    if (dryRun) {
      return {
        success: true,
        gateway: mode,
        commandsExecuted: [
          mode === 'omniroute'
            ? `Inject ANTHROPIC_BASE_URL=http://127.0.0.1:${port} into ${this.settingsFilePath}`
            : `Remove ANTHROPIC_BASE_URL from ${this.settingsFilePath}`,
        ],
        dryRun: true,
        daemonUrl: mode === 'omniroute' ? `http://127.0.0.1:${port}` : undefined,
      };
    }

    let settings: Record<string, any> = {};
    try {
      const content = await fs.readFile(this.settingsFilePath, 'utf8');
      settings = JSON.parse(content);
    } catch {
      settings = {};
    }

    if (!settings.env || typeof settings.env !== 'object') {
      settings.env = {};
    }

    if (mode === 'omniroute') {
      settings.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${port}`;
    } else {
      delete settings.env.ANTHROPIC_BASE_URL;
    }

    await fs.mkdir(path.dirname(this.settingsFilePath), { recursive: true });
    await fs.writeFile(this.settingsFilePath, JSON.stringify(settings, null, 2), 'utf8');

    return {
      success: true,
      gateway: mode,
      commandsExecuted: [],
      dryRun: false,
      daemonUrl: mode === 'omniroute' ? `http://127.0.0.1:${port}` : undefined,
    };
  }
}
