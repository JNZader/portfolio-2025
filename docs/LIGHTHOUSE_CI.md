# Lighthouse CI

`lighthouserc.js` is the single source of truth for audited URLs, run count, throttling, and score budgets. Both local runs and `.github/workflows/lighthouse.yml` use the checked-in `@lhci/cli`; there is no global CLI version or secondary JSON config.

## Run locally

```bash
npm run build
npm run lighthouse
```

The config starts `npm start`, audits home, about, projects, blog, and contact three times, and uploads temporary reports. CI always uploads `.lighthouseci` as the `lighthouse-results` artifact for 30 days.

Performance, accessibility, best-practices, SEO, and CLS are blocking assertions. FCP, LCP, and TBT remain warning budgets because shared CI runner variance can affect them.
