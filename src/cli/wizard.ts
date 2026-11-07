import * as p from '@clack/prompts';
import pc from 'picocolors';
import { loadRegistrySeed } from '../registry/registry-loader.js';
import {
  CANONICAL_FIELDS,
  type FieldId,
  type GatewayMode,
  type InstallationTarget,
  type ScopeMode,
  type RegistryItem,
} from '../core/schema.js';
import { OSDetector } from '../core/os-detector.js';
import { ClaudeInstaller } from '../installers/claude-installer.js';
import { OmniRouteInstaller } from '../installers/omniroute-installer.js';
import { NineRouterInstaller } from '../installers/ninerouter-installer.js';
import { SkillInstaller } from '../installers/skill-installer.js';
import { MCPConfigMerger } from '../installers/mcp-merger.js';
import { ClaudeMdGenerator } from '../generators/claude-md-generator.js';
import { BackupManager } from '../core/backup-manager.js';
import { theme } from './ui.js';

export interface WizardOptions {
  target?: InstallationTarget;
  gateway?: GatewayMode;
  fields?: FieldId[];
  scope?: ScopeMode;
  dryRun?: boolean;
  yes?: boolean;
}

export class WizardRunner {
  private detector = new OSDetector();
  private backupManager = new BackupManager();
  private claudeInstaller = new ClaudeInstaller(this.detector);
  private omnirouteInstaller = new OmniRouteInstaller();
  private nineRouterInstaller = new NineRouterInstaller(undefined, this.backupManager);
  private skillInstaller = new SkillInstaller();
  private mcpMerger = new MCPConfigMerger(this.backupManager);
  private claudeMdGenerator = new ClaudeMdGenerator(this.backupManager);

  loadRegistry(): RegistryItem[] {
    return loadRegistrySeed();
  }

  async run(options: WizardOptions = {}): Promise<void> {
    const { dryRun = false } = options;

    p.intro(
      `${theme.coral('◖')}${theme.coralBg(pc.bold(pc.white(' claude-bench setup wizard ')))}${theme.coral('◗')}`
    );

    // 1. Select Target
    let target = options.target;
    if (!target) {
      target = (await p.select({
        message: 'Select installation target:',
        options: [
          { value: 'cli', label: 'Claude Code CLI (Official terminal agent)' },
          { value: 'desktop', label: 'Claude Desktop App (Official GUI app)' },
          { value: 'both', label: 'Both (CLI + Desktop)' },
        ],
      })) as InstallationTarget;
      if (p.isCancel(target)) {
        p.cancel('Setup cancelled.');
        process.exit(0);
      }
    }

    // 2. Select Routing Mode
    let gateway = options.gateway;
    if (!gateway) {
      gateway = (await p.select({
        message: 'Select routing & authentication mode:',
        options: [
          { value: 'official', label: 'Official Anthropic Authentication (/login or API Key)' },
          { value: 'omniroute', label: 'OmniRoute Gateway (Multi-provider routing, local daemon)' },
          { value: '9router', label: '9router Gateway (Multi-provider routing, local daemon)' },
        ],
      })) as GatewayMode;
      if (p.isCancel(gateway)) {
        p.cancel('Setup cancelled.');
        process.exit(0);
      }
    }

    // 3. Select Fields
    let selectedFields = options.fields;
    if (!selectedFields || selectedFields.length === 0) {
      selectedFields = (await p.multiselect({
        message: 'Select your professional field(s) to tailor skills & MCPs:',
        options: CANONICAL_FIELDS.map((f) => ({
          value: f,
          label: f.replace(/-/g, ' ').toUpperCase(),
        })),
        required: true,
      })) as FieldId[];
      if (p.isCancel(selectedFields)) {
        p.cancel('Setup cancelled.');
        process.exit(0);
      }
    }

    // 4. Select Scope
    let scope = options.scope;
    if (!scope) {
      scope = (await p.select({
        message: 'Select installation scope:',
        options: [
          { value: 'global', label: 'Global (~/.claude/ - available across all projects)' },
          { value: 'project', label: 'Project-local (./.claude/ and ./.mcp.json in current directory)' },
        ],
      })) as ScopeMode;
      if (p.isCancel(scope)) {
        p.cancel('Setup cancelled.');
        process.exit(0);
      }
    }

    const s = p.spinner();

    // Step A: Target Installer
    s.start(`Configuring Claude targets (${target})...`);
    await this.claudeInstaller.install({ target, dryRun });
    s.stop(`Target configuration complete (${target}).`);

    // Step B: Gateway Configuration
    s.start(`Configuring routing gateway (${gateway})...`);
    try {
      let gatewayResult;
      if (gateway === 'omniroute') {
        gatewayResult = await this.omnirouteInstaller.setup({ port: 4000, dryRun });
      } else if (gateway === '9router') {
        gatewayResult = await this.nineRouterInstaller.setup({ port: 4000, dryRun });
      } else {
        gatewayResult = await this.omnirouteInstaller.configureGatewayRoute('official', undefined, dryRun);
      }

      if (!gatewayResult.success) {
        s.stop(pc.red(`Gateway configuration failed (${gateway}).`));
        console.error(pc.red(gatewayResult.error || 'Unknown error configuring gateway'));
        process.exit(1);
      }
      s.stop(`Gateway route configured (${gateway}).`);
    } catch (err: unknown) {
      s.stop(pc.red(`Gateway configuration failed (${gateway}).`));
      console.error(pc.red(err instanceof Error ? err.message : String(err)));
      process.exit(1);
    }

    // Step C: Filter Registry Items
    const registry = this.loadRegistry();
    const relevantItems = registry.filter((item) =>
      item.fields.some((f) => selectedFields!.includes(f))
    );

    // Step D: Install Skills & CLI-Anything Harnesses
    const skillItems = relevantItems.filter((i) => i.type === 'skill' || i.type === 'cli-anything');
    s.start(`Installing ${skillItems.length} curated skills and harnesses...`);
    await this.skillInstaller.installBatch(skillItems, { scope, dryRun });
    s.stop(`Installed ${skillItems.length} skills & harnesses.`);

    // Step E: Merge MCP Servers
    const mcpItems = relevantItems.filter((i) => i.type === 'mcp' && i.mcpConfig);
    const mcpDict: Record<string, any> = {};
    for (const item of mcpItems) {
      mcpDict[item.id] = item.mcpConfig;
    }
    const configPaths = this.detector.resolveConfigPaths(scope);
    s.start(`Merging ${Object.keys(mcpDict).length} MCP servers into configuration...`);
    await this.mcpMerger.mergeServers(configPaths.claudeCodeSettings, mcpDict, { dryRun });
    if (target === 'desktop' || target === 'both') {
      await this.mcpMerger.mergeServers(configPaths.claudeDesktopConfig, mcpDict, { dryRun });
    }
    s.stop(`Merged ${Object.keys(mcpDict).length} MCP servers.`);

    // Step F: Generate CLAUDE.md
    s.start(`Generating tailored CLAUDE.md blueprint...`);
    await this.claudeMdGenerator.writeToFile(configPaths.claudeMd, selectedFields, dryRun);
    s.stop(`CLAUDE.md created at ${configPaths.claudeMd}`);

    p.outro(
      pc.bold(
        pc.green(
          ` Setup successfully completed! Claude is now tailored for: ${selectedFields.join(', ')}`
        )
      )
    );
  }
}
