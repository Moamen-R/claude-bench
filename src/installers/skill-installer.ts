import { execa } from 'execa';
import { SecurityAuditor } from '../core/security-auditor.js';
import type { RegistryItem, ScopeMode } from '../core/schema.js';

export interface SkillInstallOptions {
  scope?: ScopeMode;
  dryRun?: boolean;
}

export interface SkillInstallFailure {
  item: string;
  error: string;
}

export interface SkillInstallBatchResult {
  success: boolean;
  installed: string[];
  failed: SkillInstallFailure[];
  commandsExecuted: string[];
  dryRun: boolean;
}

export class SkillInstaller {
  constructor(private auditor: SecurityAuditor = new SecurityAuditor()) {}

  async installBatch(
    items: RegistryItem[],
    options: SkillInstallOptions = {}
  ): Promise<SkillInstallBatchResult> {
    const { dryRun = false } = options;
    const installed: string[] = [];
    const failed: SkillInstallFailure[] = [];
    const commandsExecuted: string[] = [];

    for (const item of items) {
      // 1. Audit item before execution
      const audit = this.auditor.auditRegistryItem(item);
      if (!audit.valid) {
        failed.push({
          item: item.id,
          error: audit.issues.join('; '),
        });
        continue;
      }

      commandsExecuted.push(item.installCommand);

      if (dryRun) {
        installed.push(item.id);
        continue;
      }

      try {
        // Parse command into binary and arguments safely
        const parts = item.installCommand.trim().split(/\s+/);
        const binary = parts[0];
        const args = parts.slice(1);

        await execa(binary, args, { shell: false });
        installed.push(item.id);
      } catch (err: any) {
        failed.push({
          item: item.id,
          error: err.message,
        });
      }
    }

    return {
      success: failed.length === 0,
      installed,
      failed,
      commandsExecuted,
      dryRun,
    };
  }
}
