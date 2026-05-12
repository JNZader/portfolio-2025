import type { PortableTextBlock } from 'sanity';
import type { Project as SanityProject } from '@/types/sanity';

function span(text: string) {
  return {
    _key:
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 32) || 'span',
    _type: 'span' as const,
    marks: [],
    text,
  };
}

function block(text: string, style: 'normal' | 'h2' | 'h3' = 'normal'): PortableTextBlock {
  return {
    _key: `${style}-${
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 24) || 'block'
    }`,
    _type: 'block',
    children: [span(text)],
    markDefs: [],
    style,
  } as PortableTextBlock;
}

function bullet(text: string): PortableTextBlock {
  return {
    _key: `bullet-${
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 24) || 'item'
    }`,
    _type: 'block',
    children: [span(text)],
    level: 1,
    listItem: 'bullet',
    markDefs: [],
    style: 'normal',
  } as PortableTextBlock;
}

const LOCAL_PROJECTS: SanityProject[] = [
  {
    _id: 'apigen',
    title: 'APiGen',
    slug: {
      current: 'apigen',
    },
    excerpt:
      'A code generation platform that turns a SQL schema or OpenAPI contract into a working backend service — 12 target languages, 15+ databases, three cloud stacks.',
    technologies: [
      'Java 25',
      'Spring Boot 4',
      'Gradle',
      'OpenAPI',
      'GraphQL',
      'gRPC',
      'Docker',
      'Kubernetes',
      'Terraform',
      'MCP',
    ],
    featured: true,
    githubUrl: 'https://github.com/JNZader-Vault/apigen',
    repoIsOrigin: true,
    publishedAt: '2026-05-01T09:00:00.000Z',
    body: [
      block('The Problem', 'h2'),
      block(
        'Every Spring Boot project starts in the same place. You write the entity, then the repository, then the service, then the controller, then DTOs, then the same security setup, then the same observability wiring. Six months later you compare two services from the same team and they all picked slightly different conventions. Multiply that across teams.'
      ),
      block(
        'I wanted something that turns a SQL schema or OpenAPI contract into a working service in one command — and stays useful after I customize it.'
      ),
      block('What APiGen Does', 'h2'),
      block(
        'Point it at a SQL schema or OpenAPI spec. Get back a production-shaped service: REST endpoints, persistence layer, security wired, observability instrumented, Dockerfile, Kubernetes manifests, CI pipeline. You can preview before generating, override templates locally without forking, and drive the same engine from CLI, HTTP server, IDE plugin, or MCP.'
      ),
      block('Constraints I Set', 'h2'),
      bullet(
        'Contract-first only. Source of truth is the SQL schema or OpenAPI file. No config DSL layered on top.'
      ),
      bullet(
        'Generated code must compile and pass tests on the first try. No scaffolding that needs manual fixing.'
      ),
      bullet('Customizations live next to the project in .apigen/templates. Not in a fork.'),
      bullet(
        'One engine, every interface. CLI, server, IDE plugin, and MCP all consume the same generation core. No duplication.'
      ),
      block('My Role', 'h2'),
      block(
        'Single developer. Started December 2024 as a generic Spring Boot REST library. Designed every module, wrote every line that was not auto-generated. Java/Spring background gave me the opinion to encode; APiGen is the platform around that opinion.'
      ),
      block('How APiGen Started, And Why It Grew', 'h2'),
      block(
        'APiGen began in December 2024 as a generic Spring Boot REST library — the linked repository above. The original code is a base-controller / base-service / base-repository pattern with generics, Hibernate Envers auditing, ModelMapper conversion, centralized exception handling, and pagination, on Spring Boot 3 and Java 21.'
      ),
      block(
        'The goal was modest: encode my preferred conventions so I would stop rewriting the same controllers, the same security setup, the same exception handlers across services.'
      ),
      block(
        'As the library matured through 2025, the question shifted. If the conventions are encoded, why does the user have to write the entities at all? Why not generate them from the schema? Then: if the engine can generate Java/Spring, why not Kotlin? Python? Go?'
      ),
      block(
        'By January 2026 the project became a full code generation platform — the version described in the rest of this page. The link above points to the original generic library so the starting point is verifiable; the platform that grew from it is not public.'
      ),
      block('Key Decisions', 'h2'),
      block('1. Decoupled pipeline: parsing → IR → template rendering', 'h3'),
      block(
        'The most consequential early decision. Parsers (SQL, OpenAPI) produce a normalized intermediate representation. Templates consume the IR. Neither side knows the other exists.'
      ),
      block(
        'That separation is what made 12 target languages thinkable. Adding Kotlin does not touch the SQL parser. Adding GraphQL does not touch the codegen pipeline.'
      ),
      block(
        'Tradeoff: the IR is rigid by design. There is no shortcut from "this OpenAPI quirk" straight to "this Java annotation". Every shortcut has to round-trip through the IR, or the abstraction stops paying off.'
      ),
      block('2. Features as opt-in Gradle modules', 'h3'),
      block(
        'APiGen ships 22 modules: 4 libraries, 4 generators, 13 feature packs (gateway, GraphQL, gRPC, chaos engineering, recommendation, analytics, BFF, notifications, search, observability, and more), and an MCP layer.'
      ),
      block(
        'Features are not always-on flags. They are separate modules a project opts into. A team that needs gRPC includes the gRPC pack; a team that does not gets nothing extra in their build. Each pack versions independently — the chaos pack can move forward without touching the gateway pack.'
      ),
      block(
        'Tradeoff: module-boundary discipline. Every feature pack pays a small overhead in setup and contract maintenance. Letting features bleed into core would have made the early experience faster — and the cleanup later much worse.'
      ),
      block('3. One engine, four delivery surfaces', 'h3'),
      block(
        'The same codegen engine runs behind a CLI (local generation, preview, validation), an HTTP server (preview endpoints, team-shared flows), an IDE plugin (in-editor authoring), and an MCP server (AI assistants drive generation as a tool).'
      ),
      block(
        'Choosing this on day one forced the engine to be library-shaped from the start, not a CLI with an API bolted on later. That made the MCP integration almost free when it landed.'
      ),
      block('What APiGen Can Do Today', 'h2'),
      bullet(
        '12 target languages — Java/Spring, Kotlin, Python, Node/TypeScript, Go, Rust, C#, PHP, Ruby, Scala, Elixir, Clojure.'
      ),
      bullet(
        '15+ databases supported — PostgreSQL, MySQL, MariaDB, Oracle, SQL Server, SQLite, MongoDB, Cassandra, Redis, and more.'
      ),
      bullet(
        '100+ enterprise features across modules — auth, soft delete, multi-tenancy, audit logs, GDPR/SOC2/PCI compliance reports.'
      ),
      bullet('3 cloud target stacks — AWS, GCP, Azure, with Terraform output.'),
      bullet('60% line / 50% branch coverage minimum, gated in CI.'),
      bullet('Contract tests on the core library + JMH microbenchmarks on the generation engine.'),
      block("What I'd Reconsider", 'h2'),
      block(
        'Growing breadth-first. APiGen scaled outward fast — 12 languages, 15 databases, 13 feature packs — while Java/Spring is the only target where I have full operational confidence. The platform looks comprehensive on paper, but a user landing on Elixir or Clojure gets a less mature path than a user landing on Java.'
      ),
      block(
        'If I started over, I would compress the matrix. Two languages (Java + Python, or Java + Kotlin) and three databases (Postgres, MySQL, Mongo) deep before any breadth growth. "Supports 12 languages" sells better than "supports 2" — but engineering reputation matters more than marketing.'
      ),
      block('Architecture Snapshot', 'h2'),
      block('22 Gradle modules organized in 4 layers:'),
      bullet('libs/ — core (engine + IR), security, exceptions, bom (shared dependency catalog).'),
      bullet('generator/ — cli, codegen, server, ide-plugins.'),
      bullet(
        'features/ — 13 opt-in packs (graphql, grpc, gateway, chaos, recommendation, analytics, bff, notifications, search, observability, and more).'
      ),
      bullet('mcp/ — Java + Python MCP servers exposing the engine to AI assistants.'),
      block(
        'The build graph stays clean because the contract is enforced by the shared BOM plus separation of API and implementation modules. No cycles, no shared mutable state across modules.'
      ),
    ],
  },
  {
    _id: 'apigen-studio',
    title: 'APiGen Studio',
    slug: {
      current: 'apigen-studio',
    },
    excerpt:
      'A visual designer for Spring Boot APIs and microservices — model entities, gateway routes, and event flows, then export a multi-service project.',
    technologies: [
      'React 19',
      'TypeScript 5.9',
      'Vite 7',
      'Mantine 8',
      'Zustand',
      'Zod',
      'React Flow',
      'ELK',
      'Playwright',
      'Vitest',
    ],
    featured: true,
    demoUrl: 'https://apigen-web.vercel.app',
    publishedAt: '2026-04-29T09:00:00.000Z',
    body: [
      block('The Problem', 'h2'),
      block(
        'Tools like bootify.io let you design a single Spring Boot app visually — entities, relations, basic CRUD, auth. That solves one piece of the work. It does not solve modeling a microservices architecture: multiple services, the routes between them, the events that flow between them, and the export of all of that as a coherent system.'
      ),
      block(
        'I wanted a visual designer that handled the system, not just the app. One canvas where I model services, draw connections, configure a gateway, lay out event/message flows, and export the whole thing as a multi-service project ready to feed APiGen.'
      ),
      block('What Studio Does', 'h2'),
      block(
        'Studio is a browser-based visual designer for Spring Boot APIs and microservices. Model entities and relations like in bootify.io, then go further: add multiple services, wire gateway routes, design event/message flows, validate cross-service compatibility, and export the full architecture as a project that APiGen can generate. Import SQL schemas or OpenAPI contracts, edit them visually with conflict-aware merge, and never lose work — IndexedDB autosave plus snapshot history are built in.'
      ),
      block('Constraints I Set', 'h2'),
      bullet(
        'Beyond single-app modeling. Studio has to handle service-to-service architecture, not just entities of one service.'
      ),
      bullet(
        'Validation happens while editing, not after generation. The user sees conflicts and incompatibilities live, before exporting.'
      ),
      bullet(
        'Import has to be safe. Bringing in a SQL schema or OpenAPI contract triggers a pre-import snapshot so destructive operations are recoverable.'
      ),
      bullet(
        'Demo is public from day one. Anyone can open https://apigen-web.vercel.app and try the editor without an account.'
      ),
      block('My Role', 'h2'),
      block(
        'Single developer. Started January 20, 2026 — two days after APiGen pivoted into a full code generation platform. Designed every screen, wrote every line. 440 commits in 18 active days; the project shipped in a short, intense sprint.'
      ),
      block('How Studio Started', 'h2'),
      block(
        'I took bootify.io as the reference. The single-app generation flow it offers is clean and useful, but the moment the question becomes "how do these three services talk to each other?" the tool has no answer. That gap is exactly where the work that matters happens.'
      ),
      block(
        'Studio was built to fill that gap. The entity modeling is the table stakes; the microservices designer is the point.'
      ),
      block('Key Decisions', 'h2'),
      block('1. Microservices Designer — beyond entity modeling', 'h3'),
      block(
        'The most consequential product decision. Studio is not "bootify.io clone". It adds a service-to-service designer: multiple services on one canvas, connections between them, a gateway route designer for HTTP routing, an event/message designer for async flows, and a multi-service export that emits an architecture, not a single project.'
      ),
      block(
        'That is the differentiator. The entity editor is the entry point that feels familiar; the microservices designer is what makes Studio worth using once a team grows past one app.'
      ),
      block(
        'Tradeoff: scope. A single-app generator is a tractable product; a multi-service designer is much larger surface area. More features means more places to break, more interactions to validate, and more decisions to design. The bet is that the depth pays back on architectures with three or more services.'
      ),
      block('2. Layout as logic, not decoration', 'h3'),
      block(
        'When there are relations between nodes, Studio uses ELK for layered graph layout. When there are not, it falls back to grid placement. The same approach applies to service-to-service maps. Layout is part of the product logic — predictable, deterministic, repeatable across imports — not a cosmetic pass at the end.'
      ),
      block(
        'Tradeoff: layout coupling. Changing the layout algorithm becomes a product-level change, not a CSS tweak. The upside is that two users importing the same OpenAPI file see the same layout, which makes review and collaboration possible.'
      ),
      block('3. Client-heavy with safe persistence', 'h3'),
      block(
        'All editing, validation, and preview runs in the client — no backend round-trip while modeling. Zustand stores manage editor concerns separately; Zod validates imports and project structure; React Flow drives the canvas.'
      ),
      block(
        'Persistence is the safety net. Autosave to IndexedDB on every meaningful change. Snapshot history retained per project so users can roll back. Pre-import safety snapshots so a destructive import can be recovered if the merge goes wrong. The principle: client-heavy is fine when no work can be lost.'
      ),
      block('What Studio Can Do Today', 'h2'),
      bullet(
        'Visual entity modeling with relations, CRUD generation, and Java/Spring type mapping.'
      ),
      bullet(
        'Microservices Designer — multiple services, connections, gateway route designer, event/message designer, multi-service export.'
      ),
      bullet(
        'Import SQL schemas and OpenAPI contracts with conflict-aware merge and pre-import safety snapshots.'
      ),
      bullet(
        'Auto-layout with ELK (layered when relations exist) and grid fallback. Same logic applied to service-to-service maps.'
      ),
      bullet('IndexedDB autosave, retained snapshot history, version recovery flows.'),
      bullet(
        'Keyboard-first editing with full shortcut coverage. WCAG 2.1 AA accessibility for non-canvas surfaces.'
      ),
      bullet(
        'Playwright Component Testing for canvas interactions plus end-to-end tests for full editor flows.'
      ),
      block("What I'd Reconsider", 'h2'),
      block(
        'Mantine 8 as the UI framework. It is well-built and shipped the product fast, but it ties the editor to its design conventions and components. A more headless approach (Radix + a custom design system, or MUI with deeper theming) would have given more freedom to build editor-specific patterns — denser toolbars, more controlled focus management, layout containers that match graph editing better.'
      ),
      block(
        "The README has a justification for Mantine; in retrospect the tradeoff was real. The product moved faster early on and pays a bit of a tax now whenever the editor needs UI patterns that fight Mantine's defaults."
      ),
      block('Architecture Snapshot', 'h2'),
      block('Browser-only application, no custom backend:'),
      bullet('React 19 + TypeScript 5.9 + Vite 7 — modern toolchain, fast HMR, optimized builds.'),
      bullet(
        'Mantine 8 for UI primitives; React Flow for canvas; ELK for layered graph layout with grid fallback.'
      ),
      bullet(
        'Zustand for editor state, segmented by concern; Zod for import validation and project schema.'
      ),
      bullet(
        'IndexedDB for autosave + snapshot history; pre-import safety snapshots before destructive merges.'
      ),
      bullet(
        'Playwright (end-to-end + Component Testing) plus Vitest for unit tests. SonarQube wired in.'
      ),
      bullet('Deployed to Vercel; Docker images available for self-hosted deployments.'),
    ],
  },
  {
    _id: 'biogas-platform',
    title: 'Biogas Platform',
    slug: {
      current: 'biogas-platform',
    },
    excerpt:
      'An industrial platform for biogas plants — real-time monitoring, edge ML inference under 50ms, and a three-layer AI architecture for anomaly detection and predictive maintenance.',
    technologies: [
      'Go',
      'GORM',
      'PostgreSQL',
      'Redis',
      'Mosquitto MQTT',
      'Rust',
      'ONNX Runtime',
      'Python',
      'scikit-learn',
      'React 19',
      'Vite',
      'Mantine',
      'TypeScript',
      'OpenSpec',
      'Docker',
      'GitLab CI',
    ],
    featured: true,
    publishedAt: '2026-04-25T09:00:00.000Z',
    body: [
      block('The Problem', 'h2'),
      block(
        'My nephew is an environmental engineer. He told me how biogas plants are managed day-to-day: Excel spreadsheets. Sensor readings copied by hand, daily logs that nobody analyzed afterwards, decisions made on intuition because the data was inert. No real-time view, no anomaly detection, no predictive maintenance, no business intelligence — just files that grew bigger every week and were never queried.'
      ),
      block(
        'The opportunity was obvious. Replace the spreadsheets with a real platform that ingests sensor data, lets operators work from it, and turns the historical record into something the business can actually act on.'
      ),
      block('What Biogas Platform Does', 'h2'),
      block(
        'A full operations platform for biogas plants. Sensors stream data over MQTT to a Go backend; the data lands in PostgreSQL with time-series-friendly schemas; operators use a web dashboard and a mobile app for daily workflows; a Python ML pipeline trains models that get deployed to a Rust edge service for sub-50ms inference at the plant; an AI assistant helps operators query the system in plain language. The original Excel workflow disappears.'
      ),
      block('Constraints I Set', 'h2'),
      bullet(
        'Edge has to work without internet. Plants can lose connectivity for hours; operations and anomaly detection must keep running locally.'
      ),
      bullet(
        'Models are versioned production assets. No ad-hoc model drops — every model is trained, validated, packaged as ONNX, versioned in S3-compatible storage, and rolled out through a controlled deployment.'
      ),
      bullet(
        'Specs-driven from day one. OpenSpec is the source of truth for contracts between apps; no API is "just shipped" without a spec first.'
      ),
      bullet(
        'Role-aware from the start. Plant operators, technical staff, supervisors, and owners see different views and have different capabilities — the role model is part of the data layer, not a UI afterthought.'
      ),
      block('My Role', 'h2'),
      block(
        'Single developer. Started February 9, 2026. My nephew, an environmental engineer, is the domain expert who validates that the product matches how plants actually operate. I owned every technical decision in the stack:'
      ),
      bullet(
        'The monorepo structure — what is an app, what is a shared package, what is a service, and where the boundaries sit.'
      ),
      bullet(
        'The contract layer — OpenSpec as the source of truth between apps before any code is written.'
      ),
      bullet(
        'The edge gateway design in Rust — Modbus protocol integration, offline-first SQLite store with sync queue, the AI subsystem layout (agents, classifier, model registry, local LLM), OTA model updates with signed artifacts.'
      ),
      bullet(
        'The three-layer ML architecture — what runs at the edge, what runs in the cloud, what trains in batch, what infers in real time, and how models move between them.'
      ),
      bullet(
        'The role model — operators, technical staff, supervisors, owners — as a data-layer concept, not a UI toggle.'
      ),
      bullet(
        'The custom Biome plugin (eslint-plugin-biogas-ssot) that enforces single-source-of-truth conventions across apps at lint time.'
      ),
      bullet(
        'The CI/CD pipeline on GitLab — model versioning to S3-compatible storage, parity tests as a deployment gate, controlled rollouts.'
      ),
      block('How Biogas Platform Started, And Why It Grew', 'h2'),
      block(
        'It began as a conversation: my nephew described the Excel reality, I described the platform that should replace it. The first version was modest — a Go backend, a Postgres database, a basic dashboard. Ingest sensor data, show it on a chart, replace the daily log.'
      ),
      block(
        'Once the basic loop worked, the questions stacked up. If the data is in a real database, why not detect anomalies automatically? If we detect anomalies, why not predict failures? If we predict failures, why not run the inference at the plant so it works offline? If we run it at the plant, how do we update the models safely? Each answer added a layer, and the platform grew into what it is today.'
      ),
      block('Key Decisions', 'h2'),
      block('1. Edge gateway in Rust as a self-sufficient industrial node', 'h3'),
      block(
        'The edge gateway is the heart of the system, not a thin inference wrapper. It is the component that the plant runs locally, and it has to keep working when everything else is unavailable — the WAN link, the cloud backend, the model registry. That is why it is the largest single application in the platform: 74 Rust source files, 18 subsystems, version 2.1.0, designed as an autonomous industrial node that happens to sync with the cloud when it can.'
      ),
      block('What the gateway actually does on the plant:'),
      bullet(
        'Talks to the PLCs over Modbus TCP/RTU — the industrial protocol that sensors and controllers actually speak. Holding, input, coils, and discrete-input registers, with configurable scale, offset, and data types (u16/i16/f32).'
      ),
      bullet(
        'Persists every reading in a local SQLite store with a sync queue, so an outbound link drop just delays sync — it never loses data. Sync is HTTP batch with exponential retry, circuit breaker, and configurable batch sizes.'
      ),
      bullet(
        'Runs ML inference locally via onnxruntime 2.0 (the ort crate) — anomaly detection on every reading without a cloud round-trip.'
      ),
      bullet(
        'Hosts a local AI subsystem with on-device language models (llama_cpp), classifier, correlator, and a model registry with hardware-aware selection — picks the right model size for the gateway it is running on.'
      ),
      bullet(
        'Has an AI agent framework: help agent, SQLite query agent, status agent — small specialized agents an operator can talk to from the plant dashboard without any cloud connection.'
      ),
      bullet(
        'Supports OTA (over-the-air) updates with ed25519-signed model artifacts — models are downloaded, signature-verified, and deployed without restarting the gateway.'
      ),
      bullet(
        'Exposes Prometheus metrics on :9090/metrics and health checks on :8888/health for monitoring; ships its own embedded dashboard PWA so an operator can inspect state without an external tool.'
      ),
      block(
        'Why Rust: a process that runs unattended on plant hardware for weeks at a time, doing real-time IO with industrial protocols and ML inference, cannot afford memory leaks, GC pauses, or unhandled panics taking the gateway down. Rust delivers predictable performance, no GC, and compile-time guarantees that match the operational profile. The Tokio async runtime makes coordinating Modbus polling, SQLite writes, HTTP sync, and the AI subsystem realistic in a single process.'
      ),
      block(
        'Why ONNX as the model interchange: the Python training pipeline (scikit-learn for anomaly models, transformers stack for NLP) exports to ONNX, and the Rust runtime consumes the exact same file. Parity tests verify that the Rust outputs match the Python outputs bit-identically before a model is ever promoted.'
      ),
      block(
        'Tradeoff: scope and maintenance weight. The edge gateway is essentially its own product inside the platform — it ships its own version (2.1.0), its own configuration model (edge.toml), its own dashboard, its own CLI tooling for commissioning (validate config, dry-run a register read, convert a CSV of tags into an edge.toml draft). That breadth is the right answer for an industrial node, but it is a non-trivial amount of code to keep healthy alongside the rest of the platform.'
      ),
      block('2. Three-layer AI architecture', 'h3'),
      block(
        'Instead of treating ML as a feature stuck onto a screen, the platform has three explicit AI layers, each with its own purpose, latency budget, and lifecycle:'
      ),
      bullet(
        'Edge inference layer — Isolation Forest + Autoencoder running locally on ONNX, scoring anomalies on every sensor reading in under 50ms.'
      ),
      bullet(
        'Anomaly detection layer — 32 engineered features (temporal, change, z-score, co-variation, data quality, biogas-domain) fed into ensemble voting with dynamic per-sensor thresholds. SHAP attributions explain why a reading was flagged.'
      ),
      bullet(
        'Predictive AI layer — LSTM + Random Forest models predicting biogas production 7 days ahead and equipment failures 4-24 hours in advance, plus optimization recommendations for operating parameters.'
      ),
      block(
        'Each layer is independent: edge keeps working if the cloud is offline; anomaly detection works without the predictive layer; the predictive layer can be retrained without touching the edge runtime. The separation is what makes the system operable, not just impressive.'
      ),
      block(
        'Tradeoff: model lifecycle weight. Three layers means three training pipelines, three model registries, three deployment paths, three sets of drift monitoring. It is a lot of infrastructure for a single dev to maintain — only worth it because each layer pays back operationally.'
      ),
      block('3. Spec-driven development with OpenSpec from day one', 'h3'),
      block(
        'The first commit was literally "init: project structure with openspec specs and tooling". Every contract between apps — backend to frontend, edge to backend, ML service to backend — has a spec before any code is written. OpenSpec is the source of truth; the implementation has to match it.'
      ),
      block(
        'Tradeoff: process overhead at the start. Every new endpoint takes longer because the spec comes first. The payback is that when a contract changes, all consumers see the diff explicitly, and AI assistants generating client code can use the spec instead of guessing from the implementation.'
      ),
      block('What Biogas Platform Can Do Today', 'h2'),
      bullet(
        '5 applications in one monorepo — Go backend, Rust edge gateway, Python ML service, React/Vite web frontend, mobile app.'
      ),
      bullet(
        'Real-time ingestion over MQTT (Mosquitto broker), persistence in PostgreSQL with Redis for hot data, time-series-aware schemas.'
      ),
      bullet(
        'Autonomous edge gateway in Rust (v2.1.0) — Modbus TCP/RTU to PLCs, offline-first SQLite with sync queue, sub-50ms ONNX anomaly inference, on-device LLM with AI agents, OTA model updates with ed25519 signature verification, embedded dashboard PWA.'
      ),
      bullet(
        'Three-layer AI: edge anomaly detection, cloud anomaly analysis with SHAP explainability, predictive layer with 7-day biogas forecasts and 4-24h failure predictions.'
      ),
      bullet(
        'Role-aware UI for operators, technical staff, supervisors, and owners — distinct views and permissions, not toggles on a single dashboard.'
      ),
      bullet(
        'OpenSpec contracts for every cross-app API; custom Biome plugin (eslint-plugin-biogas-ssot) enforces single-source-of-truth conventions at lint time.'
      ),
      bullet(
        'GitLab CI/CD with versioned model storage on S3-compatible object storage, controlled model rollouts, and drift monitoring feeding retraining decisions.'
      ),
      block("What I'd Reconsider", 'h2'),
      block(
        'I waited too long to ship something. The instinct was to deliver a mature product — the three AI layers, the mobile app, the role model, the edge inference, all done well before showing it. That is not how this should have gone.'
      ),
      block(
        'A smaller, earlier delivery would have been the right call. A backend that ingests sensor data and a dashboard that shows it, shipped in week three, would have given my nephew something real to use immediately. Feedback from actual plant operations would have shaped the priorities for what comes next. Instead I built outward — adding layers, apps, and capabilities — before any of it ran against real daily use.'
      ),
      block(
        'The cost is invisible from the outside: the platform looks comprehensive and the architecture is clean. The cost is in what I never learned because nothing was in front of users early enough. The next product I build, I will ship the smallest thing that solves the original problem in the first month, and earn the right to add layers from there.'
      ),
      block('Architecture Snapshot', 'h2'),
      block('Monorepo with five applications and supporting packages:'),
      bullet(
        'apps/backend — Go + GORM + Gin, REST API, MQTT subscriber, OpenSpec source of truth.'
      ),
      bullet(
        'apps/edge-gateway — Rust (Tokio async runtime), Modbus TCP/RTU client to PLCs, SQLite local store with sync queue, onnxruntime 2.0 inference, local LLM via llama_cpp, AI agent framework, OTA model updates with ed25519 signing, embedded dashboard PWA, Prometheus metrics, health endpoints.'
      ),
      bullet(
        'apps/ml-service — Python + scikit-learn, training pipelines, SHAP explainability, ONNX export with parity tests.'
      ),
      bullet(
        'apps/frontend-vite — React 19 + Vite + Mantine + Recharts, operator and analyst dashboards.'
      ),
      bullet(
        'apps/mobile — companion app on Ionic + Capacitor + Vite for operator field workflows.'
      ),
      bullet(
        'packages/eslint-plugin-biogas-ssot — custom lint rules that enforce single-source-of-truth across apps.'
      ),
      bullet('services/ai-assistant — natural language query interface over the operational data.'),
      block(
        'Persistence is PostgreSQL for canonical state, Redis for hot data and caching, S3-compatible object storage for model artifacts and large blobs. Messaging is Mosquitto MQTT. Deployment is GitLab CI/CD with Docker images per app and Caddyfile-based edge routing.'
      ),
    ],
  },
];

function getProjectTimestamp(project: SanityProject): number {
  return new Date(project.publishedAt).getTime();
}

export function mergeLocalAndSanityProjects(remoteProjects: SanityProject[]): SanityProject[] {
  const projectMap = new Map<string, SanityProject>();

  for (const project of remoteProjects) {
    projectMap.set(project.slug.current, project);
  }

  for (const project of LOCAL_PROJECTS) {
    if (!projectMap.has(project.slug.current)) {
      projectMap.set(project.slug.current, project);
    }
  }

  return Array.from(projectMap.values()).sort(
    (left, right) => getProjectTimestamp(right) - getProjectTimestamp(left)
  );
}
