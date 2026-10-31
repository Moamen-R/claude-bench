import pc from 'picocolors';
import { CLI_VERSION } from './version.js';

/**
 * Claude Brand & Bench TrueColor Palette
 * Automatically degrades gracefully when NO_COLOR or dumb terminals are detected.
 */
const isColorSupported =
  !process.env.NO_COLOR &&
  process.env.TERM !== 'dumb' &&
  (process.stdout.isTTY ?? true);

function rgb(r: number, g: number, b: number) {
  return (str: string): string =>
    isColorSupported ? `\x1b[38;2;${r};${g};${b}m${str}\x1b[39m` : str;
}

function bgRgb(r: number, g: number, b: number) {
  return (str: string): string =>
    isColorSupported ? `\x1b[48;2;${r};${g};${b}m${str}\x1b[49m` : str;
}

// Core Brand Palette: Claude Terracotta (#D97757), Peach (#E88B6B), Amber Glow (#F5B041), Slate
export const theme = {
  coral: rgb(217, 119, 87),       // #D97757 - Primary Claude Terracotta
  peach: rgb(232, 139, 107),      // #E88B6B - Secondary Warm Accent
  apricot: rgb(244, 169, 138),    // #F4A98A - Soft Highlight
  amber: rgb(245, 176, 65),       // #F5B041 - Spark / Warning Accent
  emerald: rgb(46, 204, 113),     // #2ECC71 - Verified / Success
  cyan: rgb(86, 182, 194),        // #56B6C2 - Path / Info
  slate: rgb(148, 163, 184),      // #94A3B8 - Muted Labels
  charcoal: rgb(71, 85, 105),     // #475569 - Subtle Borders
  coralBg: bgRgb(217, 119, 87),
  darkBg: bgRgb(30, 41, 59),
};

const { coral, peach, apricot, amber, emerald, cyan, slate, charcoal } = theme;

/**
 * Canonical metadata for the 11 supported professional fields.
 */
const FIELD_META: Record<string, { label: string; icon: string; tag: string }> = {
  fullstack:       { label: 'Full Stack Web Developer', icon: '⚡', tag: 'Web & Cloud' },
  cybersecurity:   { label: 'Cyber Security',           icon: '🛡️', tag: 'SecOps & Pentest' },
  'video-editing': { label: 'Video Editing',            icon: '🎬', tag: 'Media & FFmpeg' },
  researcher:      { label: 'Researcher',               icon: '🔬', tag: 'ArXiv & Data' },
  marketing:       { label: 'Marketing',                icon: '📈', tag: 'Growth & SEO' },
  'mobile-dev':    { label: 'Mobile Developer',         icon: '📱', tag: 'RN & Flutter' },
  'desktop-dev':   { label: 'Desktop Developer',        icon: '🖥️', tag: 'Tauri & Electron' },
  'ios-dev':       { label: 'iOS Developer',            icon: '🍎', tag: 'Swift & Xcode' },
  'backend-dev':   { label: 'Backend Developer',        icon: '⚙️', tag: 'APIs & Infra' },
  'frontend-dev':  { label: 'Front-End Developer',      icon: '🎨', tag: 'UI/UX & WCAG' },
  'software-eng':  { label: 'Software Engineer',        icon: '🏗️', tag: 'Arch & TDD' },
};

/**
 * Strips ANSI escape sequences to calculate true visible character width.
 */
