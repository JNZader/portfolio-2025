# Javier Zader — Backend Developer

**Sistemas end-to-end en Java, Go y Rust — del análisis al deploy.**

Más de 20 años en tecnología: empecé en soporte técnico y mantenimiento de equipos, pasé varios años como productor agropecuario —un rubro donde los errores no se arreglan con un rollback— y de ahí volví al software. Hoy me hago cargo de un sistema completo, del análisis al deploy: backend, frontend, ML en el edge e infraestructura.

Técnico en Desarrollo de Software (Universidad Gastón Dachary, 2025). Córdoba, Argentina.

## Lo que construí

Tres sistemas que muestran cómo trabajo, no solo qué stack toco:

- **[apigen](https://javierzader.com/proyectos/apigen)** — De un schema SQL o un contrato OpenAPI a un servicio backend que compila. 12 combinaciones lenguaje/framework, 9 con gate de compilación nativo en CI.
- **[Biogas Platform](https://javierzader.com/proyectos/biogas-platform)** — Plataforma industrial en producción: telemetría en tiempo real por MQTT, detección de anomalías en tres capas (edge en Rust + ONNX, ensemble en la nube), multi-tenant con row-level security real en Postgres.
- **[apigen Studio](https://javierzader.com/proyectos/apigen-studio)** — Diseñador visual para APIs Spring Boot: modelás entidades y servicios en un canvas y exportás un proyecto que compila.

Cada uno tiene su case study completo en [javierzader.com/proyectos](https://javierzader.com/proyectos).

## Sobre este repo

Este repositorio es el código de este mismo portfolio: sirve tanto de sitio en producción como de muestra de trabajo. Next.js 16 (App Router), React 19 con React Compiler, TypeScript estricto, bilingüe ES/EN con next-intl, Sanity como CMS headless, tests con Vitest + Playwright, deploy en Vercel.

[![CI](https://github.com/JNZader/portfolio-2025/actions/workflows/ci.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/ci.yml)
[![Tests](https://github.com/JNZader/portfolio-2025/actions/workflows/test.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/test.yml)
[![E2E Tests](https://github.com/JNZader/portfolio-2025/actions/workflows/e2e.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/e2e.yml)
[![Lighthouse CI](https://github.com/JNZader/portfolio-2025/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/lighthouse.yml)
[![Security](https://github.com/JNZader/portfolio-2025/actions/workflows/security.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/security.yml)
[![Release](https://github.com/JNZader/portfolio-2025/actions/workflows/release.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/release.yml)

![Next.js](https://img.shields.io/badge/Next.js-16.2.10-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue)
![Version](https://img.shields.io/github/package-json/v/JNZader/portfolio-2025)

![Portfolio Preview](public/images/portfolio-preview.png)

## 📑 Índice

- [Qué incluye](#-qué-incluye)
- [Stack Tecnológico](#-stack-tecnológico)
- [Setup y Desarrollo](#-setup-y-desarrollo)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Licencia](#-licencia)
- [Créditos](#-créditos)

## ✨ Qué incluye

| Área | Detalle |
|---|---|
| **i18n** | ES (default, sin prefijo) / EN bajo `/en`, next-intl, diccionarios en `messages/` |
| **Blog** | CMS headless en Sanity (Markdown o Portable Text), búsqueda full-text con debounce, comentarios vía Giscus (GitHub Discussions), TOC automático, posts relacionados |
| **Proyectos** | Fuente dual Sanity + GitHub API (topics `portfolio`/`featured`), filtros por tecnología, ISR de 1 hora sobre el output renderizado |
| **Newsletter** | Double opt-in, rate limiting (Upstash Redis), templates con React Email, panel admin protegido con NextAuth (GitHub OAuth + allowlist de `ADMIN_EMAILS`) |
| **Contacto** | Validación Zod server + client, rate limiting, envío transaccional con Resend |
| **GDPR** | Cookie consent, exportación y eliminación de datos, registro de consentimientos en Postgres vía Prisma |
| **Analytics / Monitoring** | GA4, Vercel Analytics + Speed Insights, Web Vitals, Sentry (client/server/edge) |
| **SEO** | Structured data (schema-dts), Open Graph dinámico, sitemap y robots.txt generados |
| **Accesibilidad** | WCAG 2.1 AA: skip links, focus trap, navegación por teclado, contraste de color |
| **Performance** | React Server Components + React Compiler, ISR, code splitting, bundle analysis |
| **Seguridad** | Rate limiting en API routes, sanitización de inputs, CSRF con tokens, security headers |
| **Testing** | Pirámide completa: Vitest (unit/integration), Playwright (E2E multi-browser + visual + a11y con axe-core) |
| **Calidad / CI** | Biome, Husky, Commitlint, 6 workflows de GitHub Actions (CI, tests, E2E, Lighthouse, security, release) |

## 🚀 Stack Tecnológico

### Core
- **Framework:** Next.js 16.2.10 (App Router)
- **UI Library:** React 19.2.7 con React Compiler
- **Language:** TypeScript 6.0.3 (strict mode)
- **Styling:** Tailwind CSS 4.3.2 con OKLCH color space (config CSS-first en `globals.css`, sin `tailwind.config.ts`)
- **Node:** >= 22.12.0 LTS (compatible con Prisma, Vitest y jsdom)

### i18n
- **next-intl** v4.13 para enrutamiento localizado (`app/[locale]/`), diccionarios y `LanguageSwitcher`

### CMS y APIs
- **Headless CMS:** Sanity Studio v6.3 + `@sanity/client` v7.23 + `next-sanity` v13.1
- **GitHub API:** Octokit v5 (incluye lectura del rate limit propio de GitHub)
- **Comments:** Giscus (GitHub Discussions) vía `@giscus/react` v3.1
- **Auth (Admin):** NextAuth v5 (beta) con provider GitHub, gate por `ADMIN_EMAILS`
- **Theme System:** next-themes v0.4 con SSR support

### Content Rendering
- **Portable Text:** @portabletext/react v6.2
- **Syntax Highlighting:** react-syntax-highlighter + Prism.js
- **Code Blocks:** @sanity/code-input
- **Diagrams:** Mermaid v11.16 (`MermaidDiagram.tsx`)
- **Markdown:** react-markdown v10 con remark-gfm y rehype plugins

### UI Components
- **Design System:** shadcn/ui
- **Icons:** Lucide React v1.23 + React Icons v5.7
- **Image Optimization:** Next.js Image con blur placeholders
- **Animations:** hook custom `useScrollReveal` + CSS (no usa Framer Motion)

### Database y Backend
- **Database:** PostgreSQL (vía Prisma; proveedor de hosting agnóstico)
- **ORM:** Prisma v7.8 con cliente tipado (`prisma-client` generator)
- **Rate Limiting:** Upstash Redis v1.38 + @upstash/ratelimit v2.0
- **Email Service:** Resend v6.16
- **Email Templates:** @react-email/components v1.0
- **PDF Generation:** jsPDF v4.2 (CV descargable en `/cv`)

### Analytics y Monitoring
- **Production Analytics:** Vercel Analytics v2.0 + Speed Insights v2.0
- **Google Analytics:** GA4 con @next/third-parties v16.2
- **Error Tracking:** Sentry v10.63 (`@sentry/nextjs`, client/server/edge)

### SEO
- **Structured Data:** schema-dts v2.0
- **Meta Tags:** Next.js metadata API
- **Dynamic Images:** Open Graph image generation

### Security
- **Validation:** Zod v4.4
- **Rate Limiting:** Upstash Redis + @upstash/ratelimit
- **Sanitization:** sanitize-html v2.17
- **CSRF Protection:** Tokens con nanoid v5.1
- **Cookie Management:** js-cookie v3.0

### Testing
- **Unit/Integration:** Vitest v4.1 con happy-dom v20.10
- **Testing Library:** @testing-library/react v16.3 + user-event v14.6
- **E2E:** Playwright v1.61 con soporte multi-browser
- **Accessibility:** axe-core v4.12 + @axe-core/playwright v4.12
- **Coverage:** @vitest/coverage-v8 v4.1
- **Mocking:** msw v2.14

### Performance
- **Bundle Analysis:** @next/bundle-analyzer v16.2
- **Lighthouse:** @lhci/cli para CI
- **Critical CSS:** critters v0.0.25
- **Image Optimization:** sharp v0.35

### Herramientas de Desarrollo
- **Code Quality:** Biome v2.5 (linting + formatting)
- **Git Hooks:** Husky v9.1 + lint-staged v17.0
- **Commits:** Commitlint v21.2 con Conventional Commits
- **Versioning:** commit-and-tag-version v12.7 para CHANGELOG automático
- **CI/CD:** GitHub Actions con 6 workflows (CI, Tests, E2E, Lighthouse, Security, Release)

## 🛠️ Setup y Desarrollo

### 1. Requisitos Previos

- Node.js >= 22.12.0 (compatible con Prisma, Vitest y jsdom)
- npm >= 10.0.0
- Cuenta de Sanity (gratis en [sanity.io](https://sanity.io))
- Repositorio de GitHub con Discussions habilitadas
- Base de datos PostgreSQL (cualquier proveedor: Neon, Supabase, Vercel Postgres, Railway…)
- Cuenta de Resend para emails (opcional)
- Cuenta de Upstash para Redis (obligatoria para rate limiting y confirmaciones GDPR)
- GitHub Personal Access Token (opcional, para rate limits mejorados)
- GitHub OAuth App (opcional, solo para el panel `/admin` con NextAuth)

### 2. Instalación

```bash
# Clonar repositorio
git clone https://github.com/JNZader/portfolio-2025.git
cd portfolio-2025

# Instalar dependencias
npm install
```

### 3. Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```bash
# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="Tu Nombre - Portfolio"

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# Sanity CMS (obligatorio)
NEXT_PUBLIC_SANITY_PROJECT_ID="tu-project-id"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2024-01-01"
SANITY_API_READ_TOKEN=""  # Opcional para datos privados
SANITY_API_WRITE_TOKEN=""  # Solo para seed script

# Database (PostgreSQL — cualquier proveedor)
DATABASE_URL="postgresql://user:password@host:5432/database"

# Email Service (Resend)
RESEND_API_KEY="re_tu_api_key"
RESEND_FROM_EMAIL="noreply@tudominio.com"
RESEND_TO_EMAIL="tu-email@tudominio.com"

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL="https://tu-endpoint.upstash.io"
UPSTASH_REDIS_REST_TOKEN="tu-token-aqui"

# GitHub API (opcional - mejora rate limits)
GITHUB_TOKEN="ghp_tu_token_aqui"
NEXT_PUBLIC_GITHUB_USERNAME="tu-username"

# NextAuth - Panel Admin (opcional, solo si querés usar /admin)
AUTH_SECRET="genera-uno-con-openssl-rand-base64-32"
GITHUB_CLIENT_ID="tu-oauth-app-client-id"
GITHUB_CLIENT_SECRET="tu-oauth-app-client-secret"
ADMIN_EMAILS="tu-email@tudominio.com"

# Giscus Comments (obtener de https://giscus.app/)
NEXT_PUBLIC_GISCUS_REPO="tu-usuario/tu-repo"
NEXT_PUBLIC_GISCUS_REPO_ID="R_kgDO..."
NEXT_PUBLIC_GISCUS_CATEGORY="Announcements"
NEXT_PUBLIC_GISCUS_CATEGORY_ID="DIC_kwDO..."

# Google Analytics (opcional)
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

### 4. Configurar Database

```bash
# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# (Opcional) Abrir Prisma Studio
npx prisma studio
```

### 5. Configurar Sanity CMS

#### Opción A: Poblar con datos de prueba (Recomendado)

```bash
# 1. Obtener token de escritura desde https://sanity.io/manage
# 2. Agregar SANITY_API_WRITE_TOKEN a .env.local
# 3. Ejecutar seed script
node scripts/seed-sanity.mjs
```

El script creará:
- 4 categorías de blog
- 6 posts de prueba (2 destacados)
- 4 proyectos de ejemplo (2 destacados)

Ver documentación completa en `scripts/README.md`

#### Opción B: Crear contenido manualmente

```bash
# Acceder a Sanity Studio
# http://localhost:3000/studio
```

### 6. Configurar Giscus (Comentarios)

1. Habilita **GitHub Discussions** en tu repositorio (Settings → General → Features → ✅ Discussions)
2. Instala la app de Giscus: https://github.com/apps/giscus → Install
3. Configura en https://giscus.app/, seleccioná "Announcements" como categoría y copiá los valores generados
4. Agregá las variables a `.env.local` (ver arriba)

### 7. Comandos de Desarrollo

```bash
# Desarrollo
npm run dev              # Next.js dev server (localhost:3000)

# Sanity Studio
# http://localhost:3000/studio - Gestionar contenido

# Quality Checks
npm run verify           # Type-check + Biome check (usar antes de commits)
npm run type-check       # Solo TypeScript
npm run check            # Solo Biome lint + format check
npm run check:write      # Biome con auto-fix
npm run format           # Format con Biome
npm run lint             # Solo Biome linting

# Testing
npm run test             # Unit tests con Vitest (watch mode)
npm run test:run         # Unit tests (single run)
npm run test:coverage    # Tests con coverage report
npm run test:ui          # Tests con interfaz gráfica
npm run e2e              # E2E tests con Playwright
npm run e2e:ui           # E2E con interfaz gráfica
npm run e2e:debug        # E2E en modo debug
npm run e2e:headed       # E2E con browser visible
npm run e2e:chromium     # E2E solo en Chromium
npm run e2e:report       # Ver reporte de E2E tests
npm run e2e:codegen      # Generar tests con Playwright Codegen

# Performance
npm run analyze          # Analizar tamaño de bundles
npm run lighthouse       # Ejecutar Lighthouse CI
npm run lighthouse:collect  # Solo recolectar datos
npm run lighthouse:assert   # Solo validar assertions

# Build
npm run build            # Production build
npm start                # Production server

# Versioning
npm run release          # Patch version (0.0.x)
npm run release:minor    # Minor version (0.x.0)
npm run release:major    # Major version (x.0.0)

# Database
npx prisma generate      # Generar Prisma Client
npx prisma migrate dev   # Ejecutar migraciones
npx prisma studio        # Abrir Prisma Studio

# Seed
node scripts/seed-sanity.mjs  # Poblar Sanity con datos de prueba
```

## 📁 Estructura del Proyecto

```
portfolio/
├── __tests__/                 # Tests unitarios e integración
│   ├── unit/                  # Tests de utilities y funciones puras
│   ├── integration/           # Tests de componentes y hooks
│   ├── setup.ts               # Setup global de Vitest
│   └── vitest.d.ts            # Type definitions para Vitest
├── e2e/                       # Tests End-to-End con Playwright
│   ├── fixtures/              # Datos de prueba
│   └── tests/                 # Test specs (accessibility, blog, contact,
│                               #   navigation, newsletter, visual)
├── app/                       # Next.js App Router
│   ├── [locale]/              # Rutas localizadas (next-intl: es sin prefijo, /en)
│   │   ├── (pages)/           # Route group (páginas principales)
│   │   │   ├── admin/         # Panel admin (NextAuth, protegido)
│   │   │   │   ├── login/     # Login (GitHub OAuth)
│   │   │   │   └── unauthorized/
│   │   │   ├── blog/          # Blog listing + búsqueda
│   │   │   │   └── [slug]/    # Blog post individual
│   │   │   ├── contacto/      # Formulario de contacto
│   │   │   ├── cv/            # CV / resume (descarga PDF con jsPDF)
│   │   │   ├── data-request/  # Solicitud de datos GDPR
│   │   │   ├── design-system/ # Documentación de diseño
│   │   │   ├── newsletter/    # Newsletter signup
│   │   │   ├── privacy/       # Política de privacidad (ES/EN)
│   │   │   ├── proyectos/     # Proyectos con filtros
│   │   │   │   └── [id]/      # Detalle de proyecto
│   │   │   ├── secret-achievements/  # Easter eggs / gamification
│   │   │   └── sobre-mi/      # About page
│   │   ├── error.tsx          # Error boundary de la sección localizada
│   │   ├── layout.tsx         # Layout con provider de i18n
│   │   ├── not-found.tsx      # 404 page
│   │   └── page.tsx           # Homepage
│   ├── actions/                # Server Actions (contact, newsletter, admin-newsletter)
│   ├── api/                   # API Routes
│   │   ├── admin/              # Health check y uptime del panel admin
│   │   ├── auth/[...nextauth]/ # NextAuth handler
│   │   ├── data-deletion/      # GDPR data deletion (+ confirm)
│   │   ├── data-export/        # GDPR data export (+ confirm)
│   │   ├── health/              # Health check general
│   │   ├── newsletter/          # Newsletter endpoints (confirm, unsubscribe)
│   │   └── resume/              # Descarga de CV/resume
│   ├── studio/[[...tool]]/    # Sanity Studio route
│   ├── feed.xml/route.ts      # RSS feed
│   ├── globals.css            # Tailwind CSS + @theme config
│   ├── layout.tsx             # Root layout con analytics + Sentry
│   ├── opengraph-image.tsx    # OG image dinámica
│   ├── robots.ts              # robots.txt generado
│   └── sitemap.ts             # Sitemap generado
├── components/
│   ├── a11y/                  # ScreenReaderAnnouncer, SkipLinks
│   ├── admin/                  # AdminDashboard, NewsletterBroadcaster, UptimeStatus
│   ├── analytics/              # GoogleAnalytics, ThirdPartyScripts
│   ├── animations/             # AnimationProvider, RevealOnScroll (sin Framer Motion)
│   ├── blog/                   # BlogFilters, Comments (Giscus), MarkdownRenderer,
│   │                           #   PortableTextRenderer, PostCard/Grid, TableOfContents, etc.
│   ├── error/                  # ErrorFeedback
│   ├── features/               # EasterEggs, MatrixRain
│   ├── forms/                   # ContactForm, FormField
│   ├── gdpr/                    # CookieConsent, DataDeletionForm, DataRequestForm
│   ├── layout/                  # Footer, Header, LanguageSwitcher, MobileMenu, ThemeToggle
│   ├── markdown/                 # MarkdownContent, MermaidDiagram
│   ├── newsletter/                # NewsletterForm, NewsletterHero, NewsletterSkeleton
│   ├── projects/                  # ProjectCard, ProjectDetail, ProjectsClient
│   ├── sections/                   # hero-section, HeroTerminal
│   ├── seo/                        # Breadcrumbs, JsonLd
│   └── ui/                         # shadcn/ui + custom (button, card, Modal, SkillBadge, etc.)
├── lib/
│   ├── analytics/               # consent, debug, errors, events, vercel
│   ├── auth/                    # config.ts, index.ts (NextAuth)
│   ├── config/                  # site-config, site-url
│   ├── data/                    # projects.ts, resume.json/resume.en.json, case-studies/
│   ├── db/                      # prisma.ts
│   ├── email/                   # resend.ts, templates/
│   ├── generated/prisma/        # Prisma Client generado
│   ├── github/                  # client.ts, queries.ts (sin cache in-process, usa ISR)
│   ├── monitoring/              # logger.ts, performance.ts
│   ├── pdf/                     # resume-pdf.ts (jsPDF)
│   ├── rate-limit/              # redis.ts
│   ├── seo/                     # alternates, metadata, schema
│   ├── services/                # gdpr.ts
│   ├── utils/                   # blog, cn, format, project, search, tech-icons, toc, etc.
│   └── validations/             # Schemas Zod (contact, gdpr, newsletter, email-validator)
├── i18n/                       # next-intl: routing.ts, navigation.ts, request.ts
├── messages/                   # es.json, en.json (diccionarios de traducción)
├── hooks/                      # useGdprRequest, useNewsletterSubscription, useScrollReveal
├── mocks/                      # MSW handlers para tests
├── ci-local/                   # Simulación local del pipeline de CI (Docker)
├── prisma/
│   └── schema.prisma           # Prisma schema (Subscriber, ConsentLog) — PostgreSQL
├── sanity/
│   ├── schemas/                # category, post, project, resume
│   ├── lib/                    # client.ts, image.ts, queries.ts (GROQ)
│   └── sanity.config.ts        # Configuración de Sanity Studio
├── scripts/
│   ├── seed-sanity.mjs         # Script de seed para Sanity
│   ├── audit-sanity-data.mjs / clean-sanity-data.mjs
│   └── README.md               # Documentación de scripts
├── public/
│   └── giscus-theme.css        # Tema personalizado para comentarios
├── types/                      # TypeScript type definitions
├── docs/                       # Documentación adicional (CI/CD, publishing guide, etc.)
├── .github/workflows/          # ci.yml, test.yml, e2e.yml, lighthouse.yml,
│                               #   security.yml, release.yml
├── .husky/                     # commit-msg, pre-commit, pre-push
├── proxy.ts                    # Middleware (Next 16): i18n routing + rate limiting
├── instrumentation.ts          # Registro de Sentry
├── sentry.{client,server,edge}.config.ts
├── biome.json                  # Configuración de Biome
├── prisma.config.ts            # Configuración de Prisma CLI
├── next.config.ts              # Next.js configuration (sin tailwind.config.ts: Tailwind 4 es CSS-first)
├── vitest.config.ts            # Vitest configuration
├── CHANGELOG.md                # Changelog automático
└── package.json                # Dependencies y scripts
```

## 🧪 Testing

### Unit e Integration Tests

```bash
npm run test              # Watch mode
npm run test:run          # Single run
npm run test:coverage     # Con coverage
npm run test:ui           # UI mode
```

Tests ubicados en `__tests__/`:
- **unit/**: Utilities, validaciones, helpers
- **integration/**: Componentes, hooks

Herramientas: Vitest + Happy DOM, Testing Library. Coverage: 80% lines, 80% functions, 75% branches.

### E2E Tests

```bash
npm run e2e              # Todos los browsers
npm run e2e:ui           # UI mode
npm run e2e:debug        # Debug mode
npm run e2e:headed       # Con browser visible
npm run e2e:chromium     # Solo Chromium
npm run e2e:report       # Ver reporte HTML
npm run e2e:codegen      # Generar tests
```

Tests ubicados en `e2e/tests/`: accessibility (axe-core), blog, contact, navigation, newsletter, visual regression.

Browsers soportados: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari, iPad.

### CI/CD

GitHub Actions ejecuta 6 workflows: CI (Biome + TypeScript + build), Tests (unit con coverage vía Codecov), E2E (multi-browser con Playwright), Lighthouse (performance budgets), Security (CodeQL, dependency review, npm audit) y Release (versionado + CHANGELOG).

Documentación completa: [CI/CD Documentation](docs/CI_CD_DOCUMENTATION.md) · [CI/CD Quick Reference](docs/CI_CD_QUICK_REFERENCE.md) · [Lighthouse CI](docs/LIGHTHOUSE_CI.md)

## 🚀 Deployment

### Vercel (Recomendado)

1. Push a GitHub
2. Conecta el repo en Vercel
3. Agrega las variables de entorno
4. Deploy automático en cada push

### Variables de Entorno en Producción

Asegúrate de configurar todas las variables de `.env.local` en tu plataforma de deployment:
- Variables de Sanity (obligatorias)
- Variables de Database (obligatorias)
- Variables de Email (Resend)
- Variables de Rate Limiting (Upstash Redis)
- Variables de Giscus (para comentarios)
- Variables de GitHub (opcional)
- Variables de NextAuth/Admin (opcional, solo si usás `/admin`)
- Variables de Analytics (opcional)
- `NEXT_PUBLIC_SITE_URL` con tu dominio final

### Post-Deployment

1. Verificar que Sanity Studio funcione en `/studio`
2. Probar formulario de contacto
3. Verificar newsletter signup
4. Probar comentarios en blog posts
5. Verificar analytics y Web Vitals
6. Ejecutar Lighthouse en producción
7. Verificar SEO con herramientas (Google Search Console, etc.)

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Créditos

- [Next.js](https://nextjs.org/) - Framework React
- [Sanity](https://www.sanity.io/) - CMS Headless
- [Giscus](https://giscus.app/) - Sistema de comentarios
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Biome](https://biomejs.dev/) - Linting y formatting
- [Vitest](https://vitest.dev/) - Testing framework
- [Playwright](https://playwright.dev/) - E2E testing
- [Vercel](https://vercel.com/) - Hosting y Analytics
- [Upstash](https://upstash.com/) - Redis para rate limiting y tokens GDPR
- [Resend](https://resend.com/) - Email transaccional
- [Prisma](https://www.prisma.io/) - ORM para PostgreSQL
- [Sentry](https://sentry.io/) - Error tracking
- [NextAuth.js](https://authjs.dev/) - Autenticación del panel admin
- [next-intl](https://next-intl.dev/) - Internacionalización (ES/EN)
