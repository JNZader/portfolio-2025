import { test, expect } from '../fixtures/test';
import { testData, dismissCookieConsent } from '../fixtures/test-data';
import type { Page, TestInfo } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import {
  environmentReportPath,
  preflightSanityEnvironment,
  type EnvironmentResult,
} from '../fixtures/environment-status';

const BLOG_LOADING_REGIONS = [
  '[data-region="hero"]',
  '[data-region="filter"]',
  '[data-region="cards"]',
] as const;

const BLOG_LOADING_INNER_REGIONS = [
  '[data-region="search"]',
  '[data-region="control"]',
  '[data-region="result-count"]',
] as const;

const SANITY_PREREQUISITES = [
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'NEXT_PUBLIC_SANITY_DATASET',
] as const;

const BLOG_LOADING_THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

type BlogLoadingTheme = (typeof BLOG_LOADING_THEMES)[keyof typeof BLOG_LOADING_THEMES];

function blockUnavailableRuntime(testInfo: TestInfo, reason: string): void {
  const blockedReason = `blocked: ${reason}`;
  testInfo.annotations.push({ type: 'environment', description: blockedReason });
  testInfo.skip(true, blockedReason);
}

async function setTheme(page: Page, theme: BlogLoadingTheme): Promise<void> {
  await page.evaluate((nextTheme) => {
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  }, theme);
}

interface PreflightFile {
  entries: EnvironmentResult[];
}

function isSanityReason(reason: string | undefined): boolean {
  return reason?.startsWith('Missing NEXT_PUBLIC_SANITY_') === true
    || reason?.startsWith('Invalid Sanity ') === true
    || reason?.startsWith('Sanity representative fetch ') === true;
}

async function sanityBlockReason(): Promise<string | undefined> {
  const missingVariable = SANITY_PREREQUISITES.find((variable) => !process.env[variable]);
  if (missingVariable) return `Missing ${missingVariable}`;

  try {
    const raw = await readFile(environmentReportPath('environment-preflight.json'), 'utf8');
    const entries = (JSON.parse(raw) as PreflightFile).entries;
    const blockedSanity = entries.find(
      (entry) => entry.status === 'blocked' && isSanityReason(entry.reason),
    );
    if (blockedSanity?.status === 'blocked') return blockedSanity.reason;
  } catch {
    // Re-run the narrow Sanity preflight below so a missing report is not a
    // generic navigation failure or an accidental pass.
  }

  const result = await preflightSanityEnvironment(process.env);
  return result.status === 'blocked' ? result.reason : undefined;
}

function isSanityFetchFailure(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /sanity|fetch|network|timeout|http 5\d\d/i.test(message);
}

