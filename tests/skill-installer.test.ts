import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { SkillInstaller, type SkillProgressEvent } from '../src/installers/skill-installer.js';
import { SecurityAuditor } from '../src/core/security-auditor.js';
import { OSDetector } from '../src/core/os-detector.js';
import type { RegistryItem } from '../src/core/schema.js';

describe('SkillInstaller', () => {
  let auditor: SecurityAuditor;
  let installer: SkillInstaller;

  const sampleSkills: RegistryItem[] = [
    {
      id: 'shadcn-ui',
      name: 'shadcn/ui',
      type: 'skill',
      fields: ['fullstack'],
      repoUrl: 'https://github.com/shadcn-ui/ui',
      installCommand: 'npx -y skills add shadcn-ui/ui --skill add-component --agent claude-code',
      description: 'Radix UI and Tailwind CSS components',
      stars: 74000,
      trustScore: 99,
    },
    {
      id: 'superpowers',
      name: 'Superpowers TDD',
      type: 'skill',
      fields: ['software-eng'],
      repoUrl: 'https://github.com/obra/superpowers',
      installCommand: 'npx -y skills add obra/superpowers --skill superpowers --agent claude-code',
      description: 'Spec-first TDD framework',
      stars: 8200,
      trustScore: 99,
    },
  ];

  beforeEach(() => {
    auditor = new SecurityAuditor();
    installer = new SkillInstaller(auditor);
  });

  it('generates dry-run commands for selected skills', async () => {
    const result = await installer.installBatch(sampleSkills, {
      scope: 'global',
      dryRun: true,
    });

    expect(result.dryRun).toBe(true);
    expect(result.success).toBe(true);
    expect(result.installed).toContain('shadcn-ui');
    expect(result.installed).toContain('superpowers');
    expect(result.commandsExecuted).toHaveLength(2);
    expect(result.commandsExecuted[0]).toContain('npx -y skills add shadcn-ui/ui');
  });

  it('rejects malicious items during audit phase', async () => {
    const maliciousItem: RegistryItem = {
      id: 'malicious-skill',
      name: 'Exploit Test',
      type: 'skill',
      fields: ['cybersecurity'],
      repoUrl: 'https://github.com/attacker/malicious',
      installCommand: 'npx -y skills add attacker/malicious; rm -rf /',
      description: 'Dangerous payload',
      stars: 10,
      trustScore: 10,
    };

    const result = await installer.installBatch([...sampleSkills, maliciousItem], {
      dryRun: true,
    });

    expect(result.failed).toHaveLength(1);
    expect(result.failed[0].item).toBe('malicious-skill');
    expect(result.installed).toContain('shadcn-ui');
    expect(result.installed).toContain('superpowers');
  });

  it('emits onProgress events with progress bar data during installation', async () => {
    const progressEvents: SkillProgressEvent[] = [];
    const onProgress = (event: SkillProgressEvent) => {
      progressEvents.push(event);
    };

    const result = await installer.installBatch(sampleSkills, {
      dryRun: true,
      onProgress,
    });

    expect(result.success).toBe(true);
    expect(progressEvents.length).toBeGreaterThanOrEqual(sampleSkills.length);
    const lastEvent = progressEvents[progressEvents.length - 1];
    expect(lastEvent.completed).toBe(sampleSkills.length);
    expect(lastEvent.total).toBe(sampleSkills.length);
  });

  it('correctly appends non-interactive -y and scope flags in buildInstallArgs', () => {
    const globalArgs = installer.buildInstallArgs(sampleSkills[0], { scope: 'global' });
    expect(globalArgs.binary).toBe('npx');
    expect(globalArgs.args).toContain('-y');
    expect(globalArgs.args).toContain('-g');

    const projectArgs = installer.buildInstallArgs(sampleSkills[0], { scope: 'project' });
    expect(projectArgs.binary).toBe('npx');
    expect(projectArgs.args).toContain('-y');
    expect(projectArgs.args).toContain('-p');

    const directSkillsItem: RegistryItem = {
      id: 'direct-skills',
      name: 'Direct Skills Test',
      type: 'skill',
      fields: ['fullstack'],
      repoUrl: 'https://github.com/foo/bar',
      installCommand: 'skills add foo/bar --skill bar',
      description: 'Direct skills binary test',
      stars: 10,
      trustScore: 90,
    };
    const directArgs = installer.buildInstallArgs(directSkillsItem, { scope: 'global' });
    expect(directArgs.binary).toBe('skills');
    expect(directArgs.args).toContain('-y');
    expect(directArgs.args).toContain('-g');
  });

  it('detects and skips already installed skills when force is false', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-bench-skills-test-'));
    const fakeSkillsDir = path.join(tempDir, 'skills');
    fs.mkdirSync(fakeSkillsDir, { recursive: true });

    // Pre-create 'add-component' skill directory (from sampleSkills[0])
    fs.mkdirSync(path.join(fakeSkillsDir, 'add-component'), { recursive: true });
    fs.writeFileSync(path.join(fakeSkillsDir, 'add-component', 'SKILL.md'), '# Fake skill');

    const mockDetector = {
      resolveConfigPaths: () => ({ skillsDir: fakeSkillsDir }),
    } as unknown as OSDetector;

    const customInstaller = new SkillInstaller(auditor, mockDetector);

    const result = await customInstaller.installBatch([sampleSkills[0]], {
      force: false,
    });

    expect(result.cached).toContain('shadcn-ui');
    expect(result.installed).toContain('shadcn-ui');
    expect(result.commandsExecuted).toHaveLength(0);

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('re-installs already installed skills when force is true', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-bench-skills-test-'));
    const fakeSkillsDir = path.join(tempDir, 'skills');
    fs.mkdirSync(fakeSkillsDir, { recursive: true });
    fs.mkdirSync(path.join(fakeSkillsDir, 'add-component'), { recursive: true });

    const mockDetector = {
      resolveConfigPaths: () => ({ skillsDir: fakeSkillsDir }),
    } as unknown as OSDetector;

    const customInstaller = new SkillInstaller(auditor, mockDetector);

    const result = await customInstaller.installBatch([sampleSkills[0]], {
      dryRun: true,
      force: true,
    });

    expect(result.cached).toHaveLength(0);
    expect(result.installed).toContain('shadcn-ui');
    expect(result.commandsExecuted).toHaveLength(1);

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('handles child process errors gracefully without hanging the batch', async () => {
    const brokenItem: RegistryItem = {
      id: 'broken-item',
      name: 'Broken Item',
      type: 'skill',
      fields: ['fullstack'],
      repoUrl: 'https://github.com/broken/broken',
      installCommand: 'node -e "process.exit(1)"',
      description: 'Test error handling',
      stars: 1,
      trustScore: 90,
    };

    const result = await installer.installBatch([brokenItem], {
      dryRun: false,
      force: true,
      timeoutMs: 5000,
    });

    expect(result.success).toBe(false);
    expect(result.failed).toHaveLength(1);
    expect(result.failed[0].item).toBe('broken-item');
    expect(result.installed).toHaveLength(0);
  });
});
