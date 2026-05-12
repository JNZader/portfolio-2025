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
        'APiGen is a contract-first platform focused on reducing the distance between API design and a production-ready service baseline. Instead of generating toy scaffolds, it aims to accelerate the first serious version of a service with opinionated foundations around security, delivery, observability, and modular architecture.'
      ),
      block(
        'The product matters because many backend teams do not actually struggle with writing controllers or entity classes. The real drag appears earlier: agreeing on service boundaries, standardizing cross-cutting concerns, and making sure each new service starts from the same operational assumptions. APiGen addresses that problem by treating generation as a way to encode engineering standards, not as a shortcut that avoids engineering.'
      ),
      block('What It Solves', 'h2'),
      bullet(
        'Turns SQL schemas and OpenAPI contracts into backend starting points that teams can extend instead of rewriting.'
      ),
      bullet(
        'Standardizes service conventions so multiple generated services share the same operational posture.'
      ),
      bullet(
        'Supports CLI, server, and integration workflows to fit local development and automated delivery pipelines.'
      ),
      block(
        'In practice, that shape is important for organizations that want faster service creation without giving every team total freedom to reinvent packaging, authentication, error handling, or deployment wiring. A generated baseline becomes useful only when it already reflects real platform expectations.'
      ),
      block('Architecture Framing', 'h2'),
      block(
        'The platform is designed as a modular generation engine rather than a single-purpose code exporter. That separation makes it possible to plug in different contract inputs, generation strategies, and runtime targets without turning the platform into a monolith.'
      ),
      block(
        'Its value is not just speed. The real business outcome is repeatability: services start with the same operational assumptions for authentication, transport compatibility, packaging, and telemetry, which lowers variance across teams and environments.'
      ),
      block('Why The Product Shape Matters', 'h2'),
      block(
        'A backend generator can be positioned in two very different ways. One is as a developer convenience tool that emits code once and is then forgotten. The other is as an internal product that sits between API intent and platform delivery. APiGen follows the second model. That decision changes everything: the system has to support repeatable inputs, deterministic outputs, extension points, and a clear contract for how teams customize the generated result without fighting the generator later.'
      ),
      block(
        'That product framing also explains why contract-first inputs matter. If the source of truth lives in explicit contracts rather than ad hoc code inspection, generation becomes more governable. Teams can reason about what is stable, what is derived, and what can be regenerated safely as standards evolve.'
      ),
      block('Architectural Decisions', 'h2'),
      block(
        'The core architectural decision is to separate parsing, normalization, template orchestration, and runtime packaging into distinct concerns. That keeps the engine adaptable when the input contract changes, when new runtime conventions are added, or when different transports need different generation rules. Without that separation, the product would collapse into a hard-coded exporter tied to a single workflow.'
      ),
      block(
        'Another important decision is treating security, observability, and deployment posture as first-class generation concerns rather than optional extras. That is a senior-level distinction: a generated service is not valuable if it only produces endpoints. It becomes valuable when it also reflects how a real service should authenticate, expose telemetry, structure modules, and fit the platform delivery model from day one.'
      ),
      block('Technology Choices And Tradeoffs', 'h2'),
      block(
        'Java and Spring Boot make sense here because the target is not a minimal experiment but a production-oriented service baseline. The ecosystem is mature for modular enterprise services, security integration, dependency management, and operational tooling. The tradeoff is heavier conventions and more generated surface area than lighter runtime stacks, but that is acceptable when the goal is organizational consistency rather than minimal code size.'
      ),
      block(
        'Supporting OpenAPI, GraphQL, and gRPC increases the usefulness of the platform, but it also raises complexity. Each contract style carries different assumptions about schema design, transport semantics, compatibility, and generated artifacts. The product therefore has to normalize divergent inputs without pretending they are identical. That is a harder problem than simple template substitution, and it is one of the reasons the platform reads as an architecture tool rather than a code toy.'
      ),
      block(
        'Docker, Kubernetes, and OpenTelemetry belong in the story for the same reason. They show that the platform is designed around operational readiness, not only source generation. The tradeoff is stronger opinionation: teams gain consistency and a better default posture, but they also accept that the generated baseline reflects platform decisions that may not match every edge case perfectly.'
      ),
      block('Delivery And Workflow Decisions', 'h2'),
      block(
        'A generator like this only succeeds if it works in more than one workflow. Local CLI usage matters for developer feedback loops. Server or service-based execution matters for centralized governance. CI and integration workflows matter when generation is part of a broader delivery pipeline. Designing for those modes means the product cannot assume a single happy path or a single user persona.'
      ),
      block(
        'That delivery model also changes how maintainability is approached. The system must support evolving templates, versioned standards, and safer regeneration boundaries so teams can adopt improvements incrementally. Otherwise the platform creates lock-in and fear instead of leverage.'
      ),
      block('Why It Is Senior-Level', 'h2'),
      block(
        'What makes APiGen interesting from a senior engineering perspective is that it sits at the intersection of product thinking, platform architecture, and developer experience. The challenge is not merely generating files. The challenge is deciding which concerns should be standardized, where extension seams belong, how much opinionation is healthy, and how to keep generated foundations useful after real teams start modifying them.'
      ),
      block(
        'That combination of contract design, modular architecture, operational defaults, and workflow integration is what makes the project substantial. It is effectively a platform product for backend teams, and that requires more architectural judgment than a conventional CRUD service or a one-off code generator.'
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
        'APiGen Studio is the visual companion to APiGen. Where the core platform focuses on generation, Studio focuses on design intent: modeling APIs, mapping service boundaries, validating compatibility rules, and making generation decisions visible before the backend pipeline runs.'
      ),
      block(
        'That distinction is important. Studio is not just a UI wrapper around a generator. It exists because many of the hardest API problems happen before code generation begins: unclear ownership, weak boundary modeling, incompatible schemas, and design decisions that live only in scattered documents or YAML files. Studio turns those decisions into a visual, reviewable product surface.'
      ),
      block('Why It Matters', 'h2'),
      bullet(
        'Gives teams a shared visual workspace for API design instead of hiding decisions inside YAML files alone.'
      ),
      bullet(
        'Parses existing schemas and contracts to detect compatibility issues before they become integration problems.'
      ),
      bullet(
        'Connects modeling flows with export and generation workflows so design and implementation stay aligned.'
      ),
      block(
        'From a product standpoint, this matters because collaboration around API design is usually fragmented. Product people, architects, backend engineers, and frontend consumers often look at different artifacts and infer different meanings. A visual design studio reduces that ambiguity by giving the team one place to inspect structure, relationships, and readiness before the generation workflow locks in assumptions.'
      ),
      block('Frontend Architecture', 'h2'),
      block(
        'The product is structured around a React application designed for complex state, graph interactions, and validation feedback. Zustand manages editor state, Zod supports contract validation, and XYFlow-style node interactions make service relationships inspectable instead of abstract.'
      ),
      block(
        'This makes Studio related to APiGen, but distinct in purpose: APiGen accelerates backend foundations, while Studio improves the quality of the decisions that feed that generation pipeline.'
      ),
      block('Why The Product Shape Matters', 'h2'),
      block(
        'A visual studio for API work only becomes credible if the interface reflects real design complexity instead of oversimplifying it. Service relationships, schema flows, validation warnings, and export decisions all need to remain understandable without hiding important constraints. That means the product has to balance clarity for humans with enough structural rigor to feed downstream tooling.'
      ),
      block(
        'Studio therefore sits in a different layer of the system than APiGen itself. APiGen encodes backend standards into generated artifacts. Studio encodes decision-making into a collaborative editing surface. One solves backend acceleration. The other solves visibility, alignment, and design confidence.'
      ),
      block('Architectural Decisions', 'h2'),
      block(
        'Choosing a client-heavy React architecture is a deliberate decision because the product depends on responsive graph interactions, local validation feedback, and editing workflows that should feel immediate. Keeping more intelligence in the frontend improves the design experience, but it also requires careful state boundaries so editor interactions, derived validation state, and persisted project models do not become entangled.'
      ),
      block(
        'State management is central to that problem. Zustand is a practical fit for isolating editor concerns without forcing every interaction through heavyweight global abstractions. The tradeoff is that store design has to stay disciplined. In graph-heavy products, weak state boundaries quickly turn into impossible-to-debug UI coupling, stale derived values, and brittle export logic.'
      ),
      block('Technology Choices And Tradeoffs', 'h2'),
      block(
        'React 19 and TypeScript support a strongly typed, component-driven editor that can evolve with more advanced workflows. Mantine helps ship a polished internal product surface faster, which matters when the hard part of the product is interaction design rather than low-level design systems work. The tradeoff is accepting framework conventions and library patterns in exchange for delivery speed and consistency.'
      ),
      block(
        'Zod is useful because schema validation is not a secondary concern here; it is part of the product value. If a design tool cannot validate structure clearly and early, it is only a drawing tool. React Flow-style graph tooling enables relationship modeling, but it also introduces complexity around layout, interaction semantics, and synchronization between visual nodes and the underlying domain model.'
      ),
      block(
        'Playwright and Vitest reflect another senior-level decision: products like this need confidence both in isolated logic and in end-to-end editing behavior. The danger in rich editors is that everything appears to work until a particular interaction order breaks selection state, serialization, or validation messaging. Testing strategy has to respect that.'
      ),
      block('Delivery And Workflow Decisions', 'h2'),
      block(
        'Studio is valuable only if it fits real team workflows, not just solo experimentation. That means thinking about import, edit, validate, and export as one continuous path. The user should be able to bring in an existing contract, inspect it visually, refine decisions, surface issues, and hand the result back to generation-oriented workflows without losing fidelity.'
      ),
      block(
        'This also creates a product responsibility around transparency. Visual tooling can become dangerous when it hides what will actually be generated. A mature implementation needs to make design intent, validation constraints, and export consequences understandable so the UI becomes a better design instrument, not an abstraction layer that obscures engineering reality.'
      ),
      block('Why It Is Senior-Level', 'h2'),
      block(
        'APiGen Studio is senior-level work because it is fundamentally a systems UX problem. It combines domain modeling, complex client state, schema validation, graph interaction design, and workflow orchestration between human decisions and machine generation. That is a very different level of difficulty than shipping a dashboard or a forms-based admin panel.'
      ),
      block(
        'The result is a product that feels related to APiGen while clearly standing on its own. It is the design intelligence layer of the broader ecosystem: the place where architecture intent becomes explicit before backend code is ever generated.'
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
      'Private case study: a sanitized industrial platform for biogas monitoring, field workflows, and edge-to-cloud synchronization.',
    technologies: [
      'Go',
      'Gin',
      'PostgreSQL',
      'React 19',
      'Vite',
      'Mantine',
      'TypeScript',
      'Zustand',
      'OpenAPI / OpenSpec',
      'Docker',
    ],
    featured: true,
    privateCaseStudy: true,
    publishedAt: '2026-04-25T09:00:00.000Z',
    body: [
      block('Private Case Study', 'h2'),
      block(
        'Biogas Platform is presented as a sanitized private case study. It highlights the architecture and delivery approach without exposing client identifiers, internal URLs, credentials, or operationally sensitive details.'
      ),
      block(
        'The goal of this entry is to explain the system shape and engineering decisions in public-facing terms while intentionally avoiding information that could expose customer operations or internal implementation details. It should be read as an architecture narrative, not as a technical dump.'
      ),
      block('Business Framing', 'h2'),
      block(
        'The platform was shaped as a contract-driven operations product for industrial environments where field work, monitoring, and synchronization cannot depend on perfect connectivity. The goal was to unify multiple workflows across monitoring dashboards, operational tasks, and mobile-first execution.'
      ),
      block(
        'That context matters because industrial software is constrained by the physical world. Office users may need planning and visibility, while field users need dependable workflows in environments where connectivity, timing, and operational conditions are less predictable. The product therefore had to behave like a coordinated platform, not like a single web panel with a database behind it.'
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
      block(
        'The important product decision was to treat those concerns as part of one coherent system. Monitoring, task execution, and synchronization were not independent features to be bolted together later. They influenced each other directly, which meant contracts and data flows needed to be explicit from the beginning.'
      ),
      block('Architecture Takeaway', 'h2'),
      block(
        'The main architectural value was not a single feature, but the ability to deliver a multi-application platform around explicit contracts. That improved change management, reduced ambiguity between teams, and made it easier to evolve the system without coupling every application to hidden backend assumptions.'
      ),
      block('Why The Product Shape Matters', 'h2'),
      block(
        'In a private industrial platform, the system shape is often more important than any isolated screen. If office workflows, field execution, and synchronization logic are designed independently, the result becomes brittle fast: data meanings drift, edge cases multiply, and users lose trust when one application behaves differently from another. A platform approach reduces that fragmentation by making contracts and workflow boundaries explicit.'
      ),
      block(
        'That is also why this case study is presented in sanitized form. The reusable value here is not in revealing customer-specific topology. It is in showing how senior engineering work frames the system: separate concerns clearly, preserve contract integrity, and design for operational reality instead of ideal connectivity.'
      ),
      block('Architectural Decisions', 'h2'),
      block(
        'Go and PostgreSQL fit the backend shape well because the system benefits from explicit APIs, predictable performance characteristics, and clear control over synchronization and workflow logic. The decision is less about language preference and more about keeping the service layer understandable under operational complexity. In environments with several application consumers, clarity and contract stability matter more than fashionable abstractions.'
      ),
      block(
        'On the frontend side, React and TypeScript support a product family where shared concepts can be modeled consistently across applications, even when the interaction patterns differ. Zustand is a reasonable state choice for keeping local workflow state manageable without turning every feature into a framework inside the framework. The tradeoff is that teams must be disciplined about store design and domain boundaries to prevent accidental coupling.'
      ),
      block(
        'The contract-driven approach is the deeper architectural decision. Explicit API definitions create a safer seam between backend evolution and application behavior. That becomes especially valuable when synchronization, mobile workflows, and office interfaces all depend on the same domain language but consume it differently.'
      ),
      block('Technology Choices And Tradeoffs', 'h2'),
      block(
        'Offline-first behavior is never free. It improves reliability for field usage, but it introduces hard questions around conflict handling, synchronization timing, retry behavior, and what the user should see when local state and remote state are temporarily out of sync. Choosing to support that model signals that the product is designed around real operational constraints, not purely around idealized SaaS assumptions.'
      ),
      block(
        'Docker and contract tooling support delivery consistency, but the bigger tradeoff is organizational. Strong contracts and explicit workflows reduce ambiguity, yet they also require more discipline in how features are introduced and how changes are communicated across applications. That is usually the right trade for a serious operational platform.'
      ),
      block('Delivery And Workflow Decisions', 'h2'),
      block(
        'A platform like this benefits from delivery practices that keep contracts visible and change impact understandable. When multiple user surfaces depend on shared operational concepts, the team cannot treat backend, frontend, and synchronization behavior as separate delivery tracks with no coordination. Product delivery has to reflect the architecture: shared language, shared contracts, and careful evolution of workflows.'
      ),
      block(
        'That is where the project becomes senior-level. The challenge is not just implementing screens or endpoints. It is managing the tension between industrial reliability, multi-application consistency, offline behavior, and ongoing product evolution without exposing users to internal system complexity.'
      ),
      block('Why It Is Senior-Level', 'h2'),
      block(
        'Biogas Platform is included as a private case study because the interesting part is architectural maturity. It demonstrates how to shape a contract-driven platform for a demanding operational domain, how to protect privacy while still explaining engineering value, and how to design for messy real-world workflows instead of ideal lab conditions.'
      ),
      block(
        'That combination of system design, workflow modeling, synchronization concerns, and disciplined public sanitization is what makes the case study credible. It is not public because it is simple; it is public because the reusable lessons can be described without disclosing anything sensitive.'
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
