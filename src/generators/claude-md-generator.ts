import fs from 'node:fs/promises';
import path from 'node:path';
import type { FieldId } from '../core/schema.js';
import { BackupManager } from '../core/backup-manager.js';

const DOMAIN_BLUEPRINTS: Record<FieldId, { title: string; body: string }> = {
  fullstack: {
    title: 'Full Stack Web Developer Guidelines',
    body: `- **Architecture**: Next.js App Router, React 19 server components, Node.js/TypeScript backend.
- **UI Components**: Use shadcn/ui and Tailwind CSS; enforce accessibility (ARIA, keyboard navigation).
- **Data & ORM**: Type-safe queries via Prisma or Drizzle; validate all external payloads with Zod.
- **Testing**: End-to-end tests with Playwright; unit and integration tests with Vitest.`,
  },
  cybersecurity: {
    title: 'Cyber Security & AppSec Guidelines',
    body: `- **Defense-in-Depth**: Follow OWASP Top 10 guidelines; eliminate injection sinks and SSRF vectors.
- **Zero Secrets**: Never commit or log API keys, private tokens, or session secrets.
- **Static Analysis**: Run Semgrep/Trivy scans before committing code.
- **Input Validation**: Strict schema validation at all trust boundaries.`,
  },
  'video-editing': {
    title: 'Video Editing & Media Guidelines',
    body: `- **Programmatic Video**: Use Remotion for React-based frame-accurate rendering.
- **Transcoding**: Safe FFmpeg execution with proper codec parameters (H.264/H.265/AV1).
- **Audio Alignment**: Accurate sample rates and synchronized subtitle generation.`,
  },
  researcher: {
    title: 'Researcher & Academic Guidelines',
    body: `- **Evidence-First**: Ground every claim with exact citations and DOI/arXiv links.
- **Literature**: Maintain clean BibTeX files and Zotero integration.
- **Reproducibility**: Document analytical Python/Jupyter scripts with fixed random seeds.`,
  },
  marketing: {
    title: 'Marketing & Growth Guidelines',
    body: `- **SEO Standards**: Generate accurate OpenGraph tags, JSON-LD schemas, and fast LCP/CLS metrics.
- **Copywriting**: Value-driven propositions, clear calls-to-action, and audience-tailored tone.
- **Analytics**: Track conversion funnels and user intent metrics ethically.`,
  },
  'mobile-dev': {
    title: 'Mobile Developer Guidelines',
    body: `- **Performance**: Guarantee 60fps animations; avoid unnecessary re-renders in React Native/Flutter.
- **Offline First**: Handle network drops gracefully with local SQLite/WatermelonDB storage.
- **Tooling**: Automate build and signing pipelines with Fastlane and ADB.`,
  },
  'desktop-dev': {
    title: 'Desktop Developer Guidelines',
    body: `- **Isolation**: Secure IPC communication between web frontend and native Rust/Electron backend.
- **Resource Footprint**: Keep memory and CPU usage minimal during background idling.
- **Packaging**: Automate code-signing and cross-platform installers (MSI, DMG, AppImage).`,
  },
  'ios-dev': {
    title: 'iOS Developer Guidelines',
    body: `- **Language**: Strict Swift 6 concurrency, actors, and Sendable conformance.
- **Interface**: Apple Human Interface Guidelines (HIG) compliance with modern SwiftUI.
- **Builds**: Automate test schemes via xcodebuild and simctl.`,
  },
  'backend-dev': {
    title: 'Backend Developer Guidelines',
    body: `- **API Contracts**: Contract-first design with OpenAPI 3.1 or gRPC Protobuf.
- **Reliability**: Idempotent mutations, connection pooling, graceful shutdown, and structured JSON logs.
- **Databases**: Index-backed query optimization, transaction isolation, and redis caching.`,
  },
  'frontend-dev': {
    title: 'Front-End Developer Guidelines',
    body: `- **Accessibility**: WCAG 2.1 Level AA compliance; verify contrast ratios and screen readers.
- **Design Systems**: Reusable design tokens, consistent fluid typography, and zero Cumulative Layout Shift (CLS).
- **Visual Tests**: Visual regression testing with Playwright.`,
  },
  'software-eng': {
    title: 'Software Engineer & Architecture Guidelines',
    body: `- **Discipline**: Follow Red-Green-Refactor TDD using Vitest.
- **Architecture**: Enforce clean boundaries and Domain-Driven Design (DDD).
- **Code Reviews**: Verify all diffs with OpenCode Review MCP before merging.`,
  },
  'data-engineering': {
    title: 'Data Analyst & Engineering Guidelines',
    body: `- **Data Pipelines**: Write modular, idempotent ETL/ELT pipelines using DuckDB, Polars, and dbt.
- **Analytics & Warehousing**: Index-optimized SQL queries, schema migrations, and Parquet/Delta lakehouse architecture.
- **Data Quality**: Enforce data contracts and statistical validation with Great Expectations before ingestion.
- **Storytelling**: Produce colorblind-safe, publication-grade figures with Matplotlib, Seaborn, and Plotly.`,
  },
  'ai-ml': {
    title: 'Machine Learning & AI Engineering Guidelines',
    body: `- **Model Development**: PyTorch 2.x and Hugging Face ecosystem (Transformers, Accelerate, TRL, PEFT).
- **Agent Orchestration**: Multi-agent collaboration with CrewAI, LangGraph, and deterministic state graphs.
- **RAG & Retrieval**: Hybrid lexical + vector search with Qdrant, Pinecone, or pgvector, guarded against injection.
- **MLOps & Evaluation**: Rigorous eval harness before promotion; track experiments and metrics via MLflow or Weights & Biases.`,
  },
};

export class ClaudeMdGenerator {
  constructor(private backupManager: BackupManager = new BackupManager()) {}

  generate(fields: FieldId[]): string {
    const activeBlueprints = fields
      .filter((field) => DOMAIN_BLUEPRINTS[field])
      .map((field) => {
        const bp = DOMAIN_BLUEPRINTS[field];
        return `### ${bp.title}\n\n${bp.body}`;
      })
      .join('\n\n');

    return `# CLAUDE.md — Autonomous Agent Directives

## 1. Operating Doctrine
- **Minimal Viable Diff**: Write the smallest complete change that solves the issue cleanly.
- **Evidence-First**: Ground every claim in concrete code references \`file_path:line_number\`.
- **Zero Command Injection**: Never execute arbitrary shell strings without argument arrays.
- **Continuous Quality**: Run automated unit and integration tests after every task.

## 2. Active Domain Blueprints

${activeBlueprints}
`;
  }

  async writeToFile(
    targetPath: string,
    fields: FieldId[],
    dryRun = false
  ): Promise<{ success: boolean; path: string; dryRun: boolean }> {
    const content = this.generate(fields);

    if (dryRun) {
      return { success: true, path: targetPath, dryRun: true };
    }

    await this.backupManager.createBackup(targetPath);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, content, 'utf8');

    return { success: true, path: targetPath, dryRun: false };
  }
}
