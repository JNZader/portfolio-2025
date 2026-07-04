import type { Project as SanityProject } from '@/types/sanity';
import { block, bullet, mermaid } from './blocks';

export const biogasPlatform: SanityProject = {
  _id: 'biogas-platform',
  title: 'Biogas Platform',
  slug: {
    current: 'biogas-platform',
  },
  excerpt:
    'Plataforma industrial para plantas de biogás en producción: ingesta de telemetría en tiempo real por MQTT, detección de anomalías en tres capas (edge en Rust + ONNX, ensemble en la nube) y multi-tenancy con row-level security real en Postgres.',
  excerptEn:
    'An industrial platform for biogas plants in production: real-time MQTT telemetry ingestion, three-layer anomaly detection (Rust + ONNX at the edge, a cloud ensemble), and multi-tenancy with real row-level security in Postgres.',
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
    block(
      'Las alarmas por umbral fijo son fáciles de escribir y malas para detectar deterioro gradual: cuando un sensor cruza el límite, la condición que lo llevó ahí ya lleva rato. Esta plataforma monitorea plantas de biogás en producción, ingiere su telemetría en tiempo real por MQTT, y apunta a esa brecha —la deriva que un umbral no ve.'
    ),
    block(
      'La detección corre en dos lugares a propósito. En el edge, cerca del sensor, un Z-score y un IsolationForest exportado a ONNX marcan anomalías al instante, sin depender de la red. En la nube, un ensemble más pesado (IsolationForest + LSTM) cruza el histórico que el edge no tiene. Si un modelo del edge no está cargado, esa capa cae a la anterior en vez de cortar la ingesta.'
    ),
    block(
      'La plataforma corre varias plantas, de distintos operadores, sobre la misma base de datos, así que el aislamiento no podía depender de acordarse de filtrar. Es row-level security real en Postgres, con el rol de la aplicación creado bajo NOBYPASSRLS: no puede saltear el aislamiento aunque una query se olvide del WHERE. El tenant se fija por sesión, no por convención.'
    ),
    block('De un vistazo', 'h3'),
    bullet('~580.000 líneas entre Go, Rust, Python y TypeScript'),
    bullet('124 tablas bajo RLS: 239 políticas, rol de aplicación bajo NOBYPASSRLS'),
    bullet('6.528 tests, con suite de integración contra Postgres real'),
    bullet('2.656 commits, 67 merge requests en ~5 meses; en producción'),
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
      'Capa de inferencia en el edge — Isolation Forest + Autoencoder corriendo localmente sobre ONNX, diseñada para baja latencia en el edge (objetivo interno: menos de 50ms, sin benchmark publicado).'
    ),
    bullet(
      'Capa de detección de anomalías — 32 features de ingeniería (temporales, de cambio, z-score, co-variación, calidad de dato, dominio-biogás) alimentadas a una votación por ensemble con umbrales dinámicos por sensor. Las atribuciones SHAP explican por qué se marcó una lectura.'
    ),
    bullet(
      'Capa de IA predictiva — LSTM + Prophet para el forecasting de biogás/energía, Random Forest + XGBoost para la predicción de fallos de equipo con 4-24 horas de anticipación, más recomendaciones de optimización de parámetros de operación. Aprendizaje continuo con reentrenamiento automatizado; la detección de drift basada en PSI monitorea la degradación de los modelos. Esta capa está marcada como demo en el código: el forecasting y la predicción de fallos no están productivizados todavía.'
    ),
    block(
      'Cada capa es independiente: el edge sigue funcionando si la nube está caída; la detección de anomalías funciona sin la capa predictiva; la capa predictiva se puede reentrenar sin tocar el runtime del edge. La separación es lo que hace el sistema operable, no solo impresionante.'
    ),
    block(
      'Tradeoff: peso del ciclo de vida de los modelos. Tres capas significa tres pipelines de entrenamiento, tres registros de modelos, tres caminos de despliegue, tres conjuntos de monitoreo de drift. Es mucha infraestructura para que un solo dev la mantenga — solo vale la pena porque cada capa se paga sola en lo operativo.'
    ),
    mermaid(
      `flowchart TD
  R["Every sensor reading"] --> L1["Edge inference: Isolation Forest + Autoencoder (ONNX, low-latency target)"]
  L1 --> L2["Anomaly detection: 32 features, ensemble voting, SHAP"]
  L2 --> L3["Predictive (demo): LSTM + Prophet forecast, RF + XGBoost failure 4-24h"]
  L3 --> DRIFT["Continuous learning + PSI drift monitoring"]
  DRIFT -. retrain .-> L3`,
      'Tres capas de IA independientes: el edge sigue detectando anomalías aunque el cloud esté caído; la capa predictiva se reentrena sin tocar el runtime del edge. La capa predictiva está marcada como demo en el código.'
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
      'Edge gateway autónomo en Rust (v2.1.0) — Modbus TCP/RTU a los PLCs, SQLite offline-first con cola de sync, inferencia de anomalías de baja latencia sobre ONNX (diseñada para <50ms), LLM on-device con agentes de IA, actualizaciones de modelos por OTA con verificación de firma ed25519, PWA de dashboard embebida.'
    ),
    bullet(
      'IA de tres capas: detección de anomalías en el edge (Isolation Forest + Autoencoder) y en la nube con explicabilidad SHAP —ambas en producción—, más una capa predictiva (forecasts LSTM + Prophet, predicciones de fallo Random Forest + XGBoost con 4-24h de anticipación) marcada como demo en el código, no productivizada.'
    ),
    bullet(
      'Mantenimiento predictivo por condición real de equipo es el objetivo de roadmap para reemplazar el mantenimiento reactivo o por calendario — hoy la capa predictiva que lo alimentaría está marcada como demo en el código, no productivizada.'
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
    block(
      'Fixed-threshold alarms are easy to write and bad at catching gradual deterioration: by the time a sensor crosses the limit, whatever drove it there has been going on for a while. This platform monitors biogas plants in production, ingests their telemetry in real time over MQTT, and targets that gap —the drift a threshold does not see.'
    ),
    block(
      'Detection runs in two places on purpose. At the edge, close to the sensor, a Z-score and an IsolationForest exported to ONNX flag anomalies instantly, with no dependency on the network. In the cloud, a heavier ensemble (IsolationForest + LSTM) cross-references history the edge does not have. If an edge model is not loaded, that layer falls back to the previous one instead of cutting off ingestion.'
    ),
    block(
      'The platform runs several plants, from different operators, on the same database, so isolation could not depend on remembering to filter. It is real row-level security in Postgres, with the application role created under NOBYPASSRLS: it cannot bypass isolation even if a query forgets the WHERE clause. The tenant is fixed per session, not by convention.'
    ),
    block('At a glance', 'h3'),
    bullet('~580,000 lines across Go, Rust, Python and TypeScript'),
    bullet('124 tables under RLS: 239 policies, application role running as NOBYPASSRLS'),
    bullet('6,528 tests, including an integration suite against real Postgres'),
    bullet('2,656 commits, 67 merge requests over ~5 months; in production'),
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
      'Edge inference layer — Isolation Forest + Autoencoder running locally on ONNX, designed for low edge latency (internal target: under 50ms, no published benchmark).'
    ),
    bullet(
      'Anomaly detection layer — 32 engineered features (temporal, change, z-score, co-variation, data quality, biogas-domain) fed into ensemble voting with dynamic per-sensor thresholds. SHAP attributions explain why a reading was flagged.'
    ),
    bullet(
      'Predictive AI layer — LSTM + Prophet for biogas/energy forecasting, Random Forest + XGBoost for equipment failure prediction 4-24 hours in advance, plus optimization recommendations for operating parameters. Continuous learning with automated retraining; PSI-based drift detection monitors model degradation. This layer is demo-labeled in the code: forecasting and failure prediction are not yet in production.'
    ),
    block(
      'Each layer is independent: edge keeps working if the cloud is offline; anomaly detection works without the predictive layer; the predictive layer can be retrained without touching the edge runtime. The separation is what makes the system operable, not just impressive.'
    ),
    block(
      'Tradeoff: model lifecycle weight. Three layers means three training pipelines, three model registries, three deployment paths, three sets of drift monitoring. It is a lot of infrastructure for a single dev to maintain — only worth it because each layer pays back operationally.'
    ),
    mermaid(
      `flowchart TD
  R["Every sensor reading"] --> L1["Edge inference: Isolation Forest + Autoencoder (ONNX, low-latency target)"]
  L1 --> L2["Anomaly detection: 32 features, ensemble voting, SHAP"]
  L2 --> L3["Predictive (demo): LSTM + Prophet forecast, RF + XGBoost failure 4-24h"]
  L3 --> DRIFT["Continuous learning + PSI drift monitoring"]
  DRIFT -. retrain .-> L3`,
      'Three independent AI layers: the edge keeps detecting anomalies even if the cloud is down; the predictive layer retrains without touching the edge runtime. The predictive layer is demo-labeled in the code.'
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
      'Autonomous edge gateway in Rust (v2.1.0) — Modbus TCP/RTU to PLCs, offline-first SQLite with sync queue, low-latency ONNX anomaly inference (designed for under 50ms), on-device LLM with AI agents, OTA model updates with ed25519 signature verification, embedded dashboard PWA.'
    ),
    bullet(
      'Three-layer AI: edge and cloud anomaly detection (Isolation Forest + Autoencoder, SHAP explainability) —both in production—, plus a predictive layer (LSTM + Prophet forecasts, Random Forest + XGBoost failure predictions 4-24h ahead) that is demo-labeled in the code, not yet in production.'
    ),
    bullet(
      'Predictive maintenance based on real equipment condition is the roadmap goal to replace reactive or calendar-based maintenance — today the predictive layer that would feed it is demo-labeled in the code, not yet in production.'
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
    bullet('apps/backend — Go + GORM + Gin, REST API, MQTT subscriber, OpenSpec source of truth.'),
    bullet(
      'apps/edge-gateway — Rust (Tokio async runtime), Modbus TCP/RTU client to PLCs, SQLite local store with sync queue, onnxruntime 2.0 inference, local LLM via llama_cpp, AI agent framework, OTA model updates with ed25519 signing, embedded dashboard PWA, Prometheus metrics, health endpoints.'
    ),
    bullet(
      'apps/ml-service — Python + scikit-learn, training pipelines, SHAP explainability, ONNX export with parity tests.'
    ),
    bullet(
      'apps/frontend-vite — React 19 + Vite + Mantine + Recharts, operator and analyst dashboards.'
    ),
    bullet('apps/mobile — companion app on Ionic + Capacitor + Vite for operator field workflows.'),
    bullet(
      'packages/eslint-plugin-biogas-ssot — custom lint rules that enforce single-source-of-truth across apps.'
    ),
    bullet('services/ai-assistant — natural language query interface over the operational data.'),
    block(
      'Persistence is PostgreSQL for canonical state, Redis for hot data and caching, S3-compatible object storage for model artifacts and large blobs. Messaging is Mosquitto MQTT. Deployment is GitLab CI/CD with Docker images per app and Caddyfile-based edge routing.'
    ),
  ],
};
