# Portfolio 2025

[![CI](https://github.com/JNZader/portfolio-2025/actions/workflows/ci.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Version](https://img.shields.io/badge/version-0.5.1-green)

Portfolio profesional construido con el stack más moderno de 2025. Incluye sistema de diseño moderno con dark mode, integración con Sanity CMS para gestión de contenido, y conexión con GitHub API para mostrar proyectos en tiempo real.

## ✨ Características

- 🎨 **Sistema de Diseño**: shadcn/ui con Tailwind CSS 4.1 y modo oscuro
- 📝 **CMS Headless**: Sanity CMS para gestión de posts y proyectos
- 🔗 **GitHub Integration**: Proyectos desde GitHub API con caché inteligente
- ⚡ **React Server Components**: Optimización automática con Next.js 16
- 🎯 **TypeScript Estricto**: Type safety completo en todo el proyecto
- 🧪 **Quality Tools**: Biome para linting/formatting, Husky para git hooks
- 📦 **React Compiler**: Optimizaciones automáticas de rendimiento

## 🚀 Stack Tecnológico

### Core
- **Framework:** Next.js 16.0 (App Router)
- **UI Library:** React 19.2 con React Compiler
- **Language:** TypeScript 5.9 (strict mode)
- **Styling:** Tailwind CSS 4.1 con OKLCH color space

### CMS y APIs
- **Headless CMS:** Sanity CMS v4
- **GitHub API:** Octokit v5 con rate limiting
- **Theme System:** next-themes con SSR support

### UI Components
- **Design System:** shadcn/ui
- **Icons:** Lucide React + Custom SVG
- **Image Optimization:** Next.js Image component

### Herramientas de Desarrollo
- **Code Quality:** Biome (reemplaza ESLint + Prettier)
- **Git Hooks:** Husky + lint-staged
- **Commits:** Commitlint con Conventional Commits
- **Versioning:** standard-version para CHANGELOG automático
- **CI/CD:** GitHub Actions con quality checks + build

## 🛠️ Setup y Desarrollo

### 1. Requisitos Previos

- Node.js >= 23.0.0
- npm >= 10.0.0
- Cuenta de Sanity (gratis en [sanity.io](https://sanity.io))
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

# GitHub API (opcional - mejora rate limits)
GITHUB_TOKEN="ghp_tu_token_aqui"
NEXT_PUBLIC_GITHUB_USERNAME="tu-username"
```

### 4. Comandos de Desarrollo

```bash
# Desarrollo
npm run dev              # Next.js dev server (localhost:3000)

# Sanity Studio
# Acceder a http://localhost:3000/studio para gestionar contenido

# Quality Checks
npm run verify           # Type-check + Biome check (usar antes de commits)
npm run type-check       # Solo TypeScript
npm run check            # Solo Biome
npm run check:write      # Biome con auto-fix

# Build
npm run build            # Production build
npm start                # Production server

# Versioning
npm run release          # Patch version (0.0.x)
npm run release:minor    # Minor version (0.x.0)
npm run release:major    # Major version (x.0.0)
```

## 📁 Estructura del Proyecto

```
portfolio/
├── app/                       # Next.js App Router
│   ├── (pages)/              # Route group (páginas principales)
│   ├── studio/[[...tool]]/   # Sanity Studio route
│   ├── globals.css           # Tailwind CSS + @theme config
│   └── layout.tsx            # Root layout
├── components/
│   ├── layout/               # Header, Footer, Navigation
│   ├── projects/             # Project cards y filtros
│   └── ui/                   # Componentes reutilizables (shadcn/ui)
├── lib/
│   ├── github/               # GitHub API client + cache
│   └── utils.ts              # Utilidades compartidas
├── sanity/
│   ├── schemas/              # Schemas de Sanity (post, project, category)
│   ├── lib/                  # Client, queries, image helpers
│   └── sanity.config.ts      # Configuración de Sanity Studio
└── types/                    # TypeScript type definitions

```

## 🎨 Sistema de Diseño

### Temas
- **Light/Dark Mode**: Toggle automático con `next-themes`
- **Color System**: OKLCH para mejor manipulación de colores
- **Variables CSS**: Compatible con shadcn/ui components

### Componentes UI
Basado en shadcn/ui con customizaciones:
- Button, Container, Section
- Theme toggle con iconos animados
- Responsive navigation con mobile menu

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
git checkout -b feature/nombre-feature
# ... hacer cambios ...
npm run verify  # Verificar calidad antes de commit
git add .
git commit -m "feat(scope): descripción"  # Husky valida formato

# Merge a develop
git checkout develop
git merge feature/nombre-feature

# Release
npm run release  # Genera CHANGELOG y tag
git push --follow-tags origin develop
```

## 📊 Integración con GitHub

El portfolio muestra automáticamente proyectos desde GitHub que tengan los topics:
- `portfolio`
- `featured`

Si no hay proyectos con estos topics, muestra los 3 repos más recientes.

**Configuración**:
1. Agregar topics a tus repos en GitHub
2. Configurar `NEXT_PUBLIC_GITHUB_USERNAME` en `.env.local`
3. (Opcional) Agregar `GITHUB_TOKEN` para mejor rate limit

## 🔒 Seguridad

- Variables sensibles en `.env.local` (git ignored)
- Rate limiting en GitHub API con caché inteligente
- TypeScript strict mode para type safety
- Validación de datos con Sanity schemas

## 📄 Licencia

MIT
