import { describe, it, expect, vi } from 'vitest';
import {
  printBanner,
  formatFieldList,
  renderBox,
  printSummaryTable,
  formatBadge,
  stripAnsi,
  visibleLength,
  padEndAnsi,
  printStepHeader,
  printDoctorReport,
  formatProgressBar,
} from '../src/cli/ui.js';

describe('UI Utilities and Formatters', () => {
  it('strips ANSI codes and calculates visible length accurately', () => {
    const raw = '\x1b[38;2;217;119;87mclaude\x1b[0m';
    expect(stripAnsi(raw)).toBe('claude');
    expect(visibleLength(raw)).toBe(6);
    expect(stripAnsi(padEndAnsi(raw, 10))).toBe('claude    ');
  });

  it('formats badges correctly', () => {
    expect(stripAnsi(formatBadge('OK', 'success'))).toContain('OK');
    expect(stripAnsi(formatBadge('ALERT', 'warning'))).toContain('ALERT');
    expect(stripAnsi(formatBadge('INFO', 'info'))).toContain('INFO');
    expect(stripAnsi(formatBadge('MUTED', 'muted'))).toContain('[MUTED]');
  });

  it('renders box borders with custom title and content', () => {
    const box = renderBox('TEST TITLE', ['line 1', 'line 2'], { width: 40 });
    const stripped = stripAnsi(box);
    expect(stripped).toContain('TEST TITLE');
    expect(stripped).toContain('line 1');
    expect(stripped).toContain('line 2');
    expect(stripped).toContain('╭──');
    expect(stripped).toContain('╰');
  });

  it('formats field list with icons and metadata', () => {
    const list = formatFieldList(['fullstack', 'cybersecurity']);
    const stripped = stripAnsi(list);
    expect(stripped).toContain('Full Stack Web Developer');
    expect(stripped).toContain('Cyber Security');
    expect(stripped).toContain('(fullstack)');
  });

  it('handles empty field list gracefully', () => {
    const list = formatFieldList([]);
    expect(stripAnsi(list)).toContain('None selected');
  });

  it('prints hero banner and summary table without crashing', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    printBanner();
    expect(logSpy).toHaveBeenCalled();

    printSummaryTable({
      target: 'both',
      gateway: 'omniroute',
      fields: ['fullstack'],
      scope: 'global',
      installedCount: 50,
      backupPath: '/tmp/backup.json',
      dryRun: true,
    });
    expect(logSpy).toHaveBeenCalled();

    printStepHeader(1, 3, 'Installing dependencies');
    expect(logSpy).toHaveBeenCalled();

    printDoctorReport([
      { name: 'Node.js', status: 'ok', detail: 'v20.0.0' },
      { name: 'Git', status: 'warn', detail: 'Outdated' },
      { name: 'Claude CLI', status: 'fail', detail: 'Missing' },
    ]);
    expect(logSpy).toHaveBeenCalled();

    logSpy.mockRestore();
  });

  it('formats progress bar accurately at 0%, 50%, and 100%', () => {
    const bar0 = stripAnsi(formatProgressBar(0, 10, 10));
    expect(bar0).toContain('0%');
    expect(bar0).toContain('░░░░░░░░░░');

    const bar50 = stripAnsi(formatProgressBar(5, 10, 10));
    expect(bar50).toContain('50%');
    expect(bar50).toContain('█████░░░░░');

    const bar100 = stripAnsi(formatProgressBar(10, 10, 10));
    expect(bar100).toContain('100%');
    expect(bar100).toContain('██████████');
  });
});
