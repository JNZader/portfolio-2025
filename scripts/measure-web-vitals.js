/**
 * Web Vitals Measurement Script
 *
 * Usage: Copy and paste this script into the browser console
 * to measure Core Web Vitals metrics.
 *
 * Run it after the page has fully loaded.
 */

function measureWebVitals() {
  console.log('=== Web Vitals Measurement Started ===\n');

  const results = {
    LCP: null,
    FID: null,
    CLS: 0,
    FCP: null,
    TTFB: null,
    TTI: null,
  };

  // Thresholds for good/needs improvement/poor
  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
  };

  function getStatus(metric, value) {
    if (!thresholds[metric]) return '';
    if (value <= thresholds[metric].good) return ' [GOOD]';
    if (value <= thresholds[metric].poor) return ' [NEEDS IMPROVEMENT]';
    return ' [POOR]';
  }

  // Largest Contentful Paint (LCP)
  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      results.LCP = Math.round(lastEntry.renderTime || lastEntry.loadTime);
      console.log(`LCP: ${results.LCP}ms${getStatus('LCP', results.LCP)}`);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    console.log('LCP: Not supported');
  }

  // First Input Delay (FID)
  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        results.FID = Math.round(entry.processingStart - entry.startTime);
        console.log(`FID: ${results.FID}ms${getStatus('FID', results.FID)}`);
      });
    }).observe({ type: 'first-input', buffered: true });
  } catch {
    console.log('FID: Waiting for first input...');
  }

  // Cumulative Layout Shift (CLS)
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          results.CLS += entry.value;
        }
      }
      const clsRounded = Math.round(results.CLS * 1000) / 1000;
      console.log(`CLS: ${clsRounded}${getStatus('CLS', clsRounded)}`);
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {
    console.log('CLS: Not supported');
  }

  // First Contentful Paint (FCP)
  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          results.FCP = Math.round(entry.startTime);
          console.log(`FCP: ${results.FCP}ms${getStatus('FCP', results.FCP)}`);
        }
      });
    }).observe({ type: 'paint', buffered: true });
  } catch {
    console.log('FCP: Not supported');
  }

  // Time to First Byte (TTFB)
  try {
    const navEntry = performance.getEntriesByType('navigation')[0];
    if (navEntry) {
      results.TTFB = Math.round(navEntry.responseStart);
      console.log(`TTFB: ${results.TTFB}ms${getStatus('TTFB', results.TTFB)}`);
    }
  } catch {
    console.log('TTFB: Not available');
  }

  // Time to Interactive (TTI) - approximation
  setTimeout(() => {
    const navEntry = performance.getEntriesByType('navigation')[0];
    if (navEntry) {
      results.TTI = Math.round(navEntry.domInteractive);
      console.log(`TTI (approx): ${results.TTI}ms`);
    }

    // Print summary
    console.log('\n=== Web Vitals Summary ===');
    console.table({
      'LCP (Largest Contentful Paint)': {
        Value: results.LCP ? `${results.LCP}ms` : 'Pending',
        Target: '< 2500ms',
      },
      'FID (First Input Delay)': {
        Value: results.FID ? `${results.FID}ms` : 'Waiting for input',
        Target: '< 100ms',
      },
      'CLS (Cumulative Layout Shift)': {
        Value: results.CLS.toFixed(3),
        Target: '< 0.1',
      },
      'FCP (First Contentful Paint)': {
        Value: results.FCP ? `${results.FCP}ms` : 'Pending',
        Target: '< 1800ms',
      },
      'TTFB (Time to First Byte)': {
        Value: results.TTFB ? `${results.TTFB}ms` : 'N/A',
        Target: '< 800ms',
      },
      'TTI (Time to Interactive)': {
        Value: results.TTI ? `${results.TTI}ms` : 'N/A',
        Target: '< 3800ms',
      },
    });

    console.log(
      '\nNote: Click somewhere on the page to measure FID (First Input Delay)'
    );
  }, 3000);
}

// Auto-run
measureWebVitals();
