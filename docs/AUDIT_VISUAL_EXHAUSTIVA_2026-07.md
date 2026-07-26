# Auditoría visual exhaustiva — portfolio-2025

**Fecha de verificación:** 2026-07-15 00:32 UTC  
**Alcance:** segunda ronda de auditoría, centrada en las áreas que habían quedado sin verificar en la ronda fresca anterior.  
**Estado del repositorio al iniciar:** `main`, limpio, `a76fa3e fix(ui): unify interior pages on the shared InteriorHero (#203)`. No se modificó código de aplicación, paquetes, configuración ni artefactos generados.

## Resumen ejecutivo

La home, `/contacto`, `/sobre-mi` y `/cv` renderizan localmente y muestran una base visual sólida: navegación, jerarquía de headings, CTAs de contacto/CV, modo oscuro, responsive básico y validación de formulario funcionan en Chromium. La verificación no puede elevarse a “auditoría completa” porque las superficies dependientes de Sanity (`/proyectos`, los detalles y `/blog`) devuelven `500` en este checkout: faltan `NEXT_PUBLIC_SANITY_DATASET` y `NEXT_PUBLIC_SANITY_PROJECT_ID` en el entorno local. No se inspeccionaron valores secretos ni se intentó enviar ningún mensaje.

La conclusión más importante es de alcance, no necesariamente de producción: **hay un bloqueo local verificable para proyectos y blog**, pero no evidencia suficiente para afirmar que sea un incidente de producción. Safari/Firefox, dispositivos físicos, Sanity productivo, envío real de email, datos reales de imágenes y datos de usuario de Web Vitals permanecen sin verificar.

## Clasificación y confianza

- **P0:** caída o pérdida de una conversión crítica para todos los usuarios.
- **P1:** bloqueo severo de una superficie principal o riesgo alto de conversión.
- **P2:** defecto importante, riesgo operativo o área no verificable que merece seguimiento.
- **P3:** mejora menor, evidencia incompleta o deuda de bajo impacto inmediato.
- **Confianza alta:** reproducido directamente o confirmado por código determinista.
- **Confianza media:** evidencia local/parcial; requiere entorno productivo o datos reales.
- **Hipótesis:** explicación plausible que no se puede confirmar con este checkout.

## Hallazgos priorizados

