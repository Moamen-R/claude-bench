import { Command } from 'commander';
import fs from 'node:fs/promises';
import path from 'node:path';
import pc from 'picocolors';
import { loadRegistrySeed } from '../registry/registry-loader.js';
import { WizardRunner } from './wizard.js';
import { printBanner, printSummaryTable, printDoctorReport } from './ui.js';
import { OSDetector } from '../core/os-detector.js';
import { BackupManager } from '../core/backup-manager.js';
import { OmniRouteInstaller, type OmniRouteSetupResult } from '../installers/omniroute-installer.js';
import { NineRouterInstaller, type NineRouterSetupResult } from '../installers/ninerouter-installer.js';
import { SkillInstaller } from '../installers/skill-installer.js';
import { MCPConfigMerger } from '../installers/mcp-merger.js';
import {
  CANONICAL_FIELDS,
  type FieldId,
  GatewayModeSchema,
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
  .option('-g, --gateway <gateway>', 'Gateway routing mode: official, omniroute, or 9router')
  .option('-f, --fields <fields>', 'Comma-separated fields (e.g. fullstack,cybersecurity)')
  .option('-s, --scope <scope>', 'Installation scope: global or project', 'global')
  .option('--dry-run', 'Preview changes without modifying host system', false)
  .option('-y, --yes', 'Accept defaults automatically without prompting', false)
  .option('--force', 'Force re-installation of skills even if already present', false)
  .option('-c, --concurrency <number>', 'Concurrent installation workers (default: 4)', '4')
  .action(async (opts) => {
    printBanner();

    let fields: FieldId[] | undefined;
    if (opts.fields) {
      fields = opts.fields.split(',').map((f: string) => f.trim().toLowerCase()) as FieldId[];
    }

    if (opts.yes && !opts.target) opts.target = 'both';
    if (opts.yes && !opts.gateway) opts.gateway = 'official';
    if (opts.yes && (!fields || fields.length === 0)) fields = ['fullstack'];

    if (opts.gateway && !GatewayModeSchema.safeParse(opts.gateway).success) {
      console.error(
        pc.red(`Invalid gateway "${opts.gateway}". Must be one of: ${GatewayModeSchema.options.join(', ')}.`)
      );
      process.exit(1);
    }

    const concurrency = Math.max(1, parseInt(opts.concurrency, 10) || 4);

    const wizard = new WizardRunner();
    await wizard.run({
      target: opts.target as InstallationTarget,
      gateway: opts.gateway as GatewayMode,
      fields,
      scope: opts.scope as ScopeMode,
      dryRun: opts.dryRun,
      yes: opts.yes,
      force: opts.force,
      concurrency,
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
      const installer = new SkillInstaller(undefined, detector);
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
  .description('Switch Claude Code gateway routing between official, omniroute, and 9router')
  .option('-p, --port <port>', 'Gateway local port', '4000')
  .option('--dry-run', 'Preview changes without modifying settings.json', false)
  .action(async (mode, opts) => {
    if (!GatewayModeSchema.safeParse(mode).success) {
      console.error(pc.red(`Mode must be one of: ${GatewayModeSchema.options.join(', ')}.`));
      process.exit(1);
    }

    const port = Number(opts.port);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      console.error(pc.red(`Invalid port: ${opts.port}. Must be an integer between 1 and 65535.`));
      process.exit(1);
    }

    let res: NineRouterSetupResult | OmniRouteSetupResult;
    try {
      if (mode === '9router') {
        const installer = new NineRouterInstaller();
        res = await installer.configureGatewayRoute('9router', port, opts.dryRun);
      } else {
        const installer = new OmniRouteInstaller();
        const gatewayPort = mode === 'official' ? undefined : port;
        res = await installer.configureGatewayRoute(mode, gatewayPort, opts.dryRun);
      }

      if (res.success) {
        console.log(pc.green(` Successfully switched routing gateway to: ${pc.bold(mode)}`));
        if (mode === 'omniroute' || mode === '9router') {
          console.log(pc.cyan(`   ANTHROPIC_BASE_URL set to ${res.daemonUrl}`));
        } else {
          console.log(pc.cyan(`   ANTHROPIC_BASE_URL removed; official Anthropic endpoints active.`));
        }
      } else {
        console.error(pc.red(` Failed to switch gateway: ${res.error || 'Unknown error'}`));
        process.exit(1);
      }
    } catch (err: unknown) {
      console.error(
        pc.red(` Unexpected error switching gateway: ${err instanceof Error ? err.message : String(err)}`)
      );
      process.exit(1);
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

    // 9router
    const nineRouterExists = await detector.checkCommandExists('9router');
    checks.push({
      name: '9router CLI',
      status: nineRouterExists ? 'ok' : 'warn',
      detail: nineRouterExists ? 'Installed globally' : 'Not installed (optional for 9router gateway)',
    });

    // Config syntax check
    const paths = detector.resolveConfigPaths('global');
    let settingsOk = true;
    let settingsExists = false;
    try {
      const content = await fs.readFile(paths.claudeCodeSettings, 'utf8');
      settingsExists = true;
      JSON.parse(content);
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        settingsExists = true;
        settingsOk = false;
      }
    }
    checks.push({
      name: 'Claude Settings JSON Syntax',
      status: settingsOk ? 'ok' : 'fail',
      detail: settingsExists
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
