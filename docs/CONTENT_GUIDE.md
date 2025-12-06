# 📝 Guía para Crear Contenido Real en tu Portfolio

> Después de la limpieza completa, sigue esta guía para agregar contenido auténtico y profesional

---

## 🎯 Filosofía: Calidad sobre Cantidad

**Regla de Oro**: Es mejor tener 2 posts excelentes que 10 mediocres.

Un portfolio con poco contenido pero 100% real y bien escrito genera **mucha más confianza** que uno lleno de contenido genérico o ficticio.

---

## 📁 Paso 1: Crear Categorías (2-4 categorías)

### Acceder a Sanity Studio

```bash
npm run dev
# Abrir: http://localhost:3000/studio
```

### Categorías Sugeridas Basadas en tu Stack

Elige 2-4 categorías que representen tu experiencia real:

**Opción A - Stack Técnico**:
- **React** - Si trabajas con React regularmente
- **Next.js** - Si usas Next.js profesionalmente
- **TypeScript** - Si lo usas en proyectos reales
- **Full Stack** - Si haces tanto frontend como backend

**Opción B - Por Tipo de Contenido**:
- **Tutoriales** - Guías paso a paso
- **Reflexiones** - Aprendizajes y experiencias
- **Proyectos** - Case studies de tus desarrollos
- **Herramientas** - Reviews y comparaciones

**Opción C - Por Tema**:
- **Performance** - Optimización y rendimiento
- **Accesibilidad** - a11y y UX
- **DevOps** - CI/CD, deployment, infraestructura
- **Arquitectura** - Patrones y diseño de sistemas

### Crear una Categoría

1. Click en "**Category**" en el sidebar
2. Click en "**Create new category**"
3. Completa los campos:

```
Title: React
Slug: react (se genera automático)
Description: Artículos sobre React, hooks, optimización y patrones modernos
Color: #61DAFB (azul oficial de React)
```

### Colores Sugeridos

- **React**: `#61DAFB`
- **Next.js**: `#000000`
- **TypeScript**: `#3178C6`
- **JavaScript**: `#F7DF1E`
- **Full Stack**: `#00D9FF`
- **DevOps**: `#2496ED`
- **Performance**: `#FF6B6B`
- **Tutorial**: `#4CAF50`

---

## 📝 Paso 2: Escribir tu Primer Post Real

### Temas que Generan Impacto

**Escribe sobre algo que realmente hiciste o aprendiste**:

✅ **Buenos temas**:
- "Cómo optimicé el tiempo de carga de mi app de 5s a 1.2s"
- "Mi experiencia migrando de Redux a Zustand en producción"
- "5 errores que cometí con React Server Components"
- "Implementando autenticación segura con NextAuth y Prisma"
- "Testing en Next.js: De 0% a 80% de cobertura"

❌ **Evitar**:
- Tutoriales genéricos que ya existen en 1000 blogs
- Copiar documentación oficial
- Contenido sin experiencia práctica

### Estructura de un Post Profesional

```markdown
# [Título Específico y Descriptivo]

## Introducción (200-300 palabras)
- Contexto: ¿Qué problema tenías?
- Por qué es relevante
- Qué aprenderás en este post

## El Problema (300-500 palabras)
- Describe el problema técnico específico
- Por qué los enfoques tradicionales no funcionaban
- Impacto del problema (performance, UX, desarrollo)

## La Solución (800-1200 palabras)
- Tu enfoque paso a paso
- Código real con explicaciones
- Decisiones de diseño y por qué
- Trade-offs considerados

## Resultados (200-400 palabras)
- Métricas concretas (antes/después)
- Aprendizajes clave
- Qué harías diferente

## Conclusión (100-200 palabras)
- Resumen de puntos clave
- Cuándo aplicar esta solución
- Próximos pasos o recursos
```

**Total: 1,600 - 2,600 palabras** (lectura de 8-12 minutos)

### Crear un Post en Sanity Studio

1. Click en "**Blog Post**" → "**Create new post**"
2. Completa los campos principales:

**Campos Obligatorios**:
```
Title: Cómo optimicé React Server Components en producción
Slug: optimizando-react-server-components (auto-generado)
Excerpt: Pasé de 3.5s a 800ms de tiempo de carga migrando a RSC.
         Aquí te cuento los errores que cometí y cómo los solucioné.
         (Entre 100-300 caracteres)
```

