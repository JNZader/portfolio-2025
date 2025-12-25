#!/usr/bin/env node

/**
 * Script de Auditoría de Datos de Sanity
 * Consulta y muestra todos los datos actuales en Sanity CMS
 *
 * Uso: node scripts/audit-sanity-data.mjs
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
const token = env.SANITY_API_READ_TOKEN || env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  console.error('❌ Error: Faltan variables de entorno');
  process.exit(1);
}

// Cliente de Sanity
const client = createClient({
  projectId,
  dataset,
  token: token || undefined,
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function auditData() {
  console.log('🔍 Auditando datos en Sanity CMS...\n');
  console.log('═'.repeat(80));
  console.log(`📦 Proyecto: ${projectId}`);
  console.log(`📊 Dataset: ${dataset}`);
  console.log('═'.repeat(80));
  console.log('');

  try {
    // =====================
    // CATEGORÍAS
    // =====================
    console.log('📁 CATEGORÍAS');
    console.log('─'.repeat(80));

    const categories = await client.fetch(`
      *[_type == "category"] | order(title asc) {
        _id,
        _createdAt,
        _updatedAt,
        title,
        slug,
        description,
        color,
        "postCount": count(*[_type == "post" && references(^._id)])
      }
    `);

    if (categories.length === 0) {
      console.log('⚠️  No hay categorías creadas\n');
    } else {
      categories.forEach((cat, i) => {
        console.log(`${i + 1}. ${cat.title} (${cat.postCount} posts)`);
        console.log(`   Slug: ${cat.slug.current}`);
        console.log(`   Color: ${cat.color}`);
        console.log(`   Descripción: ${cat.description}`);
        console.log(`   ID: ${cat._id}`);
        console.log(`   Creado: ${new Date(cat._createdAt).toLocaleDateString('es-ES')}`);
        console.log('');
      });
      console.log(`Total: ${categories.length} categorías\n`);
    }

    // =====================
    // POSTS DEL BLOG
    // =====================
    console.log('═'.repeat(80));
    console.log('📝 POSTS DEL BLOG');
    console.log('─'.repeat(80));

    const posts = await client.fetch(`
      *[_type == "post"] | order(publishedAt desc) {
        _id,
        _createdAt,
        _updatedAt,
        title,
        slug,
        excerpt,
        publishedAt,
        readingTime,
        featured,
        categories[]-> {
          title,
          slug
        },
        author,
        "hasImage": defined(mainImage),
        "bodyLength": length(pt::text(body))
      }
    `);

    if (posts.length === 0) {
      console.log('⚠️  No hay posts creados\n');
    } else {
      posts.forEach((post, i) => {
        console.log(`${i + 1}. ${post.title} ${post.featured ? '⭐' : ''}`);
        console.log(`   Slug: /blog/${post.slug.current}`);
        console.log(`   Excerpt: ${post.excerpt.substring(0, 80)}...`);
        console.log(`   Categorías: ${post.categories?.map(c => c.title).join(', ') || 'Sin categorías'}`);
        console.log(`   Autor: ${post.author?.name || 'Sin autor'}`);
        console.log(`   Publicado: ${new Date(post.publishedAt).toLocaleDateString('es-ES')}`);
        console.log(`   Tiempo lectura: ${post.readingTime || 'N/A'} min`);
        console.log(`   Imagen: ${post.hasImage ? '✓' : '✗'}`);
        console.log(`   Contenido: ${post.bodyLength || 0} caracteres`);
        console.log(`   ID: ${post._id}`);
        console.log('');
      });

      const featuredCount = posts.filter(p => p.featured).length;
      console.log(`Total: ${posts.length} posts (${featuredCount} destacados)\n`);
    }

    // =====================
    // PROYECTOS
    // =====================
    console.log('═'.repeat(80));
    console.log('🚀 PROYECTOS');
    console.log('─'.repeat(80));

    const projects = await client.fetch(`
      *[_type == "project"] | order(publishedAt desc) {
        _id,
        _createdAt,
        _updatedAt,
        title,
        slug,
        excerpt,
        technologies,
        demoUrl,
        githubUrl,
        featured,
        publishedAt,
        "hasImage": defined(mainImage),
        "bodyLength": length(pt::text(body))
      }
    `);

    if (projects.length === 0) {
      console.log('⚠️  No hay proyectos creados\n');
    } else {
      projects.forEach((proj, i) => {
        console.log(`${i + 1}. ${proj.title} ${proj.featured ? '⭐' : ''}`);
        console.log(`   Slug: /proyectos/${proj.slug.current}`);
        console.log(`   Excerpt: ${proj.excerpt.substring(0, 80)}...`);
        console.log(`   Tecnologías: ${proj.technologies?.join(', ') || 'Sin tecnologías'}`);
        console.log(`   Demo: ${proj.demoUrl || 'N/A'}`);
        console.log(`   GitHub: ${proj.githubUrl || 'N/A'}`);
        console.log(`   Publicado: ${new Date(proj.publishedAt).toLocaleDateString('es-ES')}`);
        console.log(`   Imagen: ${proj.hasImage ? '✓' : '✗'}`);
        console.log(`   Descripción: ${proj.bodyLength || 0} caracteres`);
        console.log(`   ID: ${proj._id}`);
        console.log('');
      });

      const featuredCount = projects.filter(p => p.featured).length;
      console.log(`Total: ${projects.length} proyectos (${featuredCount} destacados)\n`);
    }

    // =====================
    // RESUMEN
    // =====================
    console.log('═'.repeat(80));
    console.log('📊 RESUMEN GENERAL');
    console.log('─'.repeat(80));
    console.log(`📁 Categorías: ${categories.length}`);
    console.log(`📝 Posts: ${posts.length} (${posts.filter(p => p.featured).length} destacados)`);
    console.log(`🚀 Proyectos: ${projects.length} (${projects.filter(p => p.featured).length} destacados)`);
    console.log('═'.repeat(80));
    console.log('');

    // =====================
    // RECOMENDACIONES
    // =====================
    console.log('💡 ANÁLISIS Y RECOMENDACIONES\n');

    // Posts sin imagen
    const postsWithoutImage = posts.filter(p => !p.hasImage);
    if (postsWithoutImage.length > 0) {
      console.log(`⚠️  ${postsWithoutImage.length} posts sin imagen principal:`);
      postsWithoutImage.forEach(p => console.log(`   - ${p.title}`));
      console.log('');
    }

    // Proyectos sin imagen
    const projectsWithoutImage = projects.filter(p => !p.hasImage);
    if (projectsWithoutImage.length > 0) {
      console.log(`⚠️  ${projectsWithoutImage.length} proyectos sin imagen principal:`);
      projectsWithoutImage.forEach(p => console.log(`   - ${p.title}`));
      console.log('');
    }

    // Posts sin contenido extenso
    const postsWithShortBody = posts.filter(p => p.bodyLength < 500);
    if (postsWithShortBody.length > 0) {
      console.log(`⚠️  ${postsWithShortBody.length} posts con poco contenido (< 500 caracteres):`);
      postsWithShortBody.forEach(p => console.log(`   - ${p.title} (${p.bodyLength} caracteres)`));
      console.log('');
    }

    // Posts sin autor
    const postsWithoutAuthor = posts.filter(p => !p.author?.name);
    if (postsWithoutAuthor.length > 0) {
      console.log(`⚠️  ${postsWithoutAuthor.length} posts sin autor:`);
      postsWithoutAuthor.forEach(p => console.log(`   - ${p.title}`));
      console.log('');
    }

    // URLs ficticias
    const projectsWithFakeUrls = projects.filter(p =>
      p.demoUrl?.includes('demo') ||
      p.demoUrl?.includes('vercel.app') ||
      p.githubUrl?.includes('/usuario/')
    );
    if (projectsWithFakeUrls.length > 0) {
      console.log(`⚠️  ${projectsWithFakeUrls.length} proyectos con URLs ficticias:`);
      projectsWithFakeUrls.forEach(p => {
        console.log(`   - ${p.title}`);
        if (p.demoUrl?.includes('demo') || p.demoUrl?.includes('vercel.app')) {
          console.log(`     Demo: ${p.demoUrl}`);
        }
        if (p.githubUrl?.includes('/usuario/')) {
          console.log(`     GitHub: ${p.githubUrl}`);
        }
      });
      console.log('');
    }

    console.log('═'.repeat(80));
    console.log('\n✅ Auditoría completada\n');
    console.log('Para gestionar el contenido:');
    console.log('   • Sanity Studio: http://localhost:3000/studio');
    console.log('   • Blog: http://localhost:3000/blog');
    console.log('   • Proyectos: http://localhost:3000/proyectos');
    console.log('');

  } catch (error) {
    console.error('❌ Error durante la auditoría:', error);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

// Ejecutar auditoría
auditData();
