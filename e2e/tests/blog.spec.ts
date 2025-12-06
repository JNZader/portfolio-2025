import { test, expect } from '@playwright/test';
import { testData, dismissCookieConsent } from '../fixtures/test-data';

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
        await expect(page).toHaveURL(new RegExp(href.replace('#', '#')));
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