| ID | Severidad | Confianza | Estado | Hallazgo y evidencia |
|---|---:|---:|---|---|
| V-01 | P1 | Alta | **Verificado localmente** | `/proyectos` y `/blog` responden `500` en `http://127.0.0.1:3001`. La respuesta expone en desarrollo el error `Missing environment variable: NEXT_PUBLIC_SANITY_DATASET`; el origen es `sanity/env.ts:9-17`, donde ambas variables son obligatorias en evaluación de módulo. No se debe extrapolar automáticamente a producción. |
| V-02 | P2 | Alta | **Verificado por código** | El listado combina Sanity y GitHub en `app/[locale]/(pages)/proyectos/page.tsx:40-78`. El orden de los proyectos curados es determinista en `lib/data/projects.ts:12-19,29-58` mediante `displayOrder` ascendente y fecha descendente. En los datos locales el orden esperado es `biogas-platform`, `apigen`, `apigen-studio`; faltan datos remotos para verificar la lista final, duplicados, badges e imágenes. |
| V-03 | P2 | Alta | **Sin poder ejecutar** | Las rutas de detalle locales existen para `/proyectos/biogas-platform`, `/proyectos/apigen` y `/proyectos/apigen-studio` (`lib/data/case-studies/*.ts`). No pudieron abrirse porque el mismo import de Sanity bloquea la ruta. El detalle sí tiene fallback de contenido a README para proyectos GitHub (`app/[locale]/(pages)/proyectos/[id]/page.tsx:159-172`) y CTA final a contacto/CV (`components/projects/ProjectDetail.tsx:242-259`). |
| V-04 | P2 | Alta | **Verificado por código; visual pendiente** | Las imágenes de cards usan `project.image` si existe y `ProjectVisual` si no (`components/projects/ProjectCard.tsx:108-123`). Los tres estudios locales no declaran `mainImage`; por lo tanto, con datos exclusivamente locales se esperan visuales generadas, no capturas de cada producto. La calidad, orden y presencia de imágenes Sanity reales no se pudo verificar sin CMS. |
| V-05 | P1 | Alta | **Verificado parcialmente** | La conversión está presente en superficies comprobables: home ofrece `Ver CV`, `Ver Proyectos` y `Contactar`; `/cv` ofrece `Descargar CV` y `Contactar`; el detalle tiene CTA dual; `/contacto` ofrece formulario y email/social links. Evidencia: `app/[locale]/page.tsx:82-103`, `app/[locale]/(pages)/cv/page.tsx`, `components/projects/ProjectDetail.tsx:242-259`, `app/[locale]/(pages)/contacto/page.tsx:34-117`. La descarga PDF y el envío real no se ejecutaron. |
| V-06 | P2 | Alta | **Limitación de entorno** | La configuración Sanity está correctamente separada y usa `perspective: 'published'`, CDN y revalidación de 60 s (`sanity/lib/client.ts:8-34`), pero el entorno inspeccionado no tiene `.env` ni `.env.local`. `sanity/env.ts` falla cerrado antes de poder probar contenido publicado, revalidación, imágenes, slugs o comportamiento ante CMS caído. No se escribieron secretos en este documento. |
| V-07 | P2 | Alta | **Verificado localmente** | Chromium headless cargó la home, `/contacto`, `/sobre-mi` y `/cv` a 390 px y 1440 px sin overflow horizontal (`scrollWidth === clientWidth`). También cargó `/contacto` sin overflow a 390 px. No equivale a probar un teléfono físico ni redes móviles. |
| V-08 | P2 | Alta | **No verificable aquí** | Firefox y WebKit/Safari no tienen ejecutables instalados en Playwright (`firefox-1532` y `webkit-2311` ausentes). Se intentó lanzar ambos y se documentó la limitación; no se afirma compatibilidad Safari/Firefox. No se probaron dispositivos físicos, VoiceOver, TalkBack ni Safari iOS real. |
| V-09 | P2 | Alta | **Verificado localmente** | `prefers-color-scheme` produjo las clases `light` y `dark`; home, contacto y CV renderizaron en ambos modos a 1440 px, con fondos distintos y sin overflow. El toggle real está implementado en `components/layout/ThemeToggle.tsx:19-49`; no se verificó persistencia después de una navegación en un dispositivo real. Axe no reportó violaciones en la segunda ejecución estable para home, ni en contacto/CV. |
| V-10 | P2 | Media | **Medición de laboratorio local** | En Chromium de desarrollo, una navegación fría a la home registró aproximadamente: FCP 272 ms a 390 px / 344 ms a 1440 px; TTFB 165/171 ms; CLS acumulado 0 durante la ventana de 3 s; `domInteractive` 254/236 ms. LCP no produjo entrada utilizable en esta captura. Son números de servidor local sin throttling y no son Core Web Vitals reales de usuarios; tampoco se ejecutó un build de producción porque modificaría artefactos y excedería el alcance read-only. |
| V-11 | P2 | Alta | **Validación segura verificada; envío desconocido** | En `/contacto`, pulsar `Enviar` con el formulario vacío dejó inválidos `name`, `email`, `reason` y `message` con mensajes nativos; no hubo request externo. El cliente usa React Hook Form/Zod (`components/forms/ContactForm.tsx:55-123`) y el servidor vuelve a validar, limita y valida MX antes de Resend (`app/actions/contact.ts:40-126`). El camino exitoso, rate limit, DNS/MX, Resend y confirmación no se ejecutaron para no enviar mensajes ni usar credenciales. |
| V-12 | P3 | Alta | **No es un problema observado** | La jerarquía semántica de las superficies disponibles es razonable: un `h1` principal en home/contacto/sobre-mi, headings de sección y labels de formulario accesibles. Las comprobaciones Axe estables no detectaron violaciones en home, contacto ni CV. La ausencia de datos reales impide extender esta conclusión a cards, Portable Text, Mermaid, artículo y filtros. |

