# `claude-forge` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and package `claude-forge`, a production-grade open-source TypeScript CLI bootstrapper for Claude Code CLI and Claude Desktop across 11 professional fields, with Official Anthropic Auth vs. OmniRoute Gateway selection, atomic backups, deep config merging, and live marketplace synchronization.

**Architecture:** A modular TypeScript CLI built with Commander and @clack/prompts, backed by strict Zod schema validation, an OS abstraction layer, an atomic backup manager, dedicated installer engines (Claude, OmniRoute, Skills/Plugins, MCPs), and a verified registry seed.

**Tech Stack:** TypeScript (Node.js >= 20), `commander`, `@clack/prompts`, `zod`, `execa`, `picocolors`, `tsup`, `vitest`.

**Spec:** [docs/SPEC.md](docs/SPEC.md)

## Global Constraints

- Must run on Node.js >= 20 across macOS, Linux, and Windows (PowerShell/CMD/WSL).
- Zero command injection: all process spawning must use argument arrays via `execa` with `shell: false`.
- Never overwrite existing user MCP configs, hooks, or permissions; always perform a lossless deep merge.
- Always create a timestamped backup before modifying any host configuration file (`settings.json`, `claude_desktop_config.json`).
- All 11 field IDs (`fullstack`, `cybersecurity`, `video-editing`, `researcher`, `marketing`, `mobile-dev`, `desktop-dev`, `ios-dev`, `backend-dev`, `frontend-dev`, `software-eng`) must be supported with zero placeholder/TODO entries.

## Review Focus

1. **Path Resolution on Windows vs. POSIX**: Ensure Windows APPDATA paths and POSIX tilde/home paths resolve correctly without corrupting JSON strings.
2. **Lossless Deep Merge Preservation**: Ensure existing custom keys in `~/.claude/settings.json` (like `permissions`, `allowedTools`, `env`) are not stripped when adding OmniRoute or MCPs.
3. **Command Injection Prevention**: Verify that user-supplied or registry-scraped strings cannot inject shell operators (`|`, `&&`, `;`, `rm`).
4. **Dry-Run Determinism**: Ensure `--dry-run` flag emits accurate plan diffs without touching the filesystem.
5. **Rollback Integrity**: Verify `claude-forge rollback` restores the exact pre-mutation state if any installer step fails.

---

### Task 1: Project Scaffolding & Configuration
- Create `package.json`, `tsconfig.json`, `tsup.config.ts`, `vitest.config.ts`, `.mcp.json`.
- Dependencies: `@clack/prompts`, `commander`, `execa`, `picocolors`, `zod`, `tsup`, `vitest`, `@types/node`.

### Task 2: Core Schemas (`src/core/schema.ts`)
- Implement Zod schemas: `FieldIdSchema`, `ItemTypeSchema`, `RegistryItemSchema`, `MCPServerConfigSchema`, `UserProfileSchema`.
- Unit tests in `tests/schema.test.ts`.

### Task 3: OS Detector & Path Resolver (`src/core/os-detector.ts`)
- Implement OS detection (`darwin`, `linux`, `win32`, `wsl`), shell detection, and config path resolution.
- Unit tests in `tests/os-detector.test.ts`.

### Task 4: Backup Manager & Atomic Rollback (`src/core/backup-manager.ts`)
- Implement timestamped backup creation in `~/.claude-forge/backups/`, backup manifest, and rollback logic.
- Unit tests in `tests/backup-manager.test.ts`.

### Task 5: Security Auditor (`src/core/security-auditor.ts`)
- Implement payload validator for install commands and URLs to prevent command injection and malicious scripts.
- Unit tests in `tests/security-auditor.test.ts`.

### Task 6: Registry Catalog Seed (`src/registry/registry.seed.json`)
- Construct comprehensive, verified catalog of skills, plugins, MCPs, and CLI-Anything wrappers for all 11 fields.
- Unit tests in `tests/registry.test.ts`.

### Task 7: Official Claude Installer Engine (`src/installers/claude-installer.ts`)
- Implement cross-platform installation of Claude Code CLI (`curl`, `irm`, `brew`, `winget`) and Claude Desktop.
- Unit tests in `tests/claude-installer.test.ts`.

### Task 8: OmniRoute Gateway Integrator (`src/installers/omniroute-installer.ts`)
- Implement OmniRoute global install check, daemon management (`omniroute serve`), skill installation, and `ANTHROPIC_BASE_URL` injection.
- Unit tests in `tests/omniroute-installer.test.ts`.

### Task 9: MCP Config Merger (`src/installers/mcp-merger.ts`)
- Implement lossless deep-merge of MCP server configs into `~/.claude/settings.json`, `.mcp.json`, and `claude_desktop_config.json`.
- Unit tests in `tests/mcp-merger.test.ts`.

### Task 10: Skill & Plugin Installer (`src/installers/skill-installer.ts`)
- Implement batch installation of skills via `npx -y skills add`, plugins, and CLI-Anything harnesses.
- Unit tests in `tests/skill-installer.test.ts`.

### Task 11: Composable CLAUDE.md Generator (`src/generators/claude-md-generator.ts`)
- Implement generation of domain-tailored `CLAUDE.md` with multi-field merging.
- Unit tests in `tests/claude-md-generator.test.ts`.

### Task 12: CLI UX, TUI Wizard & Commands (`src/cli/`)
- Implement `@clack/prompts` wizard (`src/cli/wizard.ts`), UI formatters (`src/cli/ui.ts`), and Commander CLI entrypoint (`src/cli/index.ts`).
- Unit tests in `tests/cli.test.ts`.

### Task 13: Scrapling Live Sync Engine (`src/registry/scrapling-sync.ts`)
- Implement Scrapling MCP integration for `claude-forge sync`.
- Unit tests in `tests/scrapling-sync.test.ts`.

### Task 14: Verification, OpenCode Security Audit, Graphify Knowledge Graph & Packaging
- Run test suite (`npm test`), build bundle (`npm run build`), execute dry-run end-to-end tests.
- Run `graphify extract . --code-only` to index the knowledge graph.
- Create `README.md`, `CONTRIBUTING.md`, `LICENSE`, `.github/workflows/ci.yml`.
