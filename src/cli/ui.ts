import pc from 'picocolors';

// Claude brand terracotta (#D97757) and accent (#E88B6B)
const coral = (str: string) => `\x1b[38;2;217;119;87m${str}\x1b[0m`;
const peach = (str: string) => `\x1b[38;2;232;139;107m${str}\x1b[0m`;

export function printBanner(): void {
  // Minimal Forge Anvil + Terminal Spark Icon matching brand logo
  const icon = [
    coral(pc.bold('       ✦')),
    peach(pc.bold('   ▀████████▀')),
    pc.white(pc.bold('      ████')),
    pc.white(pc.bold('     ██████')),
  ];

  console.log();
  console.log(`${icon[0]}   ${pc.bold(pc.white('claude'))}${coral(pc.bold('-forge'))}`);
  console.log(`${icon[1]}   ${pc.dim(pc.gray('CLI & DESKTOP BOOTSTRAPPER ENGINE'))}`);
  console.log(`${icon[2]}   ${pc.dim('Multi-domain AI engineering & creative orchestrator')}`);
  console.log(`${icon[3]}   ${coral('──────────────────────────────────────────────────')}`);
  console.log();
}

export function formatFieldList(fields: string[]): string {
  return fields.map((f) => pc.green(`• ${f}`)).join('\n');
}

export function printSummaryTable(summary: {
  target: string;
  gateway: string;
  fields: string[];
  scope: string;
  installedCount: number;
  backupPath?: string;
  dryRun?: boolean;
}): void {
  console.log(coral(pc.bold('\n=== Execution Summary ===')));
  console.log(`${pc.bold('Target:')}       ${summary.target}`);
  console.log(`${pc.bold('Gateway:')}      ${summary.gateway}`);
  console.log(`${pc.bold('Fields:')}       ${summary.fields.join(', ')}`);
  console.log(`${pc.bold('Scope:')}        ${summary.scope}`);
  console.log(`${pc.bold('Installed:')}    ${summary.installedCount} items`);
  if (summary.backupPath) {
    console.log(`${pc.bold('Backup:')}       ${summary.backupPath}`);
  }
  if (summary.dryRun) {
    console.log(pc.yellow(`\n[DRY RUN] No files or system binaries were modified.`));
  }
  console.log(coral('=========================\n'));
}
