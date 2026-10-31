# Graph Report - extreme-claude-setup  (2026-10-31)

## Corpus Check
- 37 files · ~45,070 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: (none) 1)

## Summary
- 266 nodes · 466 edges · 13 communities
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `06df38a5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- ref_node_path
- wizard.ts
- schema.ts
- compilerOptions
- Review Focus
- index.ts
- generate-seed.ts
- .mcp.json
- Open-Source Claude Setup CLI (`claude-forge` / `create-claude-env`) — Architecture, End-to-End Workflow & Master Agent Prompt
- Canonical 11 Professional Fields Specification (`docs/FIELDS.md`)
- CLAUDE.md — Project Context & Autonomous Agent Rules for `claude-forge`
- `claude-forge` Technical Specification (SPEC.md)

## God Nodes (most connected - your core abstractions)
1. `vitest` - 15 edges
2. `OSDetector` - 15 edges
3. `RegistryItem` - 15 edges
4. `compilerOptions` - 15 edges
5. `Review Focus` - 15 edges
6. `BackupManager` - 13 edges
7. `Canonical 11 Professional Fields Specification (`docs/FIELDS.md`)` - 12 edges
8. `FieldId` - 10 edges
9. `SecurityAuditor` - 10 edges
10. `CLAUDE.md — Project Context & Autonomous Agent Rules for `claude-forge`` - 9 edges

## Surprising Connections (you probably didn't know these)
- `5. Canonical 11 Professional Fields (`FieldId`)` --references--> `FieldId`  [INFERRED]
  CLAUDE.md → src/core/schema.ts
- `SkillDef` --references--> `FieldId`  [EXTRACTED]
  scripts/generate-seed.ts → src/core/schema.ts
- `WizardOptions` --references--> `FieldId`  [EXTRACTED]
  src/cli/wizard.ts → src/core/schema.ts
- `WizardOptions` --references--> `ScopeMode`  [EXTRACTED]
  src/cli/wizard.ts → src/core/schema.ts
- `ClaudeInstallOptions` --references--> `InstallationTarget`  [EXTRACTED]
  src/installers/claude-installer.ts → src/core/schema.ts

## Import Cycles
- None detected.

## Communities (13 total, 0 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.06
Nodes (41): author, bin, claude-forge, create-claude-env, dependencies, @clack/prompts@^0.9.1, commander@^13.1.0, execa@^9.5.2 (+33 more)

### Community 1 - "ref_node_path"
Cohesion: 0.13
Nodes (11): BackupManager, BackupRecord, BackupSnapshot, ConfigPaths, PlatformType, ShellType, MCPServerConfig, MCPConfigMerger (+3 more)

### Community 2 - "wizard.ts"
Cohesion: 0.13
Nodes (10): WizardOptions, WizardRunner, OSDetector, GatewayMode, InstallationTarget, ClaudeInstaller, ClaudeInstallOptions, ClaudeInstallResult (+2 more)

### Community 3 - "schema.ts"
Cohesion: 0.10
Nodes (24): vitest, CANONICAL_FIELDS, FieldIdSchema, GatewayModeSchema, InstallationTargetSchema, ItemType, ItemTypeSchema, MCPServerConfigSchema (+16 more)

### Community 4 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution (+9 more)

### Community 5 - "Review Focus"
Cohesion: 0.11
Nodes (17): `claude-forge` Implementation Plan, Global Constraints, Review Focus, Task 10: Skill & Plugin Installer (`src/installers/skill-installer.ts`), Task 11: Composable CLAUDE.md Generator (`src/generators/claude-md-generator.ts`), Task 12: CLI UX, TUI Wizard & Commands (`src/cli/`), Task 13: Scrapling Live Sync Engine (`src/registry/scrapling-sync.ts`), Task 14: Verification, OpenCode Security Audit, Graphify Knowledge Graph & Packaging (+9 more)

### Community 6 - "index.ts"
Cohesion: 0.21
Nodes (7): picocolors@^1.1.1, picocolors, backupManager, detector, program, printBanner(), printSummaryTable()

### Community 7 - "generate-seed.ts"
Cohesion: 0.14
Nodes (11): catalog, counts, domainTemplates, hyperframesSkills, items, seenIds, SkillDef, targetFile (+3 more)

### Community 8 - ".mcp.json"
Cohesion: 0.29
Nodes (7): npx, uvx, opencode-review, scrapling, scrapling-fetch, @alibaba/open-code-review, scrapling-fetch-mcp

### Community 9 - "Open-Source Claude Setup CLI (`claude-forge` / `create-claude-env`) — Architecture, End-to-End Workflow & Master Agent Prompt"
Cohesion: 0.14
Nodes (13): 1. Executive Summary & Project Vision, 2. Core Toolchain & Ecosystem Stack, 3. Target Registries & Marketplaces for Scrapling MCP, 4. Domain Matrix: The 11 Supported Professional Fields, 5. Added High-Value Features & Missing Instructions (Included in Spec), 6. Step-by-Step Execution Workflow (How You Will Build This), 7. Copy-Paste Master Prompt for Your Claude Code Agent, 8. Target Repository Architecture (`claude-forge`) (+5 more)

### Community 10 - "Canonical 11 Professional Fields Specification (`docs/FIELDS.md`)"
Cohesion: 0.15
Nodes (12): 10. Front-End Developer (`frontend-dev`), 11. Software Engineer (`software-eng`), 1. Full Stack Web Developer (`fullstack`), 2. Cyber Security (`cybersecurity`), 3. Video Editing (`video-editing`), 4. Researcher (`researcher`), 5. Marketing (`marketing`), 6. Mobile Developer (`mobile-dev`) (+4 more)

### Community 11 - "CLAUDE.md — Project Context & Autonomous Agent Rules for `claude-forge`"
Cohesion: 0.17
Nodes (11): 1. Project Identity & Mission, 2. Active Agent Stack, Skills & MCP Servers, 3. Essential Development Commands, 4. Target Marketplaces & Scraping Rules (`Scrapling MCP`), 5. Canonical 11 Professional Fields (`FieldId`), 6. Target Installation & Gateway Routing Rules, 7. Repository Architecture & Module Boundaries, 8. Non-Negotiable Engineering & Security Guardrails (+3 more)

### Community 12 - "`claude-forge` Technical Specification (SPEC.md)"
Cohesion: 0.20
Nodes (9): 1. System Overview & Architecture, 2. Canonical Domain Matrix (11 Professional Fields), 3.1. Registry Item Schema (`src/core/schema.ts`), 3.2. User Profile & CLI Options Schema, 3. Data Models & Zod Schemas, 4.1. File Targets, 4. Cross-Platform Configuration & Path Resolution, 5. Security & Safety Contract (+1 more)

## Knowledge Gaps
- **3 isolated node(s):** `scrapling-fetch-mcp`, `npx`, `@alibaba/open-code-review`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 133 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `FieldId` connect `generate-seed.ts` to `schema.ts`, `wizard.ts`, `CLAUDE.md — Project Context & Autonomous Agent Rules for `claude-forge``, `index.ts`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **What connects `scrapling-fetch-mcp`, `npx`, `@alibaba/open-code-review` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05537098560354374 - nodes in this community are weakly interconnected._
- **Why does `5. Canonical 11 Professional Fields (`FieldId`)` connect `CLAUDE.md — Project Context & Autonomous Agent Rules for `claude-forge`` to `generate-seed.ts`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Should `ref_node_path` be split into smaller, more focused modules?**
  _Cohesion score 0.13054187192118227 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `schema.ts` to `package.json`, `ref_node_path`, `wizard.ts`, `index.ts`, `generate-seed.ts`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `wizard.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1349206349206349 - nodes in this community are weakly interconnected._