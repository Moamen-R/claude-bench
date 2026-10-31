# Graph Report - extreme-claude-setup  (2026-10-31)

## Corpus Check
- 42 files · ~47,433 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 2)

## Summary
- 321 nodes · 527 edges · 16 communities
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d38cca53`
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
- test
- .mcp.json
- Open-Source Claude Setup CLI (`claude-forge` / `create-claude-env`) — Architecture, End-to-End Workflow & Master Agent Prompt
- Canonical 11 Professional Fields Specification (`docs/FIELDS.md`)
- CLAUDE.md — Project Context & Autonomous Agent Rules for `claude-forge`
- `claude-forge` Technical Specification (SPEC.md)
- steps
- `claude-forge` 🛠️
- generate-seed.ts

## God Nodes (most connected - your core abstractions)
1. `RegistryItem` - 16 edges
2. `vitest` - 15 edges
3. `OSDetector` - 15 edges
4. `compilerOptions` - 15 edges
5. `Review Focus` - 15 edges
6. `BackupManager` - 13 edges
7. `Canonical 11 Professional Fields Specification (`docs/FIELDS.md`)` - 12 edges
8. `SecurityAuditor` - 11 edges
9. `FieldId` - 10 edges
10. `CLAUDE.md — Project Context & Autonomous Agent Rules for `claude-forge`` - 9 edges

## Surprising Connections (you probably didn't know these)
- `5. Canonical 11 Professional Fields (`FieldId`)` --references--> `FieldId`  [INFERRED]
  CLAUDE.md → src/core/schema.ts
- `Adding Skills to the Registry` --references--> `SecurityAuditor`  [INFERRED]
  CONTRIBUTING.md → src/core/security-auditor.ts
- `SkillDef` --references--> `FieldId`  [EXTRACTED]
  scripts/generate-seed.ts → src/core/schema.ts
- `getRegistryItems()` --calls--> `loadRegistrySeed()`  [EXTRACTED]
  src/cli/index.ts → src/registry/registry-loader.ts
- `WizardOptions` --references--> `FieldId`  [EXTRACTED]
  src/cli/wizard.ts → src/core/schema.ts

## Import Cycles
- None detected.

## Communities (16 total, 0 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.06
Nodes (41): author, bin, claude-forge, create-claude-env, dependencies, @clack/prompts@^0.9.1, commander@^13.1.0, picocolors@^1.1.1 (+33 more)

### Community 1 - "ref_node_path"
Cohesion: 0.14
Nodes (10): vitest, BackupManager, BackupRecord, BackupSnapshot, MCPServerConfig, ClaudeMdGenerator, DOMAIN_BLUEPRINTS, MCPConfigMerger (+2 more)

### Community 2 - "wizard.ts"
Cohesion: 0.15
Nodes (10): execa@^9.5.2, execa, ConfigPaths, OSDetector, PlatformType, ShellType, InstallationTarget, ClaudeInstaller (+2 more)

### Community 3 - "schema.ts"
Cohesion: 0.09
Nodes (27): Adding Skills to the Registry, Code Quality & Architecture, Contributing to `claude-forge`, Development Workflow, CANONICAL_FIELDS, FieldIdSchema, GatewayModeSchema, InstallationTargetSchema (+19 more)

### Community 4 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution (+9 more)

### Community 5 - "Review Focus"
Cohesion: 0.11
Nodes (17): `claude-forge` Implementation Plan, Global Constraints, Review Focus, Task 10: Skill & Plugin Installer (`src/installers/skill-installer.ts`), Task 11: Composable CLAUDE.md Generator (`src/generators/claude-md-generator.ts`), Task 12: CLI UX, TUI Wizard & Commands (`src/cli/`), Task 13: Scrapling Live Sync Engine (`src/registry/scrapling-sync.ts`), Task 14: Verification, OpenCode Security Audit, Graphify Knowledge Graph & Packaging (+9 more)

### Community 6 - "index.ts"
Cohesion: 0.14
Nodes (14): backupManager, detector, getRegistryItems(), program, printBanner(), printSummaryTable(), WizardOptions, WizardRunner (+6 more)

### Community 7 - "test"
Cohesion: 0.09
Nodes (21): jobs, test, node, os, name, on, pull_request, push (+13 more)

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

### Community 13 - "steps"
Cohesion: 0.12
Nodes (16): jobs, sync, name, on, schedule, workflow_dispatch, cron, name (+8 more)

### Community 14 - "`claude-forge` 🛠️"
Cohesion: 0.29
Nodes (6): 📐 Architecture Overview, `claude-forge` 🛠️, 💻 CLI Commands Reference, 🌟 Key Features, 🛡️ License, ⚡ Quick Start

### Community 15 - "generate-seed.ts"
Cohesion: 0.15
Nodes (10): catalog, counts, domainTemplates, hyperframesSkills, items, PROGRAMMING_FIELDS, seenIds, SkillDef (+2 more)

## Knowledge Gaps
- **3 isolated node(s):** `scrapling-fetch-mcp`, `npx`, `@alibaba/open-code-review`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 164 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `FieldId` connect `generate-seed.ts` to `schema.ts`, `ref_node_path`, `CLAUDE.md — Project Context & Autonomous Agent Rules for `claude-forge``, `index.ts`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **What connects `scrapling-fetch-mcp`, `npx`, `@alibaba/open-code-review` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.056910569105691054 - nodes in this community are weakly interconnected._
- **Why does `5. Canonical 11 Professional Fields (`FieldId`)` connect `CLAUDE.md — Project Context & Autonomous Agent Rules for `claude-forge`` to `generate-seed.ts`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Should `ref_node_path` be split into smaller, more focused modules?**
  _Cohesion score 0.13548387096774195 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `ref_node_path` to `package.json`, `wizard.ts`, `schema.ts`, `index.ts`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Should `wizard.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14624505928853754 - nodes in this community are weakly interconnected._