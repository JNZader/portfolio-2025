import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '../fixtures/test';
import AxeBuilder from '@axe-core/playwright';
import { dismissCookieConsent } from '../fixtures/test-data';
import { expectMinimumTarget, rectanglesOverlap } from '../helpers/visual-ux';
import { skipIfPortfolioServerBlocked } from '../fixtures/portfolio-server';

/**
 * Proyectos filters redesign — end-to-end coverage of the always-visible
 * filter layout: full filter flow with URL sync, refresh round-trip (incl.
 * dropdown-only techs pinned visible), axe contrast scans in both themes,
 * 44px touch targets, skeleton data-region parity and the 320px segmented
 * control layout.
 */

const FILTER_REGIONS = ['filter', 'search', 'control', 'tech-bar'] as const;

async function gotoProyectos(page: import('@playwright/test').Page, path = '/proyectos') {
  await skipIfPortfolioServerBlocked();
  await page.goto(path);
  await dismissCookieConsent(page);
}

test.describe('proyectos filters redesign', () => {
  test('filter area is fully visible without a toggle in both locales', async ({ page }) => {
    await gotoProyectos(page);
    await expect(page.getByRole('button', { name: /^filtros$/i })).toHaveCount(0);
    await expect(page.locator('#project-filters')).toHaveCount(0);
    await expect(page.getByRole('searchbox', { name: /buscar proyectos/i })).toBeVisible();
    await expect(page.getByRole('radiogroup', { name: /filtrar por fuente/i })).toBeVisible();
    await expect(
      page.getByRole('group', { name: /filtrar por tecnología/i })
    ).toBeVisible();

    await gotoProyectos(page, '/en/proyectos');
    await expect(page.getByRole('button', { name: /^filters$/i })).toHaveCount(0);
    await expect(page.getByRole('searchbox', { name: /search projects/i })).toBeVisible();
    await expect(page.getByRole('radiogroup', { name: /filter by source/i })).toBeVisible();
    await expect(page.getByRole('group', { name: /filter by technology/i })).toBeVisible();
  });

  test('full flow: search, source, bar chip and dropdown chip sync URL and counts', async ({
    page,
  }) => {
    await gotoProyectos(page);

    const count = page.locator('p[aria-live="polite"]');
    const initialCount = await count.textContent();

    // Search
    const search = page.getByRole('searchbox', { name: /buscar proyectos/i });
    await search.fill('portfolio');
    await expect(page).toHaveURL(/[?&]q=portfolio/, { timeout: 3000 });

    // Source segment
    await page.getByRole('radio', { name: /github/i }).click();
    await expect(page).toHaveURL(/[?&]source=github/);
    await expect(page.getByRole('radio', { name: /github/i })).toHaveAttribute(
      'aria-checked',
      'true'
    );

    // Tech chip from the visible bar
    const bar = page.getByRole('group', { name: /filtrar por tecnología/i });
    const firstChip = bar.getByRole('checkbox').first();
    const chipName = await firstChip.textContent();
    await firstChip.click();
    await expect(page).toHaveURL(/[?&]tech=/);
    await expect(bar.getByRole('checkbox', { name: chipName ?? '' })).toHaveAttribute(
      'aria-checked',
      'true'
    );

    // Tech from the dropdown (when the dataset overflows the top 8)
    const more = page.getByRole('button', { name: /tecnologías más/i });
    if ((await more.count()) > 0) {
      await more.click();
      const input = page.getByPlaceholder(/filtrar tecnologías/i);
      await expect(input).toBeFocused();
      const option = page.getByRole('option').first();
      const optionName = (await option.textContent())?.trim() ?? '';
      await option.click();
      // Multiselect: the dropdown stays open after toggling
      await expect(page.getByRole('listbox')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(more).toBeFocused();
      // The dropdown-selected tech is pinned into the visible bar
      await expect(
        bar.getByRole('checkbox', { name: new RegExp(optionName) })
      ).toHaveAttribute('aria-checked', 'true');
    }

    // The count reacts to the filters
    await expect(count).not.toHaveText(initialCount ?? '');

    // Clear resets state and URL
    await page.getByRole('button', { name: /^limpiar$/i }).click();
    await expect(page).not.toHaveURL(/[?&](q|tech|source)=/);
    await expect(count).toHaveText(initialCount ?? '');
  });

  test('refresh round-trips filter state including a dropdown-only tech pinned visible', async ({
    page,
  }) => {
    await gotoProyectos(page);

    const more = page.getByRole('button', { name: /tecnologías más/i });
    test.skip((await more.count()) === 0, 'dataset fits in the visible bar — no dropdown techs');

    // Select a dropdown-only tech plus the GitHub source, then reload the URL.
    await more.click();
    const option = page.getByRole('option').first();
    const optionName = (await option.textContent())?.trim() ?? '';
    await option.click();
    await page.keyboard.press('Escape');
    await page.getByRole('radio', { name: /github/i }).click();

    await expect(page).toHaveURL(/[?&]tech=/);
    await expect(page).toHaveURL(/[?&]source=github/);
    const url = page.url();

    await page.goto(url);
    await dismissCookieConsent(page);

    await expect(page.getByRole('radio', { name: /github/i })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    const bar = page.getByRole('group', { name: /filtrar por tecnología/i });
    await expect(
      bar.getByRole('checkbox', { name: new RegExp(optionName) })
    ).toHaveAttribute('aria-checked', 'true');
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`axe reports no violations in the filter region (${colorScheme} theme)`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await gotoProyectos(page);

      const results = await new AxeBuilder({ page })
        .include('[data-region="filter"]')
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test('every chip, segment, trigger and dropdown option meets the 44px target', async ({
    page,
  }) => {
    await gotoProyectos(page);

    for (const segment of await page.getByRole('radio').all()) {
      await expectMinimumTarget(segment);
    }
    const bar = page.getByRole('group', { name: /filtrar por tecnología/i });
    for (const chip of await bar.getByRole('checkbox').all()) {
      await expectMinimumTarget(chip);
    }

    const more = page.getByRole('button', { name: /tecnologías más/i });
    if ((await more.count()) > 0) {
      await expectMinimumTarget(more);
      await more.click();
      for (const option of await page.getByRole('option').all()) {
        await expectMinimumTarget(option);
      }
      await page.keyboard.press('Escape');
    }
  });

  test('live filter region exposes the same data-region hooks as the loading skeleton', async ({
    page,
  }) => {
    await gotoProyectos(page);

    const skeletonSource = readFileSync(
      resolve(process.cwd(), 'app/[locale]/(pages)/proyectos/loading.tsx'),
      'utf8'
    );
    for (const region of FILTER_REGIONS) {
      expect(skeletonSource, `skeleton keeps data-region="${region}"`).toContain(
        `data-region="${region}"`
      );
      await expect(
        page.locator(`[data-region="${region}"]`).first(),
        `live page exposes data-region="${region}"`
      ).toBeAttached();
    }
  });

  test('320px viewport keeps all source segments visible, non-overlapping and ≥44px tall', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await gotoProyectos(page);

    const segments = page.getByRole('radio');
    await expect(segments).toHaveCount(3);
    const boxes = [];
    for (const segment of await segments.all()) {
      await expect(segment).toBeVisible();
      const box = await segment.boundingBox();
      expect(box).not.toBeNull();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.width ?? 0).toBeGreaterThan(0);
      expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320);
      boxes.push(box);
    }
    for (let first = 0; first < boxes.length; first += 1) {
      for (let second = first + 1; second < boxes.length; second += 1) {
        // Adjacent segments intentionally share a 1px collapsed border
        // (-ml-px), so shrink each box by that shared pixel before the
        // overlap assertion.
        const shrink = (box: (typeof boxes)[number]) => ({
          x: box!.x,
          y: box!.y,
          width: box!.width - 1,
          height: box!.height,
        });
        expect(rectanglesOverlap(shrink(boxes[first]), shrink(boxes[second]))).toBe(false);
      }
    }
  });
});
