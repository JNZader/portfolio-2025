# Guía de Commits - Feature Branch v0.23.0

## Resumen de Cambios

Este documento detalla cómo commitear todos los cambios realizados en la sesión de mejoras del portfolio, siguiendo Git Flow y Conventional Commits.

## Prerequisitos

```bash
# Verificar que estás en develop y actualizado
git checkout develop
git pull origin develop

# Verificar estado actual
git status
```

---

## Paso 1: Crear Feature Branch y Push Inicial

```bash
git checkout -b feature/admin-security-improvements
git push -u origin feature/admin-security-improvements
```

> **IMPORTANTE sobre `git push`:**
> - **Primer push:** Usar `git push -u origin feature/admin-security-improvements` para establecer el tracking (upstream)
> - **Pushes siguientes:** Solo `git push` (ya tiene el upstream configurado)
>
> El flag `-u` (o `--set-upstream`) vincula tu rama local con la remota. Sin esto, Git no sabe a qué rama remota enviar los cambios.

---

## Paso 2: Commits Atómicos (con push después de cada uno)

### Commit 1: Sistema de Autenticación OAuth

**Descripción:** Agrega autenticación con GitHub OAuth usando NextAuth v5 para proteger el panel de administración.

```bash
# Agregar archivos
git add lib/auth/config.ts
git add lib/auth/index.ts
git add app/api/auth/\[...nextauth\]/route.ts
git add types/next-auth.d.ts

# Commit
git commit -m "feat(auth): add GitHub OAuth authentication system

- Add NextAuth v5 with GitHub provider
- Create auth configuration with admin email validation
- Add JWT callbacks for admin role management
- Add TypeScript declarations for extended session types
- Auto-detect AUTH_URL for Vercel deployment"

# Push
git push
```

---

### Commit 2: Panel de Administración

**Descripción:** Agrega páginas de administración con dashboard de monitoreo de salud del sistema.

```bash
# Agregar archivos
git add app/\(pages\)/admin/page.tsx
git add app/\(pages\)/admin/layout.tsx
git add app/\(pages\)/admin/login/page.tsx
git add app/\(pages\)/admin/unauthorized/page.tsx
git add components/admin/AdminDashboard.tsx
git add app/api/admin/health/route.ts

# Commit
git commit -m "feat(admin): add admin dashboard with health monitoring

- Create admin pages (dashboard, login, unauthorized)
- Add AdminDashboard component with auto-refresh
- Create protected /api/admin/health endpoint
- Show system status, services health, and metrics"

# Push
git push
```

---

### Commit 3: Seguridad y Proxy

**Descripción:** Protege el endpoint de health público, migra middleware a proxy (Next.js 16), y agrega protección de rutas admin.

```bash
# Agregar archivos
git add app/api/health/route.ts
git add proxy.ts
git rm middleware.ts
git add lib/security/security-config.ts

# Commit
git commit -m "fix(security): protect health endpoint and migrate to proxy

- Reduce public /api/health to minimal info (status, timestamp)
- Move detailed health check to protected /api/admin/health
- Migrate middleware.ts to proxy.ts (Next.js 16)
- Add admin route protection in proxy
- Add CSRF protection and bot detection"

# Push
git push
```

---

### Commit 4: Corrección de Tipos

**Descripción:** Reemplaza tipos `any` con `unknown` para mejorar type safety.

```bash
# Agregar archivos
git add types/utils.ts

# Commit
git commit -m "refactor(types): replace any with unknown in utilities

- Update Dictionary type to use unknown instead of any
- Update AsyncFunction type parameters to use unknown
- Improve type safety across utility types"

# Push
git push
```

---

### Commit 5: Correcciones de Accesibilidad y Estado

**Descripción:** Corrige el estado global mutable en Modal y agrega ID faltante en MobileMenu.

```bash
# Agregar archivos
git add components/ui/Modal.tsx
git add components/layout/MobileMenu.tsx

# Commit
git commit -m "fix(a11y): fix Modal global state and MobileMenu accessibility

- Replace global mutable state with React Context in Modal
- Add ModalProvider for proper state management
- Add id='mobile-menu' for aria-controls reference
- Improve screen reader compatibility"

# Push
git push
```

---

### Commit 6: Nuevos Componentes UI

**Descripción:** Agrega nuevos componentes de UI y elimina CustomCursor no utilizado.

