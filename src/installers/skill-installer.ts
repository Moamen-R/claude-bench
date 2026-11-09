import fs from 'node:fs';
import path from 'node:path';
import { execa } from 'execa';
import { SecurityAuditor } from '../core/security-auditor.js';
import { OSDetector } from '../core/os-detector.js';
import type { RegistryItem, ScopeMode } from '../core/schema.js';

export interface SkillProgressEvent {
  completed: number;
  total: number;
  currentItem: string;
  status: 'installing' | 'installed' | 'cached' | 'failed';
  installedCount: number;
  cachedCount: number;
  failedCount: number;
  error?: string;
}

export type SkillProgressCallback = (progress: SkillProgressEvent) => void;

export interface SkillInstallOptions {
  scope?: ScopeMode;
  dryRun?: boolean;
  concurrency?: number;
  timeoutMs?: number;
  force?: boolean;
  onProgress?: SkillProgressCallback;
}

export interface SkillInstallFailure {
  item: string;
  error: string;
}

export interface SkillInstallBatchResult {
  success: boolean;
  installed: string[];
  cached: string[];
  failed: SkillInstallFailure[];
  commandsExecuted: string[];
  dryRun: boolean;
}

export class SkillInstaller {
  constructor(
    private auditor: SecurityAuditor = new SecurityAuditor(),
    private detector: OSDetector = new OSDetector()
  ) {}

  extractSkillName(item: RegistryItem): string {
    const match = item.installCommand.match(/--skill\s+([^\s]+)/);
    if (match && match[1]) {
      return match[1];
    }
    const repoMatch = item.installCommand.match(/skills\s+add\s+([^\s]+)/);
    if (repoMatch && repoMatch[1]) {
      const parts = repoMatch[1].split('/');
      return parts[parts.length - 1];
    }
    return item.id;
  }

  isSkillCached(item: RegistryItem, skillsDir: string): boolean {
    try {
      const skillName = this.extractSkillName(item);
      const candidates = [
        path.join(skillsDir, skillName),
        path.join(skillsDir, item.id),
      ];

      for (const targetPath of candidates) {
        if (fs.existsSync(targetPath)) {
          const stat = fs.statSync(targetPath);
          if (stat.isDirectory()) {
            const files = fs.readdirSync(targetPath);
            if (files.some((f) => f.toLowerCase() === 'skill.md' || f === 'skill.json' || f === 'package.json') || files.length > 0) {
              return true;
            }
          }
        }
      }
    } catch {
      return false;
    }
    return false;
  }

  buildInstallArgs(
    item: RegistryItem,
    options: SkillInstallOptions = {}
  ): { binary: string; args: string[] } {
    const parts = item.installCommand.trim().split(/\s+/);
    const binary = parts[0];
    const args = parts.slice(1);

    const isSkillsCommand = binary === 'skills' || binary.endsWith('/skills') || args.includes('skills');

    // If running skills CLI, ensure non-interactive flag -y is present
    if (isSkillsCommand && !args.includes('-y') && !args.includes('--yes')) {
      args.push('-y');
    }

    // Ensure scope flag matches requested scope
    if (isSkillsCommand) {
      if (options.scope === 'global' && !args.includes('-g') && !args.includes('--global')) {
        args.push('-g');
      } else if (options.scope === 'project' && !args.includes('-p') && !args.includes('--project')) {
        args.push('-p');
      }
    }

    return { binary, args };
  }

  async installBatch(
    items: RegistryItem[],
    options: SkillInstallOptions = {}
  ): Promise<SkillInstallBatchResult> {
    const {
      dryRun = false,
      scope = 'global',
      concurrency = 4,
      timeoutMs = 45000,
      force = false,
      onProgress,
    } = options;

    const installed: string[] = [];
    const cached: string[] = [];
    const failed: SkillInstallFailure[] = [];
    const commandsExecuted: string[] = [];

    const total = items.length;
    let completed = 0;

    const skillsDir = this.detector.resolveConfigPaths(scope).skillsDir;

    const notify = (
      currentItem: string,
      status: 'installing' | 'installed' | 'cached' | 'failed',
      error?: string
    ) => {
      if (onProgress) {
        onProgress({
          completed,
          total,
          currentItem,
          status,
          installedCount: installed.length,
          cachedCount: cached.length,
          failedCount: failed.length,
          error,
        });
      }
    };

    const validItems: RegistryItem[] = [];
    for (const item of items) {
      const audit = this.auditor.auditRegistryItem(item);
      if (!audit.valid) {
        completed++;
        failed.push({
          item: item.id,
          error: audit.issues.join('; '),
        });
        notify(item.name || item.id, 'failed', audit.issues.join('; '));
      } else {
        validItems.push(item);
      }
    }

    const limit = Math.max(1, Math.min(concurrency, 10));
    let nextIndex = 0;

    const processItem = async (item: RegistryItem): Promise<void> => {
      const { binary, args } = this.buildInstallArgs(item, { scope });
      const commandStr = [binary, ...args].join(' ');

      if (dryRun) {
        commandsExecuted.push(commandStr);
        installed.push(item.id);
        completed++;
        notify(item.name || item.id, 'installed');
        return;
      }

      if (!force && this.isSkillCached(item, skillsDir)) {
        cached.push(item.id);
        installed.push(item.id);
        completed++;
        notify(item.name || item.id, 'cached');
        return;
      }

      commandsExecuted.push(commandStr);
      notify(item.name || item.id, 'installing');

      try {
        await execa(binary, args, {
          shell: false,
          timeout: timeoutMs,
          stdio: ['ignore', 'pipe', 'pipe'],
        });
        installed.push(item.id);
        completed++;
        notify(item.name || item.id, 'installed');
      } catch (err: unknown) {
        const isTimedOut = Boolean(
          err && typeof err === 'object' && 'timedOut' in err && (err as { timedOut: boolean }).timedOut
        );
        const rawMessage = err instanceof Error ? err.message : String(err);
        const errorMsg = isTimedOut ? `Timed out after ${timeoutMs}ms` : rawMessage;
        failed.push({
          item: item.id,
          error: errorMsg,
        });
        completed++;
        notify(item.name || item.id, 'failed', errorMsg);
      }
    };

    const workers = Array.from({ length: Math.min(limit, validItems.length) }, async () => {
      while (nextIndex < validItems.length) {
        const item = validItems[nextIndex++];
        await processItem(item);
      }
    });

    await Promise.all(workers);

    return {
      success: failed.length === 0,
      installed,
      cached,
      failed,
      commandsExecuted,
      dryRun,
    };
  }
}