## Verificación por superficie

### 1. Listado de proyectos

- **Ruta:** `/proyectos` (y `/en/proyectos`, por configuración de `i18n/routing.ts:8-15`).
- **Código revisado:** `app/[locale]/(pages)/proyectos/page.tsx`, `components/projects/ProjectsClient.tsx`, `components/projects/ProjectCard.tsx`, `lib/data/projects.ts`, `sanity/lib/queries.ts`.
- **Diseño esperado según implementación:** hero interior, búsqueda con debounce de 500 ms, filtro por fuente/tecnología, conteo live, grid responsive de tres columnas en desktop y una/tres según breakpoint.
- **Resultado runtime:** no verificable; `500` por Sanity ausente antes de pintar el listado.
- **Imágenes/orden/información:** el orden local está definido y las cards distinguen fuente, destacado, descripción, tecnologías, estrellas y enlaces. La existencia y orden final de contenido Sanity son desconocidos.

### 2. Casos de estudio individuales

- **Rutas conocidas por repositorio:** `/proyectos/biogas-platform`, `/proyectos/apigen`, `/proyectos/apigen-studio`.
- **Información jerarquizada en código:** breadcrumb → volver → badge/título/descripción → acciones demo/repo → imagen → contenido → tecnologías/info/enlaces → CTA de contacto/CV.
- **SEO positivo verificado por código:** `generateMetadata` incluye `openGraph.images` cuando existe imagen, URL localizada y schema `SoftwareSourceCode` o `CreativeWork` (`app/[locale]/(pages)/proyectos/[id]/page.tsx:111-143,177-210`). Esto corrige una duda de la auditoría anterior, pero no sustituye una prueba HTML con datos CMS.
- **Resultado:** contenido, imágenes, README, Mermaid, enlaces externos y aspecto visual no pudieron abrirse localmente.

### 3. Blog y artículo

- **Rutas:** `/blog` y `/blog/[slug]`; no fue posible obtener un slug publicado porque la consulta Sanity no llegó a ejecutarse.
- **Código revisado:** `app/[locale]/(pages)/blog/page.tsx`, `app/[locale]/(pages)/blog/[slug]/page.tsx`, `components/blog/PostGrid.tsx`, `components/blog/PostHeader.tsx`, `sanity/lib/queries.ts`.
- **Diseño esperado:** filtros/búsqueda/paginación en el listado; artículo con imagen 16:9, overlay, excerpt, contenido Markdown/Portable Text, TOC desktop, compartir, relacionados y comentarios.
- **Resultado runtime:** listado y cualquier artículo son desconocidos; el listado devuelve `500` por la variable de Sanity ausente.
- **Hallazgo positivo:** el artículo tiene metadata OG específica, `BlogPosting`/breadcrumb JSON-LD y `generateStaticParams` (`page.tsx:71-143,165-207`). La disponibilidad y legibilidad del contenido real requieren CMS.

### 4. Ruta de conversión

**Ruta observada en Chromium:** navegación principal → home → `/proyectos` (bloqueada localmente) o `/cv`/`/contacto`; desde el código, cada detalle ofrece contacto y CV. La home imprime `/api/resume`/`/cv` y `/contacto`; la versión inglesa usa `/api/resume?locale=en` donde corresponde (`app/[locale]/page.tsx:88-99`).

**Fortalezas:** CTA final explícito en cada detalle; `/cv` concentra descarga y contacto; el formulario tiene motivo, empresa y timeline; los links externos usan `noopener noreferrer`.

