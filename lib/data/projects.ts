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
      'An API generation platform that turns contracts into production-oriented service foundations for faster backend delivery and stronger standards.',
    technologies: [
      'Java 25',
      'Spring Boot',
      'Gradle',
      'OpenAPI',
      'GraphQL',
      'gRPC',
      'JWT/OAuth2',
      'Docker',
      'Kubernetes',
      'OpenTelemetry',
    ],
    featured: true,
    publishedAt: '2026-05-01T09:00:00.000Z',
    body: [
      block('Platform Overview', 'h2'),
      block(
        'APiGen is a contract-first platform that turns API definitions into production-oriented service foundations. Rather than stopping at scaffolding, it exposes the same generation engine through CLI, server, IDE, and MCP workflows so teams can validate, preview, and generate from the interface that fits their delivery model.'
      ),
      block(
        'The real friction for backend teams rarely starts with controllers or entity classes. It starts earlier: defining service boundaries, aligning cross-cutting concerns, and ensuring every new service begins with the same operational posture. APiGen treats generation as a way to encode engineering standards, so teams move faster without resetting those decisions every time.'
      ),
      block('What It Solves', 'h2'),
      bullet(
        'Turns SQL schemas and OpenAPI contracts into backend starting points that teams can preview, validate, and extend instead of rewriting.'
      ),
      bullet(
        'Standardizes service conventions so multiple generated services share the same operational posture.'
      ),
      bullet(
        'Supports local CLI usage, server-side generation, IDE assistance, and MCP-based AI tooling without splitting the product into separate generators.'
      ),
      block(
        'That matters for organizations that want faster service creation without letting every team reinvent packaging, authentication, error handling, or deployment wiring. A generated baseline is only useful when it already matches the platform it will live in.'
      ),
      block('Architecture Framing', 'h2'),
      block(
        'The platform is designed as a modular generation engine rather than a one-off exporter. The repo is split across reusable libs, generator modules, feature packs, and MCP servers, which keeps parsing, code generation, delivery interfaces, and runtime capabilities from collapsing into one monolith.'
      ),
      block(
        'The business outcome is repeatability. Services start with the same assumptions for authentication, transport compatibility, packaging, and telemetry, which lowers variance across teams and environments.'
      ),
      block('Why The Product Shape Matters', 'h2'),
      block(
        'A backend generator can be treated as a disposable convenience tool or as a product that sits between API intent and platform delivery. APiGen follows the second model. That choice demands repeatable inputs, deterministic outputs, preview and validation paths before file generation, and a clear contract for how teams customize generated services without fighting the generator later.'
      ),
      block(
        'That framing also explains why contract-first inputs matter. When the source of truth is explicit, generation becomes governable: teams can see what is stable, what is derived, and what can be regenerated safely as standards evolve. The template override path is explicit too, with local `.apigen/templates` overrides instead of forcing every customization into a fork.'
      ),
      block('Architectural Decisions', 'h2'),
      block(
        'The core architectural decision is to separate parsing, normalization, template orchestration, and runtime packaging. That keeps the engine adaptable when contracts change, new runtime conventions appear, or different transports need different rules. Without that separation, the platform would harden into a single-purpose exporter.'
      ),
      block(
        'Another key decision is treating security, observability, and deployment posture as first-class generation concerns. A service foundation is valuable when it does more than expose endpoints: it should authenticate correctly, emit telemetry, structure modules coherently, and fit the delivery model from day one.'
      ),
      block('Technology Choices And Tradeoffs', 'h2'),
      block(
        'Java and Spring Boot fit the target because this is not a lightweight experiment but a production-oriented service baseline. The ecosystem is strong for modular services, security integration, dependency management, and operational tooling. The tradeoff is heavier conventions and more generated surface area than lighter stacks, but that is acceptable when consistency matters more than minimal code size.'
      ),
      block(
        'The support story is broader than a single Java happy path, but it is not uniformly mature. The repository and docs show a modular multi-language direction, with Java as the flagship implementation and Kotlin, Python, IDE tooling, and MCP surfaces extending that core. That breadth is useful, but it needs careful product framing so the stable center is clear and the expansion areas are not overstated.'
      ),
      block(
        'Docker, Kubernetes, and OpenTelemetry belong here for the same reason: the platform is designed around operational readiness, not only source generation. The tradeoff is stronger opinionation. Teams gain consistency and better defaults, but they also accept that the baseline reflects platform decisions rather than every edge case.'
      ),
      block('Delivery And Workflow Decisions', 'h2'),
      block(
        'A generator like this only works if it supports more than one workflow. The CLI covers local generation, validation, preview, and migration tasks; the server adds HTTP generation, preview endpoints, and GitHub-oriented delivery flows; the IDE and LSP layers reduce configuration friction at authoring time; and MCP exposes the same engine to AI assistants. The product cannot assume a single happy path or a single user persona.'
      ),
      block(
        'That delivery model also changes maintainability. The system needs evolving templates, versioned standards, working examples, and safer regeneration boundaries so teams can adopt improvements incrementally. The docs, quick-start flows, and example schemas act as an enablement layer, while the Terraform area shows a more complete AWS path plus scaffold/reference coverage for other clouds rather than a uniformly finished multi-cloud story.'
      ),
      block('Architectural Complexity', 'h2'),
      block(
        'What makes APiGen substantial is the intersection of product thinking, platform architecture, and developer experience. The hard part is deciding what should be standardized, where extension seams belong, how much opinionation is healthy, and how to keep generated foundations useful after real teams start modifying them.'
      ),
      block(
        'That combination of contract design, modular architecture, operational defaults, and workflow integration makes it a genuine platform product for backend teams, not a conventional CRUD service or a one-off code generator.'
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
