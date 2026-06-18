# Audit Backlog — High-ROI Improvements

**Created:** 2026-05-14
**Source:** Multi-perspective audit (Performance + SEO + UX/Conversion + Code Health)
**Status:** Backlog — not yet executed

ROI is measured by impact on **portfolio conversion** (visitor → CV download or contact form submission) and **discoverability** (Google ranking, social CTR), not internal DX.

---

## TIER S — Quick wins críticos (~1.5-2h total)

Los seis cambios juntos mejoran SEO básico, social sharing y conversión. Bajo riesgo, alto impacto. **Empezar por acá.**

### S1 · Google Site Verification es un placeholder literal

- **File:** `lib/seo/metadata.ts:76`
- **Problem:** `verification.google: 'google-site-verification-code'` — string literal placeholder. GSC no puede verificar el sitio.
- **Fix:** Leer de env var:
  ```ts
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION ?? '' }
  ```
  Y poner el token real en `.env.local` + Vercel env vars.
- **Effort:** 2 min (+ pegar el token cuando esté GSC abierto).
- **Status:** ☐

### S2 · Dominio inconsistente entre archivos de SEO

- **Files:**
  - `lib/seo/metadata.ts:3` → `javierzader.dev`
  - `lib/seo/schema.ts:3` → (verificar)
  - `app/layout.tsx:50` → `javierzader.com`
- **Problem:** Distintos canonical/OG/schema URLs según archivo. Riesgo de duplicate content en GSC.
- **Fix:** Centralizar en `lib/config/site.ts`:
  ```ts
  export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://javierzader.com';
  ```
  Importar desde los 3 archivos.
- **Effort:** 10 min.
- **Status:** ☐

### S3 · Twitter cards missing

- **Files:** `app/layout.tsx`, `lib/seo/metadata.ts`
- **Problem:** No hay `twitter: {...}` en metadata. Cuando alguien comparte en X/LinkedIn, no aparece preview rico.
- **Fix:** Agregar al metadata default:
  ```ts
  twitter: {
    card: 'summary_large_image',
    title: '...',
    description: '...',
    images: ['/og-image.png'],
    creator: '@<handle>', // si tiene Twitter
  }
  ```
- **Effort:** 5 min.
- **Status:** ☐

### S4 · `hreflang` apunta a `/en` que no existe

- **File:** `lib/seo/metadata.ts:45-48`
- **Problem:** `alternates.languages` declara `en-US: '/en'` pero la ruta `/en` no existe. Google crawler pierde tiempo y puede penalizar.
- **Fix (corto plazo):** Sacar el alternate de `en-US`. Dejar solo `es-ES`.
- **Fix (largo plazo, si querés bilingüe):** Implementar i18n routing real (`next-intl` o equivalente) — esto es una feature aparte, no parte de Tier S.
- **Effort:** 5 min (sacar las líneas).
- **Status:** ☐

### S5 · CV escondido — sin CTA visible en el hero

- **Files:**
  - `components/sections/hero-section.tsx:148-159` (ícono actual)
  - `app/page.tsx:67-79` (CTAs del hero)
- **Problem:** El botón de "Descargar CV" es solo un ícono chico al costado. El CTA secundario del hero es "Contactar", no CV. Visitor que viene a evaluar contratación NO encuentra el CV above the fold.
- **Fix:** Cambiar el CTA secundario del hero a un botón texto "Descargar CV" (con ícono de download). Mover "Contactar" a CTA terciario o mantener el ícono actual. Mismo cambio en `/sobre-mi` (mover el botón del sidebar a posición principal).
- **Effort:** 30 min.
- **Status:** ☐

### S6 · Project detail pages sin OG image específica

- **File:** `app/(pages)/proyectos/[id]/page.tsx:73-88`
- **Problem:** `generateMetadata` devuelve title + description pero no `openGraph.images`. Cuando alguien comparte el link de un caso de estudio en LinkedIn, sale la OG genérica del portfolio.
- **Fix:** Dos opciones:
  - **A (rápida):** Usar `project.thumbnail` o `project.coverImage` como OG image en el array.
  - **B (recomendada):** OG dinámica con `@vercel/og` aceptando `title` + `description` como query params. Genera una imagen branded por proyecto.
- **Effort:** 15 min (opción A) · 45 min (opción B).
- **Status:** ☐

---

## TIER A — Diferenciadores de senior (~4-5h total)

Estos no son "quick wins" pero te separan del 80% de portfolios. Hacerlos cuando Tier S esté cerrado.