// eslint-disable-next-line no-control-regex
const ANSI_REGEX = /\x1b\[[0-9;]*m/g;

export function stripAnsi(str: string): string {
  return str.replace(ANSI_REGEX, '');
}

export function visibleLength(str: string): number {
  return Array.from(stripAnsi(str)).length;
}

export function padEndAnsi(str: string, targetWidth: number, padChar = ' '): string {
  const diff = targetWidth - visibleLength(str);
  return diff > 0 ? str + padChar.repeat(diff) : str;
}

/**
 * Renders a pill-style terminal badge.
 */
export function formatBadge(
  label: string,
  variant: 'brand' | 'success' | 'warning' | 'info' | 'muted' = 'brand'
): string {
  switch (variant) {
    case 'brand':
      return `${coral('◖')}${ theme.coralBg(pc.bold(pc.white(` ${label} `))) }${coral('◗')}`;
    case 'success':
      return pc.bold(emerald(`● ${label}`));
    case 'warning':
      return pc.bold(amber(`▲ ${label}`));
    case 'info':
      return pc.bold(cyan(`◆ ${label}`));
    case 'muted':
    default:
      return slate(`[${label}]`);
  }
}

/**
 * Prints the upgraded Claude-Bench Hero Banner with 3D Anvil icon, gradient sparks, and telemetry bar.
 */
export function printBanner(version: string = `v${CLI_VERSION}`): void {
  const anvil = [
    `   ${amber('✦')}  ${coral(pc.bold('✦'))} ${peach('·')}    `,
    `  ${coral(pc.bold('▀█████████▀'))}  `,
    `    ${peach(pc.bold('▐█████▌'))}    `,
    `  ${apricot(pc.bold('▄█████████▄'))}  `,
    ` ${charcoal('▀▀▀▀▀▀▀▀▀▀▀▀▀')} `,
  ];

  const titleLine =
    `${pc.bold(pc.white('claude'))}${coral(pc.bold('-bench'))} ` +
    `${ slate(version) } ` +
    `${formatBadge('SUPERPOWERS + RUFLO', 'muted')}`;

  const subtitleLine = pc.bold(
    peach('CLI & DESKTOP BOOTSTRAPPER ENGINE FOR CLAUDE CODE')
  );

  const descLine = slate(
    'Automated Skills · Plugins · MCP Servers · CLI-Anything · OmniRoute Gateway'
  );

  const ruleLine =
    coral('━'.repeat(18)) +
    peach('━'.repeat(18)) +
    apricot('━'.repeat(14)) +
    charcoal('━'.repeat(10));

  const registryLine =
    `${emerald('●')} ${slate('Registries:')} ${pc.white('claudemarketplaces.com')} ${charcoal('│')} ` +
    `${pc.white('skills.sh')} ${charcoal('│')} ` +
    `${pc.white('clianything.cc')} ${charcoal('│')} ` +
    `${pc.white('mcp.so')}`;

  console.log();
  console.log(`${anvil[0]}  ${titleLine}`);
  console.log(`${anvil[1]}  ${subtitleLine}`);
  console.log(`${anvil[2]}  ${descLine}`);
  console.log(`${anvil[3]}  ${ruleLine}`);
  console.log(`${anvil[4]}  ${registryLine}`);
  console.log();
}

/**
 * Formats an array of field IDs or names into a rich, aligned multi-line or inline display string.
 */
export function formatFieldList(fields: string[]): string {
  if (!fields || fields.length === 0) {
    return slate('  ○ None selected');
  }

  return fields
    .map((rawField) => {
      const key = rawField.trim().toLowerCase();
      const meta = FIELD_META[key];
      if (meta) {
        return (
          `  ${emerald('✔')} ${pc.bold(pc.white(padEndAnsi(meta.label, 26)))} ` +
          `${coral(`(${key})`)} ${charcoal('—')} ${slate(meta.tag)}`
        );
      }
      return `  ${emerald('✔')} ${pc.bold(pc.white(rawField))}`;
    })
    .join('\n');
}

/**
 * Renders a clean Unicode rounded box around a title and lines of content.
 */
export function renderBox(
  title: string,
  lines: string[],
  options: { width?: number; borderColor?: (s: string) => string } = {}
): string {
  const border = options.borderColor ?? coral;
  const contentMax = Math.max(
    visibleLength(title) + 6,
    ...lines.map((l) => visibleLength(l))
  );
  const innerWidth = Math.max(options.width ?? 64, contentMax + 4);

  const titleText = ` ${title} `;
  const titleLen = visibleLength(titleText);
  const topDashCount = Math.max(2, innerWidth - titleLen - 2);
  const topBorder =
    border('╭──') +
    titleText +
    border('─'.repeat(topDashCount) + '╮');

  const body = lines.map((line) => {
    const padded = padEndAnsi(line, innerWidth - 4);
    return `${border('│')}  ${padded}  ${border('│')}`;
  });

  const bottomBorder = border(`╰${'─'.repeat(innerWidth)}╯`);
  return [topBorder, ...body, bottomBorder].join('\n');
}

/**
 * Prints a structured, rounded-box Execution Summary card after `claude-bench init` or `sync`.
 */
export function printSummaryTable(summary: {
  target: string;
  gateway: string;
  fields: string[];
  scope: string;
  installedCount: number;
  backupPath?: string;
  dryRun?: boolean;
}): void {
  const isOmni = summary.gateway.toLowerCase().includes('omniroute');
  const gatewayBadge = isOmni
    ? `${peach(pc.bold('OmniRoute AI Gateway'))} ${slate('(Multi-Provider Proxy)')}`
    : `${emerald(pc.bold('Official Anthropic'))} ${slate('(Direct Claude Auth)')}`;

  const scopeBadge =
    summary.scope.toLowerCase() === 'global'
      ? `${cyan('Global')} ${slate('(~/.claude/)')}`
      : `${amber('Project')} ${slate('(Repository ./.claude/)')}`;

  const formattedFields =
    summary.fields.length > 0
      ? summary.fields
          .map((f) => {
            const meta = FIELD_META[f.toLowerCase()];
            return meta ? `${coral(meta.label)}` : coral(f);
          })
          .join(slate(', '))
      : slate('None');

  const labelWidth = 14;
  const row = (label: string, value: string): string =>
    `${slate(padEndAnsi(label, labelWidth))} ${value}`;

  const lines: string[] = [
    row('Target', pc.bold(pc.white(summary.target))),
    row('Routing Mode', gatewayBadge),
    row('Scope', scopeBadge),
    row('Fields', formattedFields),
    row(
      'Installed',
      `${emerald(pc.bold(String(summary.installedCount)))} ${slate('verified skills, plugins & MCP servers')}`
    ),
  ];

  if (summary.backupPath) {
    lines.push(row('Backup', cyan(summary.backupPath)));
  }

  if (summary.dryRun) {
    lines.push(charcoal('─'.repeat(58)));
    lines.push(
      `${amber(pc.bold('⚠ DRY RUN MODE:'))} ${pc.yellow('No system binaries or config files were modified.')}`
    );
  }

  lines.push(charcoal('─'.repeat(58)));
  lines.push(
    `${slate('Next Step:')} Run ${coral(pc.bold('claude'))} to launch or ${peach(pc.bold('claude-bench doctor'))} to verify.`
  );

  console.log();
  console.log(
    renderBox(
      coral(pc.bold('✦ CLAUDE-BENCH EXECUTION SUMMARY')),
      lines,
      { width: 66, borderColor: summary.dryRun ? amber : coral }
    )
  );
  console.log();
}

/**
 * Prints a section step header during multi-stage CLI execution.
 */
export function printStepHeader(step: number, total: number, title: string): void {
  const stepPill = coral(pc.bold(`[${step}/${total}]`));
  console.log(`\n${stepPill} ${pc.bold(pc.white(title))}`);
}

/**
 * Prints a diagnostic table for `claude-bench doctor`.
 */
export function printDoctorReport(
  checks: Array<{
    name: string;
    status: 'ok' | 'warn' | 'fail';
    detail: string;
  }>
): void {
  const rows = checks.map((c) => {
    const icon =
      c.status === 'ok'
        ? emerald('✔ PASS')
        : c.status === 'warn'
          ? amber('▲ WARN')
          : pc.red('✖ FAIL');
    return `${padEndAnsi(icon, 8)}  ${padEndAnsi(pc.bold(pc.white(c.name)), 24)} ${slate(c.detail)}`;
  });

  console.log();
  console.log(
    renderBox(peach(pc.bold('🩺 CLAUDE-BENCH SYSTEM DIAGNOSTICS')), rows, {
      width: 66,
      borderColor: peach,
    })
  );
  console.log();
}