# Guía de Publicación: Blog Posts y Proyectos

> Tutorial paso a paso para publicar contenido en el portfolio usando Sanity Studio

---

## Requisitos Previos

```bash
# 1. Tener el proyecto corriendo
npm run dev

# 2. Abrir Sanity Studio en el navegador
http://localhost:3000/studio
```

---

## Parte 1: Publicar un Artículo de Blog

### Paso 1: Crear Categorías (solo la primera vez)

Antes de crear tu primer post, necesitas al menos una categoría.

1. En el sidebar izquierdo, click en **Blog** > **Categories**
2. Click en el botón **"+"** o **"Create"**
3. Completa los campos:

| Campo | Ejemplo | Notas |
|-------|---------|-------|
| **Title** | `React` | Nombre de la categoría |
| **Slug** | `react` | Se genera automáticamente |
| **Description** | `Artículos sobre React y hooks` | Breve descripción |
| **Color** | `#61DAFB` | Color hex para el badge |

**Colores sugeridos por tecnología:**
- React: `#61DAFB`
- Next.js: `#000000`
- TypeScript: `#3178C6`
- JavaScript: `#F7DF1E`
- DevOps: `#2496ED`
- Tutorial: `#4CAF50`

4. Click en **"Publish"** (botón verde abajo a la derecha)

---

### Paso 2: Crear el Post

1. En el sidebar, click en **Blog** > **Posts**
2. Click en **"+"** o **"Create new post"**

### Paso 3: Completar los Campos del Post

#### Campos Obligatorios

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Title** | Título del artículo (10-100 caracteres) | `Cómo optimicé mi app Next.js de 5s a 1s` |
| **Slug** | URL del artículo (auto-generado) | `como-optimice-mi-app-nextjs` |
| **Excerpt** | Resumen para tarjetas (100-300 caracteres) | `Guía práctica para mejorar el rendimiento de tu aplicación Next.js con técnicas de caching y lazy loading.` |
| **Main Image** | Imagen principal del post | Ver sección de imágenes abajo |
| **Categories** | 1-3 categorías relacionadas | Seleccionar de la lista |
| **Body** | Contenido del artículo | Ver sección de contenido abajo |
| **Published At** | Fecha de publicación | Se auto-completa con fecha actual |

#### Campos Opcionales (pero Recomendados)

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Author > Name** | Tu nombre | `Javier Zader` |
| **Author > Image** | Tu foto/avatar | Subir imagen |
| **Author > Bio** | Breve bio | `Full Stack Developer` |
| **Reading Time** | Minutos de lectura | `8` (calcula: palabras / 200) |
| **Featured** | Mostrar en destacados | Marcar para posts importantes (max 3) |
| **SEO > Meta Title** | Título para Google (max 60 chars) | `Optimización Next.js: De 5s a 1s | Tu Blog` |
| **SEO > Meta Description** | Descripción para Google (max 160 chars) | `Aprende a optimizar...` |
| **SEO > Keywords** | Palabras clave | `next.js, performance, optimization` |

---

### Paso 4: Subir la Imagen Principal

1. En el campo **Main Image**, click en **"Upload"**
2. Selecciona una imagen (JPG, PNG, WebP)
3. **Importante**: Completa el campo **"Alternative text"** (obligatorio)
   - Ejemplo: `Gráfico comparando tiempos de carga antes y después de la optimización`
4. Opcional: Ajusta el **hotspot** (punto focal) arrastrando el círculo

