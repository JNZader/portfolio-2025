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

  // Source maps: Only upload to Sentry, don't expose to browsers
  productionBrowserSourceMaps: false,

  // Webpack config for source maps (dev only)
  webpack: (config, { isServer, dev }) => {
    if (!isServer && dev) {
      config.devtool = 'source-map';
    }
    return config;
  },

  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'react-icons',
      'react-icons/fa',
      '@sanity/client',
    ],
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
          // HARDENED: Removido 'unsafe-eval', restringido img-src
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: permitir Vercel Live, Vercel Analytics, Giscus, Google Analytics, Sanity
              // NOTA: 'unsafe-inline' necesario para Next.js, 'unsafe-eval' REMOVIDO
              "script-src 'self' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com https://*.giscus.app https://www.googletagmanager.com https://www.google-analytics.com https://*.sanity.io https://core.sanity-cdn.com",
              // Estilos: permitir inline styles (necesario para Tailwind), Google Fonts, y Font Awesome (EasyMDE)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://maxcdn.bootstrapcdn.com",
              // Imágenes: whitelist específica en lugar de wildcard
              "img-src 'self' data: blob: https://cdn.sanity.io https://avatars.githubusercontent.com https://media.licdn.com https://www.google-analytics.com https://www.googletagmanager.com https://img.shields.io https://badgen.net https://raw.githubusercontent.com https://github.com https://api.securityscorecards.dev https://codecov.io https://results.pre-commit.ci",
              // Fuentes: Google Fonts y Font Awesome (EasyMDE)
              "font-src 'self' https://fonts.gstatic.com https://maxcdn.bootstrapcdn.com data:",
              // Conexiones: Sanity, Upstash, Vercel Analytics, Google Analytics
              "connect-src 'self' https://*.sanity.io https://cdn.sanity.io https://sanity-cdn.com https://*.sanity-cdn.com https://*.upstash.io https://vitals.vercel-insights.com https://va.vercel-scripts.com https://www.google-analytics.com https://analytics.google.com",
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
              // Upgrade insecure requests a HTTPS (solo en producción, no en CI/localhost)
              ...(process.env.NODE_ENV === 'production' &&
              !process.env.CI
                ? ['upgrade-insecure-requests']
                : []),
            ]
              .filter(Boolean)
              .join('; '),
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
