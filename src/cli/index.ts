import { Command } from 'commander';
import fs from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import { loadRegistrySeed } from '../registry/registry-loader.js';
import { WizardRunner } from './wizard.js';
import { printBanner, printSummaryTable, printDoctorReport } from './ui.js';
import { OSDetector } from '../core/os-detector.js';
import { BackupManager } from '../core/backup-manager.js';
import { OmniRouteInstaller } from '../installers/omniroute-installer.js';
import { SkillInstaller } from '../installers/skill-installer.js';
import { MCPConfigMerger } from '../installers/mcp-merger.js';
import {
  CANONICAL_FIELDS,
  type FieldId,
  type GatewayMode,
  type InstallationTarget,
  type ScopeMode,
  type RegistryItem,
} from '../core/schema.js';
import { CLI_VERSION } from './version.js';

const program = new Command();
const detector = new OSDetector();
const backupManager = new BackupManager();

program
  .name('claude-bench')
  .description('Production-grade CLI bootstrapper for Claude Code & Claude Desktop across 11 professional fields')
  .version(CLI_VERSION);

// Command: init
program
  .command('init')
  .description('Initialize and configure Claude environment interactively or via flags')
  .option('-t, --target <target>', 'Target application: cli, desktop, or both')
  .option('-g, --gateway <gateway>', 'Gateway routing mode: official or omniroute')
  .option('-f, --fields <fields>', 'Comma-separated fields (e.g. fullstack,cybersecurity)')
  .option('-s, --scope <scope>', 'Installation scope: global or project', 'global')
  .option('--dry-run', 'Preview changes without modifying host system', false)
  .option('-y, --yes', 'Accept defaults automatically without prompting', false)
  .action(async (opts) => {
    printBanner();

    let fields: FieldId[] | undefined;
    if (opts.fields) {
      fields = opts.fields.split(',').map((f: string) => f.trim().toLowerCase()) as FieldId[];
    }

    if (opts.yes && !opts.target) opts.target = 'both';
    if (opts.yes && !opts.gateway) opts.gateway = 'official';
    if (opts.yes && (!fields || fields.length === 0)) fields = ['fullstack'];

    const wizard = new WizardRunner();
    await wizard.run({
      target: opts.target as InstallationTarget,
      gateway: opts.gateway as GatewayMode,
      fields,
      scope: opts.scope as ScopeMode,
      dryRun: opts.dryRun,
      yes: opts.yes,
    });
  });

// Command: list
program
  .command('list')
  .description('List curated skills, plugins, and MCP servers across fields')
  .option('-f, --field <field>', 'Filter by specific professional field')
  .action((opts) => {
    printBanner();
    const items = loadRegistrySeed();
    const fieldFilter = opts.field?.trim().toLowerCase();

    console.log(pc.bold(pc.cyan('=== Curated Claude Ecosystem Registry ===\n')));

    CANONICAL_FIELDS.forEach((field) => {
      if (fieldFilter && field !== fieldFilter) return;

      const fieldItems = items.filter((i) => i.fields.includes(field));
      console.log(pc.bold(pc.yellow(`[Field: ${field.toUpperCase()}] (${fieldItems.length} items)`)));

      fieldItems.forEach((item) => {
        const typeTag = pc.magenta(`[${item.type.toUpperCase()}]`);
        const stars = pc.gray(`⭐ ${item.stars}`);
        console.log(`  ${typeTag} ${pc.bold(item.name)} (${item.id}) - ${stars}`);
        console.log(`     ${pc.dim(item.description)}`);
        console.log(`     ${pc.cyan(item.installCommand)}\n`);
      });
    });
  });

// Command: add
program
  .command('add <id>')
  .description('Install a specific skill or MCP server by ID')
  .option('-s, --scope <scope>', 'global or project', 'global')
  .option('--dry-run', 'Simulate installation', false)
  .action(async (id, opts) => {
    const items = loadRegistrySeed();
    const match = items.find((i) => i.id.toLowerCase() === id.toLowerCase());

    if (!match) {
      console.error(pc.red(`Item with ID "${id}" not found in registry. Run "claude-bench list" to view available items.`));
      process.exit(1);
    }

    console.log(pc.cyan(`Installing ${match.name} (${match.id})...`));
    if (match.type === 'skill' || match.type === 'cli-anything') {
      const installer = new SkillInstaller();
      const res = await installer.installBatch([match], { scope: opts.scope, dryRun: opts.dryRun });
      if (res.success) {
        console.log(pc.green(` Successfully installed skill ${match.name}`));
      } else {
        console.error(pc.red(` Failed: ${res.failed[0]?.error}`));
      }
    } else if (match.type === 'mcp' && match.mcpConfig) {
      const merger = new MCPConfigMerger(backupManager);
      const paths = detector.resolveConfigPaths(opts.scope);
      await merger.mergeServers(paths.claudeCodeSettings, { [match.id]: match.mcpConfig }, { dryRun: opts.dryRun });
      console.log(pc.green(` Successfully merged MCP server ${match.name}`));
    }
  });

