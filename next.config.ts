import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // React Compiler (Next.js 16+)
  reactCompiler: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // Remote patterns (para Sanity CDN y GitHub)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
        port: '',
        pathname: '/dms/image/**',
      },
    ],
  },

  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Sentry source maps
  productionBrowserSourceMaps: true,

  // Webpack config for source maps
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.devtool = 'source-map';
    }
    return config;
  },

  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },

  // Headers for security, caching and CORS
  async headers() {
    return [
      // =========================================
      // SECURITY HEADERS - Todas las rutas
      // =========================================
      {
        source: '/:path*',
        headers: [
          // Content Security Policy - Previene XSS y data injection
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: permitir Vercel Live, Giscus, Google Analytics
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.giscus.app https://www.googletagmanager.com https://www.google-analytics.com",
              // Estilos: permitir inline styles (necesario para Tailwind) y Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Imágenes: permitir todas las fuentes (para blog y proyectos)
              "img-src 'self' data: blob: https: http:",
              // Fuentes: Google Fonts
              "font-src 'self' https://fonts.gstatic.com data:",
              // Conexiones: Sanity, Upstash, Analytics
              "connect-src 'self' https://*.sanity.io https://cdn.sanity.io https://*.upstash.io https://vitals.vercel-insights.com https://www.google-analytics.com https://analytics.google.com",
              // Frames: solo Giscus comments
              "frame-src 'self' https://giscus.app",
              // Media: solo self
              "media-src 'self'",
              // No permitir plugins (Flash, etc.)
              "object-src 'none'",
              // Restringir base URL
              "base-uri 'self'",
              // Formularios solo pueden enviar a self
              "form-action 'self'",
              // Prevenir que el sitio sea embedido en iframes
              "frame-ancestors 'none'",
              // Upgrade insecure requests a HTTPS
              "upgrade-insecure-requests",
            ].join('; '),
          },

          // X-Frame-Options - Previene clickjacking (backup de frame-ancestors)
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },

          // X-Content-Type-Options - Previene MIME-sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },

          // Referrer-Policy - Controla información enviada en Referer header
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },

          // Permissions-Policy - Deshabilita APIs no usadas
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',        // No permitir acceso a cámara
              'microphone=()',    // No permitir acceso a micrófono
              'geolocation=()',   // No permitir geolocalización
              'interest-cohort=()', // Opt-out de FLoC (Google)
              'payment=()',       // No permitir Payment Request API
              'usb=()',           // No permitir USB
            ].join(', '),
          },

          // X-XSS-Protection - Para navegadores antiguos (legacy)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },

          // Strict-Transport-Security - Forzar HTTPS (solo en producción)
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains; preload',
                },
              ]
            : []),
        ],
      },

      // =========================================
      // CORS para Giscus Theme CSS
      // =========================================
      {
        source: '/giscus-theme.css',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://giscus.app', // CAMBIO: De '*' a dominio específico
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
        ],
      },

      // =========================================
      // Cache Headers - Optimización de recursos
      // =========================================
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
};

// Wrap with Sentry first, then bundle analyzer
export default bundleAnalyzer(
  withSentryConfig(nextConfig, sentryWebpackPluginOptions)
);
