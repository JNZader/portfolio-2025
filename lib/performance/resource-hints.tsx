/**
 * Resource hints for performance optimization
 * Preload, preconnect, and prefetch critical resources
 *
 * LCP Optimization Strategy:
 * - Preconnect to external CDNs used for images
 * - Prefetch critical pages for navigation
 */
export function ResourceHints() {
  return (
    <>
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://cdn.sanity.io" />
      <link rel="dns-prefetch" href="https://cdn.sanity.io" />

      {/* Giscus preconnect lives in blog/[slug] — comments only load there */}

      {/* Prefetch important pages for better navigation */}
      <link rel="prefetch" href="/blog" />
      <link rel="prefetch" href="/proyectos" />
      <link rel="prefetch" href="/contacto" />
    </>
  );
}
