# Contributing to `claude-bench`

Thank you for contributing to `claude-bench`! We welcome contributions from the community.

## Development Workflow

1. **Clone repository & install dependencies**:
   ```bash
   git clone https://github.com/Moamen-R/claude-bench.git
   cd claude-bench
   npm install
   ```

2. **Run tests**:
   ```bash
   npm test
   ```

3. **Build the CLI**:
   ```bash
   npm run build
   ```

4. **Test locally**:
   ```bash
   node dist/index.js --help
   node dist/index.js doctor
   node dist/index.js init --dry-run
   ```

## Adding Skills to the Registry

Every item in `src/registry/registry.seed.json` must conform to `RegistryItemSchema`:
- Must have valid `id`, `name`, `type`, `fields`, `repoUrl`, `installCommand`, `description`, `stars`, and `trustScore`.
- Must pass `SecurityAuditor` checks (no unquoted shell metacharacters, valid HTTPS repository URL).
- Run `npm test` to verify your changes pass the test suite before opening a PR.

## Code Quality & Architecture

- We use [Graphify](https://github.com/graphify) to maintain the AST knowledge graph: run `graphify update .` after modifying source files.
- We use [OpenCode Review](https://github.com/alibaba/open-code-review) (`ocr review`) to audit changes for security and maintainability.
