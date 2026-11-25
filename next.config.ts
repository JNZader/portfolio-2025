import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs/config';
import createNextIntlPlugin from 'next-intl/plugin';
import { copyOrtWasm } from './lib/qa/local/copy-ort-wasm';
import { buildContentSecurityPolicy } from './lib/security/csp';

copyOrtWasm();

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

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
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'user-images.githubusercontent.com',
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
    config.resolve.alias = {
      ...config.resolve.alias,
      'onnxruntime-node$': false,
    };
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },

  // Keep the in-browser model runtime out of the server bundle.
  serverExternalPackages: ['@huggingface/transformers', 'onnxruntime-node', 'onnxruntime-web', 'sharp'],

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
          // 'unsafe-eval' stays off. wasm-unsafe-eval is only for the local model.
          {
            key: 'Content-Security-Policy',
            // wasm-unsafe-eval, worker-src and Hugging Face hosts: lib/security/csp.ts
            // No COOP/COEP: Giscus and Analytics need a normal browsing context.
            value: buildContentSecurityPolicy(),
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

          // X-XSS-Protection deshabilitado explícitamente: el auditor XSS
          // legacy introdujo vulnerabilidades propias en mode=block; la CSP
          // de arriba es la protección real.
          {
            key: 'X-XSS-Protection',
            value: '0',
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
  // Tree shake debug logging (replaces deprecated disableLogger)
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
    excludeReplayIframe: true,
    excludeReplayShadowDom: true,
  },
};

// Wrap with next-intl, then Sentry, then bundle analyzer
export default bundleAnalyzer(
  withSentryConfig(withNextIntl(nextConfig), sentryWebpackPluginOptions)
);
