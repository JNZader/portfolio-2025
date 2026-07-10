import type { Project as SanityProject } from '@/types/sanity';
import { block, bullet, mermaid } from './blocks';

export const apigenStudio: SanityProject = {
  _id: 'apigen-studio',
  title: 'APiGen Studio',
  slug: {
    current: 'apigen-studio',
  },
  excerpt:
    'Diseñador visual para APIs Spring Boot: modelás entidades y servicios en un canvas y exportás un proyecto que compila —un servicio único (monolito) o varios que se comunican (microservicios).',
  excerptEn:
    'A visual designer for Spring Boot APIs: model entities and services on a canvas and export a project that compiles —a single service (monolith) or several that talk to each other (microservices).',
  technologies: [
    'React',
    'TypeScript',
    'React Flow',
    'ELK',
    'Mantine',
    'Zustand',
    'Zod',
    'Vite',
    'Playwright',
    'Vitest',
  ],
  featured: true,
  demoUrl: 'https://apigen-web.vercel.app',
  publishedAt: '2026-04-29T09:00:00.000Z',
  displayOrder: 3,
  body: [
    block(
      'apigen genera a partir de un schema, pero decidir cómo se estructura el sistema —qué entidades hay, cómo se agrupan en servicios, qué habla con qué y por qué protocolo— es más fácil de razonar viéndolo que escribiéndolo. apigen Studio es esa capa visual, y funciona igual para un servicio único (monolito) que para varios servicios comunicados (microservicios).'
    ),
    block(
      'El modelo se arma en un canvas (React Flow con auto-layout de ELK): entidades y servicios como nodos, relaciones y conexiones entre servicios como aristas, con las conexiones síncronas (REST/gRPC) y asíncronas (Kafka/RabbitMQ) dibujadas distinto. Las rutas de gateway y la configuración de mensajería se editan en paneles aparte, no en el canvas. Al exportar, cada servicio se manda al backend de apigen y vuelve compilado; el resultado se empaqueta en un único proyecto multi-servicio.'
    ),
    block('De un vistazo', 'h3'),
    bullet('~152.000 líneas de TypeScript/TSX productivo en 342 componentes'),
    bullet('10 stores de Zustand, 39 schemas de Zod validando el modelo'),
    bullet('Canvas React Flow con auto-layout de ELK, undo/redo y atajos de teclado'),
    bullet('Más de 1.100 tests automatizados (Vitest) y 63 escenarios e2e (Playwright)'),
    block('Las restricciones que me puse', 'h2'),
    bullet(
      'Más allá del modelado de una sola app. Studio tiene que manejar arquitectura servicio-a-servicio, no solo las entidades de un servicio.'
    ),
    bullet(
      'La validación ocurre mientras editás, no después de generar. El usuario ve los conflictos e incompatibilidades en vivo, antes de exportar.'
    ),
    bullet(
      'La importación tiene que ser segura. Traer un schema SQL o un contrato OpenAPI dispara un snapshot previo, así las operaciones destructivas son recuperables.'
    ),
    bullet(
      'El demo es público desde el día uno. Cualquiera puede abrir https://apigen-web.vercel.app y probar el editor sin cuenta.'
    ),
    block('Mi rol', 'h2'),
    block(
      'Desarrollador único. Arrancó el 20 de enero de 2026 — dos días después de que APiGen pivoteara a una plataforma completa de generación de código. Diseñé cada pantalla, escribí cada línea. 440 commits en 18 días activos; el proyecto salió en un sprint corto e intenso.'
    ),
    block('Cómo empezó Studio', 'h2'),
    block(
      'Tomé bootify.io como referencia. El flujo de generación de una sola app que ofrece es limpio y útil, pero en el momento en que la pregunta pasa a ser "¿cómo se hablan estos tres servicios entre sí?" la herramienta no tiene respuesta. Ese hueco es exactamente donde pasa el trabajo que importa.'
    ),
    block(
      'Studio se construyó para llenar ese hueco. El modelado de entidades es lo mínimo esperable; el diseñador de microservicios es el punto.'
    ),
    block('Decisiones clave', 'h2'),
    block('1. Diseñador de microservicios — más allá del modelado de entidades', 'h3'),
    block(
      'La decisión de producto más determinante. Studio no es un "clon de bootify.io". Suma un diseñador servicio-a-servicio: varios servicios en un canvas, conexiones entre ellos, un diseñador de rutas de gateway para el ruteo HTTP y un diseñador de eventos/mensajes para los flujos asíncronos —ambos en paneles dedicados, separados del canvas—, y una exportación multi-servicio que emite una arquitectura, no un solo proyecto.'
    ),
    block(
      'Ese es el diferenciador. El editor de entidades es la puerta de entrada que se siente familiar; el diseñador de microservicios es lo que hace que valga la pena usar Studio una vez que un equipo crece más allá de una sola app.'
    ),
    block(
      'Tradeoff: alcance. Un generador de una sola app es un producto acotado; un diseñador multi-servicio es una superficie mucho más grande. Más features significa más lugares donde romperse, más interacciones que validar, y más decisiones que diseñar. La apuesta es que la profundidad se paga sola en arquitecturas de tres o más servicios.'
    ),
    mermaid(
      `flowchart LR
  subgraph CANVAS["Canvas (React Flow)"]
    ENT["Entities + relations"]
    SVC["Services + connections"]
  end
  subgraph PANELS["Form panels (not canvas)"]
    GW["Gateway routes"]
    EV["Event / message flows"]
  end
  CANVAS --> MODEL["Studio model (Zod-validated)"]
  PANELS --> MODEL
  MODEL --> EXPORT["Multi-format export"]
  EXPORT --> ZIP["Spring Boot ZIP"]
  EXPORT --> JSON["JSON model"]
  EXPORT --> DDL["SQL DDL"]
  EXPORT --> IMG["PNG / SVG"]
  ZIP -->|feeds| APIGEN["APiGen"]`,
      'Lo que diseñás en el canvas se exporta como una arquitectura multi-servicio (no una sola app) y alimenta a APiGen. Ese es el diferenciador.'
    ),
    block('2. El layout como lógica, no como decoración', 'h3'),
    block(
      'Cuando hay relaciones entre nodos, Studio usa ELK para un layout de grafo por capas. Cuando no las hay, cae en una ubicación por grilla. El mismo enfoque aplica a los mapas servicio-a-servicio. El layout es parte de la lógica del producto — predecible, determinista, repetible entre importaciones — no una pasada cosmética al final.'
    ),
    block(
      'Tradeoff: acoplamiento del layout. Cambiar el algoritmo de layout se vuelve un cambio a nivel producto, no un retoque de CSS. La contrapartida es que dos usuarios importando el mismo archivo OpenAPI ven el mismo layout, lo que hace posible la revisión y la colaboración.'
    ),
    block('3. Client-heavy con persistencia segura', 'h3'),
    block(
      'Toda la edición, validación y preview corre en el cliente — sin ida y vuelta al backend mientras modelás. Los stores de Zustand manejan las preocupaciones del editor por separado; Zod valida las importaciones y la estructura del proyecto; React Flow maneja el canvas.'
    ),
    block(
      'La persistencia es la red de seguridad. Autosave a IndexedDB en cada cambio significativo. Historial de snapshots retenido por proyecto para que los usuarios puedan volver atrás. Snapshots de seguridad previos a la importación, así una importación destructiva se puede recuperar si el merge sale mal. El principio: client-heavy está bien mientras no se pueda perder trabajo.'
    ),
    mermaid(
      `flowchart TD
  subgraph CLIENT["Browser - no backend round-trip"]
    RF["React Flow canvas"]
    ZS["Zustand stores (per concern)"]
    ZOD["Zod validation"]
    ELK["ELK layout / grid fallback"]
  end
  CLIENT --> IDB["IndexedDB"]
  IDB --> AS["Autosave on every change"]
  IDB --> SNAP["Snapshot history"]
  IDB --> PRE["Pre-import safety snapshot"]`,
      'Todo el modelado corre en el cliente; IndexedDB es la red de seguridad (autosave + historial + snapshot pre-import). Client-heavy sin perder trabajo.'
    ),
    block('Qué puede hacer Studio hoy', 'h2'),
    bullet(
      'Modelado visual de entidades con relaciones, generación de CRUD, y mapeo de tipos a Java/Spring.'
    ),
    bullet(
      'Diseñador de microservicios — varios servicios, conexiones, diseñador de rutas de gateway, diseñador de eventos/mensajes, exportación multi-servicio.'
    ),
    bullet(
      'Importación de schemas SQL y contratos OpenAPI con merge consciente de conflictos y snapshots de seguridad previos a la importación.'
    ),
    bullet(
      'Auto-layout con ELK (por capas cuando hay relaciones) y fallback a grilla. La misma lógica aplicada a los mapas servicio-a-servicio.'
    ),
    bullet(
      'Autosave a IndexedDB, historial de snapshots retenido, flujos de recuperación de versiones.'
    ),
    bullet(
      'Exportación multiformato — ZIP de un proyecto Spring Boot listo para correr, modelo en JSON, SQL DDL, y diagramas del canvas en PNG/SVG. La exportación multi-servicio empaqueta los servicios por separado o en un único archivo combinado.'
    ),
    bullet(
      'Edición keyboard-first con cobertura total de atajos. Accesibilidad WCAG 2.1 AA en las superficies que no son el canvas.'
    ),
    bullet(
      'Playwright Component Testing para las interacciones del canvas más tests end-to-end para los flujos completos del editor.'
    ),
    block('Qué reconsideraría', 'h2'),
    block(
      'Mantine 8 como framework de UI. Está bien construido y sacó el producto rápido, pero ata el editor a sus convenciones de diseño y sus componentes. Un enfoque más headless (Radix + un design system propio, o MUI con un theming más profundo) me habría dado más libertad para construir patrones específicos de editor — toolbars más densas, manejo del foco más controlado, contenedores de layout que encajen mejor con la edición de grafos.'
    ),
    block(
      'El README tiene una justificación para Mantine; en retrospectiva el tradeoff fue real. El producto avanzó más rápido al principio y paga un pequeño impuesto ahora cada vez que el editor necesita patrones de UI que pelean con los defaults de Mantine.'
    ),
    block('Foto de la arquitectura', 'h2'),
    block('Aplicación solo-navegador, sin backend propio:'),
    bullet(
      'React 19 + TypeScript 5.9 + Vite 7 — toolchain moderno, HMR rápido, builds optimizados.'
    ),
    bullet(
      'Mantine 8 para las primitivas de UI; React Flow para el canvas; ELK para el layout de grafo por capas con fallback a grilla.'
    ),
    bullet(
      'Zustand para el estado del editor, segmentado por preocupación; Zod para la validación de importaciones y el schema del proyecto.'
    ),
    bullet(
      'IndexedDB para el autosave + el historial de snapshots; snapshots de seguridad previos a los merges destructivos.'
    ),
    bullet(
      'Playwright (end-to-end + Component Testing) más Vitest para los tests unitarios. SonarQube integrado.'
    ),
    bullet('Desplegado en Vercel; imágenes Docker disponibles para despliegues self-hosted.'),
  ],
  bodyEn: [
    block(
      'apigen generates from a schema, but deciding how the system is structured —what entities exist, how they group into services, what talks to what and over which protocol— is easier to reason about by seeing it than by writing it. apigen Studio is that visual layer, and it works the same for a single service (monolith) as for several services talking to each other (microservices).'
    ),
    block(
      'The model is built on a canvas (React Flow with ELK auto-layout): entities and services as nodes, relations and service-to-service connections as edges, with synchronous (REST/gRPC) and asynchronous (Kafka/RabbitMQ) connections drawn differently. Gateway routes and messaging configuration are edited in separate panels, not on the canvas. On export, each service is sent to the apigen backend and comes back compiled; the result is packaged into a single multi-service project.'
    ),
    block('At a glance', 'h3'),
    bullet('~152,000 lines of production TypeScript/TSX across 342 components'),
    bullet('10 Zustand stores, 39 Zod schemas validating the model'),
    bullet('React Flow canvas with ELK auto-layout, undo/redo and keyboard shortcuts'),
    bullet('Over 1,100 automated tests (Vitest) and 63 e2e scenarios (Playwright)'),
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
      'The most consequential product decision. Studio is not "bootify.io clone". It adds a service-to-service designer: multiple services on one canvas, connections between them, a gateway route designer for HTTP routing and an event/message designer for async flows —both in dedicated panels, separate from the canvas—, and a multi-service export that emits an architecture, not a single project.'
    ),
    block(
      'That is the differentiator. The entity editor is the entry point that feels familiar; the microservices designer is what makes Studio worth using once a team grows past one app.'
    ),
    block(
      'Tradeoff: scope. A single-app generator is a tractable product; a multi-service designer is much larger surface area. More features means more places to break, more interactions to validate, and more decisions to design. The bet is that the depth pays back on architectures with three or more services.'
    ),
    mermaid(
      `flowchart LR
  subgraph CANVAS["Canvas (React Flow)"]
    ENT["Entities + relations"]
    SVC["Services + connections"]
  end
  subgraph PANELS["Form panels (not canvas)"]
    GW["Gateway routes"]
    EV["Event / message flows"]
  end
  CANVAS --> MODEL["Studio model (Zod-validated)"]
  PANELS --> MODEL
  MODEL --> EXPORT["Multi-format export"]
  EXPORT --> ZIP["Spring Boot ZIP"]
  EXPORT --> JSON["JSON model"]
  EXPORT --> DDL["SQL DDL"]
  EXPORT --> IMG["PNG / SVG"]
  ZIP -->|feeds| APIGEN["APiGen"]`,
      'What you design on the canvas is exported as a multi-service architecture (not a single app) and feeds APiGen. That is the differentiator.'
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
    mermaid(
      `flowchart TD
  subgraph CLIENT["Browser - no backend round-trip"]
    RF["React Flow canvas"]
    ZS["Zustand stores (per concern)"]
    ZOD["Zod validation"]
    ELK["ELK layout / grid fallback"]
  end
  CLIENT --> IDB["IndexedDB"]
  IDB --> AS["Autosave on every change"]
  IDB --> SNAP["Snapshot history"]
  IDB --> PRE["Pre-import safety snapshot"]`,
      'All the modeling runs in the client; IndexedDB is the safety net (autosave + history + pre-import snapshot). Client-heavy without losing work.'
    ),
    block('What Studio Can Do Today', 'h2'),
    bullet('Visual entity modeling with relations, CRUD generation, and Java/Spring type mapping.'),
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
      'Multi-format export — ZIP of a ready-to-run Spring Boot project, JSON model, SQL DDL, and PNG/SVG canvas diagrams. Multi-service export bundles individual services or one combined archive.'
    ),
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
};
