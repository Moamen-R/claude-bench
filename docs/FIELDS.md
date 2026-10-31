# Canonical 13 Professional Fields Specification (`docs/FIELDS.md`)

This document details the configuration presets, tool packages, MCP servers, and CLI-Anything harnesses for each of the 13 supported fields in `claude-bench`.

---

## 1. Full Stack Web Developer (`fullstack`)
- **Display Name**: Full Stack Web Developer
- **Focus**: End-to-end web engineering, frontend frameworks, backend APIs, relational & document databases, E2E testing.
- **Curated Skills**:
  - `shadcn/ui`: `npx -y skills add shadcn/ui --skill add-component --agent claude-code`
  - `frontend-design`: `npx -y skills add anthropics/skills --skill frontend-design --agent claude-code`
  - `superpowers`: `npx -y skills add obra/superpowers --skill superpowers --agent claude-code`
  - `git-workflow`: `npx -y skills add vercel-labs/skills --skill git-workflow --agent claude-code`
  - `nextjs-helpers`: `npx -y skills add vercel-labs/skills --skill nextjs-helpers --agent claude-code`
- **MCP Servers**:
  - `playwright`: Browser testing and automation (`npx -y @modelcontextprotocol/server-playwright`)
  - `postgres`: Direct PostgreSQL database queries (`npx -y @modelcontextprotocol/server-postgres`)
  - `supabase`: Supabase database, auth, and storage management (`npx -y @supabase/mcp-server`)
- **CLI-Anything Harnesses**:
  - Docker & Compose agent wrapper
- **CLAUDE.md Persona Focus**: Strict TypeScript, test-driven Next.js App Router patterns, Prisma/Drizzle ORM hygiene, accessibility standards.

---

## 2. Cyber Security (`cybersecurity`)
- **Display Name**: Cyber Security
- **Focus**: Application security, penetration testing, vulnerability scanning, reverse engineering, OWASP compliance.
- **Curated Skills**:
  - `owasp-auditor`: `npx -y skills add security-hub/skills --skill owasp-auditor --agent claude-code`
  - `security-sast`: `npx -y skills add security-hub/skills --skill sast-scanner --agent claude-code`
  - `secret-scan`: `npx -y skills add security-hub/skills --skill secret-scanner --agent claude-code`
- **MCP Servers**:
  - `semgrep`: SAST security scanning (`uvx semgrep-mcp`)
  - `trivy`: Container and dependency vulnerability scanner (`uvx trivy-mcp`)
- **CLI-Anything Harnesses**:
  - `nmap`: Network mapper & port scanner harness (`clianything/nmap`)
  - `nuclei`: Fast vulnerability scanner harness (`clianything/nuclei`)
  - `ghidra`: Software reverse engineering headless analyzer (`clianything/ghidra`)
- **CLAUDE.md Persona Focus**: Zero Trust architecture, secure credential handling, CWE vulnerability categorization, defensive security posture.

---

## 3. Video Editing (`video-editing`)
- **Display Name**: Video Editing
- **Focus**: Programmatic video creation, audio transcoding, subtitle generation, 3D motion graphics.
- **Curated Skills**:
  - `remotion-best-practices`: `npx -y skills add remotion-dev/skills --skill remotion --agent claude-code`
  - `caption-generator`: `npx -y skills add media-skills/skills --skill caption-generator --agent claude-code`
- **MCP Servers**:
  - `whisper-transcribe`: Local audio transcription via Whisper (`uvx whisper-mcp`)
- **CLI-Anything Harnesses**:
  - `ffmpeg`: Universal video/audio transcoding harness (`clianything/ffmpeg`)
  - `blender`: Headless 3D rendering and motion tracking (`clianything/blender`)
  - `audacity`: Audio noise reduction and vocal mastering (`clianything/audacity`)
  - `obs-cli`: Stream and recording automation harness (`clianything/obs`)
