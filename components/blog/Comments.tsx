'use client';

import Giscus from '@giscus/react';

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

export function Comments({ term }: CommentsProps) {
  // Verificar que las variables de entorno existan
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

  if (!repo || !repoId || !category || !categoryId) {
    console.error('Giscus: Missing environment variables');
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t">
      <h2 className="text-2xl font-bold mb-6">Comentarios</h2>
      <Giscus
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
        theme={`${process.env.NEXT_PUBLIC_SITE_URL}/giscus-theme.css`}
        lang="es"
        loading="lazy"
      />
    </div>
  );
}