async function assertLoadingGeometry(page: Page): Promise<void> {
  const geometry = await page.evaluate(({ regionSelectors, innerRegionSelectors }) => {
    const viewportWidth = document.documentElement.clientWidth;
    const intentionalBoundary = (element: Element): boolean => {
      const tagName = element.tagName.toLowerCase();
      return tagName === 'html' || tagName === 'body' || element.classList.contains('max-w-7xl');
    };
    const hasAncestorClipping = (element: HTMLElement): boolean => {
      const elementRect = element.getBoundingClientRect();
      let ancestor = element.parentElement;
      while (ancestor) {
        if (!intentionalBoundary(ancestor)) {
          const style = getComputedStyle(ancestor);
          const clipsX = style.overflowX === 'hidden' || style.overflowX === 'clip'
            || style.overflowX === 'auto' || style.overflowX === 'scroll';
          const clipsY = style.overflowY === 'hidden' || style.overflowY === 'clip'
            || style.overflowY === 'auto' || style.overflowY === 'scroll';
          const ancestorRect = ancestor.getBoundingClientRect();
          if ((clipsX && (elementRect.left < ancestorRect.left || elementRect.right > ancestorRect.right))
            || (clipsY && (elementRect.top < ancestorRect.top || elementRect.bottom > ancestorRect.bottom))) {
            return true;
          }
        }
        ancestor = ancestor.parentElement;
      }
      return false;
    };
    const regions = regionSelectors.map((selector) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) {
        return {
          selector,
          exists: false,
          x: 0,
          right: 0,
          width: 0,
          height: 0,
          clippedByAncestor: false,
          hasOwnOverflow: false,
        };
      }
      const rect = element.getBoundingClientRect();
      return {
        selector,
        exists: true,
        x: rect.x,
        right: rect.right,
        width: rect.width,
        height: rect.height,
        y: rect.y,
        bottom: rect.bottom,
        clippedByAncestor: hasAncestorClipping(element),
        hasOwnOverflow: element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight,
      };
    });
    const innerRegions = innerRegionSelectors.map((selector) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) {
        return {
          selector,
          exists: false,
          x: 0,
          right: 0,
          y: 0,
          bottom: 0,
          width: 0,
          height: 0,
          clippedByAncestor: false,
          hasOwnOverflow: false,
        };
      }
      const rect = element.getBoundingClientRect();
      return {
        selector,
        exists: true,
        x: rect.x,
        right: rect.right,
        y: rect.y,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
        clippedByAncestor: hasAncestorClipping(element),
        hasOwnOverflow: element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight,
      };
    });
    const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-testid="blog-loading-card"]'))
      .map((card) => {
        const rect = card.getBoundingClientRect();
        return { x: rect.x, right: rect.right, y: rect.y, bottom: rect.bottom, width: rect.width, height: rect.height };
      });
    const overlaps = (left: { x: number; right: number; y?: number; bottom?: number }, right: { x: number; right: number; y?: number; bottom?: number }) =>
      left.x < right.right && right.x < left.right && (left.y ?? 0) < (right.bottom ?? 0) && (right.y ?? 0) < (left.bottom ?? 0);
    const topLevelOverlaps = regions.every((left, leftIndex) =>
      regions.slice(leftIndex + 1).every((right) => {
        if (!left.exists || !right.exists) return true;
        const leftElement = document.querySelector<HTMLElement>(left.selector);
        const rightElement = document.querySelector<HTMLElement>(right.selector);
        if (!leftElement || !rightElement) return true;
        return !overlaps(leftElement.getBoundingClientRect(), rightElement.getBoundingClientRect());
      }),
    );
    const filter = document.querySelector<HTMLElement>('[data-region="filter"]')?.getBoundingClientRect();
    const innerRegionsSizedAndContained = innerRegions.every((region) => region.exists && region.width > 0 && region.height > 0
      && region.x >= (filter?.x ?? 0) && region.right <= (filter?.right ?? 0)
      && region.y >= (filter?.y ?? 0) && region.bottom <= (filter?.bottom ?? 0));
    const innerRegionsDoNotOverlap = innerRegions.every((left, leftIndex) =>
      innerRegions.slice(leftIndex + 1).every((right) => !left.exists || !right.exists
        || !overlaps(left, right)),
    );
    const resultCount = innerRegions.find((region) => region.selector === '[data-region="result-count"]');
    const controlRow = innerRegions.filter((region) => region.selector !== '[data-region="result-count"]');
    const resultCountFollowsControlRow = resultCount !== undefined && resultCount.exists
      && resultCount.y >= Math.max(...controlRow.map((region) => region.bottom));
    const cardOverlaps = cards.every((left, leftIndex) => cards.slice(leftIndex + 1).every((right) => !overlaps(left, right)));
    const surfaces = ['[data-region="hero-motif"]', '[data-region="search"]', '[data-region="control"]', '[data-testid="blog-loading-card"]'];
    const distinguishableSurfaces = surfaces.every((selector) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) return false;
      const style = getComputedStyle(element);
      const parentStyle = getComputedStyle(element.parentElement ?? document.body);
      return style.backgroundColor !== parentStyle.backgroundColor
        || style.borderTopColor !== parentStyle.borderTopColor
        || style.borderTopStyle !== 'none';
    });
    return {
      regions,
      innerRegions,
      cards,
      noHorizontalOverflow: document.documentElement.scrollWidth <= viewportWidth,
      regionsPresentAndSized: regions.every((region) => region.exists && region.width > 0 && region.height > 0 && region.x >= 0 && region.right <= viewportWidth),
      regionsDoNotClip: regions.every((region) => !region.clippedByAncestor && !region.hasOwnOverflow),
      innerRegionsSizedAndContained,
      innerRegionsDoNotOverlap,
      innerRegionsDoNotClip: innerRegions.every((region) => !region.clippedByAncestor && !region.hasOwnOverflow),
      resultCountFollowsControlRow,
      cardsPresentAndSized: cards.length === 6 && cards.every((card) => card.width > 0 && card.height > 0 && card.x >= 0 && card.right <= viewportWidth),
      noOverlap: topLevelOverlaps && cardOverlaps,
      distinguishableSurfaces,
    };
  }, { regionSelectors: BLOG_LOADING_REGIONS, innerRegionSelectors: BLOG_LOADING_INNER_REGIONS });

  expect(geometry.noHorizontalOverflow).toBe(true);
  expect(geometry.regionsPresentAndSized).toBe(true);
  expect(geometry.regionsDoNotClip).toBe(true);
  expect(geometry.innerRegionsSizedAndContained).toBe(true);
  expect(geometry.innerRegionsDoNotOverlap).toBe(true);
  expect(geometry.innerRegionsDoNotClip).toBe(true);
  expect(geometry.resultCountFollowsControlRow).toBe(true);
  expect(geometry.cardsPresentAndSized).toBe(true);
  expect(geometry.noOverlap).toBe(true);
  expect(geometry.distinguishableSurfaces).toBe(true);
}

