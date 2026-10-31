# Open-Source Claude Setup CLI (`claude-forge` / `create-claude-env`) — Architecture, End-to-End Workflow & Master Agent Prompt

## 1. Executive Summary & Project Vision

This specification defines the complete engineering workflow, multi-agent orchestration architecture, scraping pipeline, and copy-paste **Master Prompt** for building an open-source, interactive CLI bootstrapper (tentatively named **`claude-forge`** or **`create-claude-env`**) using [Claude Code](https://code.claude.com/docs/en/overview).

The CLI provides a single-command interactive wizard (`npx claude-forge init`) and headless flags (`claude-forge init --field fullstack --gateway omniroute --target both --yes`) that automatically:

1. **Installs Official Claude Targets**: Detects the user's operating system (macOS, Linux, Windows WSL/PowerShell/WinGet) and installs [Claude Code CLI](https://code.claude.com/docs/en/quickstart) (`curl -fsSL https://claude.ai/install.sh | bash`, `irm https://claude.ai/install.ps1 | iex`, `brew install --cask claude-code`, or `winget install Anthropic.ClaudeCode`) and/or the Claude Desktop App.
2. **Configures Routing Mode (Official Anthropic vs. OmniRoute Gateway)**: Lets the user choose between direct official Anthropic authentication (`/login` or `ANTHROPIC_API_KEY`) or [OmniRoute](https://github.com/cheaper-inference/OmniRoute) ([npm package](https://www.npmjs.com/package/omniroute), [OmniRoute Portal](https://www.omniroute.online/pt-BR/)) for multi-provider LLM routing, automatic fallback, local proxy daemon (`omniroute serve`), and custom `ANTHROPIC_BASE_URL` injection into `~/.claude/settings.json` plus the [OmniRoute CLI Serve Skill](https://skillselion.com/skills/diegosouzapw/OmniRoute/cli-serve).
3. **Harvests & Curates Domain Packs Across 11 Professional Fields**: Uses [Scrapling MCP](https://scrapling.readthedocs.io/en/latest/ai/mcp-server.html) ([GitHub](https://github.com/d4vinci/Scrapling)) and [Scrapling Fetch MCP](https://github.com/cyberchitta/scrapling-fetch-mcp) to crawl and index verified skills, plugins, and MCP servers from [Claude Marketplaces](https://claudemarketplaces.com/skills) ([Main Directory](https://claudemarketplaces.com/), [Plugin Marketplaces](https://claudemarketplaces.com/marketplaces)), [Skills.sh](https://www.skills.sh/) ([Vercel Labs Skills CLI](https://github.com/vercel-labs/skills)), [Anthropic Official Skills](https://github.com/anthropics/skills), [Smithery](https://smithery.ai/), [MCP.so](https://mcp.so/), and [CLI-Anything Hub](https://clianything.cc/) ([GitHub](https://github.com/HKUDS/CLI-Anything)).
4. **Enforces Engineering Quality via Multi-Agent Orchestration**: Built end-to-end inside Claude Code using [Ruflo](https://github.com/ruvnet/ruflo) ([Ruflo Platform](https://ruflo.pro/)) for multi-agent swarm orchestration, [Superpowers](https://github.com/obra/superpowers) ([Marketplace](https://github.com/obra/superpowers-marketplace)) for spec-first TDD and subagent planning, and [OpenCode Review](https://github.com/alibaba/open-code-review) ([OpenCode vs. Claude Code](https://www.morphllm.com/comparisons/opencode-vs-claude-code)) for automated security and architecture review gates.

## 2. Core Toolchain & Ecosystem Stack

| Layer | Tool / Repository | Role in Building & Running the CLI | Installation / Bootstrap Command |
| :--- | :--- | :--- | :--- |
| **Core Agent Runtime** | [Claude Code](https://code.claude.com/docs/en/quickstart) | Primary autonomous coding environment and target CLI to configure | `curl -fsSL https://claude.ai/install.sh \| bash` (macOS/Linux/WSL) or `irm https://claude.ai/install.ps1 \| iex` (Windows PS) |
| **Multi-Agent Swarm Orchestrator** | [Ruflo (claude-flow)](https://github.com/ruvnet/ruflo) | Coordinates parallel specialist agents (Scraper, Architect, CLI Builder, Security Auditor, QA) with shared memory | `npx ruflo init` then `/ruflo` inside Claude Code; plus [Ruflo Discover Plugins](https://claudemarketplaces.com/skills/ruvnet/ruflo/discover-plugins) |
| **Disciplined Dev Methodology** | [Superpowers (`obra/superpowers`)](https://github.com/obra/superpowers) | Enforces spec-first design, micro-task planning, TDD (Red-Green-Refactor), and review loops | `npx -y skills add obra/superpowers --skill superpowers --agent claude-code` ([Guide](https://claudecowork.im/resources/superpowers)) |
| **Anti-Bot Web Scraping MCP** | [Scrapling MCP](https://scrapling.readthedocs.io/en/latest/ai/mcp-server.html) & [Scrapling Fetch MCP](https://github.com/cyberchitta/scrapling-fetch-mcp) | Token-efficient CSS/XPath extraction with stealth browser and Cloudflare bypass for scraping skill registries | `uv tool install "scrapling[ai]"` or `uv tool install git+https://github.com/cyberchitta/scrapling-fetch-mcp` ([MCP.so Config](https://mcp.so/servers/scrapling-fetch-mcp)) |
| **GUI-to-CLI Harness Generator** | [CLI-Anything (`HKUDS/CLI-Anything`)](https://github.com/HKUDS/CLI-Anything) | Wraps desktop/GUI software (FFmpeg, Blender, GIMP, Burp, Audacity, Xcode tools) into agent-native CLIs | `npx -y skills add HKUDS/CLI-Anything --skill cli-hub-meta-skill -g -y` ([CLI-Anything Hub](https://clianything.cc/)) |
| **Code Review & Security Gate** | [OpenCode Review](https://github.com/alibaba/open-code-review) | Multi-model static analysis, security auditing, and PR/diff review via MCP | Connect as MCP review server in `.mcp.json` and run on every feature branch |
| **LLM Router & Gateway** | [OmniRoute (`cheaper-inference/OmniRoute`)](https://github.com/cheaper-inference/OmniRoute) | Optional local OpenAI/Anthropic-compatible proxy gateway for multi-provider routing and fallback | `npm install -g omniroute && omniroute serve` + `npx -y skills add diegosouzapw/OmniRoute --skill cli-serve` ([Skill](https://skillselion.com/skills/diegosouzapw/OmniRoute/cli-serve)) |
| **Skill & Plugin Installer** | [Vercel Labs `npx skills`](https://github.com/vercel-labs/skills) | Standardized open agent skill installer supporting Claude Code, OpenCode, Cursor, and Codex | `npx -y skills add <owner>/<repo> --skill <name> --agent claude-code` |

## 3. Target Registries & Marketplaces for Scrapling MCP

Your Scraper Agent will use [Scrapling MCP](https://scrapling.readthedocs.io/en/latest/ai/mcp-server.html) to crawl, deduplicate, and score items from these primary sources:

1. **[Claude Marketplaces — Skills Directory](https://claudemarketplaces.com/skills)**: Over 23,300+ indexed Claude Code skills ranked by installs and GitHub stars.
2. **[Claude Marketplaces — Plugin Marketplaces](https://claudemarketplaces.com/marketplaces)**: Category-organized plugin bundles ([Development](https://claudemarketplaces.com/marketplaces/category/development), [Security](https://claudemarketplaces.com/marketplaces/category/security), [Automation](https://claudemarketplaces.com/marketplaces/category/automation), [Anthropic Official Plugins](https://claudemarketplaces.com/plugins/anthropics-skills), [Superpowers Plugins](https://claudemarketplaces.com/plugins/obra-superpowers)).
3. **[Skills.sh — The Agent Skills Directory](https://www.skills.sh/)**: Open standard `SKILL.md` registry backed by [vercel-labs/skills](https://github.com/vercel-labs/skills).
4. **[Anthropic Official Skills Repository](https://github.com/anthropics/skills)**: Official foundational skills including [skill-creator](https://claudemarketplaces.com/skills/anthropics/skills/skill-creator), frontend design, document processing, and MCP builders.
5. **[CLI-Anything Hub](https://clianything.cc/)**: Agent-native CLI harnesses for desktop and media software ([HKUDS/CLI-Anything](https://github.com/HKUDS/CLI-Anything)).
6. **[Smithery](https://smithery.ai/) & [MCP.so](https://mcp.so/)**: Verified Model Context Protocol (MCP) server registries for database, browser, security, and cloud integrations.

## 4. Domain Matrix: The 11 Supported Professional Fields

Every field maps to a curated preset in `registry.json` containing **Skills** (`~/.claude/skills/`), **Plugins**, **MCP Servers** (`~/.claude/settings.json` / `claude_desktop_config.json`), **CLI-Anything Harnesses**, and a tailored global **`CLAUDE.md`** persona:

| # | Field ID | Display Name | Scrapling Search Tags & Categories | Core Skills, Plugins, MCPs & CLI-Anything Harnesses to Bundle |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `fullstack` | **Full Stack Web Developer** | `frontend`, `backend`, `nextjs`, `react`, `database`, `prisma`, `playwright`, `docker` | [shadcn/ui skill](https://ui.shadcn.com/docs/skills), Frontend Design ([Firecrawl Top Skills](https://www.firecrawl.dev/blog/best-claude-code-skills)), Playwright MCP, Postgres/Supabase MCP, Git/PR workflow skills, [Superpowers TDD](https://github.com/obra/superpowers) |
| **2** | `cybersecurity` | **Cyber Security** | `security`, `pentest`, `owasp`, `sast`, `vulnerability`, `reverse-engineering`, `compliance` | [Security Marketplace Plugins](https://claudemarketplaces.com/marketplaces/category/security), Semgrep/Trivy MCP, Nuclei/Nmap/Ghida [CLI-Anything](https://clianything.cc/) wrappers, OWASP code auditor skill, secret-scanner pre-commit hooks |
| **3** | `video-editing` | **Video Editing** | `video`, `ffmpeg`, `remotion`, `audio`, `media`, `subtitles`, `blender`, `davinci` | [CLI-Anything](https://github.com/HKUDS/CLI-Anything) harnesses for FFmpeg, Blender, GIMP, Audacity, and OBS; Remotion programmatic video skill; Whisper transcript/captioning MCP |
| **4** | `researcher` | **Researcher** | `research`, `arxiv`, `citations`, `latex`, `data-analysis`, `scraping`, `notebooks` | [Scrapling MCP](https://scrapling.readthedocs.io/en/latest/ai/mcp-server.html), ArXiv/Semantic Scholar MCP, Zotero/BibTeX citation skill, Jupyter/Pandas analysis skill, LaTeX paper synthesis skill |
| **5** | `marketing` | **Marketing** | `marketing`, `seo`, `copywriting`, `analytics`, `social-media`, `growth`, `ads`, `cro` | SEO audit & keyword research skills, [Scrapling Fetch MCP](https://mcp.so/servers/scrapling-fetch-mcp) for competitor intelligence, Google Analytics/Search Console MCP, multi-channel content remix & copywriting playbooks |
| **6** | `mobile-dev` | **Mobile Developer** | `mobile`, `react-native`, `flutter`, `expo`, `android`, `adb`, `fastlane` | React Native / Expo & Flutter skills, Android ADB & Fastlane [CLI-Anything](https://clianything.cc/) wrappers, mobile UI/UX responsive audit skill, crashlytics/logcat analyzer |
| **7** | `desktop-dev` | **Desktop Developer** | `desktop`, `electron`, `tauri`, `rust`, `qt`, `dotnet`, `native-gui`, `packaging` | Tauri (Rust) & Electron architecture skills, cross-platform installer/signing workflows, native OS IPC security audit skill, [CLI-Anything](https://github.com/HKUDS/CLI-Anything) GUI inspection harness |
| **8** | `ios-dev` | **iOS Developer** | `ios`, `swift`, `swiftui`, `xcode`, `cocoapods`, `spm`, `testflight`, `xcrun` | Swift 6 / SwiftUI concurrency skills, `xcodebuild` & `xcrun simctl` simulator MCP/wrappers, Fastlane TestFlight automation skill, Human Interface Guidelines (HIG) auditor |
| **9** | `backend-dev` | **Backend Developer** | `backend`, `api`, `microservices`, `graphql`, `grpc`, `redis`, `kafka`, `kubernetes`, `sql` | OpenAPI/gRPC schema design skills, Postgres/Redis/MongoDB MCPs, Docker & Kubernetes manifest validator skills, load-testing (k6) & SQL query optimization skills |
| **10** | `frontend-dev` | **Front-End Developer** | `frontend`, `ui`, `ux`, `css`, `tailwind`, `accessibility`, `wcag`, `animation`, `vite` | [shadcn/ui skill](https://ui.shadcn.com/docs/skills), WCAG accessibility & Lighthouse audit MCP, Figma-to-Code MCP, Tailwind/CSS design-system architect skill, Storybook/Playwright visual regression |
| **11** | `software-eng` | **Software Engineer** | `architecture`, `system-design`, `tdd`, `refactoring`, `ci-cd`, `code-review`, `git` | [Superpowers core library](https://claudemarketplaces.com/plugins/obra-superpowers), [Ruflo orchestration skill](https://claudemarketplaces.com/skills/ruvnet/ruflo/discover-plugins), [OpenCode Review MCP](https://github.com/alibaba/open-code-review), GitHub Actions CI/CD generator, C4 system architecture skill |

## 5. Added High-Value Features & Missing Instructions (Included in Spec)

To ensure your CLI is a genuine production-grade open-source tool rather than a fragile bash script, the workflow and prompt below add these essential capabilities that are often overlooked:

1. **Multi-Field Selection & Custom Stack Merging**: Users often wear multiple hats (e.g., *Full Stack Web Developer* + *Cyber Security* + *Marketing*). The CLI supports multi-select in interactive mode and comma-separated `--fields fullstack,cybersecurity` in headless mode, deduplicating overlapping skills and merging `CLAUDE.md` instructions cleanly.
2. **Installation Scope Selection (`--scope global | project`)**: Users can install skills, MCP servers, and `CLAUDE.md` either globally (`~/.claude/skills/`, `~/.claude/settings.json`, `~/.claude/CLAUDE.md`) or scoped to the current repository (`.claude/skills/`, `.mcp.json`, `./CLAUDE.md`) so teams can commit their field configuration to Git.
3. **Automatic Backup, Atomic Rollback & Conflict Resolution**: Before touching `~/.claude/settings.json` or `claude_desktop_config.json`, the CLI creates a timestamped backup in `~/.claude-forge/backups/` and performs a deep JSON merge (preserving existing user MCP servers, hooks, and permissions) rather than overwriting files. Includes `claude-forge rollback`.
4. **`claude-forge doctor` Diagnostics Command**: Verifies `node`, `npm`/`pnpm`/`bun`, `uv`/`python3`, `git`, `claude --version`, active `omniroute` daemon health (if selected), MCP server reachability, and valid JSON syntax across all Claude config files.
5. **Hybrid Registry Engine (`sync` + Bundled Offline Snapshot)**: Ships with a pre-scraped, verified `registry.lock.json` inside the npm package for instant zero-latency execution, while offering `claude-forge sync` to invoke [Scrapling MCP](https://scrapling.readthedocs.io/en/latest/ai/mcp-server.html) live and fetch the newest trending skills from [claudemarketplaces.com](https://claudemarketplaces.com/skills) and [skills.sh](https://www.skills.sh/).
6. **Skill Security & Trust Gate**: Every scraped skill or MCP server is scored by GitHub stars, install count, and a static scan of `SKILL.md` / install scripts to block malicious prompt injections or arbitrary `curl | bash` payloads from untrusted repos before execution.
7. **`claude-forge export` / `import` Shareable Profiles**: Exports a deterministic `claude-profile.json` lockfile so developers can share their exact Claude setup with teammates via a gist or URL (`npx claude-forge import ./claude-profile.json`).

## 6. Step-by-Step Execution Workflow (How You Will Build This)

Follow these 6 phases in your terminal to initialize the workspace, wire up your MCP servers and orchestration plugins, and hand off execution to the Master Prompt in Section 7.

### Phase 1: Bootstrap Your Development Environment & Pre-Requisites

Run these commands in your terminal to ensure your local Claude Code environment has **Ruflo**, **Superpowers**, **CLI-Anything**, and **Scrapling MCP** ready before you start the build:

```bash
# 1. Create project directory and initialize Git
mkdir claude-forge && cd claude-forge
git init

# 2. Install Superpowers (Spec-First TDD & Subagent Workflow) into Claude Code
npx -y skills add obra/superpowers --skill superpowers --agent claude-code

# 3. Install CLI-Anything Meta-Skill & Ruflo Plugin Discovery Skill
npx -y skills add HKUDS/CLI-Anything --skill cli-hub-meta-skill -g -y
npx -y skills add ruvnet/ruflo --skill discover-plugins --agent claude-code

# 4. Install OmniRoute CLI Skills (for reference & testing during build)
npx -y skills add diegosouzapw/OmniRoute --skill cli-serve --agent claude-code
npx -y skills add mayankjain1815-commits/OmniRoute --skill cli-models --agent claude-code

# 5. Install Scrapling with AI/MCP support via uv (Python)
uv tool install "scrapling[ai]"
uv tool install git+https://github.com/cyberchitta/scrapling-fetch-mcp

# 6. Initialize Ruflo multi-agent orchestration in the repo
npx ruflo init
```

### Phase 2: Configure `.mcp.json` for Scrapling MCP & OpenCode Review MCP

Create a `.mcp.json` file in the root of `claude-forge/` so Claude Code and Ruflo subagents can call **Scrapling MCP** and **OpenCode Review MCP** directly as native tools:

```json
{
  "mcpServers": {
    "scrapling": {
      "command": "uvx",
      "args": ["--from", "scrapling[ai]", "scrapling", "mcp"]
    },
    "scrapling-fetch": {
      "command": "uvx",
      "args": ["scrapling-fetch-mcp"]
    },
    "opencode-review": {
      "command": "npx",
      "args": ["-y", "@alibaba/open-code-review", "--mcp"]
    }
  }
}
```

### Phase 3: Launch Claude Code & Activate Ruflo + Superpowers

Start Claude Code in your project root and verify that your MCP servers and orchestrators are online:

```bash
claude
```

Inside the interactive Claude Code session, run:

```text
/mcp
/ruflo
```

### Phase 4: Execute the Master Agent Prompt (Section 7)

Paste the **Master Agent Prompt** from Section 7 below directly into Claude Code. The prompt instructs **Ruflo** and **Superpowers** to spin up 5 specialized agents:

- **Agent 1 (` Harvester-Scraper`)**: Uses `scrapling` and `scrapling-fetch` MCP to crawl [claudemarketplaces.com/skills](https://claudemarketplaces.com/skills), [claudemarketplaces.com/marketplaces](https://claudemarketplaces.com/marketplaces), [skills.sh](https://www.skills.sh/), [anthropics/skills](https://github.com/anthropics/skills), and [clianything.cc](https://clianything.cc/), building `src/registry/registry.seed.json` mapped across all 11 fields.
- **Agent 2 (`Core-Installer-Architect`)**: Builds the cross-platform OS installer engine for Official Claude Code (`curl` / `irm` / `brew` / `winget`), Claude Desktop, and the **OmniRoute** gateway configurator (`npm i -g omniroute`, daemon setup, and `~/.claude/settings.json` proxy injection).
- **Agent 3 (`Skill-Plugin-Engine`)**: Builds the parallel installer for skills (`npx -y skills add ...`), plugins, MCP servers (safe JSON AST/deep-merge into `.claude/settings.json` and `claude_desktop_config.json`), and `CLAUDE.md` domain persona generator.
- **Agent 4 (`CLI-UX-Builder`)**: Builds the interactive TUI wizard using `@clack/prompts` + `commander`, supporting `init`, `sync`, `list`, `add`, `doctor`, `rollback`, `export`, and `import`.
- **Agent 5 (`OpenCode-QA-Reviewer`)**: Uses **OpenCode Review MCP** and **Superpowers TDD** (`vitest`) to audit every module for command injection, broken URLs, cross-platform path bugs, and test coverage before packaging for npm and GitHub release.

## 7. Copy-Paste Master Prompt for Your Claude Code Agent

Copy the entire block below and paste it into your Claude Code session:

```markdown
# ROLE & MISSION
You are the Lead Principal Architect and Swarm Coordinator building **`claude-forge`** — an advanced, production-grade, open-source CLI tool that bootstraps and configures the official **Claude Code CLI** and/or **Claude Desktop App** tailored to a user's professional field(s), with first-class support for either **Official Anthropic Authentication** or **OmniRoute Multi-Provider Gateway Routing**.

You MUST execute this project using:
1. **`obra/superpowers`** for disciplined Spec-First Design, Micro-Task Breakdown, and Red-Green-Refactor TDD.
2. **`ruflo` (`claude-flow`)** for multi-agent swarm orchestration, parallel task execution, and shared memory across subagents.
3. **`scrapling` / `scrapling-fetch` MCP** to live-scrape, extract, verify, and rank skills, plugins, and MCP servers from target marketplaces without wasting context tokens on raw HTML.
4. **`cli-anything` (`HKUDS/CLI-Anything`)** to discover and integrate agent-native CLI harnesses for GUI/desktop software required by fields like Video Editing, Cyber Security, Mobile/iOS, and Desktop Development.
5. **`opencode-review` MCP** to run automated static analysis, security audits, and architectural code reviews at the end of every milestone.

---

# 1. TARGET PROFESSIONAL FIELDS (11 MANDATORY DOMAINS)
The CLI must support single-select and multi-select across these exact 11 fields (normalizing common user spellings in search/CLI flags):
1. `fullstack` — **Full Stack Web Developer**
2. `cybersecurity` — **Cyber Security**
3. `video-editing` — **Video Editing**
4. `researcher` — **Researcher**
5. `marketing` — **Marketing**
6. `mobile-dev` — **Mobile Developer**
7. `desktop-dev` — **Desktop Developer**
8. `ios-dev` — **iOS Developer**
9. `backend-dev` — **Backend Developer**
10. `frontend-dev` — **Front-End Developer**
11. `software-eng` — **Software Engineer**

---

# 2. REQUIRED CORE CAPABILITIES OF THE CLI

## A. Target Application Bootstrapper (`Official Claude App` & `Claude Code CLI`)
Detect the user's OS (`darwin`, `linux`, `win32`, WSL) and install the user's chosen target (`cli`, `desktop`, or `both`):
- **Claude Code CLI (Official)**:
  - macOS / Linux / WSL Native: `curl -fsSL https://claude.ai/install.sh | bash` (or `brew install --cask claude-code` on macOS if Homebrew is preferred).
  - Windows PowerShell: `irm https://claude.ai/install.ps1 | iex`
  - Windows CMD: `curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd`
  - Windows WinGet: `winget install Anthropic.ClaudeCode`
  - Post-install verification: verify binary resolution on `PATH` and run `claude --version`.
- **Claude Desktop App**:
  - macOS: `brew install --cask claude` or direct official DMG download & mount fallback.
  - Windows: `winget install Anthropic.Claude` or official installer download.
  - Linux: community/wrapped desktop notification or automatic redirection to Claude Code CLI + web/PWA bridge.

## B. Routing & Authentication Mode: `Official Claude` vs. `OmniRoute`
Prompt the user (or accept `--gateway <official|omniroute>`) to configure how Claude connects to models:
- **Mode 1: Official Claude (`official`)**
  - Configure native Anthropic authentication (`claude /login` for Pro/Max/Team/Enterprise OAuth or `ANTHROPIC_API_KEY` / Bedrock / Vertex env configuration in `~/.claude/settings.json`).
- **Mode 2: OmniRoute AI Gateway (`omniroute`)**
  - Install OmniRoute globally if missing: `npm install -g omniroute` (from `cheaper-inference/OmniRoute`).
  - Install OmniRoute management skills into Claude Code:
    - `npx -y skills add diegosouzapw/OmniRoute --skill cli-serve --agent claude-code`
    - `npx -y skills add mayankjain1815-commits/OmniRoute --skill cli-models --agent claude-code`
  - Start or configure the local OmniRoute daemon (`omniroute serve` on default port e.g. `http://127.0.0.1:4000` or user-specified port).
  - Safely merge OmniRoute routing environment variables (`ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_token` / gateway key, and model aliases) into `~/.claude/settings.json` (under `"env"`) and/or generate a wrapper profile (`omniroute run claude --model <preferred-model>`) so Claude Code routes seamlessly through OmniRoute without breaking official updates.

## C. Live Marketplace Scraping & Curated Registry via `Scrapling MCP`
Use `scrapling` MCP (`stealthy_fetch`, `fetch`, CSS/XPath extraction) to scrape, parse, and build a structured, schema-validated registry (`src/registry/registry.seed.json`) from:
1. `https://claudemarketplaces.com/skills` (and category pages: Frontend, Backend, Security, DevOps, Testing, AI & Agent Building, Marketing, etc.)
2. `https://claudemarketplaces.com/marketplaces` & `https://claudemarketplaces.com/plugins` (including `anthropics/skills`, `obra/superpowers`, `ruvnet/ruflo`, `google/skills`, security & automation marketplaces)
3. `https://www.skills.sh/` (and `https://github.com/vercel-labs/skills` ecosystem)
4. `https://github.com/anthropics/skills` (Official Anthropic skills)
5. `https://clianything.cc/` & `https://github.com/HKUDS/CLI-Anything` (Agent-native CLI harnesses for desktop/GUI tools)
6. `https://smithery.ai/` & `https://mcp.so/` (Top verified MCP servers per field)

For EVERY one of the 11 fields, populate at least:
- **8–15 Top-Ranked Skills** (with exact `npx -y skills add <owner>/<repo> --skill <name> --agent claude-code` command, source URL, description, and star/install metadata).
- **2–4 Plugin Marketplaces / Bundles** (with exact plugin install commands).
- **3–6 Field-Specific MCP Servers** (with exact `command`, `args`, and required `env` keys for `.mcp.json` / `~/.claude/settings.json` / `claude_desktop_config.json`).
- **1–4 `CLI-Anything` Tool Harnesses** where applicable (e.g., FFmpeg/Blender/GIMP for Video Editing; Nmap/Nuclei/Ghidra for Cyber Security; ADB/Fastlane/Xcode for Mobile & iOS).
- **1 Tailored `CLAUDE.md` Domain Blueprint** (system instructions, coding standards, security rules, preferred workflows, and slash command references tailored to that field).

## D. Interactive & Headless CLI UX (`claude-forge`)
Build the CLI in TypeScript (Node.js >= 20, compiled with `tsup`, interactive UI with `@clack/prompts`, CLI parsing with `commander`, schema validation with `zod`, styling with `picocolors`, execution via `execa`):
- `claude-forge init`: Interactive step-by-step wizard:
  1. Select target (`Claude Code CLI`, `Claude Desktop`, or `Both`).
  2. Select routing mode (`Official Anthropic` vs. `OmniRoute Gateway`).
  3. Select one or multiple professional fields (from the 11 fields).
  4. Select installation profile (`Recommended Fast Setup` [one-click installs all top-tier items for the field] vs. `Custom Cherry-Pick` [checkbox toggle for individual skills, plugins, MCPs, and CLI-Anything wrappers]).
  5. Select installation scope (`Global (~/.claude)` vs. `Project (./.claude & ./.mcp.json)`).
  6. Execute parallel installation with live spinner progress, automatic backup of existing configs (`~/.claude-forge/backups/`), and a final rich summary table.
- `claude-forge sync [--field <id>]`: Runs Scrapling MCP / crawler adapter to refresh the local skill & plugin registry from `claudemarketplaces.com` and `skills.sh`.
- `claude-forge list [--field <id>]`: Displays all curated skills, plugins, MCPs, and CLI-Anything tools for a field.
- `claude-forge add <skill-or-mcp>`: Installs a specific skill or MCP server on demand.
- `claude-forge switch-gateway <official|omniroute>`: Toggles Claude Code between Official Anthropic API and OmniRoute gateway cleanly.
- `claude-forge doctor`: Runs full health checks (OS dependencies, `claude --version`, `omniroute` daemon status, MCP server syntax, config JSON validity).
- `claude-forge rollback`: Restores `~/.claude/settings.json` and `claude_desktop_config.json` from the latest automatic backup.
- `claude-forge export` / `claude-forge import <file>`: Exports or imports a reproducible `claude-profile.json` team config.

---

# 3. EXECUTION WORKFLOW (SUPERPOWERS + RUFLO + OPENCODE REVIEW)

Follow this strict 5-stage execution pipeline. Do NOT skip any stage:

## Stage 1: Superpowers Brainstorming & Spec Lock (`docs/SPEC.md`)
1. Activate `superpowers` planning protocol.
2. Write `docs/SPEC.md` defining the repository structure, Zod data schemas for `RegistryItem` and `FieldPreset`, configuration file merge rules across macOS/Linux/Windows, and CLI command contracts.

## Stage 2: Ruflo Multi-Agent Swarm Initialization & Live Scraping
Spawn coordinated Ruflo subagents to work in parallel on harvesting real data using `scrapling` / `scrapling-fetch` MCP:
- **Subagent A (ClaudeMarketplaces Harvester)**: Scrape `https://claudemarketplaces.com/skills` and `https://claudemarketplaces.com/marketplaces` across all categories matching the 11 fields. Extract repo owner/name, skill identifier, install command, description, and star/install counts.
- **Subagent B (Skills.sh & Anthropic Official Harvester)**: Scrape `https://www.skills.sh/` and `https://github.com/anthropics/skills` for top agent skills across the 11 fields.
- **Subagent C (CLI-Anything & MCP Harvester)**: Scrape `https://clianything.cc/` (`HKUDS/CLI-Anything`) and `https://mcp.so/` for agent-native CLI harnesses and MCP server definitions mapped to the 11 fields.
- **Consolidation & Validation**: Merge all scraped items into `src/registry/registry.seed.json`. Validate every URL and install command against our Zod schema. Ensure zero placeholder strings (`TODO`, `example/skill`, fake URLs) exist in the registry.

## Stage 3: TDD Implementation of Core Engines (`Superpowers` Red-Green-Refactor)
Write failing `vitest` unit/integration tests first, then implement each module:
1. `src/core/os-detector.ts` & `src/installers/claude-installer.ts`: Cross-platform official Claude Code CLI & Desktop installer with dry-run support.
2. `src/installers/omniroute-installer.ts`: OmniRoute global installation, daemon health check, skill injection (`cli-serve`, `cli-models`), and lossless `~/.claude/settings.json` env routing toggle.
3. `src/installers/skill-plugin-installer.ts`: Concurrent execution of `npx -y skills add ...`, plugin marketplace registration, and `cli-anything` harness installation with retry & rollback.
4. `src/installers/mcp-config-merger.ts`: Atomic backup and deep-merge of MCP server definitions into `~/.claude/settings.json`, `./.mcp.json`, and `claude_desktop_config.json`.
5. `src/generators/claude-md-generator.ts`: Generates tailored, multi-field composable `CLAUDE.md` files for each of the 11 fields.
6. `src/cli/index.ts` & `src/cli/prompts.ts`: Interactive `@clack/prompts` wizard and headless CLI commands.

## Stage 4: OpenCode Review MCP Audit & Security Hardening
1. Invoke `opencode-review` MCP across the entire codebase (`src/` and `tests/`).
2. Audit specifically for:
   - Shell command injection vulnerabilities (enforce array-based argument passing in `execa`, never unsanitized string interpolation).
   - API key / token leakage in logs or backups.
   - Cross-platform path handling (`path.join`, Windows `%APPDATA%\Claude\claude_desktop_config.json` vs macOS `~/Library/Application Support/Claude/claude_desktop_config.json` vs Linux `~/.config/Claude/claude_desktop_config.json`).
   - Graceful handling of network timeouts or missing prerequisites (`git`, `node`, `uv`).
3. Fix all critical, high, and medium findings raised by `opencode-review`.

## Stage 5: Open-Source Packaging, Documentation & Release Readiness
1. Verify all `vitest` suites pass (`npm test`) and build succeeds (`npm run build`).
2. Run `node dist/index.js init --dry-run` across multiple field combinations (e.g., `fullstack` + `omniroute`, `cybersecurity` + `official`, `video-editing` + `omniroute`) to verify end-to-end execution.
3. Generate open-source repository assets:
   - Professional `README.md` with ASCII banner, architecture diagram, quick-start (`npx claude-forge init`), all 11 field tables, OmniRoute setup guide, and CLI reference.
   - `CONTRIBUTING.md` explaining how contributors can add new skills/fields or run `claude-forge sync` with Scrapling MCP.
   - `LICENSE` (MIT) and `.github/workflows/ci.yml` (automated test, lint, typecheck, and npm publish pipeline).

Begin immediately with **Stage 1** and **Stage 2**, showing your Superpowers plan and dispatching the Scrapling MCP tasks to build the verified 11-field registry first.
```

## 8. Target Repository Architecture (`claude-forge`)

When your agent finishes executing the workflow above, your open-source project will have this clean, modular structure:

```text
claude-forge/
├── .claude/
│   └── skills/                      # Project-level skills (Superpowers, Ruflo, CLI-Anything, Scrapling)
├── .github/
│   └── workflows/
│       ├── ci.yml                   # Matrix CI (Ubuntu, macOS, Windows) running Vitest + OpenCode Review
│       └── sync-registry.yml        # Weekly cron job using Scrapling to update registry.seed.json
├── .mcp.json                        # Project MCP config (scrapling, scrapling-fetch, opencode-review)
├── docs/
│   ├── SPEC.md                      # Superpowers architectural specification
│   └── FIELDS.md                    # Documentation of all 11 domain presets
├── src/
│   ├── cli/
│   │   ├── index.ts                 # Commander entry point (init, sync, list, add, doctor, rollback)
│   │   ├── wizard.ts                # @clack/prompts interactive TUI flow
│   │   └── ui.ts                    # Spinners, tables, ASCII banner, summary reporters
│   ├── core/
│   │   ├── os-detector.ts           # macOS / Linux / Windows / WSL detection & config path resolver
│   │   ├── backup-manager.ts        # Timestamped backups & atomic rollback in ~/.claude-forge/backups
│   │   ├── security-auditor.ts      # Validates scraped SKILL.md & install commands before execution
│   │   └── schema.ts                # Zod schemas for Skills, Plugins, MCPs, Fields, and User Profiles
│   ├── installers/
│   │   ├── claude-installer.ts      # Installs Official Claude Code CLI & Claude Desktop App
│   │   ├── omniroute-installer.ts   # Installs OmniRoute, configures daemon & ~/.claude/settings.json routing
│   │   ├── skill-installer.ts       # Runs `npx -y skills add ...` & plugin marketplace registrations
│   │   ├── cli-anything-installer.ts# Installs HKUDS/CLI-Anything harnesses for GUI/media/security apps
│   │   └── mcp-merger.ts            # Deep-merges MCP servers into Claude Code & Desktop JSON configs
│   ├── generators/
│   │   └── claude-md-generator.ts   # Composes field-specific CLAUDE.md instructions & slash commands
│   └── registry/
│       ├── registry.seed.json       # Pre-scraped, verified catalog across all 11 professional fields
│       └── scrapling-sync.ts        # Live Scrapling MCP client to refresh registry on `claude-forge sync`
├── tests/
│   ├── installers.test.ts           # Unit tests with mocked execa & temp filesystem
│   ├── mcp-merger.test.ts           # Config preservation & rollback tests
│   └── registry-schema.test.ts      # Validates every URL & install command across all 11 fields
├── package.json                     # Configured with `"bin": { "claude-forge": "./dist/index.js" }`
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```
