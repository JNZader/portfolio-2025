#!/usr/bin/env node

/**
 * Script de Seed para Sanity CMS
 * Crea categorías, posts y proyectos de prueba
 *
 * Uso: node scripts/seed-sanity.mjs
 */

import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Leer .env.local
const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');

// Parsear variables
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').replaceAll(/^["']|["']$/g, '');
    env[key] = value;
  }
});

const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET;
const token = env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  console.error('❌ Error: Faltan variables de entorno');
  process.exit(1);
}

if (!token) {
  console.error('❌ Error: Falta SANITY_API_WRITE_TOKEN en .env.local');
  console.log('\n📝 Para obtener un token:');
  console.log('1. Ve a https://www.sanity.io/manage');
  console.log('2. Selecciona tu proyecto');
  console.log('3. Ve a "API" → "Tokens"');
  console.log('4. Crea un token con permisos de "Editor"');
  console.log('5. Agrégalo a tu .env.local:');
  console.log('   SANITY_API_WRITE_TOKEN="tu-token-aqui"\n');
  process.exit(1);
}

// Cliente de Sanity
const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
});

// =====================
// CATEGORÍAS
// =====================
const categories = [
  {
    _type: 'category',
    title: 'React',
    slug: { current: 'react' },
    description: 'Artículos sobre React y su ecosistema',
    color: '#61DAFB',
  },
  {
    _type: 'category',
    title: 'Next.js',
    slug: { current: 'nextjs' },
    description: 'Framework React para producción',
    color: '#000000',
  },
  {
    _type: 'category',
    title: 'TypeScript',
    slug: { current: 'typescript' },
    description: 'JavaScript con tipos estáticos',
    color: '#3178C6',
  },
  {
    _type: 'category',
    title: 'Web Development',
    slug: { current: 'web-development' },
    description: 'Desarrollo web moderno',
    color: '#FF6B6B',
  },
];

// =====================
// PROYECTOS
// =====================
const projects = [
  {
    _type: 'project',
    title: 'Portfolio Personal 2025',
    slug: { current: 'portfolio-2025' },
    excerpt: 'Portfolio personal desarrollado con Next.js 16, React 19 y TypeScript. Incluye blog, proyectos y formulario de contacto.',
    mainImage: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'image-placeholder-portfolio',
      },
      alt: 'Screenshot del Portfolio Personal 2025',
    },
    technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Sanity CMS'],
    demoUrl: 'https://portfolio-2025.vercel.app',
    githubUrl: 'https://github.com/usuario/portfolio-2025',
    featured: true,
    publishedAt: new Date('2024-01-01').toISOString(),
    body: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Portfolio personal desarrollado con las últimas tecnologías. Incluye sistema de blog con CMS, búsqueda full-text, y formulario de contacto.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Características' }],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Server Components, ISR, búsqueda con debouncing, dark mode, y diseño responsive.',
          },
        ],
      },
    ],
  },
  {
    _type: 'project',
    title: 'E-commerce Full Stack',
    slug: { current: 'ecommerce-fullstack' },
    excerpt: 'Tienda online completa con carrito de compras, pasarela de pago Stripe, panel de administración y gestión de inventario.',
    mainImage: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'image-placeholder-ecommerce',
      },
      alt: 'Screenshot de E-commerce App',
    },
    technologies: ['Next.js', 'PostgreSQL', 'Prisma', 'Stripe', 'React', 'Tailwind CSS', 'TypeScript'],
    demoUrl: 'https://shop-demo.vercel.app',
    githubUrl: 'https://github.com/usuario/ecommerce-app',
    featured: true,
    publishedAt: new Date('2023-11-15').toISOString(),
    body: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'E-commerce completo con gestión de productos, carrito, checkout con Stripe y panel de administración.',
          },
        ],
      },
    ],
  },
  {
    _type: 'project',
    title: 'Task Manager App',
    slug: { current: 'task-manager' },
    excerpt: 'Aplicación de gestión de tareas con drag and drop, colaboración en tiempo real y sincronización en la nube.',
    mainImage: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'image-placeholder-tasks',
      },
      alt: 'Screenshot de Task Manager',
    },
    technologies: ['React', 'Firebase', 'Zustand', 'DND Kit', 'TypeScript'],
    demoUrl: 'https://tasks-app.vercel.app',
    githubUrl: 'https://github.com/usuario/task-manager',
    featured: false,
    publishedAt: new Date('2023-10-01').toISOString(),
    body: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Gestión de tareas con drag and drop, tableros Kanban, y colaboración en tiempo real con Firebase.',
          },
        ],
      },
    ],
  },
  {
    _type: 'project',
    title: 'Weather Dashboard',
    slug: { current: 'weather-dashboard' },
    excerpt: 'Dashboard meteorológico con datos en tiempo real, gráficos interactivos y pronóstico extendido de múltiples ciudades.',
    mainImage: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'image-placeholder-weather',
      },
      alt: 'Screenshot de Weather Dashboard',
    },
    technologies: ['React', 'Chart.js', 'OpenWeather API', 'Tailwind CSS'],
    demoUrl: 'https://weather-dash.vercel.app',
    githubUrl: 'https://github.com/usuario/weather-dashboard',
    featured: false,
    publishedAt: new Date('2023-09-10').toISOString(),
    body: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Dashboard con datos meteorológicos en tiempo real, gráficos de temperatura y pronóstico de 7 días.',
          },
        ],
      },
    ],
  },
];