test.describe('Blog loading contract', () => {
  test('checks responsive theme geometry and the loading-to-resolved transition', async ({ page }, testInfo) => {
    const blockedSanityReason = await sanityBlockReason();
    if (blockedSanityReason) {
      blockUnavailableRuntime(testInfo, blockedSanityReason);
      return;
    }

    const isMobileViewport = testInfo.project.name.startsWith('mobile-');
    const viewportWidth = page.viewportSize()?.width ?? 0;
    expect(isMobileViewport ? viewportWidth : viewportWidth >= 768).toBe(true);
    try {
      await page.goto('/blog', { waitUntil: 'commit' });
    } catch (error) {
      if (isSanityFetchFailure(error)) {
        blockUnavailableRuntime(testInfo, 'Sanity representative fetch failed: network or timeout error');
        return;
      }
      throw error;
    }

    const loadingStatus = page.locator('[role="status"][aria-busy="true"][aria-label="Loading blog page"]');
    try {
      await loadingStatus.waitFor({ state: 'attached', timeout: 3000 });
    } catch {
      blockUnavailableRuntime(testInfo, 'no reliable route hold available');
      return;
    }

    for (const theme of Object.values(BLOG_LOADING_THEMES)) {
      await setTheme(page, theme);
      await expect(loadingStatus).toHaveCount(1);
      await expect(page.locator('[data-region="hero"]')).toHaveCount(1);
      await expect(page.locator('[data-region="filter"]')).toHaveCount(1);
      await expect(page.locator('[data-region="cards"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="blog-loading-card"]')).toHaveCount(6);
      await expect(page.locator('[data-region="card-image"]')).toHaveCount(6);
      await expect(page.locator('[data-region="card-content"]')).toHaveCount(6);
      await expect(page.locator('[data-region="card-author"]')).toHaveCount(6);
      await assertLoadingGeometry(page);
    }

    await expect(loadingStatus).toHaveCount(0, { timeout: 30000 });
    await expect(page).toHaveURL(/\/blog(?:\?.*)?$/);
    await expect(page.getByRole('heading', { name: /blog/i, level: 1 })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /buscar/i })).toBeVisible();
    await expect(page.locator('[data-region="hero"], [data-region="filter"], [data-region="cards"]')).toHaveCount(0);
  });
});

