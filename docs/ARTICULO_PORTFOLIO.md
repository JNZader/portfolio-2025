# Bienvenido a mi Portfolio: Un Tour por Todas sus Features

> Este es el artículo que se publicará en el blog. Tono conversacional y ameno.

---

**Meta para Sanity:**
- **Title:** Bienvenido a mi Portfolio: Un Tour por Todas sus Features
- **Excerpt:** Un recorrido por todas las funcionalidades de este portfolio: desde el blog con comentarios hasta los easter eggs escondidos. Te cuento qué puedes hacer aquí y cómo funciona todo.
- **Categories:** Portfolio, Full Stack
- **Reading Time:** 10 minutos

---

## El Contenido del Artículo

Hola, bienvenido a mi rincón en internet.

Este portfolio no es solo una página con mi CV y algunos links. A lo largo del tiempo le fui agregando features que me parecían útiles (o simplemente divertidas). En este post te cuento todo lo que puedes encontrar aquí y cómo sacarle el máximo provecho.

Vamos por partes.

---

## El Blog: Más que Solo Texto

### Escribo sobre lo que aprendo

El blog es donde documento mis experiencias, errores y aprendizajes. No vas a encontrar tutoriales genéricos copiados de la documentación oficial. Acá escribo sobre problemas reales que enfrenté y cómo los resolví.

Cada post tiene:
- **Tiempo de lectura estimado** - Para que sepas si tienes 5 minutos o necesitas un café
- **Categorías** - Para filtrar por tema (React, Next.js, DevOps, etc.)
- **Tabla de contenidos** - En posts largos, para saltar a la sección que te interesa
- **Fecha de publicación** - Porque el contexto importa en tecnología

### Búsqueda y Filtros

En la página del blog puedes:
- **Buscar por texto** - Encuentra posts por título o contenido
- **Filtrar por categoría** - Click en cualquier categoría para ver solo esos posts
- **Paginación** - Los posts se cargan de a 6 para no saturarte

### Comentarios con GitHub

Al final de cada post hay una sección de comentarios. Funciona con **Giscus**, que usa GitHub Discussions por detrás.

¿Qué significa esto?
- **Inicias sesión con tu cuenta de GitHub** - No necesitas crear otra cuenta
- **Puedes usar Markdown** - Formatear código, agregar links, etc.
- **Las discusiones quedan en GitHub** - Transparentes y accesibles

Si tienes una pregunta o quieres agregar algo al post, los comentarios están ahí para eso.

### Compartir es Fácil

Cada post tiene botones para compartir en:
- Twitter/X
- LinkedIn
- Copiar el link

Un click y listo.

---

## Proyectos: Lo que Construí

### Dos Fuentes de Proyectos

Los proyectos que ves en `/proyectos` vienen de dos lugares:

**1. Sanity CMS** - Proyectos que documento manualmente con descripciones detalladas, screenshots y toda la historia detrás.

**2. GitHub** - El portfolio se conecta directamente a mi cuenta de GitHub y trae repositorios automáticamente. Si un repo tiene el topic `portfolio` o `featured`, aparece aquí.

Esto significa que cuando creo un nuevo proyecto en GitHub y le agrego el topic correcto, aparece automáticamente en el portfolio. Sin tener que actualizar nada manualmente.

### Qué Ves en Cada Proyecto

- **Descripción** - De qué se trata
- **Tecnologías usadas** - El stack completo
- **Link al repositorio** - Para ver el código
- **Demo en vivo** - Si está deployado, puedes probarlo
- **Estrellas de GitHub** - Para los proyectos que vienen de GitHub

---

## Newsletter: Mantente al Día

### Suscripción con Doble Opt-in

Si te interesa recibir updates cuando publico algo nuevo, puedes suscribirte a la newsletter en `/newsletter`.

El proceso es simple:
1. Dejas tu email
2. Te llega un email de confirmación
3. Haces click en el link para confirmar
4. Listo, estás dentro

¿Por qué doble opt-in? Porque me importa que realmente quieras estar en la lista, no que alguien haya puesto tu email por error (o por maldad).

### Emails que Envío

No te voy a llenar la casilla de spam. Los emails son:
- **Bienvenida** - Cuando confirmas tu suscripción
- **Nuevos posts** - Cuando publico algo que creo que te puede interesar
- **Updates importantes** - Muy ocasionalmente

### Darte de Baja es Fácil

Cada email tiene un link de "cancelar suscripción" al final. Un click y no recibes más emails. Sin preguntas, sin formularios, sin culpa.

