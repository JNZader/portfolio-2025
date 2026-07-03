/**
 * Lighthouse CI Configuration
 * Run: npm run lighthouse
 */
module.exports = {
  ci: {
    collect: {
      // Start the production server before running tests
      startServerCommand: 'npm start',
      startServerReadyPattern: 'Ready in',
      startServerReadyTimeout: 60000, // 60 seconds to start
      url: [
        'http://localhost:3000',
        'http://localhost:3000/sobre-mi',
        'http://localhost:3000/proyectos',
        'http://localhost:3000/blog',
        'http://localhost:3000/contacto',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        // Core Web Vitals — CLS al umbral "good" real (0.1) y como error:
        // con 0.3 en warn, una regresión de layout shift pasaba verde.
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
