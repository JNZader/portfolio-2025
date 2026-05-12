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
      block('Architecture Framing', 'h2'),
      block(
        'The platform is designed as a modular generation engine rather than a single-purpose code exporter. That separation makes it possible to plug in different contract inputs, generation strategies, and runtime targets without turning the platform into a monolith.'
      ),
      block(
        'Its value is not just speed. The real business outcome is repeatability: services start with the same operational assumptions for authentication, transport compatibility, packaging, and telemetry, which lowers variance across teams and environments.'
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
      block('Frontend Architecture', 'h2'),
      block(
        'The product is structured around a React application designed for complex state, graph interactions, and validation feedback. Zustand manages editor state, Zod supports contract validation, and XYFlow-style node interactions make service relationships inspectable instead of abstract.'
      ),
      block(
        'This makes Studio related to APiGen, but distinct in purpose: APiGen accelerates backend foundations, while Studio improves the quality of the decisions that feed that generation pipeline.'
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
      block('Business Framing', 'h2'),
      block(
        'The platform was shaped as a contract-driven operations product for industrial environments where field work, monitoring, and synchronization cannot depend on perfect connectivity. The goal was to unify multiple workflows across monitoring dashboards, operational tasks, and mobile-first execution.'
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
      block('Architecture Takeaway', 'h2'),
      block(
        'The main architectural value was not a single feature, but the ability to deliver a multi-application platform around explicit contracts. That improved change management, reduced ambiguity between teams, and made it easier to evolve the system without coupling every application to hidden backend assumptions.'
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