---

## Privacidad: Tus Datos, Tu Control

### GDPR Compliant

Este portfolio cumple con GDPR (el reglamento europeo de protección de datos). En la práctica, esto significa:

**Puedes pedir tus datos** - En `/data-request` hay un formulario donde puedes solicitar una copia de todos los datos que tengo sobre ti. Te llega un email con todo.

**Puedes pedir que los borre** - Si quieres que elimine tus datos, también puedes solicitarlo. Borrado permanente, sin backups escondidos.

### Cookies Transparentes

La primera vez que visitas el sitio, aparece un banner de cookies. No es de esos molestos que ocupan media pantalla. Te da tres opciones:

- **Aceptar todas** - Analytics + Marketing
- **Solo esenciales** - Las mínimas para que funcione el sitio
- **Personalizar** - Eliges exactamente qué aceptas

Y si cambias de opinión después, puedes modificar tus preferencias en cualquier momento desde el footer.

### Qué Cookies Uso

- **Esenciales** - Para que el sitio funcione (siempre activas)
- **Analytics** - Google Analytics para entender qué contenido es útil
- **Marketing** - Por ahora ninguna, pero el sistema está preparado

---

## Contacto: Hablemos

### Formulario de Contacto

En `/contacto` hay un formulario simple:
- Tu nombre
- Tu email
- Tu mensaje

Cuando lo envías, me llega un email. Así de simple.

### Protección Anti-Spam

El formulario tiene rate limiting. No puedes enviar 100 mensajes por minuto. Esto protege contra bots y spam, sin necesidad de CAPTCHAs molestos.

También hay validación en tiempo real. Si el email está mal escrito, te avisa antes de enviar.

### Protección contra Web Scraping

Mi email no está visible en texto plano en el código fuente. Está ofuscado para que los bots que rastrean sitios buscando emails no puedan recolectarlo fácilmente. Si ves mi email en la página, es porque se renderiza de forma segura en el navegador, pero los scrapers automáticos solo ven caracteres sin sentido.

---

## Modo Oscuro: Cuida tus Ojos

### Automático por Defecto

El portfolio detecta la preferencia de tu sistema operativo. Si tienes el modo oscuro activado en Windows/Mac/Linux, el sitio se ve en modo oscuro automáticamente.

### Toggle Manual

Si prefieres elegir manualmente, hay un botoncito en el header (el icono de sol/luna). Click y cambia. Tu preferencia se guarda para la próxima visita.

---

## Accesibilidad: Para Todos

### Navegación por Teclado

Todo el sitio es navegable con teclado. Tab para moverte entre elementos, Enter para activar, Escape para cerrar modales.

### Skip Links

Si presionas Tab al cargar cualquier página, aparece un link de "Saltar al contenido". Útil si usas lector de pantalla o simplemente no quieres tabear por todo el menú.

### Lectores de Pantalla

El sitio usa HTML semántico y ARIA labels donde corresponde. Los lectores de pantalla pueden navegar el contenido correctamente.

### Contraste de Colores

Todos los textos tienen suficiente contraste con el fondo. Tanto en modo claro como oscuro.

---

## Descargar mi CV

### PDF Generado al Momento

En la sección "Sobre mí" o en el header hay un botón para descargar mi CV. El PDF se genera dinámicamente con la información más actualizada.

No es un archivo estático que tengo que acordarme de actualizar. Siempre está al día.

### Datos Protegidos

Los datos del CV no están expuestos públicamente. Muchos portfolios dejan toda la información personal accesible. Acá no:

- **Los datos están en el servidor** - No hay un archivo público que cualquiera pueda descargar
- **El email está codificado** - Solo se decodifica al momento de generar el PDF
- **Rate limiting estricto** - Solo puedes descargar 3 CVs por hora, lo que dificulta el scraping automatizado

Así que sí, puedes descargar mi CV, pero los bots que rastrean sitios buscando datos personales se van a encontrar con un muro.

---

## Easter Eggs: Sorpresas Escondidas

Ok, no voy a spoilear todo, pero hay algunas sorpresas escondidas en el portfolio. Pistas:

- **Escribe algo en el teclado** mientras navegas por el sitio
- **Haz click varias veces** en mi avatar
- **El código Konami** funciona en algún lugar

Si encontrás alguno, no lo cuentes. Dejá que otros los descubran.

---

## Performance: Rápido de Verdad

### Carga Instantánea

