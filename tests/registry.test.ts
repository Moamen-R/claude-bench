import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { RegistryItemSchema, CANONICAL_FIELDS } from '../src/core/schema.js';
import { SecurityAuditor } from '../src/core/security-auditor.js';

describe('Registry Seed Catalog Validation', () => {
  const seedPath = path.resolve('src/registry/registry.seed.json');
  const auditor = new SecurityAuditor();

  it('verifies registry.seed.json exists and is valid JSON array', () => {
    expect(existsSync(seedPath)).toBe(true);
    const content = readFileSync(seedPath, 'utf8');
    const items = JSON.parse(content);
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(100);
  });

  it('validates every item conforms to RegistryItemSchema and passes SecurityAuditor', () => {
    const items = JSON.parse(readFileSync(seedPath, 'utf8'));
    items.forEach((item: any, idx: number) => {
      const parsed = RegistryItemSchema.safeParse(item);
      if (!parsed.success) {
        throw new Error(`Item at index ${idx} failed schema: ${JSON.stringify(parsed.error.errors)}`);
      }
      expect(parsed.success).toBe(true);

      const audit = auditor.auditRegistryItem(item);
      if (!audit.valid) {
        throw new Error(`Item ${item.id} failed security audit: ${audit.issues.join('; ')}`);
      }
      expect(audit.valid).toBe(true);
    });
  });

  it('ensures every one of the 11 canonical fields has at least 50+ matching items', () => {
    const items = JSON.parse(readFileSync(seedPath, 'utf8'));
    for (const field of CANONICAL_FIELDS) {
      const fieldItems = items.filter((item: { fields: string[] }) => item.fields.includes(field));
      expect(fieldItems.length).toBeGreaterThanOrEqual(50);
    }
  });

  it('ensures video-editing contains comprehensive hyperframes skills and plugins', () => {
    const items = JSON.parse(readFileSync(seedPath, 'utf8'));
    const videoItems = items.filter((item: { fields: string[] }) => item.fields.includes('video-editing'));
    expect(videoItems.length).toBeGreaterThanOrEqual(50);

    const hyperframesItems = videoItems.filter(
      (item: { id: string; repoUrl: string }) =>
        item.id.includes('hyperframes') || item.repoUrl.includes('hyperframes')
    );
    expect(hyperframesItems.length).toBeGreaterThanOrEqual(40);
  });

  it('ensures all programming fields include superpowers and open code review mcp and skills', () => {
    const items = JSON.parse(readFileSync(seedPath, 'utf8'));
    const programmingFields = [
      'fullstack',
      'cybersecurity',
      'mobile-dev',
      'desktop-dev',
      'ios-dev',
      'backend-dev',
      'frontend-dev',
      'software-eng',
    ];

    for (const field of programmingFields) {
      const fieldItems = items.filter((item: { fields: string[] }) => item.fields.includes(field));
      const hasSuperpowers = fieldItems.some((item: { id: string }) => item.id.includes('superpowers'));
      const hasOpenCodeReview = fieldItems.some(
        (item: { id: string }) => item.id.includes('opencode-review') || item.id.includes('ocr')
      );

      expect(hasSuperpowers).toBe(true);
      expect(hasOpenCodeReview).toBe(true);
    }
  });

  it('ensures zero placeholder or fake URLs in registry.seed.json', () => {
    const raw = readFileSync(seedPath, 'utf8');
    expect(raw).not.toContain('TODO');
    expect(raw).not.toContain('example.com');
    expect(raw).not.toContain('fake/skill');
  });
});
