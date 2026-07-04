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

// Architecture diagram block (rendered by PortableTextRenderer's `mermaid` type).
// Cast through unknown: this is a custom PortableText block, not a standard one.
function mermaid(chart: string, caption?: string): PortableTextBlock {
  return {
    _key: `mermaid-${chart.replace(/[^a-z0-9]+/gi, '-').slice(0, 24) || 'diagram'}`,
    _type: 'mermaid',
    chart,
    caption,
  } as unknown as PortableTextBlock;
}

const LOCAL_PROJECTS: SanityProject[] = [
  {
    _id: 'apigen',
    title: 'APiGen',
    slug: {
      current: 'apigen',
    },
    excerpt:
      'Una plataforma de generación de código que convierte un schema SQL o un contrato OpenAPI en un servicio backend funcionando — 12 lenguajes de destino, 15+ bases de datos, tres stacks de nube.',
    excerptEn:
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
    displayOrder: 2,
    body: [
      block('El problema', 'h2'),
      block(
        'Todo proyecto Spring Boot empieza en el mismo lugar. Escribís la entidad, después el repositorio, después el service, después el controller, después los DTOs, después el mismo setup de seguridad, después el mismo cableado de observabilidad. Seis meses más tarde comparás dos servicios del mismo equipo y cada uno eligió convenciones apenas distintas. Multiplicá eso entre varios equipos.'
      ),
      block(
        'Quería algo que convirtiera un schema SQL o un contrato OpenAPI en un servicio funcionando con un solo comando — y que siguiera siendo útil después de que lo personalizara.'
      ),
      block('Qué hace APiGen', 'h2'),
      block(
        'Apuntalo a un schema SQL o a una spec OpenAPI. Te devuelve un servicio con forma de producción: endpoints REST, capa de persistencia, seguridad cableada, observabilidad instrumentada, Dockerfile, manifiestos de Kubernetes, pipeline de CI. Podés previsualizar antes de generar, sobrescribir templates localmente sin forkear, y manejar el mismo engine desde CLI, servidor HTTP, plugin de IDE o MCP.'
      ),
      mermaid(
        `erDiagram
  CATEGORY ||--o{ CATEGORY : "parent of"
  CUSTOMER ||--o{ ORDER : places
  CUSTOMER ||--o{ ADDRESS : has
  CUSTOMER ||--o{ REVIEW : writes
  CUSTOMER ||--o{ WISHLIST : owns
  ADDRESS ||--o{ ORDER : "ships / bills"
  ORDER ||--|{ ORDERITEM : contains
  PRODUCT ||--o{ ORDERITEM : "appears in"
  PRODUCTVARIANT ||--o{ ORDERITEM : specifies
  PRODUCT ||--o{ PRODUCTVARIANT : has
  PRODUCT ||--o{ PRODUCTIMAGE : has
  PRODUCT ||--o{ REVIEW : receives
  PRODUCT ||--o{ WISHLIST : "saved in"
  PRODUCT }o--|| CATEGORY : "in"
  PRODUCT }o--|| BRAND : by
  PRODUCT ||--o{ PRODUCTTAG : has
  TAG ||--o{ PRODUCTTAG : in`,
        'El schema de ejemplo (14 tablas) que apigen consume en el demo del hero — relaciones tomadas del examples/ecommerce-schema.sql real del repo. coupons no aparece: no tiene FKs (el cupón se resuelve por código).'
      ),
      block('Las restricciones que me puse', 'h2'),
      bullet(
        'Contract-first y nada más. La fuente de verdad es el archivo SQL o el OpenAPI. Sin un DSL de configuración montado encima.'
      ),
      bullet(
        'El código generado tiene que compilar y pasar los tests al primer intento. Nada de scaffolding que haya que arreglar a mano.'
      ),
      bullet(
        'Las personalizaciones viven al lado del proyecto, en .apigen/templates. No en un fork.'
      ),
      bullet(
        'Un solo engine, todas las interfaces. CLI, servidor, plugin de IDE y MCP consumen el mismo núcleo de generación. Sin duplicación.'
      ),
      block('Mi rol', 'h2'),
      block(
        'Desarrollador único. Arrancó en diciembre de 2024 como una librería REST genérica de Spring Boot. Diseñé cada módulo, escribí cada línea que no se autogeneraba. Mi background en Java/Spring me dio la opinión para codificar; APiGen es la plataforma alrededor de esa opinión.'
      ),
      block('Cómo empezó APiGen, y por qué creció', 'h2'),
      block(
        'APiGen empezó en diciembre de 2024 como una librería REST genérica de Spring Boot — el repositorio linkeado arriba. El código original es un patrón de base-controller / base-service / base-repository con generics, auditoría con Hibernate Envers, conversión con ModelMapper, manejo centralizado de excepciones y paginación, sobre Spring Boot 3 y Java 21.'
      ),
      block(
        'El objetivo era modesto: codificar mis convenciones preferidas para dejar de reescribir los mismos controllers, el mismo setup de seguridad, los mismos manejadores de excepciones en cada servicio.'
      ),
      block(
        'A medida que la librería maduró durante 2025, la pregunta cambió. Si las convenciones ya están codificadas, ¿por qué el usuario tiene que escribir las entidades siquiera? ¿Por qué no generarlas desde el schema? Y después: si el engine puede generar Java/Spring, ¿por qué no Kotlin? ¿Python? ¿Go?'
      ),
      block(
        'Para enero de 2026 el proyecto se convirtió en una plataforma completa de generación de código — la versión que describe el resto de esta página. El link de arriba apunta a la librería genérica original para que el punto de partida sea verificable; la plataforma que creció a partir de ahí no es pública.'
      ),
      block('Decisiones clave', 'h2'),
      block('1. Pipeline desacoplado: parsing → IR → renderizado de templates', 'h3'),
      block(
        'La decisión temprana más determinante. Los parsers (SQL, OpenAPI) producen una representación intermedia normalizada. Los templates consumen ese IR. Ninguno de los dos lados sabe que el otro existe.'
      ),
      block(
        'Esa separación es lo que hizo pensables los 12 lenguajes de destino. Sumar Kotlin no toca el parser de SQL. Sumar GraphQL no toca el pipeline de codegen.'
      ),
      block(
        'Tradeoff: el IR es rígido por diseño. No hay atajo desde "esta rareza de OpenAPI" directo a "esta anotación de Java". Cada atajo tiene que pasar por el IR, o la abstracción deja de rendir.'
      ),
      mermaid(
        `flowchart LR
  SQL["SQL schema"] --> P["Parsers"]
  OAS["OpenAPI contract"] --> P
  P --> IR["Normalized IR"]
  IR --> GEN["Language generators"]
  GEN --> OUT["12 target languages"]
  PACKS["Feature packs (opt-in)"] -. compose .-> GEN`,
        'Parsers y templates no se conocen entre sí: todo pasa por el IR. Por eso sumar un lenguaje no toca el parser SQL, y sumar un protocolo no toca el pipeline de codegen.'
      ),
      mermaid(
        `sequenceDiagram
  actor Dev
  Dev->>CLI: apigen generate --from sql
  CLI->>Parser: parse SQL / OpenAPI
  Parser->>IR: build normalized IR
  IR->>Generators: render per target language
  Generators-->>CLI: 199 files (5 layers/table + scaffold)
  CLI-->>Dev: ./shop-api ready to run`,
        'El mismo pipeline visto en runtime: un `apigen generate` de punta a punta, del schema a 199 archivos que arrancan. Es el run real del terminal del hero.'
      ),
      block('2. Features como módulos Gradle opt-in', 'h3'),
      block(
        'APiGen trae 22 módulos: 4 librerías, 4 generadores, 13 feature packs (gateway, GraphQL, gRPC, chaos engineering, recomendación, analytics, BFF, notificaciones, búsqueda, observabilidad, y más), y una capa MCP.'
      ),
      block(
        'Las features no son flags siempre-encendidas. Son módulos separados a los que un proyecto se suscribe. Un equipo que necesita gRPC incluye el pack de gRPC; uno que no lo necesita no arrastra nada extra en su build. Cada pack se versiona de forma independiente — el pack de chaos puede avanzar sin tocar el de gateway.'
      ),
      block(
        'Tradeoff: disciplina en los límites de los módulos. Cada feature pack paga un pequeño costo de setup y de mantenimiento de contrato. Dejar que las features se filtraran al core habría hecho la experiencia temprana más rápida — y la limpieza posterior mucho peor.'
      ),
      block('3. Un engine, cuatro superficies de entrega', 'h3'),
      block(
        'El mismo engine de codegen corre detrás de una CLI (generación local, preview, validación), un servidor HTTP (endpoints de preview, flujos compartidos por el equipo), un plugin de IDE (autoría dentro del editor) y un servidor MCP (los asistentes de IA manejan la generación como una herramienta).'
      ),
      block(
        'Elegir esto el día uno obligó a que el engine tuviera forma de librería desde el principio, no una CLI con una API atornillada después. Eso hizo que la integración con MCP saliera casi gratis cuando llegó.'
      ),
      mermaid(
        `flowchart TD
  CLI["CLI"] --> ENG["Generation engine (core + IR)"]
  HTTP["HTTP server"] --> ENG
  IDE["IDE plugin"] --> ENG
  MCP["MCP server"] --> ENG`,
        'El mismo engine detrás de las cuatro superficies. Por ser library-shaped desde el día uno, integrar MCP fue casi gratis.'
      ),
      block('Qué puede hacer APiGen hoy', 'h2'),
      bullet(
        '12 lenguajes de destino — Java/Spring, Kotlin, Python, Node/TypeScript, Go, Rust, C#, PHP, Ruby, Scala, Elixir, Clojure.'
      ),
      bullet(
        '15+ bases de datos soportadas — PostgreSQL, MySQL, MariaDB, Oracle, SQL Server, SQLite, MongoDB, Cassandra, Redis, y más.'
      ),
      bullet('REST, GraphQL y gRPC desde el mismo modelo — sin duplicar lógica entre protocolos.'),
      bullet(
        'Features enterprise incluidas por default: soft delete, multi-tenancy, auditoría con Hibernate Envers, optimistic locking, reportes de compliance GDPR/SOC2/PCI — 100+ entre todos los módulos.'
      ),
      bullet(
        'Caché multinivel out of the box: Caffeine (en proceso) + Redis (distribuido), con políticas cache-aside generadas por entidad.'
      ),
      bullet('3 stacks de nube de destino — AWS, GCP, Azure, con salida en Terraform.'),
      bullet('Cobertura mínima de 60% de líneas / 50% de ramas, exigida en CI.'),
      bullet(
        'Tests de contrato (Spring Cloud Contract) sobre la librería core + microbenchmarks JMH sobre el engine de generación.'
      ),
      mermaid(
        `flowchart LR
  MODEL["Domain model (from IR)"] --> REST["REST controllers"]
  MODEL --> GQL["GraphQL resolvers"]
  MODEL --> GRPC["gRPC services"]`,
        'Un solo modelo, derivado del IR, expone los tres protocolos — sin reescribir lógica de negocio.'
      ),
      block('Qué reconsideraría', 'h2'),
      block(
        'Crecer a lo ancho primero. APiGen escaló hacia afuera rápido — 12 lenguajes, 15 bases de datos, 13 feature packs — mientras que Java/Spring es el único destino en el que tengo plena confianza operativa. La plataforma parece completa en el papel, pero un usuario que cae en Elixir o Clojure recibe un camino menos maduro que uno que cae en Java.'
      ),
      block(
        'Si empezara de nuevo, comprimiría la matriz. Dos lenguajes (Java + Python, o Java + Kotlin) y tres bases de datos (Postgres, MySQL, Mongo) a fondo antes de crecer a lo ancho. "Soporta 12 lenguajes" vende mejor que "soporta 2" — pero la reputación de ingeniería importa más que el marketing.'
      ),
      block('Foto de la arquitectura', 'h2'),
      block('22 módulos Gradle organizados en 4 capas:'),
      bullet(
        'libs/ — core (engine + IR), security, exceptions, bom (catálogo de dependencias compartido).'
      ),
      bullet('generator/ — cli, codegen, server, ide-plugins.'),
      bullet(
        'features/ — 13 packs opt-in (graphql, grpc, gateway, chaos, recommendation, analytics, bff, notifications, search, observability, y más).'
      ),
      bullet(
        'mcp/ — servidores MCP en Java + Python que exponen el engine a los asistentes de IA.'
      ),
      bullet(
        'Variantes de contenedor: Dockerfile estándar + Dockerfile.native para compilación native-image con GraalVM cuando importan el tiempo de arranque y la huella de memoria.'
      ),
      block(
        'El grafo de build se mantiene limpio porque el contrato lo hace cumplir el BOM compartido más la separación entre módulos de API e implementación. Sin ciclos, sin estado mutable compartido entre módulos.'
      ),
      mermaid(
        `flowchart TD
  subgraph LIBS["libs/ — foundation"]
    CORE["core: engine + IR"]
    SEC["security"]
    EXC["exceptions"]
    BOM["bom: shared deps"]
  end
  subgraph GEN["generator/"]
    CODEGEN["codegen"]
    CLI["cli"]
    SERVER["server"]
    IDE["ide-plugins"]
  end
  subgraph FEAT["features/: 13 opt-in packs"]
    PACKS["graphql, grpc, gateway, analytics, +9"]
  end
  subgraph MCPL["mcp/"]
    MCPS["Java + Python servers"]
  end
  CLI --> CODEGEN
  SERVER --> CODEGEN
  IDE --> CODEGEN
  CODEGEN --> CORE
  FEAT -. opt-in .-> CODEGEN
  MCPL --> CORE`,
        '22 módulos en 4 capas. generator/ depende del core+IR; los feature packs se enchufan en codegen sin tocar el core; el BOM gobierna versiones. Sin ciclos.'
      ),
    ],
    bodyEn: [
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
      mermaid(
        `erDiagram
  CATEGORY ||--o{ CATEGORY : "parent of"
  CUSTOMER ||--o{ ORDER : places
  CUSTOMER ||--o{ ADDRESS : has
  CUSTOMER ||--o{ REVIEW : writes
  CUSTOMER ||--o{ WISHLIST : owns
  ADDRESS ||--o{ ORDER : "ships / bills"
  ORDER ||--|{ ORDERITEM : contains
  PRODUCT ||--o{ ORDERITEM : "appears in"
  PRODUCTVARIANT ||--o{ ORDERITEM : specifies
  PRODUCT ||--o{ PRODUCTVARIANT : has
  PRODUCT ||--o{ PRODUCTIMAGE : has
  PRODUCT ||--o{ REVIEW : receives
  PRODUCT ||--o{ WISHLIST : "saved in"
  PRODUCT }o--|| CATEGORY : "in"
  PRODUCT }o--|| BRAND : by
  PRODUCT ||--o{ PRODUCTTAG : has
  TAG ||--o{ PRODUCTTAG : in`,
        "The example schema (14 tables) apigen consumes in the hero demo — relationships taken from the repo's real examples/ecommerce-schema.sql. coupons doesn't show up: it has no FKs (the coupon is resolved by code)."
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
      mermaid(
        `flowchart LR
  SQL["SQL schema"] --> P["Parsers"]
  OAS["OpenAPI contract"] --> P
  P --> IR["Normalized IR"]
  IR --> GEN["Language generators"]
  GEN --> OUT["12 target languages"]
  PACKS["Feature packs (opt-in)"] -. compose .-> GEN`,
        "Parsers and templates don't know about each other: everything goes through the IR. That's why adding a language doesn't touch the SQL parser, and adding a protocol doesn't touch the codegen pipeline."
      ),
      mermaid(
        `sequenceDiagram
  actor Dev
  Dev->>CLI: apigen generate --from sql
  CLI->>Parser: parse SQL / OpenAPI
  Parser->>IR: build normalized IR
  IR->>Generators: render per target language
  Generators-->>CLI: 199 files (5 layers/table + scaffold)
  CLI-->>Dev: ./shop-api ready to run`,
        'The same pipeline at runtime: an end-to-end `apigen generate`, from schema to 199 files that boot. This is the real run from the hero terminal.'
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
      mermaid(
        `flowchart TD
  CLI["CLI"] --> ENG["Generation engine (core + IR)"]
  HTTP["HTTP server"] --> ENG
  IDE["IDE plugin"] --> ENG
  MCP["MCP server"] --> ENG`,
        'The same engine behind all four surfaces. Because it was library-shaped from day one, wiring up MCP was almost free.'
      ),
      block('What APiGen Can Do Today', 'h2'),
      bullet(
        '12 target languages — Java/Spring, Kotlin, Python, Node/TypeScript, Go, Rust, C#, PHP, Ruby, Scala, Elixir, Clojure.'
      ),
      bullet(
        '15+ databases supported — PostgreSQL, MySQL, MariaDB, Oracle, SQL Server, SQLite, MongoDB, Cassandra, Redis, and more.'
      ),
      bullet('REST, GraphQL and gRPC from the same model — no logic duplication across protocols.'),
      bullet(
        'Enterprise features built in by default: soft delete, multi-tenancy, Hibernate Envers auditing, optimistic locking, GDPR/SOC2/PCI compliance reports — 100+ across modules.'
      ),
      bullet(
        'Multi-level cache out of the box: Caffeine (in-process) + Redis (distributed), with cache-aside policies generated per entity.'
      ),
      bullet('3 cloud target stacks — AWS, GCP, Azure, with Terraform output.'),
      bullet('60% line / 50% branch coverage minimum, gated in CI.'),
      bullet(
        'Contract tests (Spring Cloud Contract) on the core library + JMH microbenchmarks on the generation engine.'
      ),
      mermaid(
        `flowchart LR
  MODEL["Domain model (from IR)"] --> REST["REST controllers"]
  MODEL --> GQL["GraphQL resolvers"]
  MODEL --> GRPC["gRPC services"]`,
        'A single model, derived from the IR, exposes all three protocols — without rewriting business logic.'
      ),
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
      bullet(
        'Container variants: standard Dockerfile + Dockerfile.native for GraalVM native-image compilation when startup time and memory footprint matter.'
      ),
      block(
        'The build graph stays clean because the contract is enforced by the shared BOM plus separation of API and implementation modules. No cycles, no shared mutable state across modules.'
      ),
      mermaid(
        `flowchart TD
  subgraph LIBS["libs/ — foundation"]
    CORE["core: engine + IR"]
    SEC["security"]
    EXC["exceptions"]
    BOM["bom: shared deps"]
  end
  subgraph GEN["generator/"]
    CODEGEN["codegen"]
    CLI["cli"]
    SERVER["server"]
    IDE["ide-plugins"]
  end
  subgraph FEAT["features/: 13 opt-in packs"]
    PACKS["graphql, grpc, gateway, analytics, +9"]
  end
  subgraph MCPL["mcp/"]
    MCPS["Java + Python servers"]
  end
  CLI --> CODEGEN
  SERVER --> CODEGEN
  IDE --> CODEGEN
  CODEGEN --> CORE
  FEAT -. opt-in .-> CODEGEN
  MCPL --> CORE`,
        '22 modules in 4 layers. generator/ depends on core+IR; the feature packs plug into codegen without touching the core; the BOM governs versions. No cycles.'
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
      'Un diseñador visual para APIs Spring Boot y microservicios — modelá entidades, rutas de gateway y flujos de eventos, y exportá un proyecto multi-servicio.',
    excerptEn:
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
    displayOrder: 3,
    body: [
      block('El problema', 'h2'),
      block(
        'Herramientas como bootify.io te dejan diseñar visualmente una sola app Spring Boot — entidades, relaciones, CRUD básico, auth. Eso resuelve una parte del trabajo. No resuelve modelar una arquitectura de microservicios: varios servicios, las rutas entre ellos, los eventos que fluyen entre ellos, y la exportación de todo eso como un sistema coherente.'
      ),
      block(
        'Quería un diseñador visual que manejara el sistema, no solo la app. Un canvas donde modelo servicios, dibujo conexiones, configuro un gateway, armo flujos de eventos/mensajes, y exporto todo como un proyecto multi-servicio listo para alimentar a APiGen.'
      ),
      block('Qué hace Studio', 'h2'),
      block(
        'Studio es un diseñador visual en el navegador para APIs Spring Boot y microservicios. Modelás entidades y relaciones como en bootify.io, y después vas más allá: sumás varios servicios, cableás rutas de gateway, diseñás flujos de eventos/mensajes, validás la compatibilidad entre servicios, y exportás toda la arquitectura como un proyecto que APiGen puede generar. Importás schemas SQL o contratos OpenAPI, los editás visualmente con merge consciente de conflictos, y nunca perdés trabajo — el autosave en IndexedDB y el historial de snapshots vienen incluidos.'
      ),
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
        'La decisión de producto más determinante. Studio no es un "clon de bootify.io". Suma un diseñador servicio-a-servicio: varios servicios en un canvas, conexiones entre ellos, un diseñador de rutas de gateway para el ruteo HTTP, un diseñador de eventos/mensajes para los flujos asíncronos, y una exportación multi-servicio que emite una arquitectura, no un solo proyecto.'
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
    SVC["Services"]
    GW["Gateway routes"]
    EV["Event / message flows"]
  end
  CANVAS --> MODEL["Studio model (Zod-validated)"]
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
      mermaid(
        `flowchart LR
  subgraph CANVAS["Canvas (React Flow)"]
    ENT["Entities + relations"]
    SVC["Services"]
    GW["Gateway routes"]
    EV["Event / message flows"]
  end
  CANVAS --> MODEL["Studio model (Zod-validated)"]
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
  },
  {
    _id: 'biogas-platform',
    title: 'Biogas Platform',
    slug: {
      current: 'biogas-platform',
    },
    excerpt:
      'Una plataforma industrial para plantas de biogás — monitoreo en tiempo real, inferencia de ML en el edge en menos de 50ms, y una arquitectura de IA de tres capas para detección de anomalías y mantenimiento predictivo.',
    excerptEn:
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
    displayOrder: 1,
    body: [
      block('El problema', 'h2'),
      block(
        'Mi sobrino es ingeniero ambiental. Me contó cómo se gestionan las plantas de biogás en el día a día: planillas de Excel. Lecturas de sensores copiadas a mano, registros diarios que nadie analizaba después, decisiones tomadas por intuición porque el dato era inerte. Sin vista en tiempo real, sin detección de anomalías, sin mantenimiento predictivo, sin business intelligence — solo archivos que crecían cada semana y nunca se consultaban.'
      ),
      block(
        'La oportunidad era obvia. Reemplazar las planillas por una plataforma de verdad que ingiera el dato de los sensores, deje a los operarios trabajar desde ahí, y convierta el registro histórico en algo sobre lo que el negocio pueda actuar.'
      ),
      block('Qué hace Biogas Platform', 'h2'),
      block(
        'Una plataforma de operaciones completa para plantas de biogás. Los sensores transmiten datos por MQTT a un backend en Go; el dato aterriza en PostgreSQL con schemas pensados para series temporales; los operarios usan un dashboard web y una app mobile para los flujos diarios; un pipeline de ML en Python entrena modelos que se despliegan a un servicio edge en Rust para inferencia sub-50ms en la planta; un asistente de IA ayuda a los operarios a consultar el sistema en lenguaje natural. El flujo original de Excel desaparece.'
      ),
      mermaid(
        `flowchart LR
  PLC["PLCs / sensors"] -->|Modbus TCP/RTU| EDGE["Rust edge gateway"]
  EDGE -->|"HTTP batch sync (offline-first)"| BACK["Go backend (Gin)"]
  BROKER["Mosquitto MQTT"] --> BACK
  BACK --> DB["PostgreSQL + Redis"]
  BACK --> APPS["Web + mobile (role-aware)"]`,
        'Topología edge→cloud: el gateway Rust opera local (offline-first) y sincroniza con el backend cuando hay link; los sensores también entran por MQTT.'
      ),
      block('Las restricciones que me puse', 'h2'),
      bullet(
        'El edge tiene que funcionar sin internet. Las plantas pueden perder conectividad por horas; las operaciones y la detección de anomalías tienen que seguir corriendo localmente.'
      ),
      bullet(
        'Los modelos son activos de producción versionados. Nada de drops de modelos ad-hoc — cada modelo se entrena, se valida, se empaqueta como ONNX, se versiona en almacenamiento compatible con S3, y se despliega por un rollout controlado.'
      ),
      bullet(
        'Specs-driven desde el día uno. OpenSpec es la fuente de verdad para los contratos entre apps; ninguna API "se shippea nomás" sin una spec primero.'
      ),
      bullet(
        'Consciente de roles desde el arranque. Operarios de planta, personal técnico, supervisores y dueños ven vistas distintas y tienen capacidades distintas — el modelo de roles es parte de la capa de datos, no un agregado de la UI.'
      ),
      block('Mi rol', 'h2'),
      block(
        'Desarrollador único. Arrancó el 9 de febrero de 2026. Mi sobrino, ingeniero ambiental, es el experto de dominio que valida que el producto coincida con cómo operan las plantas de verdad. Yo me hice cargo de cada decisión técnica del stack:'
      ),
      bullet(
        'La estructura del monorepo — qué es una app, qué es un paquete compartido, qué es un servicio, y dónde caen los límites.'
      ),
      bullet(
        'La capa de contratos — OpenSpec como fuente de verdad entre apps antes de que se escriba una línea de código.'
      ),
      bullet(
        'El diseño del edge gateway en Rust — integración del protocolo Modbus, store SQLite offline-first con cola de sync, la disposición del subsistema de IA (agentes, clasificador, registro de modelos, LLM local), actualizaciones de modelos por OTA con artefactos firmados.'
      ),
      bullet(
        'La arquitectura de ML de tres capas — qué corre en el edge, qué corre en la nube, qué se entrena en batch, qué infiere en tiempo real, y cómo se mueven los modelos entre ellas.'
      ),
      bullet(
        'El modelo de roles — operarios, personal técnico, supervisores, dueños — como un concepto de la capa de datos, no un toggle de la UI.'
      ),
      bullet(
        'El plugin de Biome propio (eslint-plugin-biogas-ssot) que hace cumplir las convenciones de fuente-única-de-verdad entre apps en tiempo de lint.'
      ),
      bullet(
        'El pipeline de CI/CD en GitLab — versionado de modelos a almacenamiento compatible con S3, tests de paridad como gate de despliegue, rollouts controlados.'
      ),
      block('Cómo empezó Biogas Platform, y por qué creció', 'h2'),
      block(
        'Empezó como una conversación: mi sobrino describió la realidad del Excel, yo describí la plataforma que debería reemplazarlo. La primera versión era modesta — un backend en Go, una base Postgres, un dashboard básico. Ingerir el dato de los sensores, mostrarlo en un gráfico, reemplazar el registro diario.'
      ),
      block(
        'Una vez que el loop básico funcionó, las preguntas se apilaron. Si el dato está en una base de datos de verdad, ¿por qué no detectar anomalías automáticamente? Si detectamos anomalías, ¿por qué no predecir fallos? Si predecimos fallos, ¿por qué no correr la inferencia en la planta para que funcione offline? Si la corremos en la planta, ¿cómo actualizamos los modelos de forma segura? Cada respuesta sumó una capa, y la plataforma creció hasta lo que es hoy.'
      ),
      block('Decisiones clave', 'h2'),
      block('1. Edge gateway en Rust como nodo industrial autosuficiente', 'h3'),
      block(
        'El edge gateway es el corazón del sistema, no un wrapper delgado de inferencia. Es el componente que la planta corre localmente, y tiene que seguir funcionando cuando todo lo demás no está disponible — el enlace WAN, el backend en la nube, el registro de modelos. Por eso es la aplicación individual más grande de la plataforma: 74 archivos fuente en Rust, 18 subsistemas, versión 2.1.0, diseñado como un nodo industrial autónomo que, cuando puede, sincroniza con la nube.'
      ),
      block('Lo que el gateway hace realmente en la planta:'),
      bullet(
        'Habla con los PLCs por Modbus TCP/RTU — el protocolo industrial que los sensores y controladores realmente hablan. Registros holding, input, coils y discrete-input, con escala, offset y tipos de dato configurables (u16/i16/f32).'
      ),
      bullet(
        'Persiste cada lectura en un store SQLite local con una cola de sync, así una caída del enlace de salida solo demora la sincronización — nunca pierde dato. El sync es HTTP por lotes con reintento exponencial, circuit breaker y tamaños de lote configurables.'
      ),
      bullet(
        'Corre inferencia de ML localmente vía onnxruntime 2.0 (el crate ort) — detección de anomalías en cada lectura sin una ida y vuelta a la nube.'
      ),
      bullet(
        'Aloja un subsistema de IA local con modelos de lenguaje on-device (llama_cpp), clasificador, correlador, y un registro de modelos con selección consciente del hardware — elige el tamaño de modelo correcto para el gateway en el que está corriendo.'
      ),
      bullet(
        'Tiene un framework de agentes de IA: agente de ayuda, agente de consultas SQLite, agente de estado — agentes chicos y especializados con los que un operario puede hablar desde el dashboard de la planta sin ninguna conexión a la nube.'
      ),
      bullet(
        'Soporta actualizaciones OTA (over-the-air) con artefactos de modelo firmados con ed25519 — los modelos se descargan, se verifica su firma, y se despliegan sin reiniciar el gateway.'
      ),
      bullet(
        'Expone métricas Prometheus en :9090/metrics y health checks en :8888/health para el monitoreo; trae su propia PWA de dashboard embebida para que un operario pueda inspeccionar el estado sin una herramienta externa.'
      ),
      block(
        'Por qué Rust: un proceso que corre desatendido en el hardware de la planta durante semanas seguidas, haciendo IO en tiempo real con protocolos industriales e inferencia de ML, no puede permitirse memory leaks, pausas de GC, ni panics no manejados que tumben el gateway. Rust da rendimiento predecible, sin GC, y garantías en tiempo de compilación que encajan con el perfil operativo. El runtime async de Tokio hace realista coordinar el polling de Modbus, las escrituras a SQLite, el sync HTTP, y el subsistema de IA en un solo proceso.'
      ),
      block(
        'Por qué ONNX como formato de intercambio de modelos: el pipeline de entrenamiento en Python (scikit-learn para los modelos de anomalías, el stack de transformers para NLP) exporta a ONNX, y el runtime en Rust consume exactamente el mismo archivo. Los tests de paridad verifican que las salidas de Rust coincidan bit a bit con las de Python antes de que un modelo se promueva siquiera.'
      ),
      block(
        'Tradeoff: alcance y peso de mantenimiento. El edge gateway es prácticamente su propio producto dentro de la plataforma — trae su propia versión (2.1.0), su propio modelo de configuración (edge.toml), su propio dashboard, su propio tooling de CLI para la puesta en marcha (validar config, hacer un dry-run de una lectura de registro, convertir un CSV de tags en un borrador de edge.toml). Esa amplitud es la respuesta correcta para un nodo industrial, pero es una cantidad de código nada trivial para mantener sana junto con el resto de la plataforma.'
      ),
      mermaid(
        `flowchart LR
  TRAIN["Python training (scikit-learn)"] --> EXP["Export to ONNX"]
  EXP --> PARITY{"Parity: Rust == Python?"}
  PARITY -->|pass| S3["Versioned in S3 storage"]
  PARITY -->|fail| TRAIN
  S3 --> OTA["OTA deploy (ed25519-signed)"]
  OTA --> RT["Rust edge runtime"]`,
        'Ciclo de vida del modelo: entrenado en Python, exportado a ONNX, y un test de paridad (Rust == Python, bit-identical) es el gate antes de versionar y desplegar por OTA firmado.'
      ),
      block('2. Arquitectura de IA de tres capas', 'h3'),
      block(
        'En lugar de tratar el ML como una feature pegada a una pantalla, la plataforma tiene tres capas de IA explícitas, cada una con su propio propósito, presupuesto de latencia y ciclo de vida:'
      ),
      bullet(
        'Capa de inferencia en el edge — Isolation Forest + Autoencoder corriendo localmente sobre ONNX, puntuando anomalías en cada lectura de sensor en menos de 50ms.'
      ),
      bullet(
        'Capa de detección de anomalías — 32 features de ingeniería (temporales, de cambio, z-score, co-variación, calidad de dato, dominio-biogás) alimentadas a una votación por ensemble con umbrales dinámicos por sensor. Las atribuciones SHAP explican por qué se marcó una lectura.'
      ),
      bullet(
        'Capa de IA predictiva — LSTM + Prophet para el forecasting de biogás/energía, Random Forest + XGBoost para la predicción de fallos de equipo con 4-24 horas de anticipación, más recomendaciones de optimización de parámetros de operación. Aprendizaje continuo con reentrenamiento automatizado; la detección de drift basada en PSI monitorea la degradación de los modelos en producción.'
      ),
      block(
        'Cada capa es independiente: el edge sigue funcionando si la nube está caída; la detección de anomalías funciona sin la capa predictiva; la capa predictiva se puede reentrenar sin tocar el runtime del edge. La separación es lo que hace el sistema operable, no solo impresionante.'
      ),
      block(
        'Tradeoff: peso del ciclo de vida de los modelos. Tres capas significa tres pipelines de entrenamiento, tres registros de modelos, tres caminos de despliegue, tres conjuntos de monitoreo de drift. Es mucha infraestructura para que un solo dev la mantenga — solo vale la pena porque cada capa se paga sola en lo operativo.'
      ),
      mermaid(
        `flowchart TD
  R["Every sensor reading"] --> L1["Edge inference: Isolation Forest + Autoencoder (ONNX, <50ms)"]
  L1 --> L2["Anomaly detection: 32 features, ensemble voting, SHAP"]
  L2 --> L3["Predictive: LSTM + Prophet forecast, RF + XGBoost failure 4-24h"]
  L3 --> DRIFT["Continuous learning + PSI drift monitoring"]
  DRIFT -. retrain .-> L3`,
        'Tres capas de IA independientes: el edge sigue detectando anomalías aunque el cloud esté caído; la capa predictiva se reentrena sin tocar el runtime del edge.'
      ),
      block('3. Desarrollo spec-driven con OpenSpec desde el día uno', 'h3'),
      block(
        'El primer commit fue literalmente "init: project structure with openspec specs and tooling". Cada contrato entre apps — backend a frontend, edge a backend, servicio de ML a backend — tiene una spec antes de que se escriba una línea de código. OpenSpec es la fuente de verdad; la implementación tiene que coincidir con ella.'
      ),
      block(
        'Tradeoff: overhead de proceso al principio. Cada endpoint nuevo tarda más porque la spec va primero. El pago es que cuando un contrato cambia, todos los consumidores ven el diff explícito, y los asistentes de IA que generan el código cliente pueden usar la spec en vez de adivinar a partir de la implementación.'
      ),
      block('Qué puede hacer Biogas Platform hoy', 'h2'),
      bullet(
        '5 aplicaciones en un monorepo — backend en Go, edge gateway en Rust, servicio de ML en Python, frontend web en React/Vite, app mobile.'
      ),
      bullet(
        'Ingesta en tiempo real por MQTT (broker Mosquitto), persistencia en PostgreSQL con Redis para el dato caliente, schemas conscientes de series temporales.'
      ),
      bullet(
        'Edge gateway autónomo en Rust (v2.1.0) — Modbus TCP/RTU a los PLCs, SQLite offline-first con cola de sync, inferencia de anomalías sub-50ms sobre ONNX, LLM on-device con agentes de IA, actualizaciones de modelos por OTA con verificación de firma ed25519, PWA de dashboard embebida.'
      ),
      bullet(
        'IA de tres capas: detección de anomalías en el edge (Isolation Forest + Autoencoder), análisis de anomalías en la nube con explicabilidad SHAP, capa predictiva con forecasts LSTM + Prophet y predicciones de fallo Random Forest + XGBoost con 4-24h de anticipación.'
      ),
      bullet(
        'Mantenimiento predictivo basado en la condición real de cada equipo reemplaza el mantenimiento reactivo o por calendario, reduciendo las paradas no planificadas.'
      ),
      bullet(
        'UI consciente de roles para operarios, personal técnico, supervisores y dueños — vistas y permisos distintos, no toggles sobre un único dashboard.'
      ),
      bullet(
        'Contratos OpenSpec para cada API entre apps; el plugin de Biome propio (eslint-plugin-biogas-ssot) hace cumplir las convenciones de fuente-única-de-verdad en tiempo de lint.'
      ),
      bullet(
        'CI/CD en GitLab con almacenamiento de modelos versionado en object storage compatible con S3, rollouts de modelos controlados, y monitoreo de drift que alimenta las decisiones de reentrenamiento.'
      ),
      block('Qué reconsideraría', 'h2'),
      block(
        'Esperé demasiado para shippear algo. El instinto fue entregar un producto maduro — las tres capas de IA, la app mobile, el modelo de roles, la inferencia en el edge, todo bien hecho antes de mostrarlo. No es así como debería haber ido.'
      ),
      block(
        'Una entrega más chica y más temprana habría sido la decisión correcta. Un backend que ingiere el dato de los sensores y un dashboard que lo muestra, shippeados en la semana tres, le habrían dado a mi sobrino algo real para usar de inmediato. El feedback de la operación real de una planta habría moldeado las prioridades de lo que viene después. En cambio construí hacia afuera — sumando capas, apps y capacidades — antes de que nada de eso corriera contra el uso diario real.'
      ),
      block(
        'El costo es invisible desde afuera: la plataforma parece completa y la arquitectura es limpia. El costo está en lo que nunca aprendí porque nada estuvo frente a usuarios lo suficientemente temprano. El próximo producto que construya, voy a shippear la cosa más chica que resuelva el problema original en el primer mes, y ganarme el derecho a sumar capas desde ahí.'
      ),
      block('Foto de la arquitectura', 'h2'),
      block('Monorepo con cinco aplicaciones y paquetes de soporte:'),
      mermaid(
        `flowchart TD
  SPEC["OpenSpec contracts (single source of truth)"]
  subgraph MONO["Monorepo"]
    BACK["apps/backend - Go + Gin"]
    EDGE["apps/edge - Rust gateway"]
    ML["apps/ml - Python service"]
    WEB["apps/web - React + Vite"]
    MOBILE["apps/mobile"]
  end
  SPEC -. governs .-> MONO`,
        '5 apps en un monorepo, con OpenSpec como contrato único entre ellas (validado en lint con un plugin Biome propio).'
      ),
      bullet(
        'apps/backend — Go + GORM + Gin, API REST, suscriptor MQTT, OpenSpec como fuente de verdad.'
      ),
      bullet(
        'apps/edge-gateway — Rust (runtime async Tokio), cliente Modbus TCP/RTU a los PLCs, store local SQLite con cola de sync, inferencia con onnxruntime 2.0, LLM local vía llama_cpp, framework de agentes de IA, actualizaciones de modelos por OTA con firma ed25519, PWA de dashboard embebida, métricas Prometheus, endpoints de health.'
      ),
      bullet(
        'apps/ml-service — Python + scikit-learn, pipelines de entrenamiento, explicabilidad SHAP, exportación a ONNX con tests de paridad.'
      ),
      bullet(
        'apps/frontend-vite — React 19 + Vite + Mantine + Recharts, dashboards de operario y de analista.'
      ),
      bullet(
        'apps/mobile — app complementaria en Ionic + Capacitor + Vite para los flujos de campo del operario.'
      ),
      bullet(
        'packages/eslint-plugin-biogas-ssot — reglas de lint propias que hacen cumplir la fuente-única-de-verdad entre apps.'
      ),
      bullet(
        'services/ai-assistant — interfaz de consulta en lenguaje natural sobre el dato operativo.'
      ),
      block(
        'La persistencia es PostgreSQL para el estado canónico, Redis para el dato caliente y el caché, object storage compatible con S3 para los artefactos de modelo y los blobs grandes. La mensajería es Mosquitto MQTT. El despliegue es CI/CD en GitLab con imágenes Docker por app y ruteo en el edge basado en Caddyfile.'
      ),
    ],
    bodyEn: [
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
      mermaid(
        `flowchart LR
  PLC["PLCs / sensors"] -->|Modbus TCP/RTU| EDGE["Rust edge gateway"]
  EDGE -->|"HTTP batch sync (offline-first)"| BACK["Go backend (Gin)"]
  BROKER["Mosquitto MQTT"] --> BACK
  BACK --> DB["PostgreSQL + Redis"]
  BACK --> APPS["Web + mobile (role-aware)"]`,
        "Edge→cloud topology: the Rust gateway operates locally (offline-first) and syncs with the backend when there's a link; sensors also come in over MQTT."
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
      mermaid(
        `flowchart LR
  TRAIN["Python training (scikit-learn)"] --> EXP["Export to ONNX"]
  EXP --> PARITY{"Parity: Rust == Python?"}
  PARITY -->|pass| S3["Versioned in S3 storage"]
  PARITY -->|fail| TRAIN
  S3 --> OTA["OTA deploy (ed25519-signed)"]
  OTA --> RT["Rust edge runtime"]`,
        'Model lifecycle: trained in Python, exported to ONNX, and a parity test (Rust == Python, bit-identical) is the gate before versioning and deploying over signed OTA.'
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
        'Predictive AI layer — LSTM + Prophet for biogas/energy forecasting, Random Forest + XGBoost for equipment failure prediction 4-24 hours in advance, plus optimization recommendations for operating parameters. Continuous learning with automated retraining; PSI-based drift detection monitors model degradation in production.'
      ),
      block(
        'Each layer is independent: edge keeps working if the cloud is offline; anomaly detection works without the predictive layer; the predictive layer can be retrained without touching the edge runtime. The separation is what makes the system operable, not just impressive.'
      ),
      block(
        'Tradeoff: model lifecycle weight. Three layers means three training pipelines, three model registries, three deployment paths, three sets of drift monitoring. It is a lot of infrastructure for a single dev to maintain — only worth it because each layer pays back operationally.'
      ),
      mermaid(
        `flowchart TD
  R["Every sensor reading"] --> L1["Edge inference: Isolation Forest + Autoencoder (ONNX, <50ms)"]
  L1 --> L2["Anomaly detection: 32 features, ensemble voting, SHAP"]
  L2 --> L3["Predictive: LSTM + Prophet forecast, RF + XGBoost failure 4-24h"]
  L3 --> DRIFT["Continuous learning + PSI drift monitoring"]
  DRIFT -. retrain .-> L3`,
        'Three independent AI layers: the edge keeps detecting anomalies even if the cloud is down; the predictive layer retrains without touching the edge runtime.'
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
        'Three-layer AI: edge anomaly detection (Isolation Forest + Autoencoder), cloud anomaly analysis with SHAP explainability, predictive layer with LSTM + Prophet forecasts and Random Forest + XGBoost failure predictions 4-24h ahead.'
      ),
      bullet(
        'Predictive maintenance based on real equipment condition replaces reactive or calendar-based maintenance, reducing unplanned downtime.'
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
      mermaid(
        `flowchart TD
  SPEC["OpenSpec contracts (single source of truth)"]
  subgraph MONO["Monorepo"]
    BACK["apps/backend - Go + Gin"]
    EDGE["apps/edge - Rust gateway"]
    ML["apps/ml - Python service"]
    WEB["apps/web - React + Vite"]
    MOBILE["apps/mobile"]
  end
  SPEC -. governs .-> MONO`,
        '5 apps in one monorepo, with OpenSpec as the single contract between them (enforced at lint time by a custom Biome plugin).'
      ),
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

// Curated projects with an explicit displayOrder lead (ascending); everything
// else (GitHub/Sanity-only) follows, sorted by publishedAt descending.
function compareProjects(left: SanityProject, right: SanityProject): number {
  const lo = left.displayOrder ?? Number.POSITIVE_INFINITY;
  const ro = right.displayOrder ?? Number.POSITIVE_INFINITY;
  if (lo !== ro) return lo - ro;
  return getProjectTimestamp(right) - getProjectTimestamp(left);
}

/**
 * Hybrid merge: Sanity stays the source of truth for CMS-managed fields
 * (image, URLs, technologies, featured, dates, excerpt) so nothing authored in
 * Studio is discarded. The version-controlled local case study only contributes
 * the prose `body` — where the architecture diagrams live — and fills any field
 * Sanity left empty. Projects that exist only in Sanity or only locally render
 * entirely from their single source.
 */
export function mergeLocalAndSanityProjects(remoteProjects: SanityProject[]): SanityProject[] {
  const projectMap = new Map<string, SanityProject>();
  const localBySlug = new Map(LOCAL_PROJECTS.map((project) => [project.slug.current, project]));

  for (const remote of remoteProjects) {
    const local = localBySlug.get(remote.slug.current);
    if (local) {
      // Field-level merge: keep all Sanity fields, but let the curated local
      // body (with diagrams) win when present, and fall back to the local
      // displayOrder when Sanity didn't author one.
      projectMap.set(remote.slug.current, {
        ...remote,
        body: local.body && local.body.length > 0 ? local.body : remote.body,
        bodyEn: local.bodyEn && local.bodyEn.length > 0 ? local.bodyEn : remote.bodyEn,
        excerptEn: local.excerptEn ?? remote.excerptEn,
        displayOrder: remote.displayOrder ?? local.displayOrder,
      });
    } else {
      projectMap.set(remote.slug.current, remote);
    }
  }

  // Local-only projects (absent from Sanity) render entirely from local.
  for (const project of LOCAL_PROJECTS) {
    if (!projectMap.has(project.slug.current)) {
      projectMap.set(project.slug.current, project);
    }
  }

  return Array.from(projectMap.values()).sort(compareProjects);
}
