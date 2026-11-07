import { describe, it, expect } from 'vitest';
import { program } from '../src/cli/index.js';

describe('CLI Commands Interface', () => {
  it('registers all required subcommands on commander program', () => {
    const commands = program.commands.map((cmd) => cmd.name());

    expect(commands).toContain('init');
    expect(commands).toContain('list');
    expect(commands).toContain('add');
    expect(commands).toContain('switch-gateway');
    expect(commands).toContain('doctor');
    expect(commands).toContain('rollback');
    expect(commands).toContain('export');
    expect(commands).toContain('sync');
  });

  it('exposes correct options for init command', () => {
    const initCmd = program.commands.find((c) => c.name() === 'init');
    expect(initCmd).toBeDefined();

    const optionFlags = initCmd?.options.map((o) => o.flags);
    expect(optionFlags?.some((f) => f.includes('--target'))).toBe(true);
    expect(optionFlags?.some((f) => f.includes('--gateway'))).toBe(true);
    expect(optionFlags?.some((f) => f.includes('--fields'))).toBe(true);
    expect(optionFlags?.some((f) => f.includes('--scope'))).toBe(true);
    expect(optionFlags?.some((f) => f.includes('--dry-run'))).toBe(true);
  });

  it('exposes switch-gateway command with mode argument', () => {
    const switchCmd = program.commands.find((c) => c.name() === 'switch-gateway');
    expect(switchCmd).toBeDefined();
    expect(switchCmd?.description()).toContain('9router');
  });
});
