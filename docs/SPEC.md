# `claude-forge` Technical Specification (SPEC.md)

## 1. System Overview & Architecture

`claude-forge` is an open-source, cross-platform TypeScript CLI tool (`npx claude-forge`) designed to automate the installation, configuration, and optimization of the official **Claude Code CLI** and/or **Claude Desktop App**.

The system operates across three modular layers:
1. **Core Runtime & Host Abstraction**: OS detection, package manager resolution, path resolution for Claude global & project configurations, atomic backup & rollback manager, and security auditing for skill payloads.
2. **Installation & Configuration Engines**:
   - Official Claude Installer (CLI + Desktop across macOS, Linux, Windows WSL/PowerShell/WinGet).
   - OmniRoute Gateway Integrator (global CLI, daemon verification, Claude skill injection, and non-destructive `~/.claude/settings.json` env routing).
   - Skill, Plugin & CLI-Anything Installer (concurrent execution of `npx -y skills add`, plugin registration, and wrapper installation).
   - MCP Server Config Merger (lossless deep-merge into `settings.json`, `.mcp.json`, and `claude_desktop_config.json`).
   - Composable `CLAUDE.md` Blueprint Generator (tailored per field, multi-field merging).
3. **Registry & Scrapling Sync Engine**:
   - Seeded offline catalog `src/registry/registry.seed.json` covering 11 professional fields.
   - Live sync client invoking Scrapling MCP to refresh skills, plugins, and MCPs from verified marketplaces.
4. **Interactive TUI & Headless CLI Interface**:
   - Interactive wizard via `@clack/prompts`.
   - Subcommands: `init`, `sync`, `list`, `add`, `switch-gateway`, `doctor`, `rollback`, `export`, `import`.

---

## 2. Canonical Domain Matrix (11 Professional Fields)

| Field ID | Name | Description | Key Ecosystem Dependencies |
| :--- | :--- | :--- | :--- |
| `fullstack` | Full Stack Web Developer | Modern web apps, React/Next.js, Node/Express, databases, testing | shadcn/ui, Playwright MCP, Supabase/Postgres MCP, Superpowers TDD |
| `cybersecurity` | Cyber Security | AppSec, penetration testing, vulnerability analysis, compliance | Security plugins, Semgrep/Trivy MCP, Nmap/Nuclei/Ghidra CLI-Anything |
| `video-editing` | Video Editing | Video automation, transcoding, motion graphics, audio | FFmpeg, Blender, GIMP, Audacity CLI-Anything, Remotion, Whisper MCP |
| `researcher` | Researcher | Academic papers, data analysis, literature discovery, citations | Scrapling MCP, ArXiv/Semantic Scholar MCP, Zotero/BibTeX, Jupyter |
| `marketing` | Marketing | SEO, copywriting, conversion rate optimization, analytics | Scrapling Fetch MCP, SEO auditor, Google Analytics MCP, copywriting skills |
| `mobile-dev` | Mobile Developer | Cross-platform mobile with React Native, Expo, Flutter, Android | Expo/Flutter skills, ADB/Fastlane CLI-Anything, responsive UI testing |
| `desktop-dev` | Desktop Developer | Native & hybrid desktop apps with Tauri, Electron, Rust, C# | Tauri/Electron skills, cross-platform packaging, IPC security audit |
| `ios-dev` | iOS Developer | Native Apple development, Swift 6, SwiftUI, Xcode automation | Xcode/Simulator MCP, Fastlane TestFlight, Apple HIG auditor |
| `backend-dev` | Backend Developer | Distributed systems, microservices, gRPC, GraphQL, Kubernetes | OpenAPI/gRPC skills, Redis/Postgres/Mongo MCPs, k6 load testing |
| `frontend-dev` | Front-End Developer | UI/UX, CSS architecture, web components, accessibility (WCAG) | shadcn/ui, WCAG/Lighthouse MCP, Figma-to-Code MCP, Tailwind design |
| `software-eng` | Software Engineer | Clean architecture, TDD, system design, CI/CD pipelines | Superpowers, Ruflo orchestration, OpenCode Review MCP, C4 architecture |

---

## 3. Data Models & Zod Schemas

### 3.1. Registry Item Schema (`src/core/schema.ts`)
```typescript
import { z } from 'zod';

export const FieldIdSchema = z.enum([
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
]);
export type FieldId = z.infer<typeof FieldIdSchema>;

export const ItemTypeSchema = z.enum(['skill', 'plugin', 'mcp', 'cli-anything']);
export type ItemType = z.infer<typeof ItemTypeSchema>;

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
  mcpConfig: z
    .object({
      command: z.string(),
      args: z.array(z.string()).default([]),
      env: z.record(z.string()).optional(),
    })
    .optional(),
});
export type RegistryItem = z.infer<typeof RegistryItemSchema>;
```

### 3.2. User Profile & CLI Options Schema
```typescript
export const InstallationTargetSchema = z.enum(['cli', 'desktop', 'both']);
export type InstallationTarget = z.infer<typeof InstallationTargetSchema>;

export const GatewayModeSchema = z.enum(['official', 'omniroute']);
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
  createdAt: z.string().datetime(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;
```

---

## 4. Cross-Platform Configuration & Path Resolution

### 4.1. File Targets
- **Claude Code Global Settings**: `~/.claude/settings.json`
- **Claude Code Global Skills Directory**: `~/.claude/skills/`
- **Claude Code Global CLAUDE.md**: `~/.claude/CLAUDE.md`
- **Claude Code Project Scoped Settings**: `./.mcp.json` and `./CLAUDE.md` and `./.claude/`
- **Claude Desktop Config**:
  - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
  - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
  - Linux: `~/.config/Claude/claude_desktop_config.json`
- **Backup Directory**: `~/.claude-forge/backups/<timestamp>/`

---

## 5. Security & Safety Contract

1. **Strict Array-Based Execution**: All child processes executed via `execa(binary, argsArray, { shell: false })`. No raw shell string interpolation.
2. **Atomic Pre-Mutation Backups**: `BackupManager.backupFile(targetPath)` copies existing file with SHA-256 hash before any read/modify/write.
3. **Lossless Deep Merge**: When updating JSON configurations (`settings.json`, `claude_desktop_config.json`), user keys (such as existing MCP servers, hooks, allowed tools, permissions) are never removed.
4. **Skill Security Gate**: Every scraped skill and install command is vetted against regex patterns detecting dangerous shell flags (`rm -rf`, piped `curl | sh` without validation, encoded base64 strings).
