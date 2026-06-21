# Apuestas grandes — roadmap post 5vr #2

Las 4 mejoras de alto impacto identificadas tras el 5vr #2 (positioning + SEO + conversión + a11y + perf, ya en prod). ROI medido en **conversión** (visitante → CV / contacto) y **descubribilidad** (ranking, gente nueva), no DX interno.

> Estado al 2026-06-20. Detalle vivo en engram (`portfolio/apuesta-*`).

---

## #1 · Campos de calificación en el form de contacto — ✅ EN PROD (PR #151)

Reemplazado "Asunto" libre por **select de Motivo** (Oportunidad laboral / Freelance / Consultoría / Otro) + **Empresa** y **Timeline** opcionales. El email al owner llega compuesto: `[Motivo] · Empresa · Timeline`.
Archivos: `lib/validations/contact.ts`, `components/forms/FormField.tsx` (nuevo `SelectField`), `components/forms/ContactForm.tsx`, `lib/email/templates/ContactEmail.tsx`, `app/actions/contact.ts`.

## #2 · Página HTML `/cv` indexable — ✅ EN PROD (PR #152)

Versión HTML del CV (antes solo PDF). Documento 1 columna, `Person` JSON-LD desde data real, print-friendly, email ofuscado, data resiliente (fallback a `resume.json`). Botón **split "Descargar CV / Ver online"** (`components/ui/CVButton.tsx`). Fix mobile: overflow horizontal del hero (`min-w-0` en las columnas del grid).
Archivos: `app/(pages)/cv/page.tsx`, `lib/seo/schema.ts` (`generateResumePersonSchema`), `app/sitemap.ts`, `components/sections/hero-section.tsx`.

## #3 · Case studies con proof de arquitectura — ✅ EN PROD (PRs #153, #154, ghagga#272)

14 diagramas Mermaid de arquitectura ya documentada, multi-vista:
- **APiGen** (6): pipeline desacoplado, secuencia generate, multi-protocolo, 4 superficies, módulos 22/4-capas, ERD ejemplo.
- **Biogas** (4): topología edge→cloud, 3 capas de IA, lifecycle ONNX+paridad+OTA, monorepo 5 apps.
- **APiGen Studio** (2): canvas→export→APiGen, client-heavy + persistencia.
- **ghagga** (2, en su README): pipeline de review, fan-out multi-agente.

Mecanismo: bloque `mermaid` en `PortableTextRenderer` + helper `mermaid()` en `lib/data/projects.ts` + **merge híbrido** (`mergeLocalAndSanityProjects`: Sanity manda en imagen/urls/tech/dates/excerpt; el body local —con diagramas— gana). `MarkdownContent.tsx` ya renderiza fences ` ```mermaid ` para proyectos de GitHub (ghagga).

**Gotchas**: `/proyectos[/id]` da 500 en dev local (falta env Sanity); diagramas validados con harness Playwright + `node_modules/mermaid/dist/mermaid.min.js`. `securityLevel:strict` → sin `<br/>`. ERD de APiGen con relaciones inferidas de nombres (repo privado, a corregir con el `.sql` real).

## #4 · Páginas de autoridad SEO — 🟡 ARRANCADA, PAUSADA

**Qué**: páginas profundas que rankean por TEMA (Spring Boot codegen, edge ML, code-gen, MCP) → traen gente que no conoce a Javier. E-E-A-T: contenido fino hunde el SEO; necesita profundidad real del autor. Flujo: draft desde trabajo documentado → autor expande con su voz.

**Decisión de formato**: usar el **BLOG (Sanity)** como hub (NO sección /guias nueva — fragmentaría la autoridad). El blog ya tiene todo: PortableText+mermaid, `BlogPosting` JSON-LD, breadcrumbs, metadata por post, categorías (topic clusters).

**BLOQUEADO esperando credenciales Sanity** para que el contenido se pueda publicar por API (sin copy-paste en Studio):
- En `.env.local` (gitignored): `NEXT_PUBLIC_SANITY_PROJECT_ID` real (hoy placeholder) + `SANITY_API_WRITE_TOKEN` (Editor, desde manage.sanity.io → API → Tokens). 🔐 El token es credencial: no se commitea, revocable.
- `@sanity/client` ya instalado; CLI disponible. Caminos: script con `@sanity/client` (recomendado) o `@sanity/mcp-server` (permanente).
- Pendiente al retomar: agregar tipo de bloque `mermaid` a `sanity/schemas/post.ts` (body), verificar conexión, draftear + publicar artículo piloto (sugerido: **Spring Boot code generation**).