**Límite:** no se pudo probar que `/api/resume` entregue un PDF en esta sesión: la request local respondió `401` desde el proceso ya activo, y no se alteraron credenciales ni middleware. El endpoint está implementado en `app/api/resume/route.ts:25-72`.

## Producción-like y configuraciones

| Área | Evidencia | Veredicto |
|---|---|---|
| Sanity | Variables obligatorias en `sanity/env.ts`; cliente publicado/CDN en `sanity/lib/client.ts`; queries ordenadas por fecha en `sanity/lib/queries.ts` | **No verificado con dataset real**; bloqueo local reproducido |
| GitHub | `getCachedFeaturedProjects()` y README remoto se ejecutan en paralelo/por proyecto en `lib/github/queries.ts` | **No verificado**; no se forzó API externa |
| Email | Server Action valida configuración, Zod, rate limit, MX y Resend | **No enviado**; solo validación vacía local |
| Analytics/CWV | `@vercel/analytics`, `@vercel/speed-insights` y script local de medición | **No hay datos RUM** disponibles en checkout; solo lab local |
| Salud | `/api/health` está protegido por el proceso/middleware observado; el intento local respondió `401` | **No se puede interpretar como estado de producción** |

## Método y evidencia

1. Se comprobó `git status --short --branch` y `git log -1`; no se modificó el árbol durante la inspección.
2. Se hizo inspección estática de rutas App Router, componentes, datos locales, queries Sanity, configuración de Playwright, endpoint de CV, Server Action y estilos globales.
3. Se usó el servidor Next existente en `http://127.0.0.1:3001`; no se levantó un build de producción ni se tocaron archivos de entorno.
4. Se recorrieron con Playwright Chromium headless las rutas `/`, `/contacto`, `/sobre-mi`, `/cv`, `/proyectos` y `/blog` a 390 px. Luego se repitieron home/contacto/CV a 1440 px en claro y oscuro.
5. Se probaron overflow, headings, links, imágenes, formulario vacío, clases de tema, timing Navigation/paint y Axe. Las capturas/temporales se mantuvieron fuera del repositorio.
6. Se intentaron Firefox y WebKit; sus binarios no estaban instalados. No se instaló software ni se afirmó soporte no observado.
7. Se inspeccionaron nombres de variables disponibles únicamente por presencia/ausencia (`.env` y `.env.local` ausentes); nunca se imprimieron valores secretos.

## No problemas / fortalezas confirmadas

- No se observó overflow horizontal en las rutas que sí renderizan, tanto en mobile emulado como desktop.
- El modo oscuro cambia realmente de tema y conserva una estructura utilizable en las superficies comprobadas.
- La búsqueda de proyectos sincroniza el estado a URL y comunica el conteo con `aria-live`; los filtros usan `aria-pressed`.
- Los CTAs de contacto/CV no quedan limitados a una única ubicación: aparecen en home, CV y detalle.
- El formulario vacío no dispara una comunicación externa y tiene campos requeridos reconocibles.
- La estrategia local de case studies conserva contenido rico en español e inglés y orden explícito, en vez de depender únicamente de una respuesta remota.

## Recomendaciones siguientes

1. **P1:** reproducir la auditoría con un entorno Sanity de solo lectura (o un fixture seguro) y confirmar que `/proyectos`, los tres detalles, `/blog` y un slug real responden `200`, con datos publicados, imágenes y orden esperados.
2. **P1:** en un entorno controlado, probar `/api/resume` con una request GET sin exponer el PDF ni datos personales; verificar `Content-Type`, `Content-Disposition`, locale y rate limit.
3. **P2:** ejecutar el mismo smoke visual con Firefox, WebKit y al menos un dispositivo físico real; añadir validación de zoom 200% y teclado en cards, filtros, TOC y formulario.
4. **P2:** obtener un Lighthouse de build de producción con throttling documentado y contrastarlo con Vercel Speed Insights/RUM. Reportar LCP, INP y CLS separados entre lab y usuarios reales; no usar el script local como sustituto.
5. **P2:** validar en un dataset CMS representativo si las cards tienen imágenes informativas; si no, decidir explícitamente entre arte generativo de fallback y capturas/diagramas reales por proyecto.
6. **P3:** mantener esta separación de estados (verificado, riesgo, hipótesis, desconocido) en la próxima ronda para no convertir la ausencia de credenciales en una afirmación sobre producción.