**Fuentes recomendadas para imágenes:**
- [Unsplash](https://unsplash.com) - Fotos gratuitas
- [Carbon](https://carbon.now.sh) - Screenshots de código
- [Excalidraw](https://excalidraw.com) - Diagramas
- Capturas propias de tu código/app

---

### Paso 5: Escribir el Contenido (Body)

El editor de Sanity soporta **Portable Text**, un formato rico que incluye:

#### Texto y Formato

- **Párrafos**: Escribe normalmente
- **Negritas**: Selecciona texto y click en **B** o `Ctrl+B`
- **Cursivas**: Selecciona texto y click en **I** o `Ctrl+I`
- **Código inline**: Selecciona texto y click en `</>`

#### Headings (Encabezados)

Click en el dropdown de estilos y selecciona:
- **H2**: Secciones principales
- **H3**: Subsecciones
- **H4**: Sub-subsecciones
- **Blockquote**: Citas destacadas

**Estructura recomendada:**
```
## Introducción (H2)
[Párrafo introductorio]

## El Problema (H2)
### Contexto (H3)
[Contenido]

## La Solución (H2)
### Paso 1 (H3)
[Contenido]

## Conclusión (H2)
```

#### Code Blocks (Bloques de Código)

1. Click en **"+ Add item"** en el editor
2. Selecciona **"Code Block"**
3. Completa:
   - **Code**: Pega tu código
   - **Language**: Selecciona el lenguaje (TypeScript, JavaScript, CSS, etc.)
   - **Filename** (opcional): Nombre del archivo, ej: `utils/cache.ts`

**Lenguajes disponibles:**
- TypeScript, JavaScript, JSX
- HTML, CSS, SCSS
- JSON, Markdown
- Bash, Python, SQL

**Ejemplo de code block:**
```typescript
// components/OptimizedImage.tsx
export function OptimizedImage({ src, alt }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      loading="lazy"
      placeholder="blur"
    />
  );
}
```

#### Imágenes Inline

1. Click en **"+ Add item"**
2. Selecciona **"Image"**
3. Sube la imagen
4. Completa **Alt text** y opcionalmente **Caption**

#### Links

1. Selecciona el texto que será el link
2. Click en el icono de link (cadena)
3. Ingresa la URL
4. Opcional: Marca **"Open in new tab"** para links externos

#### Listas

- **Bullet points**: Click en icono de lista con puntos
- **Lista numerada**: Click en icono de lista numerada

---

### Paso 6: Publicar

1. Revisa que todos los campos obligatorios estén completos
2. En la esquina inferior derecha, click en **"Publish"**
3. El artículo estará disponible en `/blog/[tu-slug]` en ~60 segundos (tiempo de revalidación)

**Para previsualizar antes de publicar:**
- Sanity guarda automáticamente como borrador
- Puedes ver el borrador en el Studio pero no será público hasta hacer "Publish"

---

## Parte 2: Publicar un Proyecto

### Paso 1: Preparar el Proyecto

Antes de agregarlo al portfolio, asegúrate de tener:

- [ ] Repositorio en GitHub con README completo
- [ ] Demo funcional (si aplica)
- [ ] Screenshots de la aplicación
- [ ] Lista de tecnologías usadas

---

### Paso 2: Crear el Proyecto en Sanity

1. En el sidebar, click en **Projects**
2. Click en **"+"** o **"Create new project"**

---

### Paso 3: Completar los Campos del Proyecto

#### Campos Obligatorios

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Title** | Nombre del proyecto (3-100 chars) | `Task Manager con IA` |
| **Slug** | URL del proyecto (auto-generado) | `task-manager-ia` |
| **Excerpt** | Descripción corta (50-200 chars) | `App de gestión de tareas que usa GPT-4 para categorizar y priorizar automáticamente.` |
| **Main Image** | Screenshot principal | Captura de la UI principal |
| **Main Image > Alt** | Texto alternativo | `Dashboard principal de Task Manager mostrando tareas categorizadas` |

#### Campos Opcionales

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Technologies** | Stack tecnológico (array) | `Next.js`, `React`, `TypeScript`, `Prisma` |
| **Demo URL** | Link a la demo en vivo | `https://mi-app.vercel.app` |
| **GitHub URL** | Link al repositorio | `https://github.com/usuario/proyecto` |
| **Featured** | Mostrar en destacados | Marcar para proyectos importantes |
| **Published At** | Fecha del proyecto | Fecha de finalización/lanzamiento |
| **Body** | Descripción detallada | Ver estructura abajo |

---

### Paso 4: Agregar Tecnologías

1. En el campo **Technologies**, click en **"Add item"**
2. Escribe el nombre de la tecnología
3. Repite para cada tecnología del stack

**Ejemplo de lista:**
```
Next.js
React
TypeScript
Tailwind CSS
Prisma
PostgreSQL
Vercel
```

---

### Paso 5: Escribir la Descripción (Body)

El body del proyecto soporta los mismos elementos que el blog:
- Párrafos y headings
- Code blocks
- Imágenes inline
- Links y listas

**Estructura recomendada para proyectos:**

```markdown
## Resumen

[1-2 párrafos explicando qué hace el proyecto y para quién]

## Motivación

[¿Por qué construiste esto? ¿Qué problema resuelve?]

## Características Principales

- Feature 1: Descripción breve
- Feature 2: Descripción breve
- Feature 3: Descripción breve

## Stack Técnico

**Frontend:**
- Next.js 16 con App Router
- React Server Components
- Tailwind CSS

**Backend:**
- API Routes
- Prisma ORM
- PostgreSQL

**Infraestructura:**
- Vercel
- Supabase

## Desafíos Técnicos

### [Desafío 1]
[Descripción del problema y cómo lo resolviste]

### [Desafío 2]
[Descripción del problema y cómo lo resolviste]

## Aprendizajes

- Aprendizaje 1
- Aprendizaje 2
- Aprendizaje 3
```

---

### Paso 6: Publicar el Proyecto

1. Verifica que todos los campos obligatorios estén completos
2. Click en **"Publish"**
3. El proyecto estará disponible en `/proyectos/[tu-slug]`

---

## Resumen Visual del Flujo

```
┌─────────────────────────────────────────────────────┐
│              SANITY STUDIO (/studio)                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  BLOG POST                    PROYECTO              │
│  ─────────                    ────────              │
│  1. Crear categoría           1. Preparar repo      │
│  2. Crear post                2. Crear proyecto     │
│  3. Completar campos          3. Completar campos   │
│  4. Subir imagen              4. Subir screenshot   │
│  5. Escribir contenido        5. Agregar techs      │
│  6. Publicar                  6. Escribir body      │
│                               7. Publicar           │
│                                                     │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
            Sanity CDN (60s cache)
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│              TU PORTFOLIO (Next.js)                 │
├─────────────────────────────────────────────────────┤
│  /blog              → Lista de posts                │
│  /blog/[slug]       → Artículo individual           │
│  /proyectos         → Lista de proyectos            │
│  /proyectos/[id]    → Proyecto individual           │
└─────────────────────────────────────────────────────┘
```

---

## Checklist de Publicación

### Blog Post

- [ ] Título descriptivo (10-100 caracteres)
- [ ] Slug generado correctamente
- [ ] Excerpt (100-300 caracteres)
- [ ] Imagen principal con alt text
- [ ] Al menos 1 categoría asignada
- [ ] Contenido estructurado con headings
- [ ] Code blocks con lenguaje correcto
- [ ] Fecha de publicación
- [ ] (Opcional) Información de autor
- [ ] (Opcional) SEO meta tags

### Proyecto

- [ ] Título del proyecto (3-100 caracteres)
- [ ] Slug generado correctamente
- [ ] Excerpt (50-200 caracteres)
- [ ] Screenshot principal con alt text
- [ ] Lista de tecnologías
- [ ] GitHub URL (verificar que funcione)
- [ ] Demo URL (solo si funciona)
- [ ] Descripción en el body
- [ ] Fecha del proyecto

---

## Solución de Problemas

### El post/proyecto no aparece en el sitio

1. Verifica que hayas hecho click en **"Publish"** (no solo guardado)
2. Espera ~60 segundos (tiempo de revalidación del cache)
3. Haz un hard refresh en el navegador (`Ctrl+Shift+R`)

### Error al subir imagen

1. Verifica que la imagen no exceda 10MB
2. Usa formatos soportados: JPG, PNG, WebP, GIF
3. Intenta comprimir la imagen con [TinyPNG](https://tinypng.com)

### El slug tiene caracteres extraños

1. Edita manualmente el slug
2. Usa solo letras minúsculas, números y guiones
3. Evita acentos y caracteres especiales

### No puedo acceder a /studio

1. Verifica que el servidor esté corriendo (`npm run dev`)
2. Verifica las variables de entorno de Sanity en `.env.local`:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=tu-project-id
   NEXT_PUBLIC_SANITY_DATASET=production
   ```

---

## Referencias

- [Documentación de Sanity](https://www.sanity.io/docs)
- [Guía de Contenido](./CONTENT_GUIDE.md) - Filosofía y mejores prácticas de escritura
- [Portable Text](https://www.sanity.io/docs/portable-text)
