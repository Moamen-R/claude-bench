import { z } from 'zod';

export const CANONICAL_FIELDS = [
  'fullstack',
  'cybersecurity',
  'video-editing',
  'researcher',
  'marketing',
  'mobile-dev',
  'desktop-dev',
  'ios-dev',
  'backend-dev',
  'frontend-dev',
  'software-eng',
  'data-engineering',
  'ai-ml',
] as const;

export const FieldIdSchema = z.enum(CANONICAL_FIELDS);
export type FieldId = z.infer<typeof FieldIdSchema>;

export const ItemTypeSchema = z.enum(['skill', 'plugin', 'mcp', 'cli-anything']);
export type ItemType = z.infer<typeof ItemTypeSchema>;

export const MCPServerConfigSchema = z.object({
  command: z.string().min(1),
  args: z.array(z.string()).default([]),
  env: z.record(z.string()).optional(),
});
export type MCPServerConfig = z.infer<typeof MCPServerConfigSchema>;

export const RegistryItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: ItemTypeSchema,
  fields: z.array(FieldIdSchema).min(1),
  repoUrl: z.string().url(),
  installCommand: z.string().min(1),
  description: z.string().min(1),
  stars: z.number().int().nonnegative().default(0),
  trustScore: z.number().min(0).max(100).default(80),
  mcpConfig: MCPServerConfigSchema.optional(),
});
export type RegistryItem = z.infer<typeof RegistryItemSchema>;

export const InstallationTargetSchema = z.enum(['cli', 'desktop', 'both']);
export type InstallationTarget = z.infer<typeof InstallationTargetSchema>;

export const GatewayModeSchema = z.enum(['official', 'omniroute', '9router']);
export type GatewayMode = z.infer<typeof GatewayModeSchema>;

export const ScopeModeSchema = z.enum(['global', 'project']);
export type ScopeMode = z.infer<typeof ScopeModeSchema>;

export const UserProfileSchema = z.object({
  version: z.string().default('1.0.0'),
  target: InstallationTargetSchema,
  gateway: GatewayModeSchema,
  fields: z.array(FieldIdSchema).min(1),
  scope: ScopeModeSchema,
  customItems: z.array(z.string()).optional(),
  createdAt: z.string(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;
