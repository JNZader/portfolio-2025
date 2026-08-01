# Pattern Backgrounds — estado y alternativas

Fondos CSS puros (grid / dots / glow) con `mask-image` que disuelve el patrón en la
página. Cero JS, cero SVG, cero imágenes. Idea tomada de pattern-craft
(patterncraft.store), pero re-implementada con los tokens del tema propios.

## Qué se agregó

- **`app/globals.css`** (`@layer components`): 3 clases utilitarias
  - `.bg-pattern-grid` — grilla blueprint, se desvanece desde arriba (mask radial top).
  - `.bg-pattern-dots` — grilla de puntos, fade hacia los bordes.
  - `.bg-pattern-glow` — halo radial del `--primary` (base layer, sin mask).
- **`components/ui/PatternBackground.tsx`** — componente opt-in
  `<PatternBackground variant="grid|dots|glow" />`. Renderiza una capa
  `aria-hidden`, `pointer-events-none`, `absolute inset-0 -z-10`. Se dropea dentro
  de cualquier contenedor `relative overflow-hidden`.
- **`components/ui/Section.tsx`** — variante de fondo reusable `glow`
  (`SECTION_BG.GLOW` → `bg-pattern-glow`). Type-safe, se aplica con un prop.
- **`app/[locale]/(pages)/design-system/page.tsx`** — sección "Pattern Backgrounds"
  que muestra las 3 opciones (visibles en `/design-system`).

## Estado actual (NO final — a definir por el próximo agente)

- Aplicado: **glow** en la sección **"Sobre mí"** (`components/sections/AboutProfile.tsx`,
  `background={SECTION_BG.GLOW}`). El halo cae en el borde inferior de la sección.
- Rama `feat/pattern-backgrounds`, **sin PR** (pendiente de decisión de ubicación final).

## Cicatriz importante (por qué se ven o no)

La 1ra versión usaba `var(--border)` para las líneas/puntos → **casi invisible**,
sobre todo en dark (`oklch(25%)` sobre fondo `oklch(10%)`). Se cambió a
`color-mix(in oklch, var(--foreground) N%, transparent)` (foreground a baja
opacidad) → **visible y theme-aware** (negro en light, blanco en dark). Y el glow
subió de `--primary` 16% → 32%. Además: **una tile chica NO es buena superficie de
preview** — el `mask-image` deja solo una franja; los patrones leen bien en
superficies amplias (full-width, sección entera).

## Alternativas / cómo cambiar

1. **Cambiar de patrón**: usar `.bg-pattern-grid` / `.bg-pattern-dots` /
   `.bg-pattern-glow`, o `<PatternBackground variant="…" />`.
   - grid = registro "ingeniero" (blueprint). dots = textura más quieta.
     glow = halo azul, el más calmo (elegido).
2. **Tunear intensidad** (en `globals.css`):
   - grid/dots: el `%` de `color-mix(... var(--foreground) 16%|26% ...)`.
   - glow: el `%` de `color-mix(... var(--primary) 32% ...)` (subir = más marcado).
3. **Mover de ubicación**: es una variante de `<Section>` → poner
   `background={SECTION_BG.GLOW}` en cualquier sección de la home
   (`app/[locale]/page.tsx`: HeroSection / FeaturedProjects / AboutProfile /
   NewsletterHero). Candidatos limpios donde el efecto "banda" pega mejor: el CTA
   de Newsletter o una banda dedicada. El hero YA está cargado (mesh + blobs +
   dots + noise) → evitar apilar ahí.
4. **Aplicar a una superficie no-Section**: `<PatternBackground variant="…" />`
   dentro de un contenedor `relative overflow-hidden`.

## Preview

`npm run dev` → `/design-system` (sección "Pattern Backgrounds") para las 3 tiles,
o la home (`/`) → "Sobre mí" para el glow en vivo. Nota: en un entorno sin datos de
Sanity el home puede tirar un error intermitente de `Slot` (Button asChild con
children vacíos) — no relacionado con estos fondos.
