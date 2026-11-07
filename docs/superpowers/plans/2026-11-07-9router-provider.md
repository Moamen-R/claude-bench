# 9router Provider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the 9router local AI gateway daemon into `claude-bench` for `init`, `switch-gateway`, and `doctor`.

**Architecture:** Extend `GatewayModeSchema` to include `'9router'`, implement `NineRouterInstaller` following the established safe child-process execution and atomic settings.json injection patterns, and expose 9router in the interactive wizard and CLI commands.

**Tech Stack:** TypeScript, Node.js (>=20), Zod, Commander, @clack/prompts, Vitest, Execa.

**Spec:** `docs/superpowers/specs/2026-11-07-9router-provider-design.md`

## Global Constraints

- Never use `shell: true` with execa; pass binary and argument arrays strictly.
- Pre-mutation backups before modifying `~/.claude/settings.json`.
- Lossless merge: preserve all existing `env`, `permissions`, and custom user settings in `settings.json`.
- Full `--dry-run` support without writing to disk or executing npm.

## Review Focus

- Malformed `settings.json` gracefully handled and parsed.
- Preserves existing custom environment variables when injecting/removing `ANTHROPIC_BASE_URL`.
- Dry-run returns simulated commands without modifying settings or running npm.
- Invalid gateway mode in `switch-gateway` exits with non-zero status.
- Doctor check passes cleanly when 9router binary is found or reports clean warning when missing.

---

### Task 1: Extend Gateway Schema

**Files:**
- Modify: `src/core/schema.ts`
- Test: `tests/schema.test.ts`

**Interfaces:**
- Produces: `GatewayMode = 'official' | 'omniroute' | '9router'`

- [ ] **Step 1: Write the failing test**

In `tests/schema.test.ts`, add test asserting `GatewayModeSchema.parse('9router')` succeeds:
```typescript
it('accepts 9router as a valid gateway mode', () => {
  expect(GatewayModeSchema.parse('9router')).toBe('9router');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/schema.test.ts`
Expected: FAIL with zod validation error.

- [ ] **Step 3: Update `GatewayModeSchema` in `src/core/schema.ts`**

Update:
```typescript
export const GatewayModeSchema = z.enum(['official', 'omniroute', '9router']);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/schema.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/core/schema.ts tests/schema.test.ts
git commit -m "feat(schema): add 9router to GatewayMode enum"
```

---

### Task 2: Implement NineRouterInstaller

**Files:**
- Create: `src/installers/ninerouter-installer.ts`
- Test: `tests/ninerouter-installer.test.ts`

**Interfaces:**
- Consumes: `GatewayMode` from `src/core/schema.ts`
- Produces: `NineRouterInstaller`, `NineRouterSetupOptions`, `NineRouterSetupResult`

- [ ] **Step 1: Write the failing tests**

Create `tests/ninerouter-installer.test.ts`:
- Dry-run test verifying simulated commands (`npm install -g 9router`, route injection) and no file mutations.
- Real execution test verifying `ANTHROPIC_BASE_URL = http://127.0.0.1:4000` merged into `settings.json` preserving existing keys.
- Rollback test verifying `configureGatewayRoute('official')` deletes `ANTHROPIC_BASE_URL`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/ninerouter-installer.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `NineRouterInstaller` in `src/installers/ninerouter-installer.ts`**

Implement:
```typescript
export interface NineRouterSetupOptions {
  port?: number;
  dryRun?: boolean;
}

export interface NineRouterSetupResult {
  success: boolean;
  gateway: GatewayMode;
  commandsExecuted: string[];
  dryRun: boolean;
  daemonUrl?: string;
  error?: string;
}

export class NineRouterInstaller {
  constructor(customSettingsPath?: string);
  setup(options?: NineRouterSetupOptions): Promise<NineRouterSetupResult>;
  configureGatewayRoute(mode: GatewayMode, port?: number, dryRun?: boolean): Promise<NineRouterSetupResult>;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/ninerouter-installer.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/installers/ninerouter-installer.ts tests/ninerouter-installer.test.ts
git commit -m "feat(installer): implement NineRouterInstaller with dry-run and route injection"
```

---

### Task 3: Integrate 9router in Wizard and CLI Commands

**Files:**
- Modify: `src/cli/wizard.ts`
- Modify: `src/cli/index.ts`
- Test: `tests/cli.test.ts`

**Interfaces:**
- Consumes: `NineRouterInstaller` from `src/installers/ninerouter-installer.ts`

- [ ] **Step 1: Write test for switch-gateway and wizard options**

In `tests/cli.test.ts`, add test for `switch-gateway 9router --dry-run`:
- Expect exit code 0 or success message indicating ANTHROPIC_BASE_URL set to `http://127.0.0.1:4000`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/cli.test.ts`
Expected: FAIL (validation error or unrecognized gateway).

- [ ] **Step 3: Update `wizard.ts` and `index.ts`**

- In `src/cli/wizard.ts`:
  - Add `{ value: '9router', label: '9router Gateway (Multi-provider routing, local daemon)' }` to the gateway prompt options.
  - In `run()`, when `gateway === '9router'`, invoke `this.nineRouterInstaller.setup({ port: 4000, dryRun })`.
- In `src/cli/index.ts`:
  - Update `init` option help to mention `9router`.
  - Update `switch-gateway` to support `mode === '9router'`, instantiating `NineRouterInstaller` to configure route.
  - Update `doctor` check to inspect `9router` binary on PATH.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/cli.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/cli/wizard.ts src/cli/index.ts tests/cli.test.ts
git commit -m "feat(cli): wire 9router into wizard, switch-gateway, and doctor"
```

---

### Task 4: Documentation & Full Verification

**Files:**
- Modify: `README.md`
- Modify: `docs/SPEC.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update documentation**

Add 9router references in `README.md`, `docs/SPEC.md`, and `CLAUDE.md`.

- [ ] **Step 2: Run typecheck and full test suite**

Run: `npm run typecheck && npm test`
Expected: 0 type errors, all test suites passing.

- [ ] **Step 3: Commit**

```bash
git add README.md docs/SPEC.md CLAUDE.md
git commit -m "docs: document 9router gateway integration"
```