- **CLAUDE.md Persona Focus**: Codec optimization (H.264/H.265/AV1), audio sync, frame-accurate timing, Remotion composition pipelines.

---

## 4. Researcher (`researcher`)
- **Display Name**: Researcher
- **Focus**: Academic literature search, citation graphing, statistical computing, LaTeX document generation.
- **Curated Skills**:
  - `scrapling-research`: `npx -y skills add scrapling/skills --skill web-research --agent claude-code`
  - `latex-paper-builder`: `npx -y skills add academic-skills/skills --skill latex-builder --agent claude-code`
  - `bibtex-formatter`: `npx -y skills add academic-skills/skills --skill bibtex --agent claude-code`
- **MCP Servers**:
  - `scrapling`: Anti-bot web extraction (`uvx --from scrapling[ai] scrapling mcp`)
  - `arxiv`: Scientific paper search and abstract extraction (`uvx arxiv-mcp`)
  - `semantic-scholar`: Citation graph and academic literature search (`uvx semantic-scholar-mcp`)
- **CLAUDE.md Persona Focus**: Rigorous evidence-first methodology, proper BibTeX citations, reproducible data analysis notebooks, LaTeX math accuracy.

---

## 5. Marketing (`marketing`)
- **Display Name**: Marketing
- **Focus**: Search engine optimization (SEO), conversion rate optimization (CRO), multi-channel copywriting, competitor research.
- **Curated Skills**:
  - `seo-audit`: `npx -y skills add marketing-hub/skills --skill seo-audit --agent claude-code`
  - `copywriting-playbook`: `npx -y skills add marketing-hub/skills --skill copywriting --agent claude-code`
  - `cro-analyzer`: `npx -y skills add marketing-hub/skills --skill cro-optimizer --agent claude-code`
- **MCP Servers**:
  - `scrapling-fetch`: Fast competitor site extraction (`uvx scrapling-fetch-mcp`)
  - `google-search-console`: Search analytics and index status (`npx -y @modelcontextprotocol/server-gsc`)
- **CLAUDE.md Persona Focus**: High-converting value propositions, audience segmentation, keyword search intent mapping, clear call-to-actions.

---

## 6. Mobile Developer (`mobile-dev`)
- **Display Name**: Mobile Developer
- **Focus**: Cross-platform mobile apps (React Native, Expo, Flutter), mobile performance, app store distribution.
- **Curated Skills**:
  - `expo-best-practices`: `npx -y skills add expo/skills --skill expo-dev --agent claude-code`
  - `flutter-tools`: `npx -y skills add flutter-community/skills --skill flutter-pro --agent claude-code`
  - `mobile-responsive-audit`: `npx -y skills add mobile-skills/skills --skill responsive-audit --agent claude-code`
- **CLI-Anything Harnesses**:
  - `adb`: Android Debug Bridge device management harness (`clianything/adb`)
  - `fastlane`: Mobile automated build, sign, and release pipeline (`clianything/fastlane`)
- **CLAUDE.md Persona Focus**: 60fps animations, memory lifecycle on low-end hardware, offline-first sync, platform-specific UI conventions.

---

## 7. Desktop Developer (`desktop-dev`)
- **Display Name**: Desktop Developer
- **Focus**: Native and hybrid cross-platform desktop applications (Tauri, Rust, Electron, .NET/WPF, Qt).
- **Curated Skills**:
  - `tauri-architecture`: `npx -y skills add tauri-apps/skills --skill tauri-dev --agent claude-code`
  - `electron-security`: `npx -y skills add electron/skills --skill electron-security --agent claude-code`
- **CLI-Anything Harnesses**:
  - Cross-platform packaging tools (`wixtoolset`, `appimagetool`, `create-dmg`)
- **CLAUDE.md Persona Focus**: Process isolation, secure IPC boundaries, memory footprint minimization, OS-level windowing controls.

---

