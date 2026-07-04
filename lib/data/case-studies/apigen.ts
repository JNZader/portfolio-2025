import type { Project as SanityProject } from '@/types/sanity';
import { block, bullet, mermaid } from './blocks';

export const apigen: SanityProject = {
  _id: 'apigen',
  title: 'APiGen',
  slug: {
    current: 'apigen',
  },
  excerpt:
    'Una plataforma de generación de código: de un schema SQL o un contrato OpenAPI a un servicio backend que compila —no un scaffold, un servicio con forma de producción que seguís manejando después.',
  excerptEn:
    'A code-generation platform: from a SQL schema or an OpenAPI contract to a backend service that compiles —not a scaffold, a production-shaped service you keep owning afterward.',
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
    block(
      'Crear un servicio CRUD en Spring Boot es siempre el mismo camino: la entidad, el repository, el service, el controller, los DTOs, el setup de seguridad, el cableado de observabilidad. Es trabajo mecánico, y cuando se repite entre varios equipos, cada servicio termina con convenciones apenas distintas. Esa divergencia es cara de revertir después.'
    ),
    block(
      'apigen toma un schema SQL o un contrato OpenAPI y genera ese servicio completo: persistencia, seguridad, observabilidad, Dockerfile, manifiestos de Kubernetes, CI. La diferencia con un scaffolder es que el output sigue siendo editable —podés sobrescribir templates sin forkear, y previsualizar antes de generar.'
    ),
    block(
      'Genera para 12 combinaciones de lenguaje y framework. Nueve de ellas pasan por un job de CI que compila el proyecto generado con el toolchain nativo de cada lenguaje (go build, cargo check, dotnet build, tsc) en lugar de comparar contra strings esperados. Esa distinción importa: un golden test en verde no garantiza que el código compile.'
    ),
    block('De un vistazo', 'h3'),
    bullet('~510.000 líneas de Java en 24 módulos Gradle, 8.406 tests'),
    bullet('12 combinaciones de lenguaje/framework; 9 con gate de compilación nativo en CI'),
    bullet(
      '9 dialectos de base de datos; deploy a 4 nubes (AWS, Azure, GCP, DigitalOcean) con Terraform'
    ),
    bullet('458 pull requests mergeados en ~5,5 meses'),
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
      '12 combinaciones de lenguaje/framework de destino — Java/Spring, Kotlin, Python, Node/TypeScript, Go, Rust, C#, PHP, Ruby, Scala, Elixir, Clojure.'
    ),
    bullet(
      '9 dialectos de base de datos soportados — PostgreSQL, MySQL, MariaDB, Oracle, SQL Server, SQLite, MongoDB, Cassandra, Redis.'
    ),
    bullet('REST, GraphQL y gRPC desde el mismo modelo — sin duplicar lógica entre protocolos.'),
    bullet(
      'Features enterprise incluidas por default: soft delete, multi-tenancy, auditoría con Hibernate Envers, optimistic locking, reportes de compliance GDPR/SOC2/PCI — 100+ entre todos los módulos.'
    ),
    bullet(
      'Caché multinivel out of the box: Caffeine (en proceso) + Redis (distribuido), con políticas cache-aside generadas por entidad.'
    ),
    bullet('4 nubes de destino — AWS, Azure, GCP, DigitalOcean, con salida en Terraform.'),
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
      'Crecer a lo ancho primero. APiGen escaló hacia afuera rápido — 12 combinaciones de lenguaje/framework, 9 dialectos de base de datos, 13 feature packs — mientras que Java/Spring es el único destino en el que tengo plena confianza operativa. La plataforma parece completa en el papel, pero un usuario que cae en Elixir o Clojure recibe un camino menos maduro que uno que cae en Java.'
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
    bullet('mcp/ — servidores MCP en Java + Python que exponen el engine a los asistentes de IA.'),
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
    block(
      'Creating a CRUD service in Spring Boot is always the same path: the entity, the repository, the service, the controller, the DTOs, the security setup, the observability wiring. It is mechanical work, and when it repeats across teams, each service ends up with slightly different conventions. That divergence is expensive to reverse later.'
    ),
    block(
      'apigen takes a SQL schema or an OpenAPI contract and generates that whole service: persistence, security, observability, Dockerfile, Kubernetes manifests, CI. The difference from a scaffolder is that the output stays editable —you can override templates without forking, and preview before generating.'
    ),
    block(
      "It generates for 12 language/framework combinations. Nine of them go through a CI job that compiles the generated project with each language's native toolchain (go build, cargo check, dotnet build, tsc) instead of comparing against expected strings. That distinction matters: a green golden test does not guarantee the code compiles."
    ),
    block('At a glance', 'h3'),
    bullet('~510,000 lines of Java across 24 Gradle modules, 8,406 tests'),
    bullet('12 language/framework targets; 9 with a native compile gate in CI'),
    bullet(
      '9 database dialects; deploys to 4 clouds (AWS, Azure, GCP, DigitalOcean) via Terraform'
    ),
    bullet('458 merged pull requests over ~5.5 months'),
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
      '12 language/framework targets — Java/Spring, Kotlin, Python, Node/TypeScript, Go, Rust, C#, PHP, Ruby, Scala, Elixir, Clojure.'
    ),
    bullet(
      '9 database dialects supported — PostgreSQL, MySQL, MariaDB, Oracle, SQL Server, SQLite, MongoDB, Cassandra, Redis.'
    ),
    bullet('REST, GraphQL and gRPC from the same model — no logic duplication across protocols.'),
    bullet(
      'Enterprise features built in by default: soft delete, multi-tenancy, Hibernate Envers auditing, optimistic locking, GDPR/SOC2/PCI compliance reports — 100+ across modules.'
    ),
    bullet(
      'Multi-level cache out of the box: Caffeine (in-process) + Redis (distributed), with cache-aside policies generated per entity.'
    ),
    bullet('4 cloud targets — AWS, Azure, GCP, DigitalOcean, with Terraform output.'),
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
      'Growing breadth-first. APiGen scaled outward fast — 12 language/framework targets, 9 database dialects, 13 feature packs — while Java/Spring is the only target where I have full operational confidence. The platform looks comprehensive on paper, but a user landing on Elixir or Clojure gets a less mature path than a user landing on Java.'
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
};
