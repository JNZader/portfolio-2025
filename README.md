# Portfolio — Javier Zader

**El código de este portfolio: un sitio en producción que también es la muestra de trabajo.**

Next.js 16 (App Router), React 19 con React Compiler, TypeScript estricto, bilingüe ES/EN con next-intl, Sanity como CMS headless, PostgreSQL vía Prisma, tests con Vitest + Playwright, deploy en Vercel. No es una landing de una tarde: blog con CMS headless, newsletter con double opt-in, panel admin con NextAuth, flujos GDPR completos, 207 tests unit/integration y CI con 6 workflows.

[![CI](https://github.com/JNZader/portfolio-2025/actions/workflows/ci.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/ci.yml)
[![Tests](https://github.com/JNZader/portfolio-2025/actions/workflows/test.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/test.yml)
[![E2E Tests](https://github.com/JNZader/portfolio-2025/actions/workflows/e2e.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/e2e.yml)
[![Lighthouse CI](https://github.com/JNZader/portfolio-2025/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/lighthouse.yml)
[![Security](https://github.com/JNZader/portfolio-2025/actions/workflows/security.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/security.yml)
[![Release](https://github.com/JNZader/portfolio-2025/actions/workflows/release.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/release.yml)

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
- **Framework:** Next.js (App Router)
- **UI Library:** React con React Compiler
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS con OKLCH color space (config CSS-first en `globals.css`, sin `tailwind.config.ts`)
- **Node:** >= 22.12.0 LTS

### i18n
- **next-intl** para enrutamiento localizado (`app/[locale]/`), diccionarios y `LanguageSwitcher`

### CMS y APIs
- **Headless CMS:** Sanity Studio + `@sanity/client` + `next-sanity`
- **GitHub API:** Octokit (incluye lectura del rate limit propio de GitHub)
- **Comments:** Giscus (GitHub Discussions) vía `@giscus/react`
- **Auth (Admin):** NextAuth con provider GitHub, gate por `ADMIN_EMAILS`
- **Theme System:** next-themes con SSR support

### Content Rendering
- **Portable Text:** @portabletext/react
- **Syntax Highlighting:** react-syntax-highlighter + Prism.js
- **Code Blocks:** @sanity/code-input
- **Diagrams:** Mermaid (`MermaidDiagram.tsx`)
- **Markdown:** react-markdown con remark-gfm y rehype plugins

### UI Components
- **Design System:** shadcn/ui
- **Icons:** Lucide React + React Icons
- **Image Optimization:** Next.js Image con blur placeholders
- **Animations:** hook custom `useScrollReveal` + CSS (no usa Framer Motion)

### Database y Backend
- **Database:** PostgreSQL (vía Prisma; proveedor de hosting agnóstico)
- **ORM:** Prisma con cliente tipado (`prisma-client` generator)
- **Rate Limiting:** Upstash Redis + @upstash/ratelimit
- **Email Service:** Resend
- **Email Templates:** @react-email/components
- **PDF Generation:** jsPDF (CV descargable en `/cv`)

### Analytics y Monitoring
- **Production Analytics:** Vercel Analytics + Speed Insights
- **Google Analytics:** GA4 con @next/third-parties
- **Error Tracking:** Sentry (`@sentry/nextjs`, client/server/edge)

### SEO
- **Structured Data:** schema-dts
- **Meta Tags:** Next.js metadata API
- **Dynamic Images:** Open Graph image generation

### Security
- **Validation:** Zod
- **Rate Limiting:** Upstash Redis + @upstash/ratelimit
- **Sanitization:** sanitize-html
- **CSRF Protection:** Tokens con nanoid
- **Cookie Management:** js-cookie

### Testing
- **Unit/Integration:** Vitest con happy-dom
- **Testing Library:** @testing-library/react + user-event
- **E2E:** Playwright con soporte multi-browser
- **Accessibility:** axe-core + @axe-core/playwright
- **Coverage:** @vitest/coverage-v8
- **Mocking:** msw

### Performance
- **Bundle Analysis:** @next/bundle-analyzer
- **Lighthouse:** @lhci/cli para CI
- **Critical CSS:** critters
- **Image Optimization:** sharp

### Herramientas de Desarrollo
- **Code Quality:** Biome (linting + formatting)
- **Git Hooks:** Husky + lint-staged
- **Commits:** Commitlint con Conventional Commits
- **Versioning:** commit-and-tag-version para CHANGELOG automático
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

Herramientas: Vitest + Happy DOM, Testing Library. **207 tests** en 29 archivos; coverage con v8 y umbral mínimo enforced en CI.

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
