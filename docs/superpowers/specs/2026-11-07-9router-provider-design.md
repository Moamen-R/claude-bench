# 9router Provider Setup Integration Design Spec

**Date:** 2026-11-07  
**Author:** AI Systems Architect & Claude Code  
**Status:** Pending Approval  

---

## 1. Intent & Context
`claude-bench` currently provides two gateway routing choices: `official` (direct Anthropic endpoints) and `omniroute` (OmniRoute local AI gateway). Users need to configure [9router](https://9router.com/) as their multi-provider AI gateway daemon, routing Claude Code traffic through `http://127.0.0.1:4000`.

---

## 2. Goals & Non-Goals

### Goals
- Extend `GatewayMode` schema to support `'9router'`.
- Implement `NineRouterInstaller` in `src/installers/ninerouter-installer.ts` supporting dry-run, installation via `npm install -g 9router`, and `ANTHROPIC_BASE_URL` route injection into `~/.claude/settings.json`.
- Add `9router` to the interactive setup wizard (`src/cli/wizard.ts`) and headless CLI flags (`init -g 9router`).
- Support `switch-gateway 9router` and `doctor` diagnostic checks in `src/cli/index.ts`.
- Add unit tests in `tests/ninerouter-installer.test.ts` verifying dry-run and configuration injection.

### Non-Goals
- Refactoring `OmniRouteInstaller` or changing official/OmniRoute routing behavior.
- Managing remote cloud accounts or API keys for 9router.

---

## 3. Approaches Considered & Trade-offs

### Option 1: Dedicated `NineRouterInstaller` (Chosen)
- **Design:** Mirror `OmniRouteInstaller` architecture with dedicated `NineRouterInstaller`.
- **Trade-offs:** Minimal blast radius, isolated tests, zero risk of breaking existing OmniRoute tests or installations.
- **Decision:** Selected by user for minimal diff and stability.

### Option 2: Generic GatewayManager Refactor
- **Design:** Consolidate gateway logic into a single generic gateway manager class.
- **Trade-offs:** Higher refactor complexity, touches multiple existing tests and callers without immediate functional benefit.

---

## 4. Implementation Specification

### 4.1. Core Schema (`src/core/schema.ts`)
```typescript
export const GatewayModeSchema = z.enum(['official', 'omniroute', '9router']);
export type GatewayMode = z.infer<typeof GatewayModeSchema>;
```

### 4.2. Installer (`src/installers/ninerouter-installer.ts`)
- `NineRouterInstaller`:
  - `setup({ port = 4000, dryRun = false })`: executes `npm install -g 9router`, sets `ANTHROPIC_BASE_URL=http://127.0.0.1:4000` via `configureGatewayRoute`.
  - `configureGatewayRoute('9router' | 'official', port, dryRun)`: updates `~/.claude/settings.json` idempotently with backup.

### 4.3. CLI Wizard & Commands
- `src/cli/wizard.ts`: Add `{ value: '9router', label: '9router Gateway (Multi-provider routing, local daemon)' }`.
- `src/cli/index.ts`:
  - `init`: accept `-g 9router`.
  - `switch-gateway`: accept `9router`, invoke `NineRouterInstaller` or `OmniRouteInstaller`.
  - `doctor`: check for `9router` executable on PATH when active or installed.

### 4.4. Tests (`tests/ninerouter-installer.test.ts`)
- Dry-run mode verification (no mutation).
- `settings.json` mutation verification (adds `ANTHROPIC_BASE_URL=http://127.0.0.1:4000`).
- Switching back to `official` removes `ANTHROPIC_BASE_URL`.
