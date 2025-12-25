'use client';

import Giscus from '@giscus/react';
import { MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { logger } from '@/lib/monitoring/logger';

/**
 * COMPONENTE: Comments con Giscus
 *
 * Sistema de comentarios basado en GitHub Discussions
 * - Autenticación con GitHub
 * - Markdown support
 * - Tema sincronizado con dark/light mode
 */
interface CommentsProps {
  /**
   * Término de búsqueda para mapear página → discussion
   * Típicamente la URL del post: `/blog/mi-post`
   */
  term?: string;
}

export function Comments({ term }: Readonly<CommentsProps>) {
  // Verificar que las variables de entorno existan
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

  // Detectar tema del sistema
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Función para detectar el tema
    const detectTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    };

    // Detectar tema inicial
    detectTheme();

    // Observar cambios en la clase 'dark' del html
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  if (!repo || !repoId || !category || !categoryId) {
    logger.error('Giscus: Missing environment variables', undefined, {
      service: 'comments',
    });
    return null;
  }

  return (
    <section className="mt-16">
      {/* Divider decorativo */}
      <SectionDivider variant="gradient" />

      {/* Card de comentarios - AUMENTADA OPACIDAD para mejor visibilidad */}
      <div className="relative rounded-xl border-2 border-border bg-card backdrop-blur-sm p-8 shadow-lg">
        {/* Background decorativo */}
        <div className="absolute inset-0 -z-10 opacity-30 dark:opacity-15 rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-tertiary/10 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Comentarios</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Inicia sesión con GitHub para dejar tu comentario
          </p>
        </div>

        {/* Giscus widget */}
        <Giscus
          key={theme}
          id="comments"
          repo={repo as `${string}/${string}`}
          repoId={repoId}
          category={category}
          categoryId={categoryId}
          mapping="pathname"
          term={term}
          reactionsEnabled="1"
          emitMetadata="1"
          inputPosition="bottom"
          theme={theme === 'dark' ? 'dark' : 'light'}
          lang="es"
          loading="lazy"
        />
      </div>
    </section>
  );
}
