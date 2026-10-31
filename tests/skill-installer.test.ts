import { describe, it, expect, beforeEach } from 'vitest';
import { SkillInstaller } from '../src/installers/skill-installer.js';
import { SecurityAuditor } from '../src/core/security-auditor.js';
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
});