El portfolio está optimizado para cargar rápido:
- Las imágenes se cargan de forma lazy (solo cuando las necesitas)
- El código JavaScript se divide en chunks pequeños
- El contenido estático se cachea agresivamente

### Sin Spinners Infinitos

Nada de pantallas de carga eternas. El contenido principal aparece de inmediato, y los elementos secundarios se van cargando progresivamente.

---

## Responsive: Se Ve Bien en Todo

### Mobile First

El diseño está pensado primero para móviles y después se adapta a pantallas más grandes. No es un sitio de escritorio "achicado" para celular.

### Menú Mobile

En pantallas chicas, el menú se convierte en un hamburger menu con animación suave. Accesible y fácil de usar.

---

## Seguridad: Tranquilo, Estás Seguro

### Formularios Protegidos

Todos los formularios (contacto, newsletter, data requests) tienen:
- **Rate limiting** - No puedes abusar enviando requests
- **Validación** - Los datos se verifican antes de procesarse
- **Sanitización** - Se limpian para evitar inyecciones

### HTTPS Everywhere

Todo el tráfico va por HTTPS. Tus datos viajan encriptados.

### Headers de Seguridad

El sitio tiene configurados headers de seguridad modernos que previenen ataques comunes como XSS, clickjacking, etc.

---

## El Stack Completo

Estas son todas las tecnologías que hacen funcionar este portfolio:

### Core

- **Next.js 16** - El framework principal, con App Router y React Server Components
- **React 19** - Con el nuevo compilador que reduce re-renders innecesarios
- **TypeScript 5.9** - Tipado estricto para evitar bugs en runtime
- **Tailwind CSS 4** - Estilos con la nueva sintaxis basada en CSS

### CMS y Base de Datos

- **Sanity CMS** - Donde vive el contenido del blog y proyectos
- **PostgreSQL** - Base de datos para suscriptores, analytics y datos de contacto
- **Prisma** - ORM para interactuar con la base de datos de forma segura
- **Upstash Redis** - Cache y rate limiting distribuido

### Autenticación y APIs

- **NextAuth v5** - Autenticación (para el admin y futuras features)
- **Octokit** - Cliente de GitHub para traer repos automáticamente
- **Resend** - Envío de emails transaccionales (confirmaciones, newsletter)
- **Zod** - Validación de datos en formularios y APIs

### UI y Animaciones

- **Framer Motion** - Animaciones fluidas y gestos
- **Lucide React** - Iconos consistentes
- **Radix UI** - Componentes accesibles (modales, tooltips)
- **React Hot Toast** - Notificaciones elegantes
- **Prism.js** - Syntax highlighting en bloques de código

### Comentarios y Analytics

- **Giscus** - Sistema de comentarios basado en GitHub Discussions
- **Vercel Analytics** - Métricas de uso
- **Google Analytics 4** - Analytics más detallado
- **Sentry** - Monitoreo de errores en producción

### Testing

- **Vitest** - Tests unitarios e integración
- **Playwright** - Tests end-to-end en múltiples navegadores
- **Testing Library** - Tests de componentes
- **axe-core** - Tests automáticos de accesibilidad

### Calidad de Código

- **Biome** - Linting y formateo ultrarrápido (reemplaza ESLint + Prettier)
- **Husky** - Git hooks para validar commits
- **Commitlint** - Commits con formato convencional
- **GitHub Actions** - CI/CD automatizado

### Hosting e Infraestructura

- **Vercel** - Hosting con edge functions y preview deployments
- **Cloudflare** - CDN y protección DDoS (a través de Vercel)

### Otras Utilidades

- **Sharp** - Optimización de imágenes
- **jsPDF** - Generación del CV en PDF
- **SWR** - Data fetching con cache
- **nanoid** - Generación de IDs únicos para tokens

---

En algún momento escribiré un post más detallado sobre la arquitectura y las decisiones técnicas detrás de cada elección. Por ahora, esto te da una idea de todo lo que hay bajo el capó.

---

## Feedback Bienvenido

Si encontrás un bug, tenés una sugerencia, o simplemente querés decir hola:
- **Comentarios** en cualquier post
- **Formulario de contacto** en `/contacto`
- **GitHub Issues** si es algo técnico

Este portfolio es un proyecto vivo. Lo sigo mejorando y agregando cosas. Tu feedback ayuda a decidir qué priorizar.

---

Espero que encuentres algo útil por aquí.

Nos vemos en el próximo post.
