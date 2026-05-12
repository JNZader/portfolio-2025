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
      'A visual API design studio for modeling service boundaries, validating contracts, and preparing generation workflows before code exists.',
    technologies: [
      'React 19',
      'TypeScript',
      'Vite',
      'Mantine',
      'Zustand',
      'Zod',
      'React Flow',
      'Playwright',
      'Vitest',
      'Docker',
    ],
    featured: true,
    publishedAt: '2026-04-29T09:00:00.000Z',
    body: [
      block('Product Overview', 'h2'),
      block(
        'APiGen Studio is the visual companion to APiGen. Where the core platform focuses on generation, Studio focuses on the work that happens before it: modeling APIs, mapping service boundaries, validating compatibility rules, and making generation decisions visible before the backend pipeline runs.'
      ),
      block(
        'Studio is not a thin UI over a generator or just a visual canvas. It exists because many API problems appear before code generation begins: unclear ownership, weak boundary modeling, incompatible schemas, fragile imports, and decisions buried across documents or YAML files. Studio turns that pre-implementation work into an editor with validation, import review, export discipline, and recovery paths.'
      ),
      block('Why It Matters', 'h2'),
      bullet(
        'Gives teams a shared visual workspace for API design instead of hiding decisions inside YAML files alone.'
      ),
      bullet(
        'Parses existing SQL schemas and OpenAPI contracts, then surfaces compatibility and conflict issues before they become integration problems.'
      ),
      bullet(
        'Connects modeling flows with schema-versioned project export, conflict-aware import review, GitHub push, and multi-service generation workflows so design and implementation stay aligned.'
      ),
      block(
        'API design collaboration is usually fragmented. Product people, architects, backend engineers, and frontend consumers often read different artifacts and infer different meanings. A visual studio reduces that ambiguity by giving the team one place to inspect structure, relationships, and readiness before generation hardens those assumptions.'
      ),
      block('Frontend Architecture', 'h2'),
      block(
        'The product is structured as a React editor built for complex state, graph interactions, and validation feedback. Zustand manages editor state, Zod validates project imports and editor data, and the target model carries a real language/framework matrix rather than a single backend assumption. That gives Studio enough depth to model service-level generation intent instead of only drawing boxes and arrows.'
      ),
      block(
        'That makes Studio related to APiGen but distinct in purpose: APiGen accelerates backend foundations, while Studio improves the quality of the decisions that feed that pipeline.'
      ),
      block('Why The Product Shape Matters', 'h2'),
      block(
        'A visual studio for API work is only credible if it reflects real design complexity instead of flattening it. Service relationships, schema flows, validation warnings, target compatibility rules, and export decisions all need to stay understandable without hiding important constraints. The product has to balance clarity for humans with enough rigor to feed downstream tooling.'
      ),
      block(
        'Studio sits in a different layer of the system than APiGen itself. APiGen encodes backend standards into generated artifacts. Studio turns decision-making into a shared editing workflow: import a contract, inspect the model, preview conflicts, surface incompatibilities, refine boundaries, and export with clearer intent.'
      ),
      block('Architectural Decisions', 'h2'),
      block(
        'Choosing a client-heavy React architecture is deliberate because the product depends on responsive graph interactions, local validation feedback, and editing workflows that should feel immediate. Keeping more intelligence in the frontend improves the experience, but it also demands careful state boundaries so editor interactions, derived validation state, persisted models, and per-service target decisions do not become entangled.'
      ),
      block(
        'State management is central to that problem. Zustand is a practical fit for isolating editor concerns without forcing every interaction through heavyweight global abstractions. The tradeoff is discipline: in graph-heavy products, weak state boundaries quickly become UI coupling, stale derived values, and brittle export logic. That matters here because the app validates language/framework compatibility, feature constraints, and import merge choices while users are still editing.'
      ),
      block('Technology Choices And Tradeoffs', 'h2'),
      block(
        'React 19 and TypeScript support a strongly typed, component-driven editor that can grow with more advanced workflows. Mantine helps ship a polished product surface faster, which matters when the hard part is interaction design rather than low-level design-system work. The tradeoff is accepting framework conventions in exchange for delivery speed and consistency.'
      ),
      block(
        'Zod matters because validation is part of the product value. If a design tool cannot validate structure early and clearly, it is just a drawing tool. Studio uses schema-versioned project import/export, compatibility checks across supported targets, and conflict-aware merge flows, which makes validation part of the workflow instead of a final warning banner.'
      ),
      block(
        'Graph tooling adds another layer of complexity around layout, interaction semantics, and synchronization between visual nodes and the underlying model. The editor uses ELK for layered graph layout when relationships exist, falls back to grid placement when they do not, and applies the same approach to service-to-service maps. That makes layout behavior part of the product logic, not just cosmetic polish.'
      ),
      block(
        'Playwright and Vitest reflect another important decision: products like this need confidence both in isolated logic and in end-to-end editing behavior. The repo includes focused tests around SQL and OpenAPI parsing, canvas layout, keyboard shortcuts, import preview conflicts, and version history utilities, which is exactly where rich editors tend to fail first.'
      ),
      block('Delivery And Workflow Decisions', 'h2'),
      block(
        'Studio is valuable only if it fits real team workflows, not just solo experimentation. That means treating import, edit, validate, and export as one continuous path. A team should be able to bring in an existing contract, inspect it visually, refine decisions, surface issues, and hand the result back to generation workflows without losing fidelity.'
      ),
      block(
        'That also creates a responsibility around transparency. Visual tooling becomes dangerous when it hides what will actually be generated. A mature implementation needs to make design intent, validation constraints, export consequences, and recovery behavior understandable so the UI improves decisions instead of obscuring engineering reality. Studio backs that up with IndexedDB-based autosave, retained snapshot history, restore flows, and pre-import safety snapshots for destructive operations.'
      ),
      block('Key Engineering Challenges', 'h2'),
      block(
        'APiGen Studio is fundamentally a systems UX problem. It combines domain modeling, complex client state, schema validation, graph interaction design, accessibility-minded keyboard editing, and workflow orchestration between human decisions and machine generation. The GitHub push path and multi-service export flow reinforce that it is a serious design-to-delivery surface, not just a drawing tool with an export button.'
      ),
      block(
        'The result is a product that feels related to APiGen while clearly standing on its own: the design layer where architecture intent becomes explicit before backend code is generated.'
      ),
    ],
  },
  {
    _id: 'biogas-platform',
    title: 'Biogas Platform',
    slug: {
      current: 'biogas-platform',
    },
    excerpt:
      'Private case study: a sanitized industrial operations platform for biogas monitoring, field workflows, edge-to-cloud synchronization, and production-minded AI/ML.',
    technologies: [
      'Go',
      'Gin',
      'PostgreSQL',
      'Rust',
      'Python',
      'React 19',
      'Vite',
      'Mantine',
      'TypeScript',
      'Zustand',
      'ONNX Runtime',
      'scikit-learn',
      'Airflow',
      'MLflow',
      'MinIO',
      'OpenAPI / OpenSpec',
      'Docker',
    ],
    featured: true,
    privateCaseStudy: true,
    publishedAt: '2026-04-25T09:00:00.000Z',
    body: [
      block('Private Case Study', 'h2'),
      block(
        'Biogas Platform is presented as a sanitized private case study. It focuses on architecture and delivery without exposing client identifiers, internal URLs, credentials, or operationally sensitive details.'
      ),
      block(
        'The goal is to explain the system shape and engineering decisions in public-facing terms while protecting customer operations. It should be read as an architecture narrative, not as a technical dump.'
      ),
      block('Business Framing', 'h2'),
      block(
        'The platform was shaped as a contract-driven operations product for industrial environments where field work, monitoring, and synchronization cannot depend on perfect connectivity. The goal was to unify monitoring, operational tasks, and mobile-first execution into one coherent workflow.'
      ),
      block(
        'That context matters because industrial software is constrained by the physical world. Office users need planning and visibility, while field users need dependable workflows in environments where connectivity, timing, and operational conditions are less predictable. The product therefore had to behave like a coordinated platform, not a single web panel with a database behind it.'
      ),
      block('System Shape', 'h2'),
      bullet(
        'Backend services exposed stable contracts for operational data, synchronization flows, and workflow actions.'
      ),
      bullet(
        'Frontend applications shared a consistent product model while serving distinct roles for office and field usage.'
      ),
      bullet(
        'Offline-first mobile behavior and edge-to-cloud synchronization reduced operational friction in unstable network conditions.'
      ),
      bullet(
        'Edge services handled local anomaly scoring and assistant flows so core operational feedback could continue even when connectivity was degraded.'
      ),
      bullet(
        'Cloud services owned heavier training, model lifecycle, and AI routing concerns instead of pushing that burden onto field hardware.'
      ),
      block(
        'The important product decision was to treat those concerns as one system. Monitoring, task execution, and synchronization were not features to bolt together later. They shaped each other directly, which meant contracts and data flows had to be explicit from the beginning.'
      ),
      block('Verified AI/ML Layer', 'h2'),
      block(
        'The part that was initially underrepresented in this case study is the verified AI/ML layer. This was not decorative “AI added later” work. It was shaped as an operational subsystem with clear boundaries between what must run locally at the edge and what belongs in cloud training and model management.'
      ),
      bullet(
        'At the edge, anomaly detection combined lightweight statistical checks with ONNX-based Isolation Forest inference so plants could score suspicious behavior locally and react without waiting on a round trip.'
      ),
      bullet(
        'In the cloud, anomaly training paired Isolation Forest with an LSTM autoencoder, which is a practical split between point anomalies and sequential behavior changes in sensor streams.'
      ),
      bullet(
        'Predictive maintenance was framed with Random Forest models around 7-day and 14-day failure risk plus estimated remaining useful life, which is a more operationally useful output than a vague “risk score.”'
      ),
      bullet(
        'The assistant layer used DistilBERT-based ONNX intent classification, with offline keyword fallback and Spanish template responses when local inference confidence or model availability made a simpler path safer.'
      ),
      bullet(
        'Cloud AI routing supported tenant-configurable provider selection and ordered fallback chains, which matters in real products where reliability, cost, and local model availability all vary by deployment.'
      ),
      bullet(
        'PSI-based drift detection monitored feature distribution shifts at the edge and fed retraining decisions upstream, while the model lifecycle combined experiment tracking, artifact storage, registry versioning, promotion, and redeployment instead of ad-hoc model drops.'
      ),
      block(
        'From a public-facing architecture perspective, the interesting lesson is not any single algorithm name. It is the separation of responsibilities: fast local inference where operations need resilience, heavier sequence modeling and retraining in the cloud, and a deployment path that treats models as versioned production assets.'
      ),
      block('Architecture Takeaway', 'h2'),
      block(
        'The main architectural value was the ability to deliver a multi-application platform around explicit contracts. That improved change management, reduced ambiguity between teams, and made it easier to evolve the system without coupling every application to hidden backend assumptions.'
      ),
      block(
        'The AI/ML layer reinforced that same architectural principle. Edge inference, cloud training, provider routing, and retraining triggers were useful precisely because they were designed as explicit platform capabilities rather than scattered experiments hidden behind individual screens.'
      ),
      block('Why The Product Shape Matters', 'h2'),
      block(
        'In a private industrial platform, system shape is often more important than any isolated screen. If office workflows, field execution, and synchronization logic are designed independently, the result becomes brittle fast: data meanings drift, edge cases multiply, and users lose trust when one application behaves differently from another. A platform approach reduces that fragmentation by making contracts and workflow boundaries explicit.'
      ),
      block(
        'The reusable value here is not customer-specific topology. It is the way the system was framed: separate concerns clearly, preserve contract integrity, and design for operational reality instead of ideal connectivity.'
      ),
      block('Architectural Decisions', 'h2'),
      block(
        'Go and PostgreSQL fit the backend well because the system benefits from explicit APIs, predictable performance, and clear control over synchronization and workflow logic. The decision is less about language preference and more about keeping the service layer understandable under operational complexity. In environments with several application consumers, clarity and contract stability matter more than fashionable abstractions.'
      ),
      block(
        'On the frontend side, React and TypeScript support a product family where shared concepts can be modeled consistently across applications, even when interaction patterns differ. Zustand is a practical state choice for keeping local workflow state manageable without turning every feature into a framework inside the framework. The tradeoff is that teams must stay disciplined about store design and domain boundaries to prevent accidental coupling.'
      ),
      block(
        'The contract-driven approach is the deeper architectural decision. Explicit API definitions create a safer seam between backend evolution and application behavior. That becomes especially valuable when synchronization, mobile workflows, and office interfaces all depend on the same domain language but consume it differently.'
      ),
      block('Technology Choices And Tradeoffs', 'h2'),
      block(
        'Offline-first behavior is never free. It improves reliability for field usage, but it introduces hard questions around conflict handling, synchronization timing, retry behavior, and what users should see when local and remote state are temporarily out of sync. Choosing that model signals that the product is designed around real operational constraints, not idealized SaaS assumptions.'
      ),
      block(
        'Docker and contract tooling support delivery consistency, but the bigger tradeoff is organizational. Strong contracts and explicit workflows reduce ambiguity, yet they also require more discipline in how features are introduced and how changes are communicated across applications. That is usually the right trade for a serious operational platform.'
      ),
      block('Delivery And Workflow Decisions', 'h2'),
      block(
        'A platform like this benefits from delivery practices that keep contracts visible and change impact understandable. When multiple user surfaces depend on shared operational concepts, the team cannot treat backend, frontend, and synchronization behavior as separate delivery tracks. Product delivery has to reflect the architecture: shared language, shared contracts, and careful workflow evolution.'
      ),
      block(
        'That is where the project complexity becomes clear. The challenge is managing the tension between industrial reliability, multi-application consistency, offline behavior, and ongoing product evolution without exposing users to internal system complexity.'
      ),
      block('System Constraints', 'h2'),
      block(
        'Biogas Platform is included as a private case study because the interesting part is the system shape required by the domain. It shows how to build a contract-driven platform for a demanding operational environment and how to design for messy real-world workflows instead of ideal lab conditions.'
      ),
      block(
        'The case study is credible because the engineering value survives sanitization. Even without naming the client or exposing sensitive details, the architecture still shows the same lesson: when operations depend on field execution, shared contracts, and unreliable connectivity, system design determines whether the product feels dependable or fragile.'
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
