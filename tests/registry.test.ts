import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { RegistryItemSchema, CANONICAL_FIELDS } from '../src/core/schema.js';

describe('Registry Seed Catalog Validation', () => {
  const seedPath = path.resolve('src/registry/registry.seed.json');

  it('verifies registry.seed.json exists and is valid JSON array', () => {
    expect(existsSync(seedPath)).toBe(true);
    const content = readFileSync(seedPath, 'utf8');
    const items = JSON.parse(content);
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(30);
  });

  it('validates every item conforms to RegistryItemSchema', () => {
    const items = JSON.parse(readFileSync(seedPath, 'utf8'));
    items.forEach((item: unknown, idx: number) => {
      const parsed = RegistryItemSchema.safeParse(item);
      if (!parsed.success) {
        throw new Error(`Item at index ${idx} failed schema validation: ${JSON.stringify(parsed.error.errors)}`);
      }
      expect(parsed.success).toBe(true);
    });
  });

  it('ensures every one of the 11 canonical fields has at least 3 matching items', () => {
    const items = JSON.parse(readFileSync(seedPath, 'utf8'));
    for (const field of CANONICAL_FIELDS) {
      const fieldItems = items.filter((item: { fields: string[] }) => item.fields.includes(field));
      expect(fieldItems.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('ensures zero placeholder or fake URLs in registry.seed.json', () => {
    const raw = readFileSync(seedPath, 'utf8');
    expect(raw).not.toContain('TODO');
    expect(raw).not.toContain('example.com');
    expect(raw).not.toContain('fake/skill');
  });
});
