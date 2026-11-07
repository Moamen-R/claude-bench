import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execa } from 'execa';
import { BackupManager } from '../core/backup-manager.js';
import type { GatewayMode } from '../core/schema.js';

export interface NineRouterSetupOptions {
  port?: number;
  dryRun?: boolean;
}

export interface NineRouterSetupResult {
  success: boolean;
  gateway: GatewayMode;
  commandsExecuted: string[];
  dryRun: boolean;
  daemonUrl?: string;
  error?: string;
}

interface ClaudeSettings {
  env?: Record<string, string>;
  [key: string]: unknown;
}

function validatePort(port: number): void {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port: ${port}. Port must be an integer between 1 and 65535.`);
  }
}

export class NineRouterInstaller {
  private settingsFilePath: string;

  constructor(
    customSettingsPath?: string,
    private backupManager: BackupManager = new BackupManager()
  ) {
    this.settingsFilePath =
      customSettingsPath || path.join(os.homedir(), '.claude', 'settings.json');
  }

  async setup(options: NineRouterSetupOptions = {}): Promise<NineRouterSetupResult> {
    const { port = 4000, dryRun = false } = options;
    const commandsExecuted: string[] = [];

    try {
      validatePort(port);

      // 1. Install 9router CLI globally
      const installCmd = 'npm install -g 9router';
      commandsExecuted.push(installCmd);
      if (!dryRun) {
        await execa('npm', ['install', '-g', '9router'], { shell: false });
      }

      // 2. Configure settings.json route
      const routeResult = await this.configureGatewayRoute('9router', port, dryRun);
      if (!routeResult.success) {
        return {
          success: false,
          gateway: '9router',
          commandsExecuted: [...commandsExecuted, ...routeResult.commandsExecuted],
          dryRun,
          error: routeResult.error,
        };
      }

      return {
        success: true,
        gateway: '9router',
        commandsExecuted: [...commandsExecuted, ...routeResult.commandsExecuted],
        dryRun,
        daemonUrl: routeResult.daemonUrl,
      };
    } catch (err: unknown) {
      return {
        success: false,
        gateway: '9router',
        commandsExecuted,
        dryRun,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  async configureGatewayRoute(
    mode: GatewayMode,
    port = 4000,
    dryRun = false
  ): Promise<NineRouterSetupResult> {
    try {
      if (mode === '9router') {
        validatePort(port);
      }

      const daemonUrl = mode === '9router' ? `http://127.0.0.1:${port}` : undefined;

      if (dryRun) {
        return {
          success: true,
          gateway: mode,
          commandsExecuted: [
            mode === '9router'
              ? `Inject ANTHROPIC_BASE_URL=${daemonUrl} into ${this.settingsFilePath}`
              : `Remove ANTHROPIC_BASE_URL from ${this.settingsFilePath}`,
          ],
          dryRun: true,
          daemonUrl,
        };
      }

      let settings: ClaudeSettings = {};
      try {
        const content = await fs.readFile(this.settingsFilePath, 'utf8');
        try {
          const parsed = JSON.parse(content);
          if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            return {
              success: false,
              gateway: mode,
              commandsExecuted: [],
              dryRun: false,
              error: `Invalid settings JSON shape at ${this.settingsFilePath}: expected an object`,
            };
          }
          settings = parsed as ClaudeSettings;
        } catch (parseErr) {
          return {
            success: false,
            gateway: mode,
            commandsExecuted: [],
            dryRun: false,
            error: `Failed to parse existing settings JSON at ${this.settingsFilePath}: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`,
          };
        }
      } catch {
        // File does not exist yet; will be created
        settings = {};
      }

      if (!settings.env || typeof settings.env !== 'object' || Array.isArray(settings.env)) {
        settings.env = {};
      }

      if (mode === '9router') {
        settings.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${port}`;
      } else {
        delete settings.env.ANTHROPIC_BASE_URL;
      }

      // Pre-mutation backup
      await this.backupManager.createBackup(this.settingsFilePath);

      await fs.mkdir(path.dirname(this.settingsFilePath), { recursive: true });
      await fs.writeFile(this.settingsFilePath, JSON.stringify(settings, null, 2), 'utf8');

      return {
        success: true,
        gateway: mode,
        commandsExecuted: [],
        dryRun: false,
        daemonUrl,
      };
    } catch (err: unknown) {
      return {
        success: false,
        gateway: mode,
        commandsExecuted: [],
        dryRun,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
