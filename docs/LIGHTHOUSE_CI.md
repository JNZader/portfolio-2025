# Lighthouse CI Configuration Guide

## Overview

Lighthouse CI automatically runs performance audits on every pull request, ensuring that performance standards are maintained throughout development.

## What is Lighthouse CI?

Lighthouse CI is an automated tool that:
- Runs Lighthouse audits on your application
- Compares results against performance budgets
- Fails builds if performance degrades
- Provides detailed reports and metrics
- Integrates with GitHub Actions

## Current Configuration

### Performance Budgets

Located in `.lighthouserc.json`:

```json
{
  "assertions": {
    "categories:performance": ["error", {"minScore": 0.95}],
    "categories:accessibility": ["error", {"minScore": 0.95}],
    "categories:best-practices": ["error", {"minScore": 0.95}],
    "categories:seo": ["error", {"minScore": 0.95}],
    "first-contentful-paint": ["error", {"maxNumericValue": 2000}],
    "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
    "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}],
    "total-blocking-time": ["error", {"maxNumericValue": 300}]
  }
}
```

### Pages Audited

- `/` - Homepage
- `/blog` - Blog listing
- `/proyectos` - Projects page
- `/contacto` - Contact page
- `/sobre-mi` - About page

### Performance Targets

| Metric | Target | Description |
|--------|--------|-------------|
| **Performance Score** | ≥ 95% | Overall performance rating |
| **Accessibility Score** | ≥ 95% | Accessibility compliance |
| **Best Practices Score** | ≥ 95% | Following web best practices |
| **SEO Score** | ≥ 95% | Search engine optimization |
| **FCP** | ≤ 2000ms | First Contentful Paint |
| **LCP** | ≤ 2500ms | Largest Contentful Paint |
| **CLS** | ≤ 0.1 | Cumulative Layout Shift |
| **TBT** | ≤ 300ms | Total Blocking Time |
| **TTI** | ≤ 3500ms | Time to Interactive |
| **Speed Index** | ≤ 3000ms | Visual completeness |

## GitHub Actions Workflow

### When it Runs

Lighthouse CI runs automatically on:
- ✅ Pull requests to `main` or `develop` branches
- 🔄 Can be configured to run on push to `main` (commented out)

### What it Does

1. **Checkout code** - Gets the latest code
2. **Setup Node.js 22** - Uses Node.js 22 LTS
3. **Install dependencies** - Runs `npm ci`
4. **Setup environment** - Configures environment variables
5. **Generate Prisma Client** - Prepares database client
6. **Push Prisma schema** - Syncs database schema
7. **Run Lighthouse CI** - Executes performance audits
8. **Upload results** - Saves reports as artifacts
9. **Comment on PR** - Posts summary to pull request

### Environment Variables

Set in GitHub workflow:
- `DATABASE_URL=file:./prisma/dev.db`
- `SKIP_ENV_VALIDATION=true`
- `NEXT_PUBLIC_ENABLE_ANALYTICS=false`

### Secrets (Optional)

Create in GitHub repository settings:

**LHCI_GITHUB_APP_TOKEN** (optional)
- For enhanced PR comments
- Get from: https://github.com/apps/lighthouse-ci
- Settings → Secrets → Actions → New repository secret

## Running Locally

### Prerequisites

Install Lighthouse CI globally:

```bash
npm install -g @lhci/cli
```

### Run Full Audit

```bash
# Build, start server, and run audits
npm run lighthouse
```

This will:
1. Build the application (`npm run build`)
2. Start the production server (`npm run start`)
3. Run audits on all configured URLs
4. Generate reports in `.lighthouseci/` directory

### Run Collect Only

```bash
# Just collect metrics without assertions
npm run lighthouse:collect
```

### Run Assertions Only

```bash
# Check existing results against budgets
npm run lighthouse:assert
```

## Viewing Results

### Local Results

After running Lighthouse CI locally:

```bash
# Results saved in:
.lighthouseci/
├── manifest.json          # Summary of all runs
├── lhr-{timestamp}-0.json # Detailed report for run 1
├── lhr-{timestamp}-1.json # Detailed report for run 2
└── lhr-{timestamp}-2.json # Detailed report for run 3
```

View HTML reports:
```bash
# Open Lighthouse Viewer
open https://googlechrome.github.io/lighthouse/viewer/
# Upload .json files from .lighthouseci/ directory
```

### GitHub Actions Results

1. Go to **Actions** tab in GitHub repository
2. Click on Lighthouse CI workflow run
3. Download **lighthouse-results** artifact
4. Extract and view JSON files in Lighthouse Viewer

