# Backlog UX — accesibilidad + copy

Dos mejoras derivadas de la investigación de repos (ideas robadas de
`A-poc/RedTeam-Tools` a11y tools + `ttt30ga/awesome-product-design`). Documentadas
para hacerlas después; no urgentes, esfuerzo bajo.

## B2 — Accesibilidad (a11y)

**Qué:** pasar el portfolio por checkers de accesibilidad y, si vale, agregar un
gate automático. El portfolio es una vidriera técnica + tiene páginas públicas
(landing, case studies, blog) → la a11y suma pulcritud y SEO.

**Herramientas (gratis, sin diseñador):**
- **WAVE** (wave.webaim.org) — correr sobre landing / case-study / blog.
- **Contrast Ratio** (contrast-ratio.com) + **Snook** (snook.ca/technical/colour_contrast)
  — verificar contraste de texto y, sobre todo, de **labels/ejes de los charts**
  (dataviz necesita cumplir WCAG contrast sí o sí).
- **axe** (`@axe-core/playwright` o la extensión) — para un chequeo automatizable.

**Acción concreta:**
1. Correr WAVE + contrast sobre las páginas públicas y las de dataviz.
2. Arreglar lo que salga (probablemente contraste de ejes/leyendas de charts y
   algún `aria-label` faltante).
3. (Opcional) agregar `@axe-core/playwright` como test/gate de CI sobre las rutas
   clave — un smoke de a11y por deploy.

**Esfuerzo:** S. **Prioridad:** media (páginas públicas + dataviz).

## B3 — Copy (tono "ingeniero, no salesy")

**Qué:** pasar el copy del portfolio por filtros de legibilidad para cazar padding
y tono vendedor — alineado con la preferencia explícita de tono "ingeniero a un
par, seco y honesto", NO "vendedor de autos usados".

**Herramientas:**
- **Hemingway App** (hemingwayapp.com) — marca frases largas, adverbios de más,
  voz pasiva. Bueno para detectar el relleno que un draft salesy acumula.
- **Readable.io** — score de legibilidad.

**Acción concreta:**
1. Pegar en Hemingway: los **case studies**, el **README** (si aplica al sitio),
   y el **copy de la landing**.
2. Recortar lo que marque como padding/superlativos; dejar números como hechos,
   no como flex.

**Esfuerzo:** S. **Prioridad:** baja (pulido de tono).

---

Contexto: parte del programa de ideas (7 repos). Las otras ideas de ese programa
(fondos pattern-craft) ya están en `docs/pattern-backgrounds.md` / la rama
`feat/pattern-backgrounds`.
