# Portfolio 2025

[![CI](https://github.com/JNZader/portfolio-2025/actions/workflows/ci.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Version](https://img.shields.io/badge/version-0.8.0-green)

Portfolio profesional construido con el stack más moderno de 2025. Incluye sistema de blog completo con búsqueda, comentarios, CMS headless, y conexión con GitHub API para proyectos en tiempo real.

## ✨ Características

### 🎨 Sistema de Diseño
- shadcn/ui con Tailwind CSS 4.1 y modo oscuro automático
- OKLCH color space para mejor manipulación de colores
- Tema personalizado sincronizado entre portfolio y comentarios

### 📝 Blog Completo
- **CMS Headless**: Sanity CMS v4 para gestión de contenido
- **Búsqueda Full-Text**: Búsqueda en tiempo real con debouncing y highlight de términos
- **Comentarios**: Sistema de comentarios con Giscus (GitHub Discussions)
- **Portable Text**: Renderizado de contenido rico con syntax highlighting
- **Table of Contents**: Navegación automática en posts largos
- **Posts Relacionados**: Sugerencias basadas en categorías
- **Categorías**: Filtrado por categorías con colores personalizados
- **Share Buttons**: Compartir en redes sociales

### 🚀 Proyectos
- **Integración dual**: Proyectos desde Sanity CMS + GitHub API
- **Búsqueda y filtros**: Búsqueda interactiva con filtros por tecnología
- **Caché inteligente**: GitHub API con cache de 15 minutos

### ⚡ Rendimiento
- **React Server Components**: Optimización automática con Next.js 16
- **ISR**: Incremental Static Regeneration para contenido dinámico
- **React Compiler**: Optimizaciones automáticas de rendimiento
- **Image Optimization**: Next/Image con blur placeholders

### 🧪 Quality Tools
- **Biome**: Linting y formatting (reemplaza ESLint + Prettier)
- **Husky**: Git hooks pre-commit y commit-msg
- **TypeScript Strict**: Type safety completo
- **CI/CD**: GitHub Actions con quality checks + build

## 🚀 Stack Tecnológico

### Core
- **Framework:** Next.js 16.0 (App Router)
- **UI Library:** React 19.2 con React Compiler
- **Language:** TypeScript 5.9 (strict mode)
- **Styling:** Tailwind CSS 4.1 con OKLCH color space

### CMS y APIs
- **Headless CMS:** Sanity CMS v4
- **GitHub API:** Octokit v5 con rate limiting
- **Comments:** Giscus (GitHub Discussions)
- **Theme System:** next-themes con SSR support

### Content Rendering
- **Portable Text:** @portabletext/react v5
- **Syntax Highlighting:** react-syntax-highlighter
- **Code Blocks:** @sanity/code-input

### UI Components
- **Design System:** shadcn/ui
- **Icons:** Lucide React + Sanity Icons
- **Image Optimization:** Next.js Image + Sanity Image URLs

### Search & UX
- **Debouncing:** use-debounce para search input
- **URL State:** Search params para búsquedas compartibles
- **Highlight:** Resaltado de términos en resultados

### Herramientas de Desarrollo
- **Code Quality:** Biome (linting + formatting)
- **Git Hooks:** Husky + lint-staged
- **Commits:** Commitlint con Conventional Commits
- **Versioning:** standard-version para CHANGELOG automático
- **CI/CD:** GitHub Actions con quality checks + build

## 🛠️ Setup y Desarrollo

### 1. Requisitos Previos

- Node.js >= 23.0.0
- npm >= 10.0.0
- Cuenta de Sanity (gratis en [sanity.io](https://sanity.io))
- Repositorio de GitHub con Discussions habilitadas
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

# GitHub API (opcional - mejora rate limits)
GITHUB_TOKEN="ghp_tu_token_aqui"
NEXT_PUBLIC_GITHUB_USERNAME="tu-username"

# Giscus Comments (obtener de https://giscus.app/)
NEXT_PUBLIC_GISCUS_REPO="tu-usuario/tu-repo"
NEXT_PUBLIC_GISCUS_REPO_ID="R_kgDO..."
NEXT_PUBLIC_GISCUS_CATEGORY="Announcements"
NEXT_PUBLIC_GISCUS_CATEGORY_ID="DIC_kwDO..."
```

### 4. Configurar Sanity CMS

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

### 5. Configurar Giscus (Comentarios)

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

### 6. Comandos de Desarrollo

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

# Build
npm run build            # Production build
npm start                # Production server

# Versioning
npm run release          # Patch version (0.0.x)
npm run release:minor    # Minor version (0.x.0)
npm run release:major    # Major version (x.0.0)

# Seed
node scripts/seed-sanity.mjs  # Poblar Sanity con datos de prueba
```

## 📁 Estructura del Proyecto

```
portfolio/
├── app/                       # Next.js App Router
│   ├── (pages)/              # Route group (páginas principales)
│   │   ├── blog/             # Blog listing + búsqueda
│   │   │   └── [slug]/       # Blog post individual
│   │   ├── contacto/         # Página de contacto
│   │   ├── proyectos/        # Proyectos con filtros
│   │   └── sobre-mi/         # About page
│   ├── studio/[[...tool]]/   # Sanity Studio route
│   ├── globals.css           # Tailwind CSS + @theme config
│   └── layout.tsx            # Root layout
├── components/
│   ├── blog/                 # Componentes de blog
│   │   ├── CategoryFilter.tsx       # Filtro de categorías
│   │   ├── CodeBlock.tsx            # Syntax highlighting
│   │   ├── Comments.tsx             # Sistema de comentarios Giscus
│   │   ├── EmptyState.tsx           # Estado vacío
│   │   ├── Pagination.tsx           # Paginación
│   │   ├── PortableTextRenderer.tsx # Renderizado Portable Text
│   │   ├── PostCard.tsx             # Card con search highlight
│   │   ├── PostGrid.tsx             # Grid de posts
│   │   ├── PostHeader.tsx           # Hero del post
│   │   ├── RelatedPosts.tsx         # Posts relacionados
│   │   ├── SearchInput.tsx          # Input con debounce
│   │   ├── SearchStats.tsx          # Stats de búsqueda
│   │   ├── ShareButtons.tsx         # Compartir en redes
│   │   └── TableOfContents.tsx      # TOC automático
│   ├── layout/               # Header, Footer, Navigation
│   ├── projects/             # Project cards y filtros
│   └── ui/                   # Componentes reutilizables (shadcn/ui)
├── lib/
│   ├── github/               # GitHub API client + cache
│   └── utils/
│       ├── blog.ts           # Utilidades de blog
│       ├── format.ts         # Formateo de fechas
│       ├── search.ts         # Funciones de búsqueda
│       └── toc.ts            # Table of Contents generator
├── sanity/
│   ├── schemas/              # Schemas de Sanity
│   │   ├── author.ts         # Schema de autores
│   │   ├── category.ts       # Schema de categorías
│   │   ├── post.ts           # Schema de posts
│   │   └── project.ts        # Schema de proyectos
│   ├── lib/
│   │   ├── client.ts         # Cliente de Sanity
│   │   ├── image.ts          # Image URL helpers
│   │   └── queries.ts        # Queries GROQ
│   └── sanity.config.ts      # Configuración de Sanity Studio
├── scripts/
│   ├── seed-sanity.mjs       # Script de seed
│   └── README.md             # Documentación de scripts
├── public/
│   └── giscus-theme.css      # Tema personalizado para comentarios
└── types/                    # TypeScript type definitions
```

## 🎨 Sistema de Diseño

### Temas
- **Light/Dark Mode**: Toggle automático con `next-themes`
- **Color System**: OKLCH para mejor manipulación de colores
- **Variables CSS**: Compatible con shadcn/ui components
- **Giscus Sync**: Tema de comentarios sincronizado con portfolio

### Componentes UI
Basado en shadcn/ui con customizaciones:
- Button, Badge, Container, Section
- Theme toggle con iconos animados
- Responsive navigation con mobile menu
- Skip link para accesibilidad

## 📝 Blog Features

### Búsqueda Full-Text
- Búsqueda server-side con GROQ en Sanity
- Debouncing de 500ms en el input
- Highlight de términos encontrados
- Búsqueda en título, excerpt y contenido
- Combinable con filtros de categoría
- URL params para búsquedas compartibles

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

## 🔒 Seguridad

- Variables sensibles en `.env.local` (git ignored)
- Rate limiting en GitHub API con caché inteligente
- TypeScript strict mode para type safety
- Validación de datos con Sanity schemas
- Sanitización de inputs en búsqueda
- OAuth para autenticación de comentarios

## 🚀 Deployment

### Vercel (Recomendado)

1. Push a GitHub
2. Conecta el repo en Vercel
3. Agrega las variables de entorno
4. Deploy automático en cada push

### Variables de Entorno en Producción

Asegúrate de configurar todas las variables de `.env.local` en tu plataforma de deployment:
- Variables de Sanity (obligatorias)
- Variables de Giscus (para comentarios)
- Variables de GitHub (opcional)
- `NEXT_PUBLIC_SITE_URL` con tu dominio final

## 📄 Licencia

MIT

## 🙏 Créditos

- [Next.js](https://nextjs.org/) - Framework React
- [Sanity](https://www.sanity.io/) - CMS Headless
- [Giscus](https://giscus.app/) - Sistema de comentarios
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Biome](https://biomejs.dev/) - Linting y formatting
