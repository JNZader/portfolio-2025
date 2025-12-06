# 🛠️ Scripts de Gestión de Sanity CMS

Scripts para gestionar contenido en Sanity CMS: auditar, limpiar, y poblar con datos.

## 📋 Prerrequisitos

1. **Token de Sanity con permisos de escritura**

### Obtener Token de Sanity

1. Ve a https://www.sanity.io/manage
2. Selecciona tu proyecto
3. Ve a **"API"** → **"Tokens"**
4. Click en **"Add API token"**
5. Configuración:
   - **Name:** "Seed Script"
   - **Permissions:** **Editor** (puede leer y escribir)
6. Click en **"Add token"**
7. **Copia el token** (se muestra solo UNA vez)

### Configurar Token

Agrega el token a tu archivo `.env.local`:

```bash
# .env.local

# Agregar esta línea:
SANITY_API_WRITE_TOKEN="tu-token-sanity-aqui"
```

## 🚀 Scripts Disponibles

### 1. Auditar Datos Actuales

Muestra todo el contenido actual en Sanity con análisis detallado:

```bash
node scripts/audit-sanity-data.mjs
```

**Qué hace**:
- Lista todas las categorías, posts y proyectos
- Detecta duplicados
- Identifica contenido sin imágenes
- Encuentra URLs ficticias
- Detecta posts con poco contenido
- Genera recomendaciones de limpieza

**Resultado**: Informe completo en consola + archivo `SANITY_DATA_AUDIT.md`

---

### 2. Limpiar Base de Datos (DESTRUCTIVO)

⚠️ **ADVERTENCIA**: Elimina TODOS los datos permanentemente.

```bash
node scripts/clean-sanity-data.mjs
```

**Qué hace**:
- Pide confirmación doble
- Elimina todos los posts
- Elimina todos los proyectos
- Elimina todas las categorías
- Deja la DB limpia para contenido real

**Cuándo usar**:
- Cuando quieres eliminar datos ficticios/prueba
- Para empezar con contenido 100% real
- Después de revisar el audit y decidir limpiar todo

**Nota**: Después de limpiar, usa la guía en `CONTENT_GUIDE.md` para agregar contenido real.

---

### 3. Poblar con Datos de Prueba

```bash
node scripts/seed-sanity.mjs
```

### ¿Qué hace el script?

El script creará automáticamente en Sanity:

#### 📁 Categorías (4 items)
- React (#61DAFB)
- Next.js (#000000)
- TypeScript (#3178C6)
- Web Development (#FF6B6B)

#### 🚀 Proyectos (4 items)
- Portfolio Personal 2025 (Featured)
- E-commerce Full Stack (Featured)
- Task Manager App
- Weather Dashboard

#### 📝 Posts (6 items)
- Introducción a Next.js 16 App Router (Featured)
- TypeScript Tips para desarrolladores React
- React Server Components explicado (Featured)
- Optimización de performance en Next.js
- Estado global en React: Context vs Zustand
- Testing en aplicaciones Next.js con Vitest

## 📊 Output Esperado

```
🌱 Iniciando seed de Sanity...

📁 Creando categorías...
✅ Creadas 4 categorías

🚀 Creando proyectos...
✅ Creados 4 proyectos

📝 Creando posts...
✅ Creados 6 posts

🎉 Seed completado exitosamente!

📊 Resumen:
   • 4 categorías
   • 4 proyectos
   • 2 proyectos destacados
   • 6 posts
   • 2 posts destacados

📝 IMPORTANTE: Las imágenes de los proyectos deben subirse manualmente
   • Ve a http://localhost:3000/studio
   • Edita cada proyecto y sube una imagen

🌐 Ahora puedes probar:
   • http://localhost:3000/blog
   • http://localhost:3000/blog?search=next
   • http://localhost:3000/proyectos
   • http://localhost:3000/studio
```

## 📝 Después del Seed

### 1. Subir Imágenes a Proyectos

Los proyectos se crean sin imágenes. Para agregarlas:

1. Ve a http://localhost:3000/studio
2. Click en **"Projects"**
3. Edita cada proyecto
4. En **"Main Image"**, sube una imagen
5. Agrega el **"Alternative text"**
6. **Guardar** (Publish)

### 2. (Opcional) Subir Imágenes a Posts

Los posts se crean sin imágenes destacadas. Para agregarlas:

1. Ve a http://localhost:3000/studio
2. Click en **"Blog"** → **"Posts"**
3. Edita cada post
4. En **"Main Image"**, sube una imagen
5. **Guardar** (Publish)

## 🧹 Limpiar Datos

Si necesitas eliminar todos los datos y volver a ejecutar el seed:

### Opción 1: Desde Sanity Studio

1. Ve a http://localhost:3000/studio
2. Elimina manualmente los documentos

### Opción 2: Desde Sanity Manage

1. Ve a https://www.sanity.io/manage
2. Selecciona tu proyecto
3. Ve a **"Datasets"**
4. Crea un nuevo dataset o limpia el actual

## ⚠️ Notas Importantes

- **El script NO borra datos existentes**, solo agrega nuevos
- Si ejecutas el script múltiples veces, se crearán documentos duplicados
- Las imágenes de proyectos deben subirse manualmente en Sanity Studio
- El token de escritura debe tener permisos de **"Editor"**, no solo **"Viewer"**

## 🔒 Seguridad

- **NUNCA** subas el token a Git
- El archivo `.env.local` está en `.gitignore`
- Usa tokens específicos para cada ambiente (dev, staging, prod)
- Revoca tokens que ya no uses

## 🎯 Flujo de Trabajo Recomendado

### Para Nuevo Proyecto (Primera vez)

1. **Poblar con datos de prueba** (para testing):
   ```bash
   node scripts/seed-sanity.mjs
   ```

2. **Probar que todo funciona**:
   - Blog: http://localhost:3000/blog
   - Proyectos: http://localhost:3000/proyectos
   - Studio: http://localhost:3000/studio

3. **Cuando estés listo para producción**:
   ```bash
   # Auditar primero
   node scripts/audit-sanity-data.mjs

   # Limpiar todo
   node scripts/clean-sanity-data.mjs

   # Agregar contenido real siguiendo CONTENT_GUIDE.md
   ```

### Para Proyecto Existente (Con datos ficticios)

1. **Auditar estado actual**:
   ```bash
   node scripts/audit-sanity-data.mjs
   ```

2. **Revisar** `SANITY_DATA_AUDIT.md` generado

3. **Decidir estrategia**:
   - Opción A: Limpiar todo y empezar de cero (recomendado)
   - Opción B: Limpiar duplicados manualmente y mejorar contenido

4. **Si eliges Opción A**:
   ```bash
   node scripts/clean-sanity-data.mjs
   ```

5. **Agregar contenido real**:
   - Seguir guía en `CONTENT_GUIDE.md`
   - Calidad sobre cantidad

## 📋 Archivos Generados

| Archivo | Propósito |
|---------|-----------|
| `SANITY_DATA_AUDIT.md` | Informe completo de auditoría con recomendaciones |
| `CONTENT_GUIDE.md` | Guía paso a paso para crear contenido real de calidad |

## 📚 Recursos

- [Sanity Client Docs](https://www.sanity.io/docs/js-client)
- [Sanity API Tokens](https://www.sanity.io/docs/http-auth)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
- **Guía de Contenido**: Ver `CONTENT_GUIDE.md` en la raíz del proyecto