## 8. iOS Developer (`ios-dev`)
- **Display Name**: iOS Developer
- **Focus**: Native Apple ecosystem engineering with Swift 6, SwiftUI, SwiftData, and Xcode tooling.
- **Curated Skills**:
  - `swiftui-architecture`: `npx -y skills add apple-dev/skills --skill swiftui-pro --agent claude-code`
  - `apple-hig-auditor`: `npx -y skills add apple-dev/skills --skill hig-compliance --agent claude-code`
- **CLI-Anything Harnesses**:
  - `xcodebuild`: Xcode command line compilation harness (`clianything/xcodebuild`)
  - `simctl`: iOS Simulator automation harness (`clianything/simctl`)
  - `fastlane-ios`: TestFlight and App Store submission harness (`clianything/fastlane`)
- **CLAUDE.md Persona Focus**: Swift concurrency (actors, Sendable), SwiftUI declarative layout, strict Apple Human Interface Guidelines.

---

## 9. Backend Developer (`backend-dev`)
- **Display Name**: Backend Developer
- **Focus**: Distributed systems, microservices, gRPC, GraphQL, database internals, messaging queues, containerization.
- **Curated Skills**:
  - `openapi-designer`: `npx -y skills add api-skills/skills --skill openapi-spec --agent claude-code`
  - `grpc-protobuf`: `npx -y skills add api-skills/skills --skill grpc-protobuf --agent claude-code`
  - `sql-optimizer`: `npx -y skills add db-skills/skills --skill sql-tuner --agent claude-code`
- **MCP Servers**:
  - `postgres`: Relational query engine (`npx -y @modelcontextprotocol/server-postgres`)
  - `redis`: In-memory cache & pub/sub inspector (`npx -y @modelcontextprotocol/server-redis`)
  - `mongodb`: Document store inspector (`npx -y @modelcontextprotocol/server-mongodb`)
- **CLAUDE.md Persona Focus**: Idempotent APIs, database indexing strategies, connection pooling, graceful shutdown, structured JSON logging.

---

## 10. Front-End Developer (`frontend-dev`)
- **Display Name**: Front-End Developer
- **Focus**: User experience, accessible UI component engineering, CSS/Tailwind architecture, visual regression.
- **Curated Skills**:
  - `shadcn-ui`: `npx -y skills add shadcn/ui --skill add-component --agent claude-code`
  - `tailwind-v4`: `npx -y skills add tailwindlabs/skills --skill tailwind-v4 --agent claude-code`
  - `wcag-accessibility`: `npx -y skills add a11y-skills/skills --skill wcag-audit --agent claude-code`
- **MCP Servers**:
  - `playwright`: Visual testing & DOM inspection (`npx -y @modelcontextprotocol/server-playwright`)
  - `lighthouse`: Core Web Vitals & performance auditing (`npx -y lighthouse-mcp`)
- **CLAUDE.md Persona Focus**: WCAG 2.1 AA accessibility, keyboard navigation, responsive fluid typography, zero layout shift (CLS).

---

## 11. Software Engineer (`software-eng`)
- **Display Name**: Software Engineer
- **Focus**: Clean code, domain-driven design, design patterns, refactoring, comprehensive automated testing, CI/CD.
- **Curated Skills**:
  - `superpowers`: `npx -y skills add obra/superpowers --skill superpowers --agent claude-code`
  - `ruflo-orchestration`: `npx -y skills add ruvnet/ruflo --skill discover-plugins --agent claude-code`
  - `c4-architecture`: `npx -y skills add arch-skills/skills --skill c4-model --agent claude-code`
  - `github-actions-ci`: `npx -y skills add devops-skills/skills --skill gh-actions --agent claude-code`
- **MCP Servers**:
  - `opencode-review`: Automated static analysis and multi-model code review (`npx -y @alibaba/open-code-review --mcp`)
- **CLAUDE.md Persona Focus**: Red-Green-Refactor TDD, minimal viable diffs, backward-compatible APIs, comprehensive unit and integration tests.