## Límites explícitos

- No se verificó producción ni se accedió a Vercel, Sanity Studio, GitHub API autenticada, Resend, Redis, base de datos ni analytics.
- No se enviaron emails, formularios ni eventos externos.
- No se inspeccionaron secretos; el documento no contiene tokens, IDs privados, cookies ni valores de entorno.
- No hubo Firefox, Safari/WebKit, iOS/Android físico, VoiceOver/TalkBack ni red móvil real.
- Los timings son de desarrollo local y no representan experiencia de usuarios reales.
- La imposibilidad de abrir proyectos/blog es un hecho del entorno auditado, no una prueba suficiente de una caída en producción.

## Revisión del video externo (Twitch, 01:24:00–01:30:00)

### Alcance y metadata

Se revisó visualmente el segmento externo de Twitch comprendido entre 01:24:00 y 01:30:00 (360 s). El archivo observado tiene resolución 1920×1080, 60 fps y audio AAC. **El audio no fue transcrito ni escuchado de forma analítica**, porque no había STT ni monitorización local disponible; por tanto, este apartado no atribuye ninguna afirmación verbal al video y reporta únicamente evidencia visible.

Los tiempos de la tabla son relativos al inicio del segmento descargado, no al timestamp absoluto del VOD.

### Línea de tiempo de pantallas visibles

| Tiempo relativo | Evidencia visual |
|---|---|
| 00:20–00:50 | Home oscura con “Javier Zader”, “backend developer” y CTAs “CV”, “Ver Proyectos” y “Contactar”. También se ven APiGen y visuales de respuestas API/SQL. |
| 01:00–01:30 | Página de CV con “Download CV”/“Contact”, Córdoba, resumen y experiencia. Se muestra asimismo el panel de preferencias de privacidad. |
| 01:40–02:20 | Listado de proyectos con el conteo “11 de 11 proyectos”. Se identifican Biogas Platform, ApiGen, ApiGen Studio, consorcio-canalero, fit-tracker, repoforge, repo-radar y md-evals, junto con tecnologías, estrellas y enlaces. |
| 02:20–03:00 | Página “About” con las métricas visibles “20+ years”, “6 end-to-end systems”, “4+ certifications” y “20+ technologies”. |
| 03:00–04:00 | Newsletter y footer. |
| 04:00–04:40 | Blog con búsqueda y filtros; aparece “1 artículo” y el artículo “Bienvenido a mi Portfolio: Un Tour por Todas sus Features”, de 8 min, fechado 11/12/2025. |
| 04:40–04:50 | Error JSON transitorio visible: `Rate limit exceeded. Please try again later.`, con `retryAfter: 2`. |
| 04:50–06:00 | El blog vuelve a mostrarse; después se recorren About, newsletter, footer y Chrome DevTools. |

### Acuerdos con la auditoría local

- Confirma la existencia y disponibilidad visual de superficies que el checkout local no permitió abrir: listado de proyectos, blog y contenido asociado.
- Confirma las superficies ya observadas localmente: home, CV, About, newsletter/footer, CTAs de conversión y preferencias de privacidad.
- Refuerza que el sitio integra contenido de proyectos, metadatos técnicos, enlaces externos, filtros/búsqueda y una ruta editorial de blog.
- El error de rate limit observado es compatible con una dependencia externa o una ejecución limitada por cuota; no demuestra por sí solo un fallo persistente ni contradice la validación local de rutas.