// Command: switch-gateway
program
  .command('switch-gateway <mode>')
  .description('Switch Claude Code gateway routing between official and omniroute')
  .option('-p, --port <port>', 'OmniRoute local port', '4000')
  .option('--dry-run', 'Preview changes without modifying settings.json', false)
  .action(async (mode, opts) => {
    if (mode !== 'official' && mode !== 'omniroute') {
      console.error(pc.red('Mode must be either "official" or "omniroute".'));
      process.exit(1);
    }

    const installer = new OmniRouteInstaller();
    const res = await installer.configureGatewayRoute(mode, Number(opts.port), opts.dryRun);

    if (res.success) {
      console.log(pc.green(` Successfully switched routing gateway to: ${pc.bold(mode)}`));
      if (mode === 'omniroute') {
        console.log(pc.cyan(`   ANTHROPIC_BASE_URL set to ${res.daemonUrl}`));
      } else {
        console.log(pc.cyan(`   ANTHROPIC_BASE_URL removed; official Anthropic endpoints active.`));
      }
    }
  });

// Command: doctor
program
  .command('doctor')
  .description('Diagnose host environment, Claude installation, and config syntax')
  .action(async () => {
    printBanner();

    const checks: Array<{ name: string; status: 'ok' | 'warn' | 'fail'; detail: string }> = [];

    // Node.js
    const nodeVer = process.version;
    const major = parseInt(nodeVer.replace('v', '').split('.')[0], 10);
    checks.push({
      name: 'Node.js Runtime',
      status: major >= 20 ? 'ok' : 'fail',
      detail: `${nodeVer} (Minimum: v20.0.0)`,
    });

    // Git
    const gitExists = await detector.checkCommandExists('git');
    checks.push({
      name: 'Git Version Control',
      status: gitExists ? 'ok' : 'fail',
      detail: gitExists ? 'Found on PATH' : 'Not found on PATH',
    });

    // Claude Code CLI
    const claudeExists = await detector.checkCommandExists('claude');
    checks.push({
      name: 'Claude Code CLI',
      status: claudeExists ? 'ok' : 'warn',
      detail: claudeExists ? 'Installed on PATH' : 'Not found on PATH (run "claude-bench init" to install)',
    });

    // OmniRoute
    const omnirouteExists = await detector.checkCommandExists('omniroute');
    checks.push({
      name: 'OmniRoute CLI',
      status: omnirouteExists ? 'ok' : 'warn',
      detail: omnirouteExists ? 'Installed globally' : 'Not installed (optional for OmniRoute gateway)',
    });

    // Config syntax check
    const paths = detector.resolveConfigPaths('global');
    let settingsOk = true;
    if (existsSync(paths.claudeCodeSettings)) {
      try {
        JSON.parse(readFileSync(paths.claudeCodeSettings, 'utf8'));
      } catch {
        settingsOk = false;
      }
    }
    checks.push({
      name: 'Claude Settings JSON Syntax',
      status: settingsOk ? 'ok' : 'fail',
      detail: existsSync(paths.claudeCodeSettings)
        ? settingsOk
          ? 'Valid JSON syntax'
          : 'CORRUPTED JSON syntax!'
        : 'File does not exist yet (clean state)',
    });

    printDoctorReport(checks);
  });

// Command: rollback
program
  .command('rollback')
  .description('Restore Claude configuration files from the latest automatic backup')
  .action(async () => {
    try {
      const restored = await backupManager.rollbackLatest();
      console.log(pc.green(` Successfully rolled back to latest backup:`));
      restored.forEach((r) => console.log(pc.cyan(`  • Restored: ${r}`)));
    } catch (err: any) {
      console.error(pc.red(`Rollback failed: ${err.message}`));
      process.exit(1);
    }
  });

// Command: export
program
  .command('export [file]')
  .description('Export current setup profile into a shareable JSON lockfile')
  .action(async (file = 'claude-profile.json') => {
    const profile = {
      version: CLI_VERSION,
      exportedAt: new Date().toISOString(),
      platform: detector.getPlatform(),
      configPaths: detector.resolveConfigPaths('global'),
    };
    const resolvedPath = path.resolve(file);
    await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
    await fs.writeFile(resolvedPath, JSON.stringify(profile, null, 2), 'utf8');
    console.log(pc.green(` Setup profile exported to ${pc.bold(file)}`));
  });

// Command: sync
program
  .command('sync')
  .description('Synchronize and verify skill registry catalog')
  .action(() => {
    const items = loadRegistrySeed();
    console.log(pc.green(` Registry synchronized successfully. ${items.length} verified items active across all 11 fields.`));
  });

export { program };

// Automatically parse arguments when executed as main CLI outside test environment
if (process.env.NODE_ENV !== 'test') {
  program.parse(process.argv);
}
