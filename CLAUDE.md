# CLAUDE.md — Project Context & Autonomous Agent Rules for `claude-bench`

## 1. Project Identity & Mission
**`claude-bench`** is a production-grade, open-source TypeScript CLI tool (`npx claude-bench init`) that bootstraps, configures, and optimizes the official [Claude Code CLI](https://code.claude.com/docs/en/quickstart) and/or **Claude Desktop App** based on a user's professional field(s) and routing preference (**Official Anthropic** vs. **[OmniRoute](https://github.com/cheaper-inference/OmniRoute)**).

Every agent working in this repository MUST follow the orchestration, scraping, testing, and security rules defined in this file.

## 2. Active Agent Stack, Skills & MCP Servers

Always verify and use these configured tools and skills before writing code or scraping data:

| Tool / Skill | Identifier / Invocation | Mandatory Usage Rule |
| :--- | :--- | :--- |
| **Superpowers** | [obra/superpowers](https://github.com/obra/superpowers) (`/superpowers`) | Use for Spec-First design (`docs/SPEC.md`), task decomposition, and strict Red-Green-Refactor TDD. Never write implementation code before writing a failing `vitest` test. |
| **Ruflo Swarm Orchestrator** | [ruvnet/ruflo](https://github.com/ruvnet/ruflo) (`/ruflo`) | Use to dispatch parallel subagents (`Harvester-Scraper`, `Core-Installer-Architect`, `Skill-Plugin-Engine`, `CLI-UX-Builder`, `OpenCode-QA-Reviewer`) and coordinate shared state. |
| **Scrapling MCP** | `mcp__scrapling` & `mcp__scrapling-fetch` ([Docs](https://scrapling.readthedocs.io/en/latest/ai/mcp-server.html)) | Use CSS/XPath selectors and stealth fetch to extract structured skill/plugin metadata from marketplaces. Never dump raw full-page HTML into context. |
| **CLI-Anything Skill** | [HKUDS/CLI-Anything](https://github.com/HKUDS/CLI-Anything) (`cli-hub-meta-skill`) | Use to discover, wrap, and register agent-native CLI harnesses from [clianything.cc](https://clianything.cc/) for desktop/GUI software (FFmpeg, Blender, GIMP, Nmap, Ghidra, ADB, Xcode). |
| **Open Code Review MCP** | `mcp__opencode-review` ([alibaba/open-code-review](https://github.com/alibaba/open-code-review)) | Run after every feature implementation and before any Git commit to audit for command injection, secret exposure, and architectural regressions. |
| **OmniRoute Skills** | [cli-serve](https://skillselion.com/skills/diegosouzapw/OmniRoute/cli-serve) & [cli-models](https://www.skillsdirectory.com/skills/mayankjain1815-commits-cli-models) | Reference when building and testing `src/installers/omniroute-installer.ts` for gateway daemon management and model routing. |

## 3. Essential Development Commands

- **Install dependencies**: `npm install`
- **Build CLI bundle (`tsup`)**: `npm run build`
- **Run in development mode**: `npx tsx src/cli/index.ts <command>`
- **Dry-run interactive wizard**: `npx tsx src/cli/index.ts init --dry-run`
- **Run unit & integration tests**: `npm test` (runs `vitest run`)
- **Run single test file**: `npx vitest run tests/<file>.test.ts`
- **Typecheck**: `npm run typecheck` (runs `tsc --noEmit`)
- **Lint & format**: `npm run lint`
- **Refresh skill registry via Scrapling**: `npx tsx src/cli/index.ts sync`

## 4. Target Marketplaces & Scraping Rules (`Scrapling MCP`)

When populating or refreshing `src/registry/registry.seed.json`, `Harvester-Scraper` agents must query and cross-verify from:
1. **[Claude Marketplaces — Skills](https://claudemarketplaces.com/skills)** (`https://claudemarketplaces.com/skills`)
2. **[Claude Marketplaces — Plugins & Marketplaces](https://claudemarketplaces.com/marketplaces)** (`https://claudemarketplaces.com/marketplaces`)
3. **[Skills.sh Directory](https://www.skills.sh/)** (`https://www.skills.sh/` & [vercel-labs/skills](https://github.com/vercel-labs/skills))
4. **[Anthropic Official Skills](https://github.com/anthropics/skills)** (`https://github.com/anthropics/skills`)
5. **[CLI-Anything Hub](https://clianything.cc/)** (`https://clianything.cc/` & [HKUDS/CLI-Anything](https://github.com/HKUDS/CLI-Anything))
6. **[Smithery](https://smithery.ai/) & [MCP.so](https://mcp.so/)** (`https://smithery.ai/`, `https://mcp.so/`)

**Scraping Guardrails**:
- Extract only verified fields: `id`, `name`, `type` (`skill` | `plugin` | `mcp` | `cli-anything`), `fields` (array of matching field IDs), `repoUrl`, `installCommand`, `description`, `stars`, and `trustScore`.
- **Zero Fabrication Policy**: Never invent fake repository names, placeholder URLs, or unverified `npx skills add` commands. Every entry in `registry.seed.json` must come from live Scrapling MCP extraction and pass `tests/registry-schema.test.ts`.

## 5. Canonical 11 Professional Fields (`FieldId`)

All CLI flags, wizard prompts, registry entries, and `CLAUDE.md` templates must support single or multi-select across these exact 11 canonical field IDs:

| # | `FieldId` | Display Name | Required Bundle Composition |
| :--- | :--- | :--- | :--- |
| 1 | `fullstack` | **Full Stack Web Developer** | Frontend/UI skills ([shadcn/ui](https://ui.shadcn.com/docs/skills)), backend APIs, Playwright MCP, Postgres/Supabase MCP, Docker/Git workflows, [Superpowers TDD](https://github.com/obra/superpowers) |
| 2 | `cybersecurity` | **Cyber Security** | [Security Marketplace plugins](https://claudemarketplaces.com/marketplaces/category/security), OWASP/SAST auditor skills, Semgrep/Trivy MCP, Nmap/Nuclei/Ghidra [CLI-Anything](https://clianything.cc/) harnesses |
| 3 | `video-editing` | **Video Editing** | FFmpeg, Blender, GIMP, Audacity, and OBS [CLI-Anything](https://github.com/HKUDS/CLI-Anything) harnesses, Remotion video skill, Whisper subtitle/transcription MCP |
| 4 | `researcher` | **Researcher** | [Scrapling MCP](https://scrapling.readthedocs.io/en/latest/ai/mcp-server.html), ArXiv/Semantic Scholar MCP, BibTeX/Zotero citation skills, Jupyter/Pandas analysis, LaTeX synthesis skill |
| 5 | `marketing` | **Marketing** | SEO/CRO audit skills, [Scrapling Fetch MCP](https://mcp.so/servers/scrapling-fetch-mcp) competitor research, Analytics/Search Console MCP, multi-channel copywriting & content remix skills |
| 6 | `mobile-dev` | **Mobile Developer** | React Native/Expo & Flutter skills, Android ADB & Fastlane [CLI-Anything](https://clianything.cc/) wrappers, mobile responsive UI & crash log analyzers |
| 7 | `desktop-dev` | **Desktop Developer** | Tauri (Rust) & Electron skills, native OS packaging/code-signing workflows, IPC security audit skill, GUI automation harnesses |
| 8 | `ios-dev` | **iOS Developer** | Swift 6 / SwiftUI concurrency skills, `xcodebuild` & `xcrun simctl` simulator MCP/wrappers, Fastlane TestFlight skill, Apple HIG auditor |
| 9 | `backend-dev` | **Backend Developer** | OpenAPI/gRPC schema skills, Postgres/Redis/MongoDB MCPs, Kubernetes/Docker validators, SQL optimization & k6 load-testing skills |
| 10 | `frontend-dev` | **Front-End Developer** | [shadcn/ui skill](https://ui.shadcn.com/docs/skills), Tailwind/CSS architecture, WCAG/Lighthouse accessibility MCP, Figma-to-Code MCP, Playwright visual testing |
| 11 | `software-eng` | **Software Engineer** | [Superpowers](https://claudemarketplaces.com/plugins/obra-superpowers), [Ruflo orchestration](https://claudemarketplaces.com/skills/ruvnet/ruflo/discover-plugins), [OpenCode Review MCP](https://github.com/alibaba/open-code-review), C4 system design, GitHub Actions CI/CD skills |

## 6. Target Installation & Gateway Routing Rules

### A. Official Claude Code & Desktop Installation (`src/installers/claude-installer.ts`)
- **macOS / Linux / WSL**: `curl -fsSL https://claude.ai/install.sh | bash` (or `brew install --cask claude-code` on macOS).
- **Windows PowerShell**: `irm https://claude.ai/install.ps1 | iex`
- **Windows CMD**: `curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd`
- **Windows WinGet**: `winget install Anthropic.ClaudeCode`
- Always verify installation after execution by running `claude --version`.

### B. Official Auth vs. OmniRoute Gateway (`src/installers/omniroute-installer.ts`)
- **`--gateway official`**: Preserves default Anthropic endpoints and guides the user through `claude /login` or `ANTHROPIC_API_KEY` setup.
- **`--gateway omniroute`**:
  1. Installs [OmniRoute](https://www.npmjs.com/package/omniroute) (`npm install -g omniroute`) if not already installed.
  2. Installs the official OmniRoute skills:
     - `npx -y skills add diegosouzapw/OmniRoute --skill cli-serve --agent claude-code`
     - `npx -y skills add mayankjain1815-commits/OmniRoute --skill cli-models --agent claude-code`
  3. Starts/verifies `omniroute serve` daemon health and merges `ANTHROPIC_BASE_URL` (pointing to the local OmniRoute gateway port) into the `"env"` block of `~/.claude/settings.json` without overwriting existing user settings.
  4. Provides `claude-bench switch-gateway <official|omniroute>` to toggle cleanly at any time.

## 7. Repository Architecture & Module Boundaries

```text
src/
├── cli/
│   ├── index.ts                 # Commander CLI entry point (init, sync, list, add, switch-gateway, doctor, rollback, export, import)
│   ├── wizard.ts                # Interactive @clack/prompts multi-step setup flow
│   └── ui.ts                    # Terminal tables, spinners, and diagnostic formatters
├── core/
│   ├── os-detector.ts           # OS, shell, package manager, and config path resolution
│   ├── backup-manager.ts        # Automatic timestamped backups & atomic rollback (~/.claude-bench/backups/)
│   ├── security-auditor.ts      # Validates SKILL.md and install commands against malicious payloads
│   └── schema.ts                # Zod schemas for Registry, FieldPreset, MCPServerConfig, and UserProfile
├── installers/
│   ├── claude-installer.ts      # Official Claude Code CLI & Claude Desktop installer
│   ├── omniroute-installer.ts   # OmniRoute gateway installer, daemon manager, and env router
│   ├── skill-installer.ts       # Executes `npx -y skills add ...` and plugin registrations concurrently
│   ├── cli-anything-installer.ts# Installs HKUDS/CLI-Anything harnesses
│   └── mcp-merger.ts            # Deep-merges MCP configs into ~/.claude/settings.json, ./.mcp.json, & claude_desktop_config.json
├── generators/
│   └── claude-md-generator.ts   # Composes multi-field CLAUDE.md instructions
└── registry/
    ├── registry.seed.json       # Verified offline snapshot of skills, plugins, MCPs, and CLI-Anything tools
    └── scrapling-sync.ts        # Live Scrapling MCP sync engine for `claude-bench sync`
```

## 8. Non-Negotiable Engineering & Security Guardrails

1. **Zero Command Injection**: Always execute child processes via `execa(binary, argsArray, options)` using argument arrays. Never interpolate user input or scraped strings into `execaCommand` or `shell: true`.
2. **Atomic Backups Before Mutation**: Any write to `~/.claude/settings.json`, `./.mcp.json`, `~/.claude/CLAUDE.md`, or `claude_desktop_config.json` MUST first create a timestamped backup via `BackupManager.createBackup(filePath)` and perform a lossless deep merge that preserves existing user keys.
3. **Cross-Platform Config Paths**:
   - Claude Code Global Settings: `path.join(os.homedir(), '.claude', 'settings.json')`
   - Claude Code Global Skills: `path.join(os.homedir(), '.claude', 'skills')`
   - Claude Desktop Config:
     - macOS: `path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json')`
     - Windows: `path.join(process.env.APPDATA || '', 'Claude', 'claude_desktop_config.json')`
     - Linux: `path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json')`
4. **Dry-Run Support Everywhere**: Every installer and config mutator must respect `--dry-run` (logging exact commands and JSON diffs without modifying the host system) so automated tests and cautious users can inspect all changes safely.
5. **Mandatory OpenCode Review Gate**: Before marking any milestone complete, run `mcp__opencode-review` on `git diff` and resolve all security, error-handling, and type-safety findings.