---

## 12. Data Analyst & Engineering (`data-engineering`)
- **Display Name**: Data Analyst & Engineering
- **Focus**: High-throughput ETL/ELT pipelines, distributed data processing, data warehousing, lakehouse architecture, data modeling, statistical analysis & data visualization.
- **Curated Skills (50+ items)**:
  - `duckdb-embedded-olap`: In-process SQL OLAP engine for fast analytics.
  - `polars-fast-dataframe`: Multi-threaded, lightning-fast DataFrame library.
  - `pandas-2-arrow-backend`: Arrow-backed data manipulation and analysis.
  - `pyspark-cluster-etl`: Distributed batch and streaming data processing.
  - `dbt-core-transformation`: Modular SQL transformation pipelines and data testing.
  - `apache-airflow-dag-orchestration`: Directed Acyclic Graph (DAG) scheduling.
  - `great-expectations-data-contracts`: Automated data quality validation and profiling.
  - `apache-kafka-event-streaming`: Real-time distributed pub/sub event streaming.
  - `apache-iceberg-lakehouse`: Open table format for huge analytic datasets.
  - `snowflake-data-warehouse`: Cloud-native data warehousing and Snowpark.
  - `clickhouse-realtime-olap`: High-performance column-oriented DBMS.
  - `evidence-dev-bi-markdown`: Code-driven business intelligence and reporting.
  - `plotly-interactive-viz` & `seaborn-statistical-plots`: Visual storytelling.
- **MCP Servers**:
  - `postgres`: Direct PostgreSQL analytics and schema inspection.
  - `duckdb`: Embedded SQL execution on local Parquet, CSV, and Arrow files.
  - `bigquery`: Google Cloud BigQuery data queries and metadata inspection.
- **CLAUDE.md Persona Focus**: Idempotent ETL pipelines, schema validation contracts, Parquet/Delta lakehouse optimization, colorblind-safe accessible data visualization.

---

## 13. Machine Learning & AI (`ai-ml`)
- **Display Name**: Machine Learning & AI
- **Focus**: Deep learning architectures, LLM fine-tuning, retrieval-augmented generation (RAG), autonomous multi-agent systems, MLOps, inference serving, and safety guardrails.
- **Curated Skills (50+ items)**:
  - `pytorch-2-compile-inductor`: High-performance deep learning model development.
  - `huggingface-transformers-pipeline`: State-of-the-art NLP, vision, and multimodal inference.
  - `huggingface-accelerate-fsdp`: Multi-GPU and distributed training with FSDP and DeepSpeed.
  - `huggingface-peft-qlora`: Parameter-Efficient Fine-Tuning and QLoRA recipes.
  - `unsloth-fast-finetune`: 5x faster, memory-efficient LLM fine-tuning.
  - `vllm-paged-attention-serving`: High-throughput LLM serving with PagedAttention.
  - `ollama-local-model-runner`: Air-gapped local SLM and model management.
  - `langchain-rag-agent` & `langgraph-stateful-graph`: Stateful multi-agent graphs.
  - `crewai-multi-agent-system`: Collaborative multi-agent teams with task delegation.
  - `qdrant-vector-database-client`: Production vector search engine.
  - `ragas-rag-evaluation`: Metric-driven eval framework for RAG pipelines.
  - `prompt-injection-guardrails` & `nemo-guardrails-colang`: Adversarial safety filters.
  - `rea`: Reverse engineer anything with agents down to native binaries.
- **MCP Servers**:
  - `qdrant`: Vector search and similarity retrieval.
  - `chroma`: Local embedded vector database for agent memory and embeddings.
  - `weaviate`: Hybrid vector and keyword search.
- **CLAUDE.md Persona Focus**: Evaluation-first model promotion, PEFT/QLoRA memory discipline, deterministic multi-agent state graphs, strict prompt-injection guardrails.
