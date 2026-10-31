import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { ScraplingSyncEngine } from '../src/registry/scrapling-sync.js';
import type { RegistryItem } from '../src/core/schema.js';

describe('ScraplingSyncEngine', () => {
  let tempBaseDir: string;
  let tempSeedPath: string;

  beforeEach(async () => {
    tempBaseDir = await fs.mkdtemp(path.join(os.tmpdir(), 'claude-forge-sync-'));
    tempSeedPath = path.join(tempBaseDir, 'registry.seed.json');
    await fs.writeFile(
      tempSeedPath,
      JSON.stringify([
        {
          id: 'existing-skill',
          name: 'Existing Skill',
          type: 'skill',
          fields: ['fullstack'],
          repoUrl: 'https://github.com/existing/skill',
          installCommand: 'npx -y skills add existing/skill --skill skill --agent claude-code',
          description: 'An existing skill',
          stars: 1000,
          trustScore: 90,
        },
      ])
    );
  });

  afterEach(async () => {
    await fs.rm(tempBaseDir, { recursive: true, force: true });
  });

  it('validates and merges incoming scraped items into registry', async () => {
    const engine = new ScraplingSyncEngine(tempSeedPath);
    const newItems: RegistryItem[] = [
      {
        id: 'new-scraped-skill',
        name: 'New Scraped Skill',
        type: 'skill',
        fields: ['cybersecurity'],
        repoUrl: 'https://github.com/scraped/skill',
        installCommand: 'npx -y skills add scraped/skill --skill tool --agent claude-code',
        description: 'A newly scraped skill',
        stars: 2500,
        trustScore: 95,
      },
    ];

    const result = await engine.mergeIncoming(newItems);
    expect(result.addedCount).toBe(1);

    const updated = JSON.parse(await fs.readFile(tempSeedPath, 'utf8'));
    expect(updated).toHaveLength(2);
    expect(updated.some((i: any) => i.id === 'new-scraped-skill')).toBe(true);
  });

  it('filters out untrusted or schema-invalid incoming items', async () => {
    const engine = new ScraplingSyncEngine(tempSeedPath);
    const maliciousItems: RegistryItem[] = [
      {
        id: 'bad-skill',
        name: 'Bad Skill',
        type: 'skill',
        fields: ['cybersecurity'],
        repoUrl: 'http://insecure.com',
        installCommand: 'npx -y skills add bad/skill; rm -rf /',
        description: 'Malicious',
        stars: 5,
        trustScore: 20,
      },
    ];

    const result = await engine.mergeIncoming(maliciousItems);
    expect(result.addedCount).toBe(0);
    expect(result.rejectedCount).toBe(1);

    const updated = JSON.parse(await fs.readFile(tempSeedPath, 'utf8'));
    expect(updated).toHaveLength(1);
  });
});
