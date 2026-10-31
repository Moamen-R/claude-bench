import pc from 'picocolors';

export function printBanner(): void {
  console.log(
    pc.cyan(`
   ██████╗██╗      █████╗ ██╗   ██╗██████╗ ███████╗
  ██╔════╝██║     ██╔══██╗██║   ██║██╔══██╗██╔════╝
  ██║     ██║     ███████║██║   ██║██║  ██║█████╗
  ██║     ██║     ██╔══██║██║   ██║██║  ██║██╔══╝
  ╚██████╗███████╗██║  ██║╚██████╔╝██████╔╝███████╗
   ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝
   ███████╗ ██████╗ ██████╗  ██████╗ ███████╗
   ██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝
   █████╗  ██║   ██║██████╔╝██║  ███╗█████╗
   ██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝
   ██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗
   ╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝
`)
  );
  console.log(
    pc.bold(
      pc.magenta(
        '  Production-grade Claude Setup CLI for Official Claude & OmniRoute\n'
      )
    )
  );
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
  console.log(pc.bold(pc.cyan('\n=== Execution Summary ===')));
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
  console.log(pc.cyan('=========================\n'));
}
