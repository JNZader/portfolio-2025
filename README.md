# Portfolio 2025

[![CI](https://github.com/JNZader/portfolio-2025/actions/workflows/ci.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/ci.yml)
[![Tests](https://github.com/JNZader/portfolio-2025/actions/workflows/test.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/test.yml)
[![E2E Tests](https://github.com/JNZader/portfolio-2025/actions/workflows/e2e.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/e2e.yml)
[![Lighthouse CI](https://github.com/JNZader/portfolio-2025/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/lighthouse.yml)
[![Security](https://github.com/JNZader/portfolio-2025/actions/workflows/security.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/security.yml)

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Version](https://img.shields.io/badge/version-0.22.6-green)

Portfolio profesional construido con el stack más moderno de 2025. Incluye sistema de blog completo con búsqueda, comentarios, CMS headless, conexión con GitHub API, analytics avanzado, testing completo, y optimizaciones de rendimiento de nivel producción.

## ✨ Características

### 🎨 Sistema de Diseño
- shadcn/ui con Tailwind CSS 4.1 y modo oscuro automático
- OKLCH color space para mejor manipulación de colores
- Tema personalizado sincronizado entre portfolio y comentarios
- Componentes UI premium con micro-interacciones y efectos visuales
- Sistema de diseño documentado y escalable

### 📝 Blog Completo
- **CMS Headless**: Sanity CMS v4 para gestión de contenido
- **Búsqueda Full-Text**: Búsqueda en tiempo real con debouncing y highlight de términos
- **Comentarios**: Sistema de comentarios con Giscus (GitHub Discussions)
- **Portable Text**: Renderizado de contenido rico con syntax highlighting
- **Table of Contents**: Navegación automática en posts largos
- **Posts Relacionados**: Sugerencias basadas en categorías
- **Categorías**: Filtrado por categorías con colores personalizados
- **Share Buttons**: Compartir en redes sociales
- **SEO Avanzado**: Structured data, Open Graph, Twitter Cards

### 🚀 Proyectos
- **Integración dual**: Proyectos desde Sanity CMS + GitHub API
- **Búsqueda y filtros**: Búsqueda interactiva con filtros por tecnología
- **Caché inteligente**: GitHub API con cache de 15 minutos

### 📧 Sistema de Newsletter
- **Double Opt-in**: Confirmación por email para suscripciones
- **Rate Limiting**: Protección con Upstash Redis
- **Email Templates**: Plantillas profesionales con React Email
- **GDPR Compliant**: Gestión de consentimientos y datos personales
- **Desuscripción fácil**: Links de un solo click

### 📮 Formulario de Contacto
- **Validación avanzada**: Validación en servidor y cliente con Zod
- **Rate Limiting**: Protección anti-spam con Upstash Redis
- **Email Transaccional**: Envío con Resend API
- **Honeypot**: Protección adicional contra bots

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
- **CI/CD**: 5 workflows de GitHub Actions (CI, Tests, E2E, Lighthouse, Security)
- **Commitlint**: Validación de Conventional Commits
- **Standard Version**: Versionado automático con CHANGELOG

## 🚀 Stack Tecnológico

### Core
- **Framework:** Next.js 16.0.2 (App Router)
- **UI Library:** React 19.2.0 con React Compiler
- **Language:** TypeScript 5.9.3 (strict mode)
- **Styling:** Tailwind CSS 4.1.17 con OKLCH color space
- **Node:** >= 22.12.0 LTS (compatible con Prisma, Vitest y jsdom)

### CMS y APIs
- **Headless CMS:** Sanity CMS v4.18
- **GitHub API:** Octokit v5 con rate limiting
- **Comments:** Giscus (GitHub Discussions)
- **Theme System:** next-themes v0.4 con SSR support

### Content Rendering
- **Portable Text:** @portabletext/react v5
- **Syntax Highlighting:** react-syntax-highlighter + Prism.js
- **Code Blocks:** @sanity/code-input
- **Markdown:** react-markdown con remark-gfm y rehype plugins

### UI Components
- **Design System:** shadcn/ui
- **Icons:** Lucide React v0.554 + React Icons v5.5
- **Image Optimization:** Next.js Image + Sanity Image URLs + Plaiceholder
- **Animations:** Framer Motion v12.23

### Search & UX
- **Debouncing:** use-debounce para search input
- **URL State:** Search params para búsquedas compartibles
- **Highlight:** Resaltado de términos en resultados
- **Focus Trap:** focus-trap-react para modales

### Database y Backend
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma v6.19 con cliente tipado
- **Rate Limiting:** Upstash Redis v1.35 + @upstash/ratelimit v2.0
- **Email Service:** Resend v6.4
- **Email Templates:** @react-email/components v1.0

### Analytics y Monitoring
- **Production Analytics:** Vercel Analytics v1.5 + Speed Insights v1.2
- **Google Analytics:** GA4 con @next/third-parties v16.0
- **Web Vitals:** web-vitals v5.1
- **Custom Events:** Sistema de eventos personalizado
- **Error Tracking:** Error boundary con reporting

### SEO
- **Structured Data:** schema-dts v1.1
- **Meta Tags:** Next.js metadata API
- **Dynamic Images:** Open Graph image generation

### Security
- **Validation:** Zod v4.1
- **Rate Limiting:** Upstash Redis + @upstash/ratelimit
- **Sanitization:** isomorphic-dompurify v2.31
- **CSRF Protection:** Tokens con nanoid v5.1
- **Cookie Management:** js-cookie v3.0

### Testing
- **Unit/Integration:** Vitest v4.0 con happy-dom v20.0
- **Testing Library:** @testing-library/react v16.3 + user-event v14.6
- **E2E:** Playwright v1.56 con soporte multi-browser
- **Accessibility:** axe-core v4.11 + @axe-core/playwright v4.11
- **Coverage:** @vitest/coverage-v8 v4.0
- **Mocking:** msw v2.12

### Performance
- **Bundle Analysis:** @next/bundle-analyzer v16.0
- **Lighthouse:** @lhci/cli para CI
- **Compression:** compression v1.8
- **Image Optimization:** sharp v0.34

### Herramientas de Desarrollo
- **Code Quality:** Biome v2.3.7 (linting + formatting)
- **Git Hooks:** Husky v9.1 + lint-staged v16.2
- **Commits:** Commitlint v20.1 con Conventional Commits
- **Versioning:** standard-version v9.5 para CHANGELOG automático
- **CI/CD:** GitHub Actions con 5 workflows

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

Ver documentación completa en la guía `docs/08_GISCUS_COMENTARIOS.md`

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
│   │   ├── utils/             # Tests de lib/utils
│   │   └── validations/       # Tests de schemas Zod
│   ├── integration/           # Tests de componentes y hooks
│   │   ├── components/        # Tests de componentes React
│   │   └── hooks/             # Tests de custom hooks
│   ├── setup.ts               # Setup global de Vitest
│   └── vitest.d.ts            # Type definitions para Vitest
├── e2e/                       # Tests End-to-End con Playwright
│   ├── fixtures/              # Datos de prueba
│   └── tests/                 # Test specs
│       ├── accessibility.spec.ts  # Tests de accesibilidad
│       ├── blog.spec.ts           # Tests de blog
│       ├── contact.spec.ts        # Tests de contacto
│       ├── navigation.spec.ts     # Tests de navegación
│       ├── newsletter.spec.ts     # Tests de newsletter
│       └── visual.spec.ts         # Tests de regresión visual
├── app/                       # Next.js App Router
│   ├── (pages)/               # Route group (páginas principales)
│   │   ├── blog/              # Blog listing + búsqueda
│   │   │   └── [slug]/        # Blog post individual
│   │   ├── contacto/          # Formulario de contacto
│   │   ├── data-request/      # Solicitud de datos GDPR
│   │   ├── design-system/     # Documentación de diseño
│   │   ├── newsletter/        # Newsletter signup
│   │   ├── privacy/           # Política de privacidad
│   │   ├── proyectos/         # Proyectos con filtros
│   │   │   └── [id]/          # Detalle de proyecto
│   │   └── sobre-mi/          # About page
│   ├── api/                   # API Routes
│   │   ├── analytics/         # Analytics endpoints
│   │   │   └── web-vitals/    # Web Vitals tracking
│   │   ├── data-deletion/     # GDPR data deletion
│   │   │   └── confirm/       # Confirmación de eliminación
│   │   ├── data-export/       # GDPR data export
│   │   │   └── confirm/       # Confirmación de exportación
│   │   └── newsletter/        # Newsletter endpoints
│   │       ├── confirm/       # Confirmación de suscripción
│   │       └── unsubscribe/   # Desuscripción
│   ├── studio/[[...tool]]/    # Sanity Studio route
│   ├── error.tsx              # Error boundary global
│   ├── globals.css            # Tailwind CSS + @theme config
│   ├── layout.tsx             # Root layout con analytics
│   ├── not-found.tsx          # 404 page
│   └── page.tsx               # Homepage
├── components/
│   ├── a11y/                  # Componentes de accesibilidad
│   │   ├── FocusTrap.tsx      # Focus management
│   │   ├── ScreenReaderAnnouncer.tsx  # ARIA announcements
│   │   └── SkipLinks.tsx      # Skip navigation
│   ├── analytics/             # Componentes de analytics
│   │   ├── GoogleAnalytics.tsx    # GA4 integration
│   │   ├── ThirdPartyScripts.tsx  # Scripts externos
│   │   └── WebVitals.tsx          # Web Vitals tracking
│   ├── animations/            # Componentes de animación
│   │   ├── AnimationProvider.tsx  # Proveedor de animaciones
│   │   └── RevealOnScroll.tsx     # Scroll animations
│   ├── blog/                  # Componentes de blog
│   │   ├── BlogFilters.tsx        # Filtros combinados
│   │   ├── BlogPostTracker.tsx    # Event tracking
│   │   ├── CategoryFilter.tsx     # Filtro de categorías
│   │   ├── CodeBlock.tsx          # Syntax highlighting
│   │   ├── Comments.tsx           # Sistema de comentarios Giscus
│   │   ├── EmptyState.tsx         # Estado vacío
│   │   ├── Pagination.tsx         # Paginación
│   │   ├── PortableTextRenderer.tsx  # Renderizado Portable Text
│   │   ├── PostCard.tsx           # Card con search highlight
│   │   ├── PostGrid.tsx           # Grid de posts
│   │   ├── PostHeader.tsx         # Hero del post
│   │   ├── RelatedPosts.tsx       # Posts relacionados
│   │   ├── SearchInput.tsx        # Input con debounce
│   │   ├── SearchStats.tsx        # Stats de búsqueda
│   │   ├── SearchTracker.tsx      # Event tracking búsquedas
│   │   ├── ShareButtons.tsx       # Compartir en redes
│   │   └── TableOfContents.tsx    # TOC automático
│   ├── forms/                 # Componentes de formularios
│   │   ├── ContactForm.tsx        # Formulario de contacto
│   │   └── FormField.tsx          # Field reutilizable
│   ├── gdpr/                  # Componentes GDPR
│   │   ├── CookieConsent.tsx      # Banner de cookies
│   │   ├── DataDeletionForm.tsx   # Form eliminación
│   │   └── DataRequestForm.tsx    # Form exportación
│   ├── layout/                # Layout components
│   │   ├── Footer.tsx         # Footer con enlaces
│   │   ├── Header.tsx         # Header con navegación
│   │   └── MobileMenu.tsx     # Menu móvil
│   ├── markdown/              # Markdown rendering
│   │   └── MarkdownContent.tsx
│   ├── newsletter/            # Newsletter components
│   │   ├── NewsletterForm.tsx     # Form de suscripción
│   │   ├── NewsletterHero.tsx     # Hero section
│   │   ├── NewsletterInline.tsx   # Inline form
│   │   └── NewsletterSkeleton.tsx # Loading state
│   ├── projects/              # Project components
│   │   ├── ProjectCard.tsx        # Card de proyecto
│   │   └── ProjectsClient.tsx     # Client wrapper
│   ├── sections/              # Page sections
│   │   └── hero-section.tsx       # Hero reutilizable
│   ├── seo/                   # SEO components
│   │   ├── Breadcrumbs.tsx        # Breadcrumb navigation
│   │   ├── FAQSchema.tsx          # FAQ structured data
│   │   └── JsonLd.tsx             # JSON-LD schemas
│   └── ui/                    # Componentes UI reutilizables
│       ├── AccentLine.tsx         # Línea decorativa
│       ├── badge.tsx              # Badge component
│       ├── button.tsx             # Button variants
│       ├── card.tsx               # Card component
│       ├── Container.tsx          # Container responsive
│       ├── ExternalLink.tsx       # Link externo seguro
│       ├── input.tsx              # Input component
│       ├── Modal.tsx              # Modal accesible
│       ├── ObfuscatedEmail.tsx    # Email anti-scraping
│       ├── OptimizedImage.tsx     # Image optimizada
│       ├── ScrollIndicator.tsx    # Indicador de scroll
│       ├── Section.tsx            # Section wrapper
│       ├── SectionDivider.tsx     # Divisor de secciones
│       ├── skeleton.tsx           # Loading skeleton
│       └── SkipLink.tsx           # Skip to content
├── lib/
│   ├── analytics/             # Sistema de analytics
│   │   ├── consent.ts         # Gestión de consentimientos
│   │   ├── errors.ts          # Error tracking
│   │   ├── events.ts          # Custom events
│   │   └── types.ts           # TypeScript types
│   ├── constants/             # Constantes globales
│   │   ├── index.ts           # Constantes generales
│   │   └── navigation.ts      # Navegación
│   ├── db/                    # Database
│   │   └── prisma.ts          # Cliente de Prisma
│   ├── design/                # Design system
│   │   └── tokens.ts          # Design tokens
│   ├── email/                 # Email service
│   │   └── resend.ts          # Cliente de Resend
│   ├── generated/             # Código generado
│   │   └── prisma/            # Prisma Client generado
│   ├── github/                # GitHub API client
│   │   ├── cache.ts           # In-memory cache
│   │   ├── client.ts          # Octokit client
│   │   ├── queries.ts         # GraphQL queries
│   │   └── types.ts           # TypeScript types
│   ├── hooks/                 # Custom React hooks
│   │   ├── useBlogPosts.ts    # SWR hook para posts
│   │   ├── useKeyboardNav.ts  # Keyboard navigation
│   │   └── useProjects.ts     # SWR hook para proyectos
│   ├── performance/           # Performance optimization
│   │   └── web-vitals.ts      # Web Vitals helpers
│   ├── rate-limit/            # Rate limiting
│   │   └── redis.ts           # Redis client
│   ├── seo/                   # SEO utilities
│   │   ├── metadata.ts        # Metadata helpers
│   │   └── schema.ts          # Structured data
│   ├── services/              # Business logic
│   │   └── gdpr.ts            # GDPR services
│   ├── utils/                 # Utilities
│   │   ├── blog.ts            # Blog helpers
│   │   ├── cn.ts              # Class names utility
│   │   ├── format.ts          # Formateo (fechas, números)
│   │   ├── guards.ts          # Type guards
│   │   ├── image.ts           # Image optimization
│   │   ├── index.ts           # Barrel exports
│   │   ├── search.ts          # Search helpers
│   │   ├── string.ts          # String manipulation
│   │   └── toc.ts             # Table of Contents
│   └── validations/           # Schemas de validación Zod
│       ├── constants.ts       # Constantes de validación
│       ├── contact.ts         # Schema de contacto
│       ├── email-validator.ts     # Validador de emails
│       ├── email-validator-client.ts  # Validador cliente
│       ├── gdpr.ts            # Schemas GDPR
│       └── newsletter.ts      # Schema newsletter
├── prisma/
│   ├── schema.prisma          # Prisma schema (Subscriber, ConsentLog)
│   └── dev.db                 # SQLite local (desarrollo)
├── sanity/
│   ├── schemas/               # Schemas de Sanity
│   │   ├── author.ts          # Schema de autores
│   │   ├── category.ts        # Schema de categorías
│   │   ├── post.ts            # Schema de posts
│   │   └── project.ts         # Schema de proyectos
│   ├── lib/
│   │   ├── client.ts          # Cliente de Sanity
│   │   ├── image.ts           # Image URL helpers
│   │   └── queries.ts         # Queries GROQ
│   └── sanity.config.ts       # Configuración de Sanity Studio
├── scripts/
│   ├── seed-sanity.mjs        # Script de seed para Sanity
│   └── README.md              # Documentación de scripts
├── public/
│   ├── giscus-theme.css       # Tema personalizado para comentarios
│   └── [assets]               # Assets estáticos
├── types/                     # TypeScript type definitions
├── docs/                      # Documentación adicional
│   ├── CACHE_OPTIMIZATION.md      # Estrategia de caché
│   ├── LIGHTHOUSE_CI.md           # Lighthouse CI setup
│   └── THIRD_PARTY_SCRIPTS.md     # Scripts externos
├── .github/
│   └── workflows/             # GitHub Actions workflows
│       ├── ci.yml             # Quality checks + build
│       ├── test.yml           # Unit tests
│       ├── e2e.yml            # E2E tests
│       ├── lighthouse.yml     # Lighthouse CI
│       └── security.yml       # Security scanning
├── .husky/                    # Git hooks
│   ├── commit-msg             # Commitlint
│   ├── pre-commit             # Lint-staged + Biome
│   └── pre-push               # Tests automáticos
├── biome.json                 # Configuración de Biome
├── commitlint.config.js       # Configuración de Commitlint
├── next.config.ts             # Next.js configuration
├── playwright.config.ts       # Playwright configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── vitest.config.ts           # Vitest configuration
├── CLAUDE.md                  # Instrucciones para Claude Code
├── CHANGELOG.md               # Changelog automático
└── package.json               # Dependencies y scripts
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
- Portable Text con componentes custom
- Syntax highlighting para código
- Imágenes optimizadas con blur placeholders
- Table of Contents automático
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

Ver documentación completa en `docs/08_GISCUS_COMENTARIOS.md`

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

```bash
# Feature development
git checkout develop
git checkout -b feature/nombre-feature
# ... hacer cambios ...
npm run verify  # Verificar calidad antes de commit
git add .
git commit -m "feat(scope): descripción"  # Husky valida formato

# Merge a develop
git checkout develop
git merge feature/nombre-feature --no-ff
git push origin develop

# Release
npm run release -- --release-as 0.x.0  # Genera CHANGELOG y tag
git push --follow-tags origin develop

# (Opcional) GitHub Release
gh release create v0.x.0 --title "v0.x.0: Feature Name" --notes-file CHANGELOG.md
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
- OAuth para autenticación de comentarios
- CSRF protection con tokens
- Honeypot en formularios
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

MIT

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