### PR Comments

When configured with `LHCI_GITHUB_APP_TOKEN`, Lighthouse CI posts:
- Performance score summary
- Link to detailed artifacts
- Comparison with previous runs

## Troubleshooting

### Build Fails in CI

**Issue**: Build fails during Lighthouse CI workflow

**Solutions**:
1. Check environment variables are set correctly
2. Verify Prisma schema is valid
3. Ensure all dependencies are in package.json
4. Check Node.js version (should be 22)

### Performance Scores Failing

**Issue**: Scores below thresholds

**Solutions**:
1. Run locally: `npm run lighthouse`
2. Review `.lighthouseci/` reports
3. Identify failing metrics
4. Optimize accordingly:
   - **LCP**: Optimize images, lazy load below-fold content
   - **CLS**: Set image dimensions, avoid layout shifts
   - **TBT**: Code split, lazy load JS
   - **FCP**: Reduce render-blocking resources

### Timeout Errors

**Issue**: Server doesn't start in time

**Solutions**:
1. Increase timeout in `.lighthouserc.json`:
   ```json
   {
     "collect": {
       "startServerReadyTimeout": 60000
     }
   }
   ```
2. Check server starts successfully locally
3. Review build logs for errors

### Missing Artifacts

**Issue**: Lighthouse results not uploaded

**Solutions**:
1. Check workflow completed successfully
2. Verify `.lighthouseci/` directory exists
3. Check artifact retention (30 days by default)
4. Ensure upload step didn't fail

## Adjusting Performance Budgets

### Make Budgets More Strict

```json
{
  "assertions": {
    "categories:performance": ["error", {"minScore": 0.98}],
    "first-contentful-paint": ["error", {"maxNumericValue": 1500}]
  }
}
```

### Make Budgets Less Strict (Not Recommended)

```json
{
  "assertions": {
    "categories:performance": ["warn", {"minScore": 0.90}],
    "first-contentful-paint": ["warn", {"maxNumericValue": 2500}]
  }
}
```

Use `"warn"` instead of `"error"` to allow PR merges despite failing metrics.

### Add New Metrics

```json
{
  "assertions": {
    "server-response-time": ["error", {"maxNumericValue": 600}],
    "resource-summary:script:size": ["error", {"maxNumericValue": 300000}],
    "resource-summary:image:size": ["error", {"maxNumericValue": 500000}]
  }
}
```

## Best Practices

### 1. Run Before PR

Always run Lighthouse CI locally before creating pull request:

```bash
npm run lighthouse
```

### 2. Monitor Trends

Track performance over time:
- Download artifacts from multiple PRs
- Compare scores
- Identify trends

### 3. Optimize Iteratively

Don't try to fix everything at once:
1. Focus on one metric at a time
2. Make incremental improvements
3. Re-run audits after each change

### 4. Set Realistic Budgets

Don't set impossible targets:
- Start with current performance
- Gradually increase standards
- Balance performance with functionality

### 5. Test on Real Devices

Lighthouse simulates devices, but test on real hardware:
- Use Chrome DevTools device emulation
- Test on actual mobile devices
- Use WebPageTest for real-world testing

## Integration with CI/CD

### Pre-merge Checks

Lighthouse CI is configured as a required check:
1. PR created → Lighthouse CI runs
2. Scores below budget → Build fails
3. Fix performance issues → Re-run CI
4. Scores meet budget → PR can merge

### Continuous Monitoring

Optional: Run on every push to main:

```yaml
# In .github/workflows/lighthouse.yml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main, develop]
```

## Resources

- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Lighthouse Metrics](https://web.dev/metrics/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse Viewer](https://googlechrome.github.io/lighthouse/viewer/)
- [WebPageTest](https://www.webpagetest.org/)
- [PageSpeed Insights](https://pagespeed.web.dev/)

## Quick Reference

### Commands

```bash
# Run full audit locally
npm run lighthouse

# Run in CI (GitHub Actions)
# Automatically triggered on PR

# View results
# .lighthouseci/*.json → Upload to Lighthouse Viewer

# Adjust budgets
# Edit .lighthouserc.json
```

### Files

- **Configuration**: `.lighthouserc.json`
- **Workflow**: `.github/workflows/lighthouse.yml`
- **Results**: `.lighthouseci/` (gitignored)
- **Documentation**: `docs/LIGHTHOUSE_CI.md`

### Scores Explanation

- **90-100**: Good (green)
- **50-89**: Needs improvement (orange)
- **0-49**: Poor (red)

Target: **≥ 95%** for all categories
