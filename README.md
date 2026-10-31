# `claude-forge` 🛠️

> **Production-grade open-source bootstrapper & configuration engine for [Claude Code CLI](https://code.claude.com/docs/en/overview) and the Claude Desktop App across 11 professional fields, with official Anthropic authentication or [OmniRoute](https://github.com/cheaper-inference/OmniRoute) multi-provider gateway routing.**

---

## ⚡ Quick Start

```bash
# Launch the interactive setup wizard
npx claude-forge init

# Or run non-interactively with headless flags
npx claude-forge init --target both --gateway omniroute --fields fullstack,cybersecurity --scope global --yes
```

---

## 🌟 Key Features

1. **Cross-Platform Claude Installer**: Detects OS (`darwin`, `linux`, `win32`, WSL) and installs official Claude Code CLI (`curl`, `irm`, `brew`, `winget`) and/or Claude Desktop.
2. **Flexible Routing Modes**:
   - **Official Anthropic**: Standard `/login` OAuth or `ANTHROPIC_API_KEY`.
   - **OmniRoute AI Gateway**: Installs `omniroute`, starts the local daemon (`http://127.0.0.1:4000`), injects `ANTHROPIC_BASE_URL` into `~/.claude/settings.json`, and installs `cli-serve` & `cli-models` skills.
3. **11 Tailored Domain Presets (50+ Skills & Plugins per field)**:
   - Full Stack Web Developer (`fullstack`)
   - Cyber Security (`cybersecurity`)
   - Video Editing (`video-editing`) — **powered by the full HyperFrames ecosystem (50+ skills & media tools)**
   - Researcher (`researcher`)
   - Marketing (`marketing`)
   - Mobile Developer (`mobile-dev`)
   - Desktop Developer (`desktop-dev`)
   - iOS Developer (`ios-dev`)
   - Backend Developer (`backend-dev`)
   - Front-End Developer (`frontend-dev`)
   - Software Engineer (`software-eng`)
4. **Safety & Zero Clutter**:
   - **Atomic Backups & Rollback**: Automatic timestamped backup in `~/.claude-forge/backups/` before any file write. Run `claude-forge rollback` to revert instantly.
   - **Lossless Deep Merge**: Preserves all existing MCP servers, hooks, and permissions in `~/.claude/settings.json` and `claude_desktop_config.json`.
   - **Security Auditor**: All install commands and URLs are pre-scanned against shell injection and malicious payloads.
5. **Diagnostics & Maintenance**:
   - `claude-forge doctor`: Verifies Node, Git, Claude CLI, OmniRoute daemon, and JSON config syntax.
   - `claude-forge list`: Explores the 640+ curated skills, plugins, and MCPs.
   - `claude-forge sync`: Refreshes skills catalog via [Scrapling MCP](https://github.com/d4vinci/Scrapling).
   - `claude-forge export` / `import`: Exports and shares team setup profiles.

---

## 📐 Architecture Overview

```text
src/
├── cli/
│   ├── index.ts                 # Commander CLI entrypoint
│   ├── wizard.ts                # @clack/prompts interactive flow
│   └── ui.ts                    # Terminal banner & table formatters
├── core/
│   ├── os-detector.ts           # OS, shell, and config path resolution
│   ├── backup-manager.ts        # Atomic backups & rollback (~/.claude-forge/backups/)
│   ├── security-auditor.ts      # Command injection & URL security gate
│   └── schema.ts                # Zod validation schemas
├── installers/
│   ├── claude-installer.ts      # Claude CLI & Desktop installer
│   ├── omniroute-installer.ts   # OmniRoute global installer & routing engine
│   ├── skill-installer.ts       # Secure batch skill installer (npx -y skills add)
│   └── mcp-merger.ts            # Lossless deep-merge into settings & desktop configs
├── generators/
│   └── claude-md-generator.ts   # Composable multi-field CLAUDE.md generator
└── registry/
    ├── registry.seed.json       # Curated 640+ item catalog across 11 fields
    └── scrapling-sync.ts        # Scrapling MCP live marketplace sync client
```

---

## 💻 CLI Commands Reference

| Command | Description |
| :--- | :--- |
| `claude-forge init` | Interactive multi-step wizard or headless setup with flags |
| `claude-forge list [-f <field>]` | Lists all curated skills, plugins, and MCP servers |
| `claude-forge add <id>` | Installs a single skill or merges an MCP server by ID |
| `claude-forge switch-gateway <mode>` | Switches routing between `official` and `omniroute` |
| `claude-forge doctor` | Runs comprehensive health checks on local environment |
| `claude-forge rollback` | Restores previous Claude configurations from atomic backup |
| `claude-forge export [file]` | Exports current configuration profile to JSON |
| `claude-forge sync` | Synchronizes catalog with Scrapling MCP |

---

## 🛡️ License

MIT License. Open source and community-driven.