// =====================
// POSTS
// =====================
const posts = [
  {
    _type: 'post',
    title: 'Introducción a Next.js 16 App Router',
    slug: { current: 'nextjs-16-app-router' },
    excerpt: 'Descubre las nuevas características de Next.js 16 y cómo usar el App Router para mejorar tu aplicación web.',
    publishedAt: new Date('2024-01-15').toISOString(),
    featured: true,
    readingTime: 8,
    body: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Next.js 16 introduce cambios revolucionarios en la forma en que construimos aplicaciones React. El App Router es el nuevo paradigma que permite Server Components por defecto, mejorando significativamente el rendimiento.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Server Components' }],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Los React Server Components permiten renderizar componentes en el servidor, reduciendo el bundle de JavaScript enviado al cliente y mejorando el tiempo de carga inicial.',
          },
        ],
      },
    ],
  },
  {
    _type: 'post',
    title: 'TypeScript Tips para desarrolladores React',
    slug: { current: 'typescript-tips-react' },
    excerpt: 'Mejora tu código React con estos tips de TypeScript que te harán más productivo y tu código más seguro.',
    publishedAt: new Date('2024-01-20').toISOString(),
    featured: false,
    readingTime: 6,
    body: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'TypeScript se ha convertido en el estándar de facto para aplicaciones React modernas. Aquí te comparto algunos tips esenciales.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Tipos Genéricos' }],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Los tipos genéricos en TypeScript son muy útiles para crear componentes reutilizables que funcionan con diferentes tipos de datos sin perder la seguridad de tipos.',
          },
        ],
      },
    ],
  },
  {
    _type: 'post',
    title: 'React Server Components explicado',
    slug: { current: 'react-server-components' },
    excerpt: 'Una guía completa sobre React Server Components y cómo funcionan en el contexto de Next.js.',
    publishedAt: new Date('2024-01-25').toISOString(),
    featured: true,
    readingTime: 10,
    body: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Los Server Components son una nueva forma de renderizar React que permite ejecutar componentes exclusivamente en el servidor, sin enviar JavaScript al cliente.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Ventajas' }],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Reducción del bundle size, mejor performance, acceso directo a recursos del servidor como bases de datos, y mejor SEO.',
          },
        ],
      },
    ],
  },
  {
    _type: 'post',
    title: 'Optimización de performance en Next.js',
    slug: { current: 'optimizacion-nextjs' },
    excerpt: 'Técnicas y estrategias para mejorar el rendimiento de tu aplicación Next.js y ofrecer la mejor experiencia de usuario.',
    publishedAt: new Date('2024-02-01').toISOString(),
    featured: false,
    readingTime: 12,
    body: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'La optimización comienza con el análisis del bundle. Next.js proporciona herramientas excelentes para identificar y solucionar problemas de rendimiento.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Image Optimization' }],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'El componente Image de Next.js optimiza automáticamente las imágenes, lazy loading, y genera formatos modernos como WebP.',
          },
        ],
      },
    ],
  },
  {
    _type: 'post',
    title: 'Estado global en React: Context vs Zustand',
    slug: { current: 'estado-global-react' },
    excerpt: 'Comparación entre Context API y Zustand para manejo de estado global en aplicaciones React modernas.',
    publishedAt: new Date('2024-02-05').toISOString(),
    featured: false,
    readingTime: 7,
    body: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'El manejo de estado global es crucial en aplicaciones React. Context API es nativo pero tiene limitaciones de performance.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Zustand' }],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Zustand es una librería minimalista que ofrece mejor performance y una API más simple que Redux.',
          },
        ],
      },
    ],
  },
  {
    _type: 'post',
    title: 'Testing en aplicaciones Next.js con Vitest',
    slug: { current: 'testing-nextjs-vitest' },
    excerpt: 'Guía práctica para configurar y escribir tests efectivos en Next.js usando Vitest y Testing Library.',
    publishedAt: new Date('2024-02-10').toISOString(),
    featured: false,
    readingTime: 9,
    body: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Vitest es una alternativa moderna a Jest que ofrece mejor performance y compatibilidad con ESM. Configurarlo en Next.js es sencillo.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Testing Library' }],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Testing Library fomenta mejores prácticas de testing enfocándose en cómo los usuarios interactúan con tu aplicación.',
          },
        ],
      },
    ],
  },
];

