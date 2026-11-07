<div align="center">

<img src="https://raw.githubusercontent.com/Moamen-R/claude-forge/master/assets/logo.svg" alt="claude-bench logo" width="520" />

<br />
<br />

**Production-grade open-source bootstrapper & configuration engine for [Claude Code CLI](https://code.claude.com/docs/en/overview) and the Claude Desktop App.**

*Provision 13 specialized engineering & creative workflows, 750+ curated skills/MCPs, and official Anthropic or [OmniRoute](https://github.com/cheaper-inference/OmniRoute) multi-provider routing in seconds.*

[![npm version](https://img.shields.io/npm/v/claude-bench.svg?style=flat-square&color=D97757)](https://www.npmjs.com/package/claude-bench)
[![Node.js Compatibility](https://img.shields.io/node/v/claude-bench.svg?style=flat-square&color=2E2D2B)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](./CONTRIBUTING.md)

[Quick Start](#-quick-start) • [Key Features](#-key-features) • [Domain Presets](#-11-domain-presets) • [CLI Reference](#-cli-commands-reference) • [Architecture](#-architecture-overview)

</div>

---

##  Quick Start

###  One-Line Run (Zero Install)
```bash
npx claude-bench init
```

Or install globally as a persistent CLI:
```bash
npm install -g claude-bench
```

### Prerequisites
- **Node.js** `>= 18.18.0`
- **Git** `>= 2.30.0`
- Supported OS: **macOS** (`darwin`), **Linux**, **Windows** (`win32` / **WSL2**)

### Interactive Setup (Recommended)
Launch the guided terminal wizard to detect your OS, choose your routing gateway, and select domain presets:

```bash
npx claude-bench init
```

### Unattended / CI Setup
Provision both Claude Code CLI and Claude Desktop non-interactively using headless flags:

```bash
npx claude-bench init \
  --target both \
  --gateway omniroute \
  --fields fullstack,cybersecurity \
  --scope global \
  --yes
```

---

## 🌟 Key Features

1. **Cross-Platform Claude Installer**: Automatically detects your host environment (`darwin`, `linux`, `win32`, or WSL) and installs the official Claude Code CLI and/or Claude Desktop via native package managers (`brew`, `winget`, `curl`, or `irm`).
2. **Multi-Gateway Routing Engine**: Switch seamlessly between first-party authentication and local multi-provider proxy routing at any time:
   - **Official Anthropic (`official`)**: Standard `/login` OAuth flow or direct `ANTHROPIC_API_KEY` configuration.
   - **OmniRoute AI Gateway (`omniroute`)**: Installs `omniroute`, launches the local routing daemon (`http://127.0.0.1:4000`), injects `ANTHROPIC_BASE_URL` into `~/.claude/settings.json`, and provisions the `cli-serve` and `cli-models` management skills.
   - **9router AI Gateway (`9router`)**: Installs [9router](https://9router.com/) globally via npm (`npm install -g 9router`), launches local daemon routing (`http://127.0.0.1:4000`), and injects `ANTHROPIC_BASE_URL` into `~/.claude/settings.json`.
3. **Safety-First Configuration Management**:
   - **Atomic Backups & Instant Rollback**: Takes a timestamped snapshot in `~/.claude-bench/backups/` prior to every write operation. Revert anytime via `claude-bench rollback`.
   - **Lossless Deep Merge**: Preserves existing MCP servers, custom hooks, environment variables, and permission rules inside `~/.claude/settings.json` and `claude_desktop_config.json`.
   - **Built-In Security Gate**: Pre-scans all skill install commands, package identifiers, and remote URLs against shell injection patterns and untrusted payloads before execution.
4. **Composable CLAUDE.md Generation**: Combines multiple domain presets into a unified, conflict-free global or workspace `CLAUDE.md` file tailored to your active tech stack.

---

##  13 Domain Presets

Each preset equips Claude with 50+ curated skills, plugins, and MCP servers along with domain-specific system instructions:

| Preset ID | Domain | Highlights & Included Tooling |
| :--- | :--- | :--- |
| `fullstack` | Full Stack Web | Next.js/React, TypeScript, Prisma/Drizzle, Playwright E2E, database & API design MCPs |
| `cybersecurity` | Cyber Security | Threat modeling, static/dynamic code auditing, OWASP verification, defensive hardening workflows |
| `video-editing` | Video Editing | Powered by the full HyperFrames ecosystem (50+ programmatic video, FFmpeg, and motion skills) |
| `researcher` | Researcher | Literature synthesis, citation verification, ArXiv/semantic search MCPs, structured data extraction |
| `marketing` | Marketing | Technical copywriting, SEO/GEO auditing, funnel analytics, campaign asset automation |
| `mobile-dev` | Mobile Developer | React Native, Expo, Flutter, cross-platform state management, mobile UI/UX diagnostics |
| `desktop-dev` | Desktop Developer | Tauri, Electron, native OS IPC bridges, cross-platform packaging and notarization |
| `ios-dev` | iOS Developer | Swift 6, SwiftUI, Xcode build/test automation, CoreData/SwiftData, App Store guidelines |
| `backend-dev` | Backend Developer | Distributed systems, Go/Rust/Node/Python services, PostgreSQL tuning, Redis, OpenAPI/gRPC |
| `frontend-dev` | Front-End Developer | Modern CSS/Tailwind, design systems, WCAG accessibility auditing, Core Web Vitals optimization |
| `software-eng` | Software Engineer | Clean architecture, refactoring patterns, TDD/BDD pipelines, CI/CD automation, system design |
| `data-engineering` | Data Analyst & Eng | DuckDB, Polars, Pandas, Apache Spark/Airflow, dbt, Parquet lakehouse, Great Expectations, Plotly |
| `ai-ml` | Machine Learning & AI | PyTorch 2.x, Hugging Face, LangChain/LangGraph, CrewAI multi-agent, vLLM, Qdrant/Chroma RAG |

---

## 💻 CLI Commands Reference

### Core Commands

| Command | Description |
| :--- | :--- |
| `claude-bench init` | Launch the interactive multi-step setup wizard or run headlessly with flags |
| `claude-bench list [-f <field>]` | Browse and filter the 640+ curated skills, plugins, and MCP servers |
| `claude-bench add <id>` | Install an individual skill or lossless-merge an MCP server by registry ID |
| `claude-bench switch-gateway <mode>` | Toggle routing dynamically between `official`, `omniroute`, and `9router` |
| `claude-bench doctor` | Run diagnostics on Node, Git, Claude CLI, OmniRoute / 9router daemons, and JSON configs |
| `claude-bench rollback` | Restore configurations from the latest or a selected atomic backup snapshot |
| `claude-bench export [file]` | Export your active setup profile to a portable JSON manifest for team sharing |
| `claude-bench import <file>` | Apply a shared team configuration manifest to the local machine |
| `claude-bench sync` | Refresh the local catalog via Scrapling MCP |

### `init` Flags

| Flag | Values | Description |
| :--- | :--- | :--- |
| `--target <target>` | `cli`, `desktop`, `both` | Target environment(s) to install and configure |
| `--gateway <mode>` | `official`, `omniroute`, `9router` | Authentication and inference routing backend |
| `--fields <list>` | Comma-separated IDs | Domain presets to install (e.g., `fullstack,cybersecurity`) |
| `--scope <scope>` | `global`, `project` | Write configuration to `~/.claude` or current workspace `./.claude` |
| `-y, --yes` | Boolean | Bypass confirmation prompts for automated/CI execution |

---

## 🔄 Team Profile Sharing

Standardize Claude tooling across your engineering organization by exporting and committing a profile manifest:

```bash
# Export your current configuration
npx claude-bench export ./team-claude-profile.json

# Teammates can replicate the exact setup with one command
npx claude-bench import ./team-claude-profile.json
```

---

## 📐 Architecture Overview

```text
src/
├── cli/
│   ├── index.ts                  # Commander CLI entrypoint & flag parser
│   ├── wizard.ts                 # @clack/prompts interactive TUI flow
│   └── ui.ts                     # Terminal banner, spinners & table formatters
├── core/
│   ├── os-detector.ts            # OS, shell, WSL, and config path resolution
│   ├── backup-manager.ts         # Atomic backups & rollback (~/.claude-bench/backups/)
│   ├── security-auditor.ts       # Command injection & URL security gate
│   └── schema.ts                 # Strict Zod validation schemas
├── installers/
│   ├── claude-installer.ts       # Cross-platform Claude CLI & Desktop installer
│   ├── omniroute-installer.ts    # OmniRoute daemon installer & routing injector
│   ├── ninerouter-installer.ts   # 9router daemon installer & routing injector
│   ├── skill-installer.ts        # Audited batch skill installer (npx -y skills add)
│   └── mcp-merger.ts             # Lossless deep-merge into settings & desktop configs
├── generators/
│   └── claude-md-generator.ts    # Composable multi-domain CLAUDE.md synthesizer
└── registry/
    ├── registry.seed.json        # Curated 640+ item catalog across 11 fields
    └── scrapling-sync.ts         # Scrapling MCP live marketplace sync client
```

---

##  Development & Contributing

```bash
# Clone the repository
git clone https://github.com/Moamen-R/claude-bench.git
cd claude-bench

# Install dependencies
npm install

# Run in development mode
npm run dev -- init

# Run typechecks and test suite
npm run typecheck && npm test
```

Contributions, new domain presets, and MCP registry additions are welcome! Please run `claude-bench doctor` and ensure all schema checks pass before opening a Pull Request.

---

## 🛡️ License

Distributed under the MIT License. See [LICENSE](./LICENSE) for details.
