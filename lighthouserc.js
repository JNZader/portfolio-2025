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
        // Slightly relaxed for blog page with dynamic content
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        // Core Web Vitals - relaxed CLS for dynamic content
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.3 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
