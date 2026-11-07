import { describe, it, expect } from 'vitest';
import {
  FieldIdSchema,
  ItemTypeSchema,
  RegistryItemSchema,
  UserProfileSchema,
  MCPServerConfigSchema,
  GatewayModeSchema,
  CANONICAL_FIELDS,
} from '../src/core/schema.js';

describe('Core Schema Validation', () => {
  it('validates all 13 canonical Field IDs', () => {
    expect(CANONICAL_FIELDS).toHaveLength(13);
    expect(CANONICAL_FIELDS).toContain('fullstack');
    expect(CANONICAL_FIELDS).toContain('cybersecurity');
    expect(CANONICAL_FIELDS).toContain('video-editing');
    expect(CANONICAL_FIELDS).toContain('researcher');
    expect(CANONICAL_FIELDS).toContain('marketing');
    expect(CANONICAL_FIELDS).toContain('mobile-dev');
    expect(CANONICAL_FIELDS).toContain('desktop-dev');
    expect(CANONICAL_FIELDS).toContain('ios-dev');
    expect(CANONICAL_FIELDS).toContain('backend-dev');
    expect(CANONICAL_FIELDS).toContain('frontend-dev');
    expect(CANONICAL_FIELDS).toContain('software-eng');
    expect(CANONICAL_FIELDS).toContain('data-engineering');
    expect(CANONICAL_FIELDS).toContain('ai-ml');

    CANONICAL_FIELDS.forEach((field) => {
      expect(FieldIdSchema.safeParse(field).success).toBe(true);
    });

    expect(FieldIdSchema.safeParse('invalid-field').success).toBe(false);
  });

  it('validates item types', () => {
    ['skill', 'plugin', 'mcp', 'cli-anything'].forEach((type) => {
      expect(ItemTypeSchema.safeParse(type).success).toBe(true);
    });
    expect(ItemTypeSchema.safeParse('unknown').success).toBe(false);
  });

  it('validates a valid RegistryItem', () => {
    const validItem = {
      id: 'shadcn-ui',
      name: 'shadcn/ui component helper',
      type: 'skill',
      fields: ['fullstack', 'frontend-dev'],
      repoUrl: 'https://github.com/shadcn-ui/ui',
      installCommand: 'npx -y skills add shadcn/ui --skill add-component --agent claude-code',
      description: 'Add shadcn/ui components easily',
      stars: 12500,
      trustScore: 98,
    };

    const result = RegistryItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it('validates MCP server config schema', () => {
    const mcpConfig = {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-postgres', 'postgresql://localhost/db'],
      env: {
        DEBUG: 'true',
      },
    };
    expect(MCPServerConfigSchema.safeParse(mcpConfig).success).toBe(true);
  });

  it('validates UserProfile schema', () => {
    const profile = {
      version: '1.0.0',
      target: 'both',
      gateway: 'omniroute',
      fields: ['fullstack', 'cybersecurity'],
      scope: 'global',
      createdAt: new Date().toISOString(),
    };
    const parsed = UserProfileSchema.safeParse(profile);
    expect(parsed.success).toBe(true);
  });

  it('validates gateway modes including 9router', () => {
    expect(GatewayModeSchema.parse('official')).toBe('official');
    expect(GatewayModeSchema.parse('omniroute')).toBe('omniroute');
    expect(GatewayModeSchema.parse('9router')).toBe('9router');
    expect(GatewayModeSchema.safeParse('unknown').success).toBe(false);
  });
});
