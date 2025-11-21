# CI/CD Quick Reference Guide

Guía rápida de referencia para operaciones comunes en CI/CD.

---

## 🚀 Comandos Rápidos

### Ejecutar Tests Localmente (como CI)

```bash
# Quality checks
npm run verify                    # Type-check + Biome

# Unit tests
npm run test:run                  # Run once
npm run test:coverage             # With coverage

# E2E tests
npm run build                     # Build first
npm run e2e                       # Run all E2E tests
npm run e2e:chromium             # Single browser

# Lighthouse
npm run lighthouse                # Full audit

# Security
npm audit --audit-level=high      # NPM vulnerabilities
```

---

## 🔄 Workflow Status Badges

```markdown
[![CI](https://github.com/JNZader/portfolio-2025/actions/workflows/ci.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/ci.yml)
[![Tests](https://github.com/JNZader/portfolio-2025/actions/workflows/test.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/test.yml)
[![E2E](https://github.com/JNZader/portfolio-2025/actions/workflows/e2e.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/e2e.yml)
[![Lighthouse](https://github.com/JNZader/portfolio-2025/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/lighthouse.yml)
[![Security](https://github.com/JNZader/portfolio-2025/actions/workflows/security.yml/badge.svg)](https://github.com/JNZader/portfolio-2025/actions/workflows/security.yml)
```

---

## 🐛 Troubleshooting Rápido

### Workflow Falla: "Module not found"

```bash
# Regenerar package-lock.json
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "fix: regenerate package-lock.json"
```

### Cache Corrupto

**GitHub UI:**
1. Settings → Actions → Caches
2. Buscar cache problemático
3. Delete

**Forzar re-cache:** Cambiar cualquier línea en `package-lock.json` (touch)

### Tests Fallan en CI pero Pasan Local

```bash
# Reproducir ambiente de CI localmente
NODE_ENV=test npm run test:run

# Verificar diferencias
echo $NODE_ENV  # debe ser 'test' en CI
```

### Playwright Install Falla

```bash
# Limpiar cache local
rm -rf ~/.cache/ms-playwright
npx playwright install --force

# En CI: Borrar cache de Playwright en Settings
```

### Lighthouse Scores Bajos en CI

```jsonc
// Verificar que analytics está deshabilitado en CI
// .lighthouserc.json debe tener:
{
  "ci": {
    "collect": {
      "numberOfRuns": 3  // Aumentar para estabilidad
    }
  }
}
```

---

## 📦 Dependabot

### Aprobar Update de Dependabot

```bash
# Revisar cambios
gh pr view 123  # Ver detalles del PR

# Si tests pasan, aprobar y merge
gh pr review 123 --approve
gh pr merge 123 --auto --squash
```

### Ignorar Dependencia

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    ignore:
      - dependency-name: "nombre-package"
        versions: ["1.x", "2.x"]
```

---

## 🔐 Secrets Management

### Agregar Secret

**GitHub UI:**
1. Settings → Secrets and variables → Actions
2. New repository secret
3. Name: `SECRET_NAME`
4. Value: `secret_value`
5. Add secret

**Usar en workflow:**
```yaml
env:
  API_KEY: ${{ secrets.SECRET_NAME }}
```

### Verificar Secret Existe

```yaml
- name: Check secret
  run: |
    if [ -z "${{ secrets.SECRET_NAME }}" ]; then
      echo "Secret not set"
      exit 1
    fi
```

---

## ⚡ Optimización de Performance

### Reducir Tiempo de CI

1. **Paralelizar jobs independientes**
```yaml
jobs:
  lint:
    # ...
  test:
    # ... (ejecutan en paralelo)
```

2. **Usar cache agresivamente**
```yaml
- uses: actions/cache@v4
  with:
    path: .next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/*.ts', '**/*.tsx') }}
```

3. **Skip workflows en draft PRs**
```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]

jobs:
  test:
    if: github.event.pull_request.draft == false
```

---

## 📊 Monitoreo

### Ver Workflow Runs

```bash
# CLI
gh run list --workflow=ci.yml

# Ver detalles de run específico
gh run view 12345

# Ver logs
gh run view 12345 --log
```

### Cancelar Workflow Run

```bash
# Cancelar run en progreso
gh run cancel 12345

# Cancelar todos los runs del workflow
gh run list --workflow=ci.yml --status=in_progress | awk '{print $7}' | xargs -I {} gh run cancel {}
```

---

## 🔄 Re-run Workflows

### Re-run Failed Jobs

**GitHub UI:**
1. Actions tab
2. Click en workflow run fallido
3. Re-run failed jobs

**CLI:**
```bash
gh run rerun 12345 --failed
```

### Re-run All Jobs

```bash
gh run rerun 12345
```

---

## 🎯 Branch Protection

### Requerir Status Checks

**Settings → Branches → main:**
1. ✅ Require status checks to pass
2. ✅ CI
3. ✅ Tests
4. ✅ E2E Tests
5. ✅ Lighthouse CI
6. ✅ Security

---

## 📈 Usage Monitoring

### Ver Minutos Consumidos

```bash
# GitHub UI
Settings → Billing → Actions

# Límites free tier:
# - Public repos: Ilimitado
# - Private repos: 2000 min/mes
```

### Optimizar Costos

```yaml
# Usar runners más pequeños cuando sea posible
runs-on: ubuntu-latest  # Más barato que macos/windows

# Timeouts razonables
timeout-minutes: 30  # Evitar runs infinitos

# Retention de artifacts corta
retention-days: 7  # No 90 días
```

---

## 🔍 Debugging Workflows

### Enable Debug Logging

**Repository secrets:**
```
ACTIONS_STEP_DEBUG = true
ACTIONS_RUNNER_DEBUG = true
```

### Ver Logs Detallados

```yaml
- name: Debug info
  run: |
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
    echo "Working directory: $(pwd)"
    echo "Files: $(ls -la)"
    echo "Environment: $NODE_ENV"
```

---

## 🚦 Status Checks

### Verificar Status de PR

```bash
gh pr checks 123
```

### Skip CI en Commit

```bash
git commit -m "docs: update readme [skip ci]"
```

**Patterns que skipean CI:**
- `[skip ci]`
- `[ci skip]`
- `[no ci]`

---

## 🔄 Workflow Dispatch (Manual)

### Agregar Manual Trigger

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
```

### Ejecutar Manualmente

```bash
gh workflow run ci.yml --ref main
```

---

## 📝 Artifacts

### Descargar Artifacts

```bash
# CLI
gh run download 12345

# Artifact específico
gh run download 12345 -n artifact-name
```

### Listar Artifacts

```bash
gh api repos/:owner/:repo/actions/artifacts
```

---

## 🎯 Recursos Útiles

- **Actions Logs:** `https://github.com/:owner/:repo/actions`
- **Workflow Syntax:** https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions
- **GitHub CLI:** https://cli.github.com/
- **Cache Debug:** Settings → Actions → Caches

---

**Tip:** Marca esta página para acceso rápido durante desarrollo.