### Diferencias aparentes y explicación por entorno

El video muestra `/proyectos` y `/blog` funcionando, mientras que la auditoría local registró respuestas `500` por ausencia de `NEXT_PUBLIC_SANITY_DATASET` y `NEXT_PUBLIC_SANITY_PROJECT_ID`. Esto **no es una contradicción**: son ejecuciones en entornos distintos. El video aporta evidencia de un entorno con contenido y configuración/datos remotos disponibles; la auditoría documenta el comportamiento reproducible del checkout local sin esas variables. En consecuencia, el video reduce la incertidumbre sobre la existencia de las superficies, pero no reemplaza una prueba reproducible del entorno de producción ni permite determinar qué configuración exacta estaba activa.

### Evidencia nueva incorporada

1. El listado visible declara **11 proyectos** (“11 de 11 proyectos”), ampliando la evidencia más allá de los tres estudios identificables en los datos locales revisados.
2. El blog contiene **un artículo** visible, con título, duración y fecha concretos: “Bienvenido a mi Portfolio: Un Tour por Todas sus Features”, 8 min, 11/12/2025.
3. Se observó un error JSON transitorio de rate limit con `retryAfter: 2`; debe tratarse como evidencia de resiliencia/limitación temporal de una dependencia, no como caída general.
4. El panel de preferencias de privacidad aparece visible en la página de CV, confirmando la presencia de esa superficie en la ejecución externa.

### Confianza de las conclusiones

- **Alta:** duración del segmento, resolución, frecuencia de imagen, codec de audio declarado, pantallas y textos que se leen directamente, incluidos “11 de 11 proyectos”, “1 artículo” y el JSON de rate limit.
- **Media:** que los datos visibles correspondan a contenido publicado y representativo de producción; el video no identifica de forma suficiente el entorno, commit, dataset ni configuración de despliegue.
- **Baja/no evaluable:** cualquier afirmación verbal, debido a que el audio no fue transcrito ni escuchado analíticamente; también quedan sin confirmar la interacción completa, persistencia de filtros, descarga efectiva del CV, envío del formulario, accesibilidad con teclado/lector de pantalla y comportamiento en otros navegadores o dispositivos.

### Límites de esta revisión

- La revisión fue visual y se limitó al segmento 01:24:00–01:30:00; no se inspeccionó el VOD completo ni se ejecutó la aplicación desde el video.
- No se atribuyen al autor del video ni a la aplicación afirmaciones que dependan del audio.
- No se conocen el commit, las variables de entorno, el dataset Sanity, el estado de caché, la identidad de la sesión ni la condición de red del entorno mostrado.
- El material externo confirma superficies visibles en otra ejecución, pero no invalida el bloqueo local documentado ni constituye evidencia suficiente de disponibilidad actual en producción.

## Transcripción y feedback verbal del video externo

### Método y alcance de la transcripción

Se transcribió el clip completo de 360 s con `faster-whisper medium` usando CPU e `int8`. El idioma detectado fue español, con probabilidad 0.9996, y se obtuvieron 39 segmentos de voz. La confianza es **media para la literalidad de cada palabra** —especialmente nombres propios y términos de interfaz— y **alta para el contenido general y las recomendaciones expresadas**. El texto resultante está en `/tmp/opencode/portfolio-review-84-90-transcript-medium.txt`; es un archivo temporal de trabajo y **no debe tratarse como artefacto del repositorio**.

Los puntos siguientes separan la evidencia verbal directa de su interpretación para la auditoría. Las palabras o términos cuya transcripción es incierta no se usan como hallazgos: solo se resumen las observaciones cuyo sentido general es consistente con el audio y el contexto visual.

### Feedback verbal directo, con marcas temporales

Los tiempos son relativos al inicio del clip descargado, igual que en la sección anterior.

