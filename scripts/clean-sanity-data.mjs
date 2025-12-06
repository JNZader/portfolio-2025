#!/usr/bin/env node

/**
 * Script de Limpieza Completa de Sanity CMS
 * ELIMINA TODOS los datos ficticios para empezar de cero
 *
 * ⚠️ ADVERTENCIA: Este script es DESTRUCTIVO y NO se puede deshacer
 *
 * Uso: node scripts/clean-sanity-data.mjs
 */

import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as readline from 'readline';

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
    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
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

// Función para preguntar confirmación
function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 's' || answer.toLowerCase() === 'si' || answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Función para pedir texto específico
function askExactMatch(question, expectedAnswer) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim() === expectedAnswer);
    });
  });
}

async function cleanData() {
  console.log('🧹 Script de Limpieza Completa de Sanity CMS\n');
  console.log('═'.repeat(80));
  console.log('⚠️  ADVERTENCIA: Este script eliminará TODOS los datos');
  console.log('═'.repeat(80));
  console.log('');

  try {
    // Obtener estadísticas actuales
    const posts = await client.fetch(`*[_type == "post"]`);
    const projects = await client.fetch(`*[_type == "project"]`);
    const categories = await client.fetch(`*[_type == "category"]`);

    console.log('📊 Datos actuales en Sanity:');
    console.log(`   📝 Posts: ${posts.length}`);
    console.log(`   🚀 Proyectos: ${projects.length}`);
    console.log(`   📁 Categorías: ${categories.length}`);
    console.log(`   📦 Total: ${posts.length + projects.length + categories.length} documentos\n`);

    if (posts.length === 0 && projects.length === 0 && categories.length === 0) {
      console.log('✅ La base de datos ya está vacía. No hay nada que limpiar.\n');
      return;
    }

    console.log('🗑️  Se eliminarán:');
    console.log(`   ❌ ${posts.length} posts del blog`);
    console.log(`   ❌ ${projects.length} proyectos`);
    console.log(`   ❌ ${categories.length} categorías`);
    console.log('');
    console.log('⚠️  ESTA ACCIÓN NO SE PUEDE DESHACER\n');

    // Confirmación 1
    const confirm1 = await askConfirmation('¿Estás seguro de que quieres continuar? (s/n): ');

    if (!confirm1) {
      console.log('\n❌ Operación cancelada por el usuario.\n');
      process.exit(0);
    }

    // Confirmación 2 (doble check)
    console.log('\n⚠️  ÚLTIMA ADVERTENCIA: Se borrarán TODOS los datos de forma permanente.\n');
    const confirm2 = await askExactMatch('Escribe "ELIMINAR" para confirmar: ', 'ELIMINAR');

    if (!confirm2) {
      console.log('\n❌ Operación cancelada por el usuario.\n');
      process.exit(0);
    }

    console.log('\n🧹 Iniciando limpieza...\n');

    // Eliminar posts
    if (posts.length > 0) {
      console.log('📝 Eliminando posts...');
      for (const post of posts) {
        await client.delete(post._id);
        console.log(`   ✓ Eliminado: ${post.title}`);
      }
      console.log(`✅ ${posts.length} posts eliminados\n`);
    }

    // Eliminar proyectos
    if (projects.length > 0) {
      console.log('🚀 Eliminando proyectos...');
      for (const project of projects) {
        await client.delete(project._id);
        console.log(`   ✓ Eliminado: ${project.title}`);
      }
      console.log(`✅ ${projects.length} proyectos eliminados\n`);
    }

    // Eliminar categorías
    if (categories.length > 0) {
      console.log('📁 Eliminando categorías...');
      for (const category of categories) {
        await client.delete(category._id);
        console.log(`   ✓ Eliminado: ${category.title}`);
      }
      console.log(`✅ ${categories.length} categorías eliminadas\n`);
    }

    console.log('═'.repeat(80));
    console.log('🎉 Limpieza completada exitosamente!\n');
    console.log('✅ Tu Sanity CMS está ahora limpio y listo para contenido real.\n');

    console.log('📋 Próximos pasos:\n');
    console.log('1. Accede a Sanity Studio:');
    console.log('   npm run dev');
    console.log('   → http://localhost:3000/studio\n');

    console.log('2. Crea contenido real:');
    console.log('   • Categorías: 2-4 categorías relevantes a tu trabajo');
    console.log('   • Posts: 1-2 posts sobre tu experiencia (2000+ palabras)');
    console.log('   • Proyectos: Solo proyectos que hayas construido realmente\n');

    console.log('3. Para cada contenido:');
    console.log('   • Agrega imágenes reales (capturas o fotos)');
    console.log('   • URLs reales de GitHub (no placeholders)');
    console.log('   • Descripciones auténticas y detalladas');
    console.log('   • Tu información como autor\n');

    console.log('💡 Tip: Empieza con 1-2 piezas de contenido de calidad');
    console.log('   Es mejor tener poco contenido excelente que mucho contenido mediocre.\n');

    console.log('═'.repeat(80));

  } catch (error) {
    console.error('\n❌ Error durante la limpieza:', error);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

// Ejecutar limpieza
cleanData();