```bash
# Agregar archivos
git add components/ui/ConfirmationModal.tsx
git add components/ui/icons.tsx
git add components/error/ErrorBoundary.tsx
git add components/blog/SyntaxHighlighter.tsx
git rm components/ui/CustomCursor.tsx

# Commit
git commit -m "feat(ui): add new UI components and remove unused CustomCursor

- Add ConfirmationModal for destructive action confirmations
- Add centralized icons component
- Add ErrorBoundary for graceful error handling
- Add SyntaxHighlighter for code blocks
- Remove unused CustomCursor component"

# Push
git push
```

---

### Commit 7: Configuración de Entorno

**Descripción:** Reorganiza archivos de entorno con estructura clara para desarrollo y producción.

```bash
# Agregar archivos
git add .env.example
git add .gitignore

# Commit
git commit -m "chore(env): reorganize environment configuration

- Update .env.example with comprehensive documentation
- Structure: .env (prod), .env.local (dev), .env.example (template)
- Add instructions for GitHub OAuth setup (dev/prod)
- Update .gitignore to properly ignore env files"

# Push
git push
```

---

### Commit 8: Dependencias

**Descripción:** Agrega next-auth y actualiza dependencias del proyecto.

```bash
# Agregar archivos
git add package.json
git add package-lock.json

# Commit
git commit -m "chore(deps): add next-auth and update dependencies

- Add next-auth@beta for authentication
- Update existing dependencies to latest versions"

# Push
git push
```

---

### Commit 9: Tests y Snapshots

**Descripción:** Actualiza tests E2E y snapshots visuales.

```bash
# Agregar archivos
git add e2e/tests/accessibility.spec.ts
git add e2e/tests/blog.spec.ts
git add e2e/tests/contact.spec.ts
git add e2e/tests/navigation.spec.ts
git add e2e/tests/newsletter.spec.ts
git add e2e/tests/visual.spec.ts
git add e2e/tests/visual.spec.ts-snapshots/
git add __tests__/integration/components/NewsletterForm.test.tsx
git add __tests__/test-utils.tsx

# Commit
git commit -m "test(e2e): update tests and visual snapshots

- Update E2E test selectors and assertions
- Add new visual snapshots for dark mode
- Update existing snapshots after UI changes
- Add test utilities"

# Push
git push
```

---

### Commit 10: Configuraciones

**Descripción:** Actualiza configuraciones de Biome, Next.js, Playwright y Lighthouse.

```bash
# Agregar archivos
git add biome.json
git add next.config.ts
git add playwright.config.ts
git add lighthouserc.js

# Commit
git commit -m "chore(config): update build and test configurations

- Update Biome linting rules
- Update Next.js configuration for Next.js 16
- Update Playwright test configuration
- Add Lighthouse CI configuration"

# Push
git push
```

---

### Commit 11: Scripts y Utilidades

**Descripción:** Agrega nuevos scripts y utilidades.

```bash
# Agregar archivos
git add scripts/audit-sanity-data.mjs
git add scripts/clean-sanity-data.mjs
git add scripts/measure-web-vitals.js
git add scripts/README.md
git add lib/utils/toast.ts
git add hooks/

# Commit
git commit -m "feat(utils): add utility scripts and hooks

- Add Sanity data audit and cleanup scripts
- Add web vitals measurement script
- Add toast utility for notifications
- Add custom React hooks"

# Push
git push
```

---

### Commit 12: Documentación

**Descripción:** Actualiza documentación del proyecto.

```bash
# Agregar archivos
git add README.md
git add docs/CI_CD_DOCUMENTATION.md
git add docs/CONTENT_GUIDE.md
git add docs/GIT_COMMIT_GUIDE.md

# Commit
git commit -m "docs: update project documentation

- Update README with new features
- Update CI/CD documentation
- Add content writing guide
- Add git commit guide"

# Push
git push
```

---

### Commit 13: Refactorizaciones de Páginas

**Descripción:** Actualiza páginas y rutas API con mejoras menores.

```bash
# Agregar archivos
git add app/\(pages\)/blog/\[slug\]/error.tsx
git add app/\(pages\)/blog/\[slug\]/opengraph-image.tsx
git add app/\(pages\)/blog/\[slug\]/page.tsx
git add app/\(pages\)/blog/error.tsx
git add app/\(pages\)/data-request/page.tsx
git add app/\(pages\)/design-system/page.tsx
git add app/\(pages\)/proyectos/\[id\]/page.tsx
git add app/\(pages\)/proyectos/page.tsx
git add app/\(pages\)/sobre-mi/page.tsx
git add app/actions/newsletter.ts
git add app/api/analytics/route.ts
git add app/api/analytics/web-vitals/route.ts
git add app/api/data-deletion/route.ts
git add app/api/data-export/route.ts
git add app/api/newsletter/unsubscribe/route.ts
git add app/api/resume/route.ts
git add app/globals.css
git add app/layout.tsx
git add app/page.tsx

# Commit
git commit -m "refactor(pages): update pages and API routes

- Update error boundaries across pages
- Improve API route handlers
- Update CSS styles
- Minor component improvements"

# Push
git push
```