**Main Image**:
- Click "**Upload**"
- Sube una captura de pantalla, diagrama o foto relevante
- Alt text: "Diagrama de arquitectura de React Server Components"
- **Fuentes de imágenes**:
  - Tus propias capturas de pantalla
  - [Unsplash](https://unsplash.com) - Fotos libres de alta calidad
  - [Carbon](https://carbon.now.sh) - Screenshots bonitos de código
  - Diagramas creados con [Excalidraw](https://excalidraw.com)

**Categorías**:
- Selecciona 1-3 categorías relevantes
- Usa las que creaste en el Paso 1

**Author** (Tu información):
```
Name: [Tu nombre completo]
Bio: Senior Full Stack Developer especializado en React y Next.js.
     5+ años construyendo aplicaciones escalables.
Image: [Tu foto profesional o avatar]
```

**Published At**:
- Usa la fecha real de publicación
- Para el primer post: fecha actual

**Reading Time**:
- Calcula: ~200 palabras por minuto
- Post de 2000 palabras = 10 minutos
- Sanity puede calcular esto automáticamente después

**Featured**:
- ☑️ Marca como "Featured" tu mejor contenido
- Máximo 3 posts destacados

### Escribir el Contenido (Body)

**Usa bloques variados para mejor lectura**:

1. **Párrafos normales** - La mayor parte del contenido

2. **Headings (H2, H3)** - Para estructurar:
   ```
   ## El Problema (H2)
   ### Síntomas que noté (H3)
   ### Impacto en usuarios (H3)
   ```

3. **Code Blocks** - Para código:
   - Selecciona el lenguaje correcto (TypeScript, JavaScript, etc.)
   - Usa nombres de archivo descriptivos
   - Incluye comentarios explicativos

   Ejemplo:
   ```typescript
   // app/components/OptimizedServerComponent.tsx
   import { Suspense } from 'react';

   export async function ProductList() {
     // Fetch directo desde el servidor
     const products = await db.product.findMany();

     return (
       <Suspense fallback={<LoadingSkeleton />}>
         {products.map(p => <ProductCard key={p.id} {...p} />)}
       </Suspense>
     );
   }
   ```

4. **Listas** - Para puntos clave:
   - Usa bullet points para listas no ordenadas
   - Usa numbered lists para pasos secuenciales

5. **Quotes** - Para destacar conceptos importantes:
   > "Los React Server Components no son solo una optimización,
   > son un cambio de paradigma en cómo pensamos sobre el renderizado."

6. **Imágenes inline** - Diagramas, capturas, gráficos:
   - Inserta imágenes entre secciones
   - Siempre agrega Alt text descriptivo
   - Opcional: Caption para contexto adicional

7. **Links** - Referencias y recursos:
   - Marca "Open in new tab" para links externos
   - Links internos pueden abrir en la misma pestaña

### SEO (Opcional pero Recomendado)

Expande la sección "**SEO**" y completa:

```
Meta Title: Optimizando React Server Components: De 3.5s a 800ms
           (Max 60 caracteres, incluye keyword principal)

Meta Description: Guía práctica para optimizar React Server Components
                  en Next.js. Aprende a reducir el tiempo de carga con
                  ejemplos reales de código y métricas.
                  (Max 160 caracteres)

Keywords: react server components, next.js optimization, performance,
          web vitals, rsc
```

---

## 🚀 Paso 3: Agregar Proyectos Reales

### Qué Proyectos Incluir

**Incluye SOLO proyectos que hayas construido realmente**:

✅ **Buenos ejemplos**:
- Este mismo portfolio (es meta pero válido)
- Proyectos open source en los que contribuyes
- Proyectos personales hosteados en GitHub
- Proyectos profesionales (con permiso para mostrar)

❌ **Evitar**:
- Proyectos de tutoriales seguidos al pie de la letra
- Clones exactos de apps existentes
- Proyectos que no puedes mostrar públicamente
- URLs o demos que no funcionan

### Preparar tu Proyecto

**Antes de agregarlo a Sanity**:

1. **GitHub README completo**:
   - Descripción clara del proyecto
   - Screenshots/GIFs
   - Instrucciones de instalación
   - Stack tecnológico
   - Licencia

2. **Demo funcional** (si aplica):
   - Deployado en Vercel, Netlify, Railway, etc.
   - URLs reales que funcionen
   - Sin credenciales de prueba expuestas

3. **Código limpio**:
   - Sin TODOs vergonzosos
   - README actualizado
   - Código comentado en partes complejas

### Crear un Proyecto en Sanity

1. Click en "**Project**" → "**Create new project**"
2. Completa los campos:

```
Title: Sistema de Gestión de Tareas con IA
Slug: task-manager-ai

Excerpt: Aplicación full-stack que usa GPT-4 para categorizar
         y priorizar tareas automáticamente. Incluye colaboración
         en tiempo real y sincronización offline.
         (50-200 caracteres - enfócate en qué hace único al proyecto)
```

**Main Image**:
- Screenshot de tu app funcionando
- Usa Lightshot, Snagit, o built-in screenshot tools
- Muestra la UI principal o funcionalidad clave

**Technologies**:
```
Next.js
React
TypeScript
Prisma
PostgreSQL
OpenAI API
Tailwind CSS
Vercel
```

**Demo URL**:
```
https://task-manager-ai.vercel.app
```
(Solo si funciona - déjalo vacío si no hay demo pública)

**GitHub URL**:
```
https://github.com/tu-usuario/task-manager-ai
```
(Tu repo real - NO uses /usuario/ como placeholder)

**Featured**:
- Marca 2-3 de tus mejores proyectos

**Published At**:
- Fecha en que terminaste el proyecto (aproximada)

### Escribir la Descripción del Proyecto (Body)

**Estructura recomendada**:

```markdown
## Resumen

[Párrafo corto: qué hace, para quién, problema que resuelve]

## Motivación

¿Por qué construiste esto? ¿Qué problema querías resolver?

## Características Principales

- Feature 1: Categorización automática con GPT-4
- Feature 2: Colaboración en tiempo real con WebSockets
- Feature 3: Modo offline con sincronización automática
- Feature 4: Dashboard de productividad con gráficos

## Stack Técnico

**Frontend:**
- Next.js 16 con App Router
- React Server Components para optimización
- Tailwind CSS + shadcn/ui para UI

**Backend:**
- API Routes de Next.js
- Prisma ORM con PostgreSQL
- OpenAI API para categorización IA

**Infraestructura:**
- Deployment en Vercel
- Base de datos en Supabase
- Autenticación con NextAuth

## Desafíos Técnicos

[Describe 2-3 problemas interesantes que resolviste]

### 1. Sincronización Offline

El desafío más grande fue implementar sincronización confiable...

[Código de ejemplo si es relevante]

### 2. Rate Limiting de OpenAI

Tuve que implementar un sistema de cola para manejar...

## Aprendizajes

- Aprendí sobre manejo de estado offline
- Mejoré mi comprensión de WebSockets
- Implementé patterns de retry y error handling

## Próximos Pasos

- [ ] Implementar notificaciones push
- [ ] Agregar soporte para equipos
- [ ] Mobile app con React Native
```

**Total: 500-1000 palabras para proyectos destacados**

### Capturas de Pantalla

**Agrega 2-4 imágenes inline mostrando**:
1. Interfaz principal
2. Feature único/interesante
3. Vista mobile (si aplica)
4. Dashboard o analytics

---

## 📸 Recursos para Imágenes

### Herramientas para Screenshots

**Para código**:
- [Carbon](https://carbon.now.sh) - Hermosos screenshots de código
- [Ray.so](https://ray.so) - Alternativa a Carbon
- [CodeSnap](https://marketplace.visualstudio.com/items?itemName=adpyke.codesnap) - Extension de VS Code

**Para UI/Capturas**:
- Windows: Win + Shift + S
- Mac: Cmd + Shift + 4
- [Lightshot](https://app.prntscr.com) - Editor rápido
- [ShareX](https://getsharex.com) - Windows, muy potente

**Para Diagramas**:
- [Excalidraw](https://excalidraw.com) - Diagramas hand-drawn
- [tldraw](https://www.tldraw.com) - Similar a Excalidraw
- [draw.io](https://app.diagrams.net) - Diagramas técnicos

**Para Fotos de Hero**:
- [Unsplash](https://unsplash.com) - Fotos libres de alta calidad
- [Pexels](https://www.pexels.com) - Alternativa a Unsplash

### Optimización de Imágenes

Antes de subir a Sanity:
1. Redimensiona a max 2000px de ancho
2. Optimiza con [TinyPNG](https://tinypng.com)
3. Usa formato PNG para screenshots con texto
4. Usa JPG para fotos

---

## ✅ Checklist Pre-Publicación

### Para Cada Post

- [ ] Título específico y descriptivo (no genérico)
- [ ] Excerpt entre 100-300 caracteres
- [ ] Imagen principal con alt text descriptivo
- [ ] 1-3 categorías asignadas
- [ ] Información de autor completa
- [ ] Tiempo de lectura calculado (8-12 min ideal)
- [ ] Contenido mínimo 1,500 palabras
- [ ] Al menos 2 code blocks con ejemplos reales
- [ ] 2-4 headings para estructura
- [ ] SEO meta title y description
- [ ] Revisión de ortografía
- [ ] Links funcionan correctamente

### Para Cada Proyecto

- [ ] Título claro del proyecto
- [ ] Excerpt descriptivo (50-200 caracteres)
- [ ] Screenshot principal de alta calidad
- [ ] Lista de tecnologías completa
- [ ] GitHub URL funcional (NO /usuario/)
- [ ] Demo URL solo si funciona (o dejarlo vacío)
- [ ] Descripción de 500-1000 palabras
- [ ] 2-4 screenshots inline
- [ ] Sección de desafíos técnicos
- [ ] README en GitHub actualizado

---

## 🎯 Plan de Contenido Inicial

### Semana 1: Fundación

**Día 1-2**: Categorías y configuración
- [ ] Crear 2-4 categorías relevantes
- [ ] Configurar información de autor
- [ ] Preparar banco de imágenes

**Día 3-5**: Primer post
- [ ] Escribir 1 post completo (2000+ palabras)
- [ ] Agregar imágenes y code blocks
- [ ] Revisar y publicar

**Día 6-7**: Primer proyecto
- [ ] Documentar 1 proyecto real
- [ ] Tomar screenshots
- [ ] Publicar con descripción completa

### Semana 2-4: Expansión

- [ ] Agregar 1 post más cada 2 semanas
- [ ] Documentar 1-2 proyectos adicionales
- [ ] Iterar basándote en feedback

---

## 💡 Tips de Escritura

### Voz y Tono

**Sé auténtico**:
- ✅ "Cometí este error y así lo solucioné"
- ❌ "Este es el único camino correcto"

**Muestra el proceso**:
- ✅ "Primero intenté X, no funcionó por Y, entonces probé Z"
- ❌ "La solución es Z" (sin contexto)

**Sé específico**:
- ✅ "Reduje el tiempo de carga de 3.5s a 800ms"
- ❌ "Mejoré la performance significativamente"

### Código en Posts

**Buenas prácticas**:
1. Incluye el nombre del archivo como contexto
2. Agrega comentarios explicativos
3. Muestra solo las partes relevantes (no todo el archivo)
4. Usa syntax highlighting correcto
5. Formatea correctamente (usa Prettier)

**Ejemplo**:
```typescript
// lib/cache/redis.ts
import { Redis } from '@upstash/redis';

// Implementar cache con TTL automático
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 3600 // 1 hora por defecto
): Promise<T> {
  const cached = await redis.get<T>(key);

  if (cached) {
    console.log(`Cache hit: ${key}`);
    return cached;
  }

  // Cache miss - fetch y guardar
  const data = await fetcher();
  await redis.setex(key, ttl, data);

  return data;
}
```

---

## 🚀 Después de Publicar

### Promoción

1. **Comparte en redes**:
   - LinkedIn (ideal para contenido técnico)
   - Twitter/X con hashtags relevantes
   - Dev.to (republica con canonical URL)

2. **Comunidades**:
   - r/reactjs, r/nextjs (si es relevante)
   - Discord de Next.js, React
   - Hashnode, Medium con canonical link

3. **Newsletter** (si tienes):
   - Envía a suscriptores
   - Include excerpt y call-to-action

### Métricas a Seguir

- Visitas por post (Google Analytics)
- Tiempo en página
- Compartidos en redes
- Comentarios y feedback
- Tráfico de referral

### Iteración

- Actualiza posts antiguos con nueva info
- Agrega enlaces entre posts relacionados
- Mejora SEO basándote en analytics
- Responde comentarios y preguntas

---

## 🎓 Recursos Adicionales

### Escritura Técnica

- [Google Developer Documentation Style Guide](https://developers.google.com/style)
- [Write the Docs](https://www.writethedocs.org)
- [Technical Writing Courses by Google](https://developers.google.com/tech-writing)

### SEO para Desarrolladores

- [Ahrefs Blog](https://ahrefs.com/blog/) - SEO técnico
- [Google Search Console](https://search.google.com/search-console)
- [Schema.org](https://schema.org) - Structured data

### Inspiración

**Blogs técnicos de calidad**:
- [Kent C. Dodds](https://kentcdodds.com/blog)
- [Josh Comeau](https://www.joshwcomeau.com)
- [Dan Abramov](https://overreacted.io)
- [Lee Robinson (Vercel)](https://leerob.io/blog)

---

## 📝 Plantilla Rápida

### Template: Post Técnico

```markdown
# [Problema Específico que Resolviste]

## TL;DR
[2-3 líneas con la solución y resultado principal]

## El Contexto
[¿Qué estabas construyendo? ¿Por qué surgió este problema?]

## El Problema en Detalle
[Describe el problema técnico, con síntomas y por qué los enfoques comunes no funcionaban]

## Investigación y Alternativas
[¿Qué soluciones consideraste? ¿Por qué no funcionaron?]

## La Solución
[Tu solución paso a paso, con código y explicaciones]

## Implementación
[Código real, con explicación de decisiones importantes]

## Resultados
[Métricas: antes/después, performance, impacto]

## Aprendizajes Clave
[3-5 puntos principales que aprendiste]

## Conclusión
[Cuándo usar esta solución, próximos pasos]

## Referencias
[Links a docs, artículos, recursos útiles]
```

---

**¿Preguntas? Revisa `SANITY_DATA_AUDIT.md` para más contexto sobre la limpieza.**

**Ejecuta la limpieza cuando estés listo**:
```bash
node scripts/clean-sanity-data.mjs
```