| Tiempo relativo | Feedback verbal del revisor |
|---|---|
| 00:41–01:00 | Las animaciones le parecen agradables y destaca que no percibe CLS asociado a ellas. Esta afirmación es la apreciación del revisor; no sustituye la medición local de CLS documentada en V-10. |
| 01:00–01:50 | Valora que el proyecto destacado sea interactivo y no una captura estática. Sugiere que esa pieza permita acceder a más información, a un detalle del proyecto o, como mínimo, a GitHub. También cuestiona la claridad de “Ver”: puede interpretarse como abrir un modal, pero no resulta evidente cómo cerrarlo ni qué representa el icono del ojo. |
| 01:50–02:21 | Considera que las cards son preferibles a mostrar únicamente screenshots, pero observa que una card destaca demasiado frente al resto. Recomienda conservar una coherencia visual y tamaños más uniformes. |
| 02:21–02:59 | Algunos controles parecen indicar que algo está cargando o que existe un slider desplazable, aunque no se comportan así. Propone simplificarlos; en particular, valora probar un check sin círculo y revisar el uso del gris. También plantea si algunas secciones —por ejemplo, proyectos dentro de “Sobre mí”— podrían resolverse con anchors en lugar de tantas rutas separadas. |
| 02:59–03:13 | El skeleton del blog le resulta extraño. Dado que solo hay un post, recomienda ocultar el blog hasta disponer de más contenido o ampliarlo antes de presentarlo como una sección editorial. Durante la revisión también menciona un rate limit tras dos requests, coherente con el error JSON ya registrado en la línea de tiempo visual. |
| 03:13–03:59 | Considera que contacto está bien. Para el footer, prefiere evitar el texto centrado y usar una anchura y alineación más controladas, con mejor aprovechamiento horizontal del espacio. |

### Interpretación y comparación con la auditoría existente

Este audio **complementa**, pero no reemplaza, la evidencia del audit local ni la revisión visual previa:

- Refuerza V-02, V-04 y la sección de proyectos al aportar una crítica de presentación sobre el proyecto destacado, las cards y los controles; no verifica por sí mismo datos de Sanity, imágenes reales ni el orden final.
- Añade una recomendación de conversión concreta: el proyecto destacado debe tener un destino inequívoco hacia información ampliada, detalle del proyecto o GitHub. Esto es compatible con la observación de que los detalles ya disponen de CTAs hacia contacto/CV (V-03 y V-05), pero señala una posible discontinuidad entre el highlight de la home y esos detalles.
- Matiza V-10: el revisor afirma que no percibe CLS durante las animaciones, mientras que la auditoría local midió CLS acumulado 0 en una ventana de laboratorio. Son evidencias favorables pero distintas y ninguna representa datos RUM de producción.
- Amplía la revisión del blog: la auditoría ya había documentado un único artículo visible y un rate limit transitorio. El feedback verbal convierte esa situación en una cuestión de percepción y contenido mínimo viable: ocultar la sección hasta tener más publicaciones o hacer que la experiencia de un único artículo sea deliberadamente completa.
- Añade observaciones de claridad de interacción, uniformidad visual, navegación mediante anchors y alineación del footer que no estaban formuladas como hallazgos priorizados en la sección anterior. Se consideran recomendaciones UX de seguimiento, no defectos funcionales confirmados.

### Límites de interpretación

La transcripción puede contener errores puntuales en nombres propios, etiquetas o términos de interfaz. Esos términos inciertos no se elevan a hallazgos ni se emplean para atribuir comportamientos no confirmados. “No hay CLS” se conserva como comentario verbal del revisor, no como una nueva medición; de igual forma, la sugerencia sobre anchors no implica que las rutas actuales sean incorrectas. La grabación muestra otra ejecución y sus comentarios, pero no permite determinar el commit, el entorno, el dataset ni la reproducibilidad de cada interacción.
