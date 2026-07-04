# Portfolio 2025

[![CI](https://github.com/JNZader/portfolio-2025/actions/workflows/ci.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/ci.yml)
[![Tests](https://github.com/JNZader/portfolio-2025/actions/workflows/test.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/test.yml)
[![E2E Tests](https://github.com/JNZader/portfolio-2025/actions/workflows/e2e.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/e2e.yml)
[![Lighthouse CI](https://github.com/JNZader/portfolio-2025/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/lighthouse.yml)
[![Security](https://github.com/JNZader/portfolio-2025/actions/workflows/security.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/security.yml)
[![Release](https://github.com/JNZader/portfolio-2025/actions/workflows/release.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/release.yml)

![Next.js](https://img.shields.io/badge/Next.js-16.2.10-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue)
![Version](https://img.shields.io/badge/version-2.17.5-green)

![Portfolio Preview](public/images/portfolio-preview.png)


Portfolio profesional construido con el stack más moderno de 2025. Incluye sistema de blog completo con búsqueda, comentarios, CMS headless, conexión con GitHub API, analytics avanzado, testing completo, y optimizaciones de rendimiento de nivel producción.

## 📑 Índice

- [Características](#-características)
- [Internacionalización](#-internacionalización)
- [Stack Tecnológico](#-stack-tecnológico)
- [Setup y Desarrollo](#-setup-y-desarrollo)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Sistema de Diseño](#-sistema-de-diseño)
- [Funcionalidades del Blog](#-blog-features)
- [Comentarios](#-comentarios)
- [Convenciones de Código](#-convenciones-de-código)
- [Flujo de Trabajo Git](#-flujo-de-trabajo-git)
- [Integración con GitHub](#-integración-con-github)
- [Testing](#-testing)
- [Performance](#-performance)
- [Seguridad](#-seguridad)
- [Deployment](#-deployment)
- [Licencia](#-licencia)
- [Créditos](#-créditos)

## ✨ Características

### 🎨 Sistema de Diseño
- shadcn/ui con Tailwind CSS 4.3 y modo oscuro automático
- OKLCH color space para mejor manipulación de colores
- Tema personalizado sincronizado entre portfolio y comentarios
- Componentes UI premium con micro-interacciones y efectos visuales
- Sistema de diseño documentado y escalable

### 🌐 Internacionalización
- **ES/EN con next-intl**: Español como idioma por defecto (sin prefijo), inglés bajo `/en`
- **Rutas localizadas**: `app/[locale]/` con `i18n/routing.ts` + `i18n/navigation.ts`
- **Diccionarios**: `messages/es.json` y `messages/en.json`
- **Selector de idioma**: `LanguageSwitcher` en el header

### 📝 Blog Completo
- **CMS Headless**: Sanity Studio v6 + `@sanity/client` v7 para gestión de contenido
- **Dual Content Format**: Soporte para Markdown (copy/paste) y Portable Text (editor visual)
- **Búsqueda Full-Text**: Búsqueda en tiempo real con debouncing y highlight de términos
- **Comentarios**: Sistema de comentarios con Giscus (GitHub Discussions)
- **Portable Text**: Renderizado de contenido rico con syntax highlighting
- **Markdown Support**: GitHub Flavored Markdown con tablas, código y más
- **Table of Contents**: Navegación automática en posts largos
- **Posts Relacionados**: Sugerencias basadas en categorías
- **Categorías**: Filtrado por categorías con colores personalizados
- **Share Buttons**: Compartir en redes sociales
- **SEO Avanzado**: Structured data, Open Graph, Twitter Cards

### 🚀 Proyectos
- **Integración dual**: Proyectos desde Sanity CMS + GitHub API
- **Búsqueda y filtros**: Búsqueda interactiva con filtros por tecnología
- **Caché inteligente**: Sin cache in-process; se apoya en ISR de Next.js (`revalidate = 3600`, 1 hora) para el output renderizado

### 📧 Sistema de Newsletter
- **Double Opt-in**: Confirmación por email para suscripciones
- **Rate Limiting**: Protección con Upstash Redis
- **Email Templates**: Plantillas profesionales con React Email
- **GDPR Compliant**: Gestión de consentimientos y datos personales
- **Desuscripción fácil**: Links de un solo click
- **Panel Admin**: Envío de broadcasts protegido con NextAuth (GitHub OAuth + allowlist de `ADMIN_EMAILS`)

### 📮 Formulario de Contacto
- **Validación avanzada**: Validación en servidor y cliente con Zod
- **Rate Limiting**: Protección anti-spam con Upstash Redis
- **Email Transaccional**: Envío con Resend API

### 🔒 GDPR y Privacidad
- **Cookie Consent**: Banner de consentimiento con gestión granular
- **Data Export**: Los usuarios pueden exportar sus datos
- **Data Deletion**: Solicitud de eliminación de datos
- **Privacy Policy**: Política de privacidad completa
- **Consent Tracking**: Registro de consentimientos con Prisma

### 📊 Analytics y Monitoreo
- **Google Analytics 4**: Tracking de pageviews automático
- **Vercel Analytics**: Analytics de producción
- **Vercel Speed Insights**: Métricas de rendimiento en producción
- **Web Vitals**: Tracking de Core Web Vitals (LCP, FID, CLS, INP, TTFB, FCP)
- **Custom Events**: Sistema de eventos personalizados para tracking
- **Sentry**: Error tracking en cliente, servidor y edge (`@sentry/nextjs`)
- **Error Tracking**: Boundary global para captura de errores
- **Debug Panel**: Panel de desarrollo para monitoreo en local
- **Event Tracking**: Tracking de búsquedas, clicks, formularios, etc.

### 🎯 SEO Avanzado
- **Structured Data**: Schema.org markup para mejor indexación
- **Open Graph**: Metadata para redes sociales
- **Twitter Cards**: Cards optimizadas para Twitter
- **Dynamic OG Images**: Imágenes Open Graph generadas dinámicamente
- **Breadcrumbs**: Navegación estructurada
- **FAQ Schema**: Schema para preguntas frecuentes
- **Sitemap**: Generación automática de sitemap
- **Robots.txt**: Configuración de crawlers

### ♿ Accesibilidad (WCAG 2.1 AA)
- **Skip Links**: Navegación por teclado
- **Screen Reader Support**: Anuncios y landmarks ARIA
- **Focus Management**: Gestión de foco con FocusTrap
- **Keyboard Navigation**: Navegación completa por teclado
- **Touch Targets**: Áreas táctiles de 44x44px mínimo
- **Color Contrast**: Contraste de color optimizado
- **Modal Accessibility**: Modales accesibles con aria-*
- **Form Announcements**: Anuncios de validación en formularios

### ⚡ Optimización de Rendimiento
- **React Server Components**: Optimización automática con Next.js 16
- **ISR**: Incremental Static Regeneration para contenido dinámico
- **React Compiler**: Optimizaciones automáticas de rendimiento
- **Code Splitting**: División automática de código por rutas
- **Bundle Analysis**: Análisis de tamaño de bundles con @next/bundle-analyzer
- **Image Optimization**: Next/Image con blur placeholders y lazy loading
- **Font Optimization**: Carga optimizada de fuentes
- **Resource Hints**: Prefetch, preload, preconnect
- **Multi-Layer Cache**: Caché en memoria, CDN y browser
- **Database Optimization**: Queries optimizadas con índices Prisma
- **Third-Party Scripts**: Carga diferida de scripts externos
- **Lazy Loading**: Carga diferida de componentes y recursos
- **Web Vitals Tracking**: Monitoreo de métricas de rendimiento

### 🧪 Testing Completo
- **Unit Tests**: Vitest para testing de utilities y hooks
- **Integration Tests**: Testing Library para componentes
- **E2E Tests**: Playwright para flujos completos
- **Visual Regression**: Screenshots comparativos en Playwright
- **Accessibility Tests**: axe-core para testing de a11y
- **Coverage Reports**: Reportes de cobertura con V8
- **CI Integration**: Tests automáticos en GitHub Actions

### 🔧 Quality Tools
- **Biome**: Linting y formatting (reemplaza ESLint + Prettier)
- **Husky**: Git hooks pre-commit, commit-msg y pre-push
- **TypeScript Strict**: Type safety completo
- **CI/CD**: 6 workflows de GitHub Actions (CI, Tests, E2E, Lighthouse, Security, Release)
- **Commitlint**: Validación de Conventional Commits
- **commit-and-tag-version**: Versionado automático con CHANGELOG (sucesor de standard-version)

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

### Search & UX
- **Debouncing:** use-debounce (500ms) para search input
- **URL State:** Search params para búsquedas compartibles
- **Highlight:** Resaltado de términos en resultados
- **Focus Trap:** gestión de foco propia en `components/a11y` y `Modal.tsx`

### Database y Backend
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma v7.8 con cliente tipado (`prisma-client` generator)
- **Rate Limiting:** Upstash Redis v1.38 + @upstash/ratelimit v2.0
- **Email Service:** Resend v6.16
- **Email Templates:** @react-email/components v1.0
- **PDF Generation:** jsPDF v4.2 (CV descargable en `/cv`)

### Analytics y Monitoring
- **Production Analytics:** Vercel Analytics v2.0 + Speed Insights v2.0
- **Google Analytics:** GA4 con @next/third-parties v16.2
- **Error Tracking:** Sentry v10.63 (`@sentry/nextjs`, client/server/edge)
- **Web Vitals:** web-vitals v5.3
- **Custom Events:** Sistema de eventos personalizado

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
- Base de datos PostgreSQL (Supabase recomendado)
- Cuenta de Resend para emails (opcional)
- Cuenta de Upstash para Redis (opcional para rate limiting)
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

# Database (PostgreSQL/Supabase)
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

1. Habilita **GitHub Discussions** en tu repositorio:
   - Settings → General → Features → ✅ Discussions

2. Instala la app de Giscus:
   - https://github.com/apps/giscus → Install

3. Configura en https://giscus.app/:
   - Ingresa tu repositorio
   - Selecciona "Announcements" como categoría
   - Copia los valores generados

4. Agrega las variables a `.env.local` (ver arriba)



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
│   │   ├── analytics/          # Analytics endpoints (incl. web-vitals)
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
│   ├── analytics/              # GoogleAnalytics, ThirdPartyScripts, WebVitals
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

## 🎨 Sistema de Diseño

### Temas
- **Light/Dark Mode**: Toggle automático con `next-themes`
- **Color System**: OKLCH para mejor manipulación de colores
- **Variables CSS**: Compatible con shadcn/ui components
- **Giscus Sync**: Tema de comentarios sincronizado con portfolio
- **Premium Effects**: Gradientes, glassmorphism, micro-interacciones

### Componentes UI
Basado en shadcn/ui con customizaciones:
- Button, Badge, Card, Input, Skeleton
- Modal accesible con focus trap
- Theme toggle con iconos animados
- Responsive navigation con mobile menu
- Skip links para accesibilidad
- Loading states con skeletons
- Microinteracciones y efectos premium (ripple, shine, hover)

## 📝 Blog Features

### Búsqueda Full-Text
- Búsqueda server-side con GROQ en Sanity
- Debouncing de 500ms en el input
- Highlight de términos encontrados
- Búsqueda en título, excerpt y contenido
- Combinable con filtros de categoría
- URL params para búsquedas compartibles
- Event tracking de búsquedas

### Sistema de Comentarios
- Basado en GitHub Discussions (gratis, sin backend)
- Autenticación con GitHub OAuth
- Markdown support nativo
- Reacciones y replies
- Moderación desde GitHub
- Tema sincronizado con portfolio
- Lazy loading para mejor performance

### Content Rendering
- **Dual Format Support**: Markdown o Portable Text según preferencia
- Portable Text con componentes custom
- Markdown con GitHub Flavored Markdown (tablas, código, listas)
- Syntax highlighting para código (Prism.js)
- Imágenes optimizadas con blur placeholders
- Table of Contents automático (ambos formatos)
- Posts relacionados por categoría
- Share buttons para redes sociales
- Event tracking de interacciones

## 💬 Comentarios

Este proyecto usa [Giscus](https://giscus.app/) para comentarios basados en GitHub Discussions.

### Configuración

1. Habilita GitHub Discussions en tu repo
2. Ve a https://giscus.app/ y genera tu configuración
3. Agrega las variables de entorno en `.env.local`:

```bash
NEXT_PUBLIC_GISCUS_REPO="tu-usuario/tu-repo"
NEXT_PUBLIC_GISCUS_REPO_ID="tu-repo-id"
NEXT_PUBLIC_GISCUS_CATEGORY="Announcements"
NEXT_PUBLIC_GISCUS_CATEGORY_ID="tu-category-id"
```

### Moderación

Los comentarios se moderan desde la pestaña "Discussions" en GitHub:
- Editar/eliminar comentarios
- Marcar como spam
- Bloquear usuarios
- Lock discussions (cerrar comentarios)



## 📝 Convenciones de Código

### Conventional Commits

```bash
feat(scope): nueva funcionalidad
fix(scope): corrección de bugs
docs(scope): cambios en documentación
chore(scope): cambios en herramientas
style(scope): cambios de formato
refactor(scope): refactorización
test(scope): agregar/actualizar tests
perf(scope): mejoras de rendimiento
```

### Code Style (Biome)
- Single quotes para JavaScript
- Double quotes para JSX
- 2 espacios de indentación
- 100 caracteres por línea
- Semicolons siempre

## 🔄 Flujo de Trabajo Git

No se usa una rama `develop`: el flujo es trunk-based con feature branches que
se mergean directo a `main` vía Pull Request.

```bash
# Feature development
git checkout main
git pull
git checkout -b feature/nombre-feature
# ... hacer cambios ...
npm run verify   # type-check + Biome (mirror de CI)
npm run test:run
git add .
git commit -m "feat(scope): descripción"  # Husky valida formato

# Abrir PR a main
git push -u origin feature/nombre-feature
gh pr create --base main --head feature/nombre-feature

# Release (tras mergear a main)
npm run release -- --release-as 0.x.0  # Genera CHANGELOG y tag
git push --follow-tags origin main
```

## 📊 Integración con GitHub

### Proyectos desde GitHub API

El portfolio muestra automáticamente proyectos desde GitHub que tengan los topics:
- `portfolio`
- `featured`

Si no hay proyectos con estos topics, muestra los 3 repos más recientes.

**Configuración**:
1. Agregar topics a tus repos en GitHub
2. Configurar `NEXT_PUBLIC_GITHUB_USERNAME` en `.env.local`
3. (Opcional) Agregar `GITHUB_TOKEN` para mejor rate limit

### Proyectos desde Sanity

Puedes agregar proyectos manualmente en Sanity Studio o usar el seed script.
Los proyectos de Sanity aparecen primero, seguidos de los de GitHub.

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

Herramientas:
- Vitest + Happy DOM
- Testing Library
- Coverage: 80% lines, 80% functions, 75% branches

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

Tests ubicados en `e2e/tests/`:
- accessibility.spec.ts - Tests de a11y con axe-core
- blog.spec.ts - Flujos de blog
- contact.spec.ts - Formulario de contacto
- navigation.spec.ts - Navegación
- newsletter.spec.ts - Newsletter
- visual.spec.ts - Regresión visual

Browsers soportados:
- Chromium, Firefox, WebKit
- Mobile Chrome, Mobile Safari
- iPad

### CI/CD Testing

GitHub Actions ejecuta automáticamente:
- **CI Workflow**: Quality checks (Biome + TypeScript) + Build
- **Tests Workflow**: Unit tests con coverage (Codecov)
- **E2E Workflow**: E2E tests multi-browser con Playwright
- **Lighthouse Workflow**: Performance audits con budgets
- **Security Workflow**: CodeQL, dependency review, npm audit
- **Release Workflow**: Automatiza versionado y CHANGELOG

**Características:**
- 🚀 Cache multi-capa para ejecución rápida (~30-60% más rápido)
- 🔒 Security scanning semanal automático
- 📊 Coverage reports y performance budgets
- 🤖 Dependabot para actualizaciones automáticas
- ⚡ Ejecución paralela de workflows (~8-12 min total)

**Documentación completa:**
- 📖 [CI/CD Documentation](docs/CI_CD_DOCUMENTATION.md) - Guía completa
- 🚀 [CI/CD Quick Reference](docs/CI_CD_QUICK_REFERENCE.md) - Guía rápida

## ⚡ Performance

### Optimizaciones Implementadas

1. **Code Splitting**: División automática por rutas
2. **Image Optimization**: Next/Image con lazy loading
3. **Bundle Analysis**: Monitoreo de tamaño de bundles
4. **Multi-Layer Cache**: Memoria + CDN + Browser
5. **Database Indexes**: Queries optimizadas
6. **Resource Hints**: Prefetch, preload, preconnect
7. **Lazy Loading**: Componentes y recursos diferidos
8. **Third-Party Scripts**: Carga diferida de scripts externos

### Lighthouse CI

```bash
npm run lighthouse        # Ejecutar Lighthouse
npm run lighthouse:collect  # Solo recolectar
npm run lighthouse:assert   # Solo validar
```

Ver documentación en `docs/LIGHTHOUSE_CI.md`

## 🔒 Seguridad

- Variables sensibles en `.env.local` (git ignored)
- Rate limiting en API routes con Upstash Redis
- TypeScript strict mode para type safety
- Validación de datos con Zod schemas
- Sanitización de inputs en búsqueda y formularios
- OAuth para autenticación de comentarios (Giscus) y del panel admin (NextAuth)
- CSRF protection con tokens
- Email validation avanzada
- Security headers en Next.js config

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
- [Upstash](https://upstash.com/) - Redis para rate limiting
- [Resend](https://resend.com/) - Email transaccional
- [Supabase](https://supabase.com/) - PostgreSQL database
- [Sentry](https://sentry.io/) - Error tracking
- [NextAuth.js](https://authjs.dev/) - Autenticación del panel admin
- [next-intl](https://next-intl.dev/) - Internacionalización (ES/EN)