### A1 · Trust signals débiles — falta señal de "senior"

- **Files:** `app/page.tsx`, `app/(pages)/sobre-mi/page.tsx`
- **Problem:** No hay testimonials, no hay "for whom is this" (qué tipo de cliente/empresa). El visitor lee 8 segundos y no entiende rápido por qué deberías ser su próxima contratación.
- **Fix:**
  1. Agregar sección "Trabajamos juntos" o "Qué hago por mis clientes" en home con 2-3 personas/casos de uso concretos (ej: "Empresas SaaS B2B escalando backend Java/Spring", "Equipos que necesitan modernizar legacy").
  2. Agregar 1-2 testimonials reales (de ex-jefes, colegas, clientes). Si no hay disponibles, contactar a alguien de tu red.
  3. Reforzar el `/sobre-mi` con un bloque "Cómo trabajo" (proceso, comunicación, etc.).
- **Effort:** 3 horas (incluye redactar copy y conseguir testimonios).
- **Status:** ☐

### A2 · Project cards sin métricas de impacto

- **File:** `app/(pages)/proyectos/page.tsx` (y los case studies individuales)
- **Problem:** Cards describen QUÉ es el proyecto, no QUÉ IMPACTO tuvo. "Es un CRUD con Spring Boot" ≠ "Procesa 10K req/h con p99 < 50ms, ahorró X horas/mes a Y operadores".
- **Fix:** Agregar a cada project card una línea de impacto cuantificado. Ejemplos para tus proyectos actuales:
  - **APiGen:** "Reduce X horas/proyecto al generar specs OpenAPI desde DB introspection."
  - **Biogas:** "N plantas monitoreadas en tiempo real, alertas que evitaron X paradas no planificadas."
  - **Consorcio:** "Reemplazó proceso manual de X actores, redujo gestión de Y a Z minutos."
- **Effort:** 1-2 horas (depende de qué métricas tenés a mano).
- **Status:** ☐

### A3 · `/proyectos` sin `generateStaticParams` — cold start en cada visita fría

- **File:** `app/(pages)/proyectos/page.tsx:22`
- **Problem:** Tiene `revalidate: 3600` (ISR 1h) pero no pre-genera al build. Visita fría = serverless cold start = +200-400ms FCP.
- **Fix:** Agregar `generateStaticParams()` que devuelva la lista de proyectos del CMS al build time. Mantener `revalidate` para updates de Sanity.
- **Effort:** 15 min.
- **Status:** ☐

---

## NO HACER (descartados con razón)

Items que aparecieron en la auditoría pero que descarto por ROI bajo o riesgo > beneficio:

- **Breadcrumb schema en home** — Los breadcrumbs de la home no aparecen en SERP. Cero ROI.
- **Organization schema** — Sos persona, no empresa. Agrega ruido al JSON-LD sin beneficio.
- **Verificar React Compiler con benchmarks** — Está enabled en `next.config.ts:11`, funciona. Obsesión sin retorno.
- **Refactor de HTML responses en API routes** (newsletter/confirm, data-deletion/confirm) — 500 LOC de boilerplate pero solo se ve en flujos GDPR/newsletter confirm que casi nadie pisa. Bajo ROI.
- ~~**TypeScript 6.0 major upgrade**~~ — ✅ HECHO (PR #132, 2026-06). Se mergeó `typescript@6.0.3` sin cascada de errores.
- ~~**lucide-react 0.x → 1.x major**~~ — ✅ HECHO (PR #138, 2026-06-18). Bump a `1.16.0` verificado con build verde — los 45 íconos siguen resolviendo.
- **Tests para Server Actions + API routes** — Importante para vos, **invisible para el visitor**. Va después de Tier S y A.
- **Env validation con Zod** — Misma razón. Importante pero no mueve conversión.
- **Sentry tags/user context** — Solo importa cuando algo falla. No urgente para portfolio.

---

## Cómo medir éxito (post-Tier S)

Antes de ejecutar Tier S, capturar baseline:
1. **GSC:** Coverage + Performance (clicks, impressions, CTR, posición media).
2. **Vercel Analytics:** Web Vitals + pageviews del último mes.
3. **LinkedIn/X share preview:** screenshot del card actual al pegar la URL.

Después de Tier S (esperar 2-3 semanas para GSC):
- ¿Subieron impressions/clicks?
- ¿Mejoró el preview en LinkedIn?
- ¿Aparece el sitio verificado en GSC?

Tier A se mide en analytics más a largo plazo (3-6 meses).
