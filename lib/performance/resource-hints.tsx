/**
 * Resource hints for performance optimization
 * Preload, preconnect, and prefetch critical resources
 */
export function ResourceHints() {
  return (
    <>
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://cdn.sanity.io" />
      <link rel="dns-prefetch" href="https://cdn.sanity.io" />

      {/* Preconnect to Giscus for comments */}
      <link rel="preconnect" href="https://giscus.app" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://giscus.app" />

      {/* Prefetch important pages for better navigation */}
      <link rel="prefetch" href="/blog" />
      <link rel="prefetch" href="/proyectos" />
      <link rel="prefetch" href="/contacto" />
    </>
  );
}
