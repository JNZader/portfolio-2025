# CI/CD Documentation

## 📋 Tabla de Contenidos

- [Descripcion General](#descripcion-general)
- [Workflows Implementados](#workflows-implementados)
- [Estrategia de Caching](#estrategia-de-caching)
- [Secrets y Variables de Entorno](#secrets-y-variables-de-entorno)
- [Triggers y Ejecucion](#triggers-y-ejecucion)
- [Tiempos de Ejecucion](#tiempos-de-ejecucion)
- [Troubleshooting](#troubleshooting)
- [Mejores Practicas](#mejores-practicas)

---

## 📖 Descripcion General

Este proyecto utiliza **GitHub Actions** para automatizar completamente el proceso de CI/CD con 5 workflows especializados:

- **CI**: Quality checks + Build
- **Tests**: Unit tests con coverage
- **E2E**: End-to-end tests con Playwright
- **Lighthouse**: Performance audits
- **Security**: Vulnerability scanning

**Beneficios:**
- ✅ Detección temprana de bugs
- ✅ Calidad de código consistente
- ✅ Performance garantizado
- ✅ Seguridad validada
- ✅ Feedback rápido en PRs

---

## 🔄 Workflows Implementados

### 1. CI Workflow (`ci.yml`)

**Propósito:** Validar calidad de código y build en cada cambio

**Jobs:**
1. **Quality Check**
   - Biome linting + formatting
   - TypeScript type checking
   - Prisma Client generation

2. **Build**
   - Next.js production build
   - Environment variables validation
   - Build artifacts upload

**Se ejecuta en:**
- ✅ Push a `main` o `develop`
- ✅ Pull requests a `main` o `develop`

**Duración:** ~3-5 minutos (con cache)

**Cache:**
- Next.js build cache (`.next/cache`)
- Prisma Client (`node_modules/.prisma`)

---

### 2. Tests Workflow (`test.yml`)

**Propósito:** Ejecutar tests unitarios e integration tests

**Features:**
- Vitest con Happy DOM
- Coverage reports (HTML + JSON)
- Upload a Codecov (opcional)
- Coverage artifacts

**Se ejecuta en:**
- ✅ Push a `main` o `develop`
- ✅ Pull requests a `main` o `develop`

**Duración:** ~2-3 minutos (con cache)

**Cache:**
- Vitest cache (`node_modules/.vitest`)

**Coverage Thresholds:**
- Lines: 80%
- Functions: 80%
- Branches: 75%
- Statements: 80%

---

### 3. E2E Tests Workflow (`e2e.yml`)

**Propósito:** Tests end-to-end con Playwright

**Features:**
- Multi-browser testing (Chromium, Firefox, WebKit)
- Accessibility tests con axe-core
- Visual regression tests
- Test reports + screenshots
- Timeout: 60 minutos

**Se ejecuta en:**
- ✅ Push a `main` o `develop`
- ✅ Pull requests a `main` o `develop`

**Duración:** ~5-8 minutos (con cache)

**Cache:**
- Playwright browsers (`~/.cache/ms-playwright`) - **~500MB**
- Next.js build cache (`.next/cache`)

**Artifacts:**
- Playwright HTML report (30 días)
- Test results (30 días)
- Screenshots en failures

---

### 4. Lighthouse CI Workflow (`lighthouse.yml`)

**Propósito:** Auditoría de performance y best practices

**Features:**
- Lighthouse CI con assertions
- Audita 5 páginas principales
- 3 runs por página para estabilidad
- Performance budgets
- PR comments con resultados

**Se ejecuta en:**
- ✅ Pull requests a `main` o `develop`

**Duración:** ~4-6 minutos (con cache)

**Cache:**
- Next.js build cache (`.next/cache`)
- Prisma Client (`node_modules/.prisma`)

**Thresholds:**
- Performance: ≥95
- Accessibility: ≥95
- Best Practices: ≥95
- SEO: ≥95
- FCP: ≤2000ms
- LCP: ≤2500ms
- CLS: ≤0.1
- TBT: ≤300ms

**Páginas auditadas:**
- `/` - Homepage
- `/blog` - Blog listing
- `/proyectos` - Projects
- `/contacto` - Contact
- `/sobre-mi` - About

---

### 5. Security Workflow (`security.yml`)

**Propósito:** Escaneo de vulnerabilidades y dependencias

**Jobs:**

1. **Dependency Review** (solo en PRs)
   - Revisa nuevas dependencias
   - Detecta vulnerabilidades conocidas
   - Falla si hay vulnerabilidades HIGH o CRITICAL

2. **CodeQL Analysis**
   - Análisis estático de código
   - Detecta vulnerabilidades de seguridad
   - Patterns de código inseguro
   - Lenguaje: JavaScript/TypeScript

3. **NPM Audit**
   - Escaneo de dependencias npm
   - Audit level: HIGH
   - Reporta vulnerabilidades en node_modules

**Se ejecuta en:**
- ✅ Push a `main` o `develop`
- ✅ Pull requests a `main` o `develop`
- ✅ Weekly schedule (Lunes 00:00 UTC)

**Duración:** ~2-4 minutos

**Permisos requeridos:**
- `actions: read`
- `contents: read`
- `security-events: write`

---

## 🗄️ Estrategia de Caching

### Tipos de Cache Implementados

#### 1. NPM Dependencies Cache
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```
- **Qué cachea:** `~/.npm` directory
- **Key:** Hash de `package-lock.json`
- **Beneficio:** ~30-60 segundos ahorrados en `npm ci`
- **Usado en:** TODOS los workflows

#### 2. Next.js Build Cache
```yaml
path: .next/cache
key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx') }}
```
- **Qué cachea:** Webpack cache, análisis de bundle
- **Invalidación:** Cambios en dependencies O source code
- **Beneficio:** 30-50% más rápido en builds
- **Usado en:** CI, E2E, Lighthouse

#### 3. Prisma Client Cache
```yaml
path: |
  node_modules/.prisma
  node_modules/@prisma/client
key: ${{ runner.os }}-prisma-${{ hashFiles('**/prisma/schema.prisma') }}
```
- **Qué cachea:** Prisma Client generado
- **Invalidación:** Cambios en `schema.prisma`
- **Beneficio:** ~10-20 segundos en generation
- **Usado en:** CI, Lighthouse

#### 4. Playwright Browsers Cache
```yaml
path: ~/.cache/ms-playwright
key: ${{ runner.os }}-playwright-${{ hashFiles('**/package-lock.json') }}
```
- **Qué cachea:** Chromium, Firefox, WebKit binaries
- **Tamaño:** ~500MB
- **Invalidación:** Cambios en Playwright version
- **Beneficio:** 2-3 minutos ahorrados
- **Usado en:** E2E

#### 5. Vitest Cache
```yaml
path: node_modules/.vitest
key: ${{ runner.os }}-vitest-${{ hashFiles('**/package-lock.json') }}
```
- **Qué cachea:** Test cache y resultados
- **Beneficio:** 10-20% más rápido en tests
- **Usado en:** Tests

### Restore Keys Strategy

Todos los caches usan `restore-keys` para aprovechar caches parciales:

```yaml
restore-keys: |
  ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-
  ${{ runner.os }}-nextjs-
```

**Funcionamiento:**
1. Busca cache exacto con key completa
2. Si no existe, busca con dependencies hash
3. Si no existe, busca cache más reciente del OS
4. Mejor cache parcial que nada

---

## 🔐 Secrets y Variables de Entorno

### Secrets Necesarios

#### Para Codecov (opcional)
```
CODECOV_TOKEN
```
- Obtener en: https://codecov.io/
- Usado en: `test.yml`

#### Para Lighthouse CI (opcional)
```
LHCI_GITHUB_APP_TOKEN
```
- Obtener en: https://github.com/apps/lighthouse-ci
- Usado en: `lighthouse.yml`

### Environment Variables en Workflows

#### CI Build Environment
```yaml
DATABASE_URL: file:./prisma/dev.db
SKIP_ENV_VALIDATION: true
NEXT_PUBLIC_SITE_URL: http://localhost:3000
NEXT_PUBLIC_SANITY_PROJECT_ID: dummy-project-id
NEXT_PUBLIC_SANITY_DATASET: production
NEXT_PUBLIC_SANITY_API_VERSION: 2024-01-01
NEXT_PUBLIC_GISCUS_REPO: dummy-user/dummy-repo
NEXT_PUBLIC_GISCUS_REPO_ID: dummy-repo-id
NEXT_PUBLIC_GISCUS_CATEGORY: Announcements
NEXT_PUBLIC_GISCUS_CATEGORY_ID: dummy-category-id
RESEND_API_KEY: re_dummy_api_key_for_ci_build
RESEND_FROM_EMAIL: noreply@example.com
RESEND_TO_EMAIL: contact@example.com
UPSTASH_REDIS_REST_URL: https://dummy-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN: dummy_redis_token_for_ci
```

**Importante:**
- Todos los valores son dummies para CI
- Build debe pasar sin servicios externos reales
- `SKIP_ENV_VALIDATION=true` permite builds sin secrets reales

---

## ⚡ Triggers y Ejecucion

### Eventos que Disparan Workflows

| Workflow | Push main/develop | PR to main/develop | Schedule |
|----------|-------------------|---------------------|----------|
| CI | ✅ | ✅ | ❌ |
| Tests | ✅ | ✅ | ❌ |
| E2E | ✅ | ✅ | ❌ |
| Lighthouse | ❌ | ✅ | ❌ |
| Security | ✅ | ✅ | ✅ Weekly |

### Orden de Ejecución

**Workflows ejecutan en PARALELO** por defecto:
```
Push/PR trigger
├── CI (quality → build)
├── Tests (test → coverage)
├── E2E (install → build → test)
├── Lighthouse (build → audit)
└── Security (dependency-review + codeql + audit)
```

**Jobs con dependencias:**
```yaml
build:
  needs: quality  # Espera a que quality termine
```

### Manual Execution

Ejecutar workflow manualmente:
1. Ve a Actions tab en GitHub
2. Selecciona el workflow
3. Click "Run workflow"
4. Selecciona branch
5. Run

---

## ⏱️ Tiempos de Ejecucion

### Tiempos Promedio (con cache)

| Workflow | Primera ejecución | Con cache | Ahorro |
|----------|-------------------|-----------|--------|
| CI | 5-7 min | 3-4 min | ~40% |
| Tests | 3-4 min | 2-3 min | ~25% |
| E2E | 10-12 min | 6-8 min | ~40% |
| Lighthouse | 7-9 min | 4-6 min | ~45% |
| Security | 3-5 min | 2-4 min | ~30% |

**Total pipeline:** ~8-12 minutos (con cache)

### Cache Hit Rate Esperado

- NPM dependencies: ~95%
- Next.js build: ~70-80%
- Playwright browsers: ~90%
- Prisma Client: ~95%

---

## 🔧 Troubleshooting

### Cache no Funciona

**Síntoma:** Workflows no aprovechan cache, siempre descargan todo

**Causas comunes:**
1. `package-lock.json` cambia frecuentemente
2. Source code cambia (expected en Next.js cache)
3. Cache key muy específico

**Solución:**
```yaml
# Verificar restore-keys
restore-keys: |
  ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-
  ${{ runner.os }}-nextjs-
```

**Limpiar cache manualmente:**
1. Settings → Actions → Caches
2. Buscar cache problemático
3. Delete

---

### Workflow Falla en Install Playwright

**Síntoma:** `npx playwright install --with-deps` falla

**Causa:** Cache de browsers corrupto

**Solución:**
```bash
# En GitHub: Borrar cache de Playwright
# En local:
npx playwright install --force
```

---

### Tests Fallan Solo en CI

**Síntoma:** Tests pasan local pero fallan en CI

**Causas comunes:**
1. Timing issues (race conditions)
2. Environment variables diferentes
3. Happy DOM vs jsdom

**Solución:**
```typescript
// Aumentar timeouts
test('something', { timeout: 10000 }, async () => {
  // ...
});

// Verificar env vars
console.log(process.env.NODE_ENV); // debe ser 'test'
```

---

### Lighthouse Falla Randomly

**Síntoma:** Lighthouse scores varían mucho entre runs

**Causa:** Performance variance en CI runners

**Solución:**
```jsonc
// .lighthouserc.json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3  // Aumentar runs
    }
  }
}
```

---

### CodeQL Analysis Tarda Mucho

**Síntoma:** Security workflow tarda >10 minutos

**Causa:** Codebase grande o muchos lenguajes

**Solución:**
```yaml
# Optimizar autobuild
- name: Autobuild
  uses: github/codeql-action/autobuild@v3
  env:
    NODE_OPTIONS: --max-old-space-size=4096
```

---

### NPM Audit Falla por Vulnerabilities

**Síntoma:** `npm audit` falla workflow

**Solución temporal:**
```yaml
# Bajar nivel a moderate (NO RECOMENDADO para prod)
- name: Run npm audit
  run: npm audit --audit-level=moderate
```

Mejor opción (recomendado):
```bash
# Actualizar dependencias
npm audit fix
```

---

## ✨ Mejores Practicas

### 1. Mantener Workflows Rápidos

- ✅ Usar cache agresivamente
- ✅ Ejecutar jobs en paralelo cuando sea posible
- ✅ Limitar artifacts retention (7-30 días)
- ✅ Usar `npm ci` en vez de `npm install`

### 2. Seguridad de Secrets

- ❌ NUNCA hardcodear secrets en workflows
- ✅ Usar GitHub Secrets para valores sensibles
- ✅ Usar environment protection rules
- ✅ Rotar secrets regularmente

### 3. Artifact Management

```yaml
- name: Upload artifacts
  uses: actions/upload-artifact@v4
  with:
    retention-days: 7  # No más de 30 días
```

### 4. Conditional Execution

```yaml
# Solo ejecutar en PRs
- name: Run on PR only
  if: github.event_name == 'pull_request'
  run: echo "Running on PR"

# Solo ejecutar si NO tiene [skip ci]
- name: Run if not skip ci
  if: contains(github.event.head_commit.message, '[skip ci]') == false
  run: echo "Not skipping CI"
```

### 5. Monitoreo y Alertas

- Configurar notificaciones de fallas
- Revisar workflow runs semanalmente
- Monitorear usage de GitHub Actions minutes
- Optimizar workflows que consumen más tiempo

### 6. Dependency Updates

- Revisar Dependabot PRs semanalmente
- Testear updates en develop antes de merge a main
- Agrupar updates relacionadas

### 7. Cache Invalidation

```yaml
# Invalidar cache si cambia config
key: ${{ runner.os }}-build-${{ hashFiles('**/next.config.ts') }}-${{ hashFiles('**/package-lock.json') }}
```

---

## 📊 Metricas de Exito

### KPIs del CI/CD

- **Time to feedback:** <10 minutos
- **Pass rate:** >95%
- **Cache hit rate:** >80%
- **False positives:** <5%

### Monitoreo

- **GitHub Actions dashboard:** Insights → Actions
- **Workflow runs history:** Actions tab
- **Cache usage:** Settings → Actions → Caches
- **Minutes usage:** Settings → Billing

---

## 🔗 Referencias

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [actions/cache@v4](https://github.com/actions/cache)
- [Playwright CI](https://playwright.dev/docs/ci)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [CodeQL](https://codeql.github.com/)

---

**Última actualización:** v0.22.6
**Mantenido por:** Development Team