async function seed() {
  console.log('🌱 Iniciando seed de Sanity...\n');

  try {
    // Crear categorías
    console.log('📁 Creando categorías...');
    const createdCategories = await Promise.all(
      categories.map((category) => client.create(category))
    );
    console.log(`✅ Creadas ${createdCategories.length} categorías\n`);

    // Obtener IDs de categorías para referencias
    const categoryRefs = {
      react: { _type: 'reference', _ref: createdCategories[0]._id },
      nextjs: { _type: 'reference', _ref: createdCategories[1]._id },
      typescript: { _type: 'reference', _ref: createdCategories[2]._id },
      webdev: { _type: 'reference', _ref: createdCategories[3]._id },
    };

    // Crear proyectos (sin imágenes por ahora)
    console.log('🚀 Creando proyectos...');
    const projectsWithoutImages = projects.map(p => {
      const { mainImage, ...rest } = p;
      return rest;
    });
    const createdProjects = await Promise.all(
      projectsWithoutImages.map((project) => client.create(project))
    );
    console.log(`✅ Creados ${createdProjects.length} proyectos\n`);

    // Asignar categorías a posts
    const postsWithCategories = [
      { ...posts[0], categories: [categoryRefs.nextjs, categoryRefs.react] },
      { ...posts[1], categories: [categoryRefs.typescript, categoryRefs.react] },
      { ...posts[2], categories: [categoryRefs.react, categoryRefs.nextjs] },
      { ...posts[3], categories: [categoryRefs.nextjs, categoryRefs.webdev] },
      { ...posts[4], categories: [categoryRefs.react] },
      { ...posts[5], categories: [categoryRefs.nextjs, categoryRefs.react] },
    ];

    // Crear posts
    console.log('📝 Creando posts...');
    const createdPosts = await Promise.all(
      postsWithCategories.map((post) => client.create(post))
    );
    console.log(`✅ Creados ${createdPosts.length} posts\n`);

    console.log('🎉 Seed completado exitosamente!\n');
    console.log('📊 Resumen:');
    console.log(`   • ${createdCategories.length} categorías`);
    console.log(`   • ${createdProjects.length} proyectos`);
    console.log(`   • ${createdProjects.filter((p) => p.featured).length} proyectos destacados`);
    console.log(`   • ${createdPosts.length} posts`);
    console.log(`   • ${createdPosts.filter((p) => p.featured).length} posts destacados\n`);

    console.log('📝 IMPORTANTE: Las imágenes de los proyectos deben subirse manualmente en Sanity Studio');
    console.log('   • Ve a http://localhost:3000/studio');
    console.log('   • Edita cada proyecto y sube una imagen\n');

    console.log('🌐 Ahora puedes probar:');
    console.log('   • http://localhost:3000/blog');
    console.log('   • http://localhost:3000/blog?search=next');
    console.log('   • http://localhost:3000/proyectos');
    console.log('   • http://localhost:3000/studio\n');
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

// Ejecutar seed
seed();