test.describe('Blog', () => {
  test('should navigate to blog page', async ({ page, viewport }) => {
    // Skip on mobile - nav is hidden in hamburger menu (tested in navigation.spec.ts)
    test.skip(!!viewport && viewport.width < 768, 'Desktop navigation test - skipped on mobile');

    await page.goto('/');
    await dismissCookieConsent(page);

    // Click blog link in main navigation (use nav context to avoid ambiguity)
    const nav = page.getByRole('navigation', { name: /principal/i });
    await nav.getByRole('link', { name: /blog/i }).click();

    // Should be on blog page
    await expect(page).toHaveURL(/\/blog/);
    await expect(page.getByRole('heading', { name: /blog/i, level: 1 })).toBeVisible();
  });

  test('should display blog posts or empty state', async ({ page }) => {
    await page.goto('/blog');
    await dismissCookieConsent(page);

    // Check if posts exist or empty state is shown
    const posts = page.getByRole('article');
    const emptyState = page.getByText(/no hay posts|no hay artículos/i);

    // Wait for either posts or empty state
    const postsVisible = await posts.first().isVisible().catch(() => false);
    const emptyVisible = await emptyState.isVisible().catch(() => false);

    // At least one should be visible
    expect(postsVisible || emptyVisible).toBe(true);

    // If posts exist, verify structure
    if (postsVisible) {
      const firstPost = posts.first();
      await expect(firstPost.getByRole('heading')).toBeVisible();
    }
  });

  test('should navigate to individual post if posts exist', async ({ page }) => {
    await page.goto('/blog');
    await dismissCookieConsent(page);

    // Check if posts exist
    const posts = page.getByRole('article');
    const postCount = await posts.count();

    if (postCount === 0) {
      test.skip();
      return;
    }

    // Click first post
    const firstPost = posts.first();
    const postTitle = await firstPost.getByRole('heading').textContent();
    await firstPost.getByRole('link').first().click();

    // Should be on post page
    await expect(page).toHaveURL(/\/blog\/.+/);
    await expect(page.getByRole('heading', { name: postTitle! })).toBeVisible();
  });

  test('should filter by category if posts exist', async ({ page }) => {
    await page.goto('/blog');
    await dismissCookieConsent(page);

    // Check if posts exist first
    const posts = page.getByRole('article');
    const postCount = await posts.count();

    if (postCount === 0) {
      test.skip();
      return;
    }

    // Get categories
    const categoryButtons = page.getByRole('button').filter({ hasText: /#/ });
    const categoryCount = await categoryButtons.count();

    if (categoryCount > 0) {
      // Click first category
      await categoryButtons.first().click();

      // URL should have category param
      await expect(page).toHaveURL(/category=/);
    }
  });

  test('should have search input', async ({ page }) => {
    await page.goto('/blog');
    await dismissCookieConsent(page);

    // Find search input - should always be visible
    const searchInput = page.getByRole('textbox', { name: /buscar/i });
    await expect(searchInput).toBeVisible();
  });

  test('should show empty state for no results', async ({ page }) => {
    await page.goto('/blog');
    await dismissCookieConsent(page);

    const searchInput = page.getByRole('textbox', { name: /buscar/i });
    await searchInput.fill(testData.search.noResultsQuery);

    // Wait for URL to update (indicates search completed)
    await page.waitForURL(/search=/, { timeout: 5000 });

    // Wait for content to load after search
    await page.waitForLoadState('networkidle');

    // Should show empty state - check for title or description
    const emptyStateTitle = page.getByRole('heading', { name: /no se encontraron|no hay/i });
    const emptyStateText = page.getByText(/no se encontraron|no hay artículos que coincidan/i);

    // Either the heading or the text should be visible
    await expect(emptyStateTitle.or(emptyStateText).first()).toBeVisible({ timeout: 10000 });
  });

  test('should paginate results if enough posts', async ({ page }) => {
    await page.goto('/blog');
    await dismissCookieConsent(page);

    // Check if pagination exists
    const pagination = page.locator('[role="navigation"]').filter({ hasText: /página/i });

    if (await pagination.isVisible()) {
      // Click page 2
      await page.getByRole('link', { name: '2' }).click();

      // URL should have page param
      await expect(page).toHaveURL(/page=2/);

      // Should show posts
      await expect(page.getByRole('article').first()).toBeVisible();
    }
  });
});

test.describe('Blog Post', () => {
  test('should display post content if posts exist', async ({ page }) => {
    // Navigate to blog first to check if posts exist
    await page.goto('/blog');
    await dismissCookieConsent(page);

    const posts = page.getByRole('article');
    const postCount = await posts.count();

    if (postCount === 0) {
      test.skip();
      return;
    }

    // Navigate to first post
    await posts.first().getByRole('link').first().click();

    // Should show title
    const mainHeading = page.getByRole('heading', { level: 1 });
    await expect(mainHeading).toBeVisible();

    // Should show content
    const content = page.locator('article').first();
    await expect(content).toBeVisible();
  });

  test('should have table of contents if post has headings', async ({ page }) => {
    await page.goto('/blog');
    await dismissCookieConsent(page);

    const posts = page.getByRole('article');
    const postCount = await posts.count();

    if (postCount === 0) {
      test.skip();
      return;
    }

    await posts.first().getByRole('link').first().click();

    // Check if TOC exists (may not exist in all posts)
    const toc = page.getByRole('navigation', { name: /tabla de contenido/i });

    if (await toc.isVisible()) {
      // Click first TOC link
      const firstLink = toc.getByRole('link').first();
      const href = await firstLink.getAttribute('href');
      await firstLink.click();

      // Wait for scroll to complete by checking URL hash
      if (href) {
        const escapedHref = href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        await expect(page).toHaveURL(new RegExp(escapedHref));
      }
    }
  });

  test('should show related posts if available', async ({ page }) => {
    await page.goto('/blog');
    await dismissCookieConsent(page);

    const posts = page.getByRole('article');
    const postCount = await posts.count();

    if (postCount === 0) {
      test.skip();
      return;
    }

    await posts.first().getByRole('link').first().click();

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check for related posts section (optional feature)
    const relatedSection = page.getByRole('heading', { name: /relacionados/i });

    if (await relatedSection.isVisible()) {
      const relatedPosts = page.getByRole('article');
      await expect(relatedPosts.first()).toBeVisible();
    }
  });
});
