/**
 * Resource hints for performance optimization
 * Preload, preconnect, and prefetch critical resources
 *
 * LCP Optimization Strategy:
 * - Preconnect to Google Fonts for faster font loading
 * - Preconnect to external CDNs used for images
 * - Prefetch critical pages for navigation
 */
export function ResourceHints() {
  return (
    <>
      {/* Preconnect to Google Fonts - critical for LCP text rendering */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

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