---

### Commit 14: Componentes Restantes

**Descripción:** Actualiza componentes de UI, layout y features.

```bash
# Agregar archivos
git add components/a11y/ScreenReaderAnnouncer.tsx
git add components/animations/CSSRevealOnScroll.tsx
git add components/animations/RevealOnScroll.tsx
git add components/blog/BlogFilters.tsx
git add components/blog/CodeBlock.tsx
git add components/blog/Comments.tsx
git add components/blog/EmptyState.tsx
git add components/blog/PostCard.tsx
git add components/features/EasterEggs.tsx
git add components/forms/ContactForm.tsx
git add components/gdpr/CookieConsent.tsx
git add components/gdpr/DataDeletionForm.tsx
git add components/gdpr/DataRequestForm.tsx
git add components/layout/ClientComponents.tsx
git add components/layout/Footer.tsx
git add components/layout/Header.tsx
git add components/layout/NavLink.tsx
git add components/layout/ThemeToggle.tsx
git add components/markdown/MarkdownContent.tsx
git add components/newsletter/NewsletterForm.tsx
git add components/newsletter/NewsletterHero.tsx
git add components/newsletter/NewsletterInline.tsx
git add components/sections/hero-section.tsx
git add components/ui/HeroBackground.tsx
git add components/ui/ObfuscatedEmail.tsx
git add components/ui/ScrollIndicator.tsx
git add components/ui/ScrollProgress.tsx
git add components/ui/SkipLink.tsx

# Commit
git commit -m "refactor(components): update UI and layout components

- Improve animation components
- Update blog components
- Enhance form components
- Update layout components
- Minor fixes and improvements"

# Push
git push
```

---

### Commit 15: Librerías y Tipos

**Descripción:** Actualiza librerías del proyecto.

```bash
# Agregar archivos
git add lib/achievements.ts
git add lib/analytics/vercel.tsx
git add lib/constants/skills.ts
git add lib/performance/resource-hints.tsx
git add lib/rate-limit/redis.ts
git add lib/utils/string.ts
git add lib/utils/tech-icons.tsx
git add types/global.d.ts

# Commit
git commit -m "refactor(lib): update libraries and utilities

- Update achievements system
- Improve analytics integration
- Update skills constants
- Enhance performance utilities
- Update rate limiting
- Improve string utilities"

# Push
git push
```

---

## Paso 3: Verificar Commits

```bash
# Ver historial de commits
git log --oneline -20

# Verificar que todo está pusheado
git status
```

---

## Paso 4: Crear Pull Request

```bash
gh pr create --title "feat: add admin authentication and security improvements" --body "## Summary

### New Features
- GitHub OAuth authentication for admin panel
- Admin dashboard with system health monitoring
- Protected health endpoint with detailed metrics

### Security Improvements
- Migrated middleware to proxy (Next.js 16)
- Protected sensitive endpoints
- Added CSRF protection and bot detection

### Code Quality
- Fixed type safety issues (any → unknown)
- Fixed Modal global state anti-pattern
- Improved accessibility (MobileMenu id)

### Other Changes
- New UI components (ConfirmationModal, ErrorBoundary)
- Reorganized environment configuration
- Updated tests and visual snapshots
- Updated dependencies and configurations

## Test Plan
- [ ] Test GitHub OAuth login flow
- [ ] Verify admin dashboard loads correctly
- [ ] Check public /api/health returns minimal info
- [ ] Check /api/admin/health requires authentication
- [ ] Run E2E tests
- [ ] Verify build succeeds"
```

---

## Paso 5: Merge a Develop

Después de aprobar el PR:

```bash
# Opción A: Merge desde GitHub UI (recomendado)
# Click "Merge pull request" → "Squash and merge" o "Create a merge commit"

# Opción B: Merge local
git checkout develop
git pull origin develop
git merge --no-ff feature/admin-security-improvements
git push origin develop
```

---

## Paso 6: Cleanup

```bash
# Eliminar branch local
git branch -d feature/admin-security-improvements

# Eliminar branch remota
git push origin --delete feature/admin-security-improvements
```

---

## Paso 7: Release (Opcional)

Si quieres crear una release:

```bash
git checkout develop
git pull origin develop

# Crear release branch
git checkout -b release/0.23.0
git push -u origin release/0.23.0

# Bump version
npm version minor -m "chore(release): %s"
git push
git push --tags

# Merge a main
git checkout main
git pull origin main
git merge --no-ff release/0.23.0
git push origin main

# Tag (si no se creó con npm version)
git tag -a v0.23.0 -m "Release v0.23.0 - Admin authentication and security improvements"
git push origin v0.23.0

# Merge back to develop
git checkout develop
git pull origin develop
git merge --no-ff release/0.23.0
git push origin develop

# Cleanup
git branch -d release/0.23.0
git push origin --delete release/0.23.0
```

---

## Script Completo (Copiar y Pegar)

Si prefieres ejecutar todo de una vez, aquí está el script completo:

```bash
#!/bin/bash

# === SETUP ===
git checkout develop
git pull origin develop
git checkout -b feature/admin-security-improvements
git push -u origin feature/admin-security-improvements

# === COMMIT 1: Auth ===
git add lib/auth/config.ts lib/auth/index.ts "app/api/auth/[...nextauth]/route.ts" types/next-auth.d.ts
git commit -m "feat(auth): add GitHub OAuth authentication system

- Add NextAuth v5 with GitHub provider
- Create auth configuration with admin email validation
- Add JWT callbacks for admin role management
- Add TypeScript declarations for extended session types
- Auto-detect AUTH_URL for Vercel deployment"
git push

# === COMMIT 2: Admin ===
git add "app/(pages)/admin/page.tsx" "app/(pages)/admin/layout.tsx" "app/(pages)/admin/login/page.tsx" "app/(pages)/admin/unauthorized/page.tsx" components/admin/AdminDashboard.tsx app/api/admin/health/route.ts
git commit -m "feat(admin): add admin dashboard with health monitoring

- Create admin pages (dashboard, login, unauthorized)
- Add AdminDashboard component with auto-refresh
- Create protected /api/admin/health endpoint
- Show system status, services health, and metrics"
git push

# === COMMIT 3: Security ===
git add app/api/health/route.ts proxy.ts lib/security/security-config.ts
git rm middleware.ts
git commit -m "fix(security): protect health endpoint and migrate to proxy

- Reduce public /api/health to minimal info (status, timestamp)
- Move detailed health check to protected /api/admin/health
- Migrate middleware.ts to proxy.ts (Next.js 16)
- Add admin route protection in proxy
- Add CSRF protection and bot detection"
git push

# === COMMIT 4: Types ===
git add types/utils.ts
git commit -m "refactor(types): replace any with unknown in utilities

- Update Dictionary type to use unknown instead of any
- Update AsyncFunction type parameters to use unknown
- Improve type safety across utility types"
git push

# === COMMIT 5: A11y ===
git add components/ui/Modal.tsx components/layout/MobileMenu.tsx
git commit -m "fix(a11y): fix Modal global state and MobileMenu accessibility

- Replace global mutable state with React Context in Modal
- Add ModalProvider for proper state management
- Add id='mobile-menu' for aria-controls reference
- Improve screen reader compatibility"
git push

# === COMMIT 6: UI Components ===
git add components/ui/ConfirmationModal.tsx components/ui/icons.tsx components/error/ErrorBoundary.tsx components/blog/SyntaxHighlighter.tsx
git rm components/ui/CustomCursor.tsx
git commit -m "feat(ui): add new UI components and remove unused CustomCursor

- Add ConfirmationModal for destructive action confirmations
- Add centralized icons component
- Add ErrorBoundary for graceful error handling
- Add SyntaxHighlighter for code blocks
- Remove unused CustomCursor component"
git push

# === COMMIT 7: Env ===
git add .env.example .gitignore
git commit -m "chore(env): reorganize environment configuration

- Update .env.example with comprehensive documentation
- Structure: .env (prod), .env.local (dev), .env.example (template)
- Add instructions for GitHub OAuth setup (dev/prod)
- Update .gitignore to properly ignore env files"
git push

# === COMMIT 8: Deps ===
git add package.json package-lock.json
git commit -m "chore(deps): add next-auth and update dependencies

- Add next-auth@beta for authentication
- Update existing dependencies to latest versions"
git push

# === COMMIT 9: Tests ===
git add e2e/tests/ "__tests__/integration/components/NewsletterForm.test.tsx" "__tests__/test-utils.tsx"
git commit -m "test(e2e): update tests and visual snapshots

- Update E2E test selectors and assertions
- Add new visual snapshots for dark mode
- Update existing snapshots after UI changes
- Add test utilities"
git push

# === COMMIT 10: Config ===
git add biome.json next.config.ts playwright.config.ts lighthouserc.js
git commit -m "chore(config): update build and test configurations

- Update Biome linting rules
- Update Next.js configuration for Next.js 16
- Update Playwright test configuration
- Add Lighthouse CI configuration"
git push

# === COMMIT 11: Utils ===
git add scripts/audit-sanity-data.mjs scripts/clean-sanity-data.mjs scripts/measure-web-vitals.js scripts/README.md lib/utils/toast.ts hooks/
git commit -m "feat(utils): add utility scripts and hooks

- Add Sanity data audit and cleanup scripts
- Add web vitals measurement script
- Add toast utility for notifications
- Add custom React hooks"
git push

# === COMMIT 12: Docs ===
git add README.md docs/CI_CD_DOCUMENTATION.md docs/CONTENT_GUIDE.md docs/GIT_COMMIT_GUIDE.md
git commit -m "docs: update project documentation

- Update README with new features
- Update CI/CD documentation
- Add content writing guide
- Add git commit guide"
git push

# === COMMIT 13: Pages ===
git add "app/(pages)/blog/" "app/(pages)/data-request/page.tsx" "app/(pages)/design-system/page.tsx" "app/(pages)/proyectos/" "app/(pages)/sobre-mi/page.tsx" app/actions/newsletter.ts "app/api/analytics/" "app/api/data-deletion/route.ts" "app/api/data-export/route.ts" "app/api/newsletter/unsubscribe/route.ts" "app/api/resume/route.ts" app/globals.css app/layout.tsx app/page.tsx
git commit -m "refactor(pages): update pages and API routes

- Update error boundaries across pages
- Improve API route handlers
- Update CSS styles
- Minor component improvements"
git push

# === COMMIT 14: Components ===
git add components/a11y/ components/animations/ components/blog/BlogFilters.tsx components/blog/CodeBlock.tsx components/blog/Comments.tsx components/blog/EmptyState.tsx components/blog/PostCard.tsx components/features/ components/forms/ components/gdpr/ components/layout/ClientComponents.tsx components/layout/Footer.tsx components/layout/Header.tsx components/layout/NavLink.tsx components/layout/ThemeToggle.tsx components/markdown/ components/newsletter/ components/sections/ components/ui/HeroBackground.tsx components/ui/ObfuscatedEmail.tsx components/ui/ScrollIndicator.tsx components/ui/ScrollProgress.tsx components/ui/SkipLink.tsx
git commit -m "refactor(components): update UI and layout components

- Improve animation components
- Update blog components
- Enhance form components
- Update layout components
- Minor fixes and improvements"
git push

# === COMMIT 15: Lib ===
git add lib/achievements.ts lib/analytics/vercel.tsx lib/constants/skills.ts lib/performance/resource-hints.tsx lib/rate-limit/redis.ts lib/utils/string.ts lib/utils/tech-icons.tsx types/global.d.ts
git commit -m "refactor(lib): update libraries and utilities

- Update achievements system
- Improve analytics integration
- Update skills constants
- Enhance performance utilities
- Update rate limiting
- Improve string utilities"
git push

# === DONE ===
echo "✅ Todos los commits completados y pusheados"
git log --oneline -15
```

---

## Notas Importantes

1. **Git Push - Upstream Tracking:**
   ```bash
   # PRIMER push de una rama nueva - establecer upstream:
   git push -u origin nombre-rama

   # TODOS los pushes siguientes - ya tiene upstream:
   git push

   # Si olvidaste -u en el primer push:
   git push --set-upstream origin nombre-rama
   ```

2. **No commitear archivos sensibles:**
   - `.env`
   - `.env.local`
   - `.env.development.local`
   - `.env.production.local`

3. **Archivos que SÍ se commitean:**
   - `.env.example` (template sin secretos)

4. **Verificar antes de cada commit:**
   ```bash
   npm run verify  # type-check + biome
   ```

5. **Si hay errores de lint:**
   ```bash
   npm run check:write  # auto-fix
   ```

6. **En PowerShell usar comillas para paths con caracteres especiales:**
   ```powershell
   git add "app/(pages)/admin/page.tsx"
   git add "app/api/auth/[...nextauth]/route.ts"
   ```

7. **En Bash/Git Bash usar escape o comillas:**
   ```bash
   git add app/\(pages\)/admin/page.tsx
   # o
   git add "app/(pages)/admin/page.tsx"
   ```
