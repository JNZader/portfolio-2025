import { expect, test } from '@playwright/test';
import { dismissCookieConsent } from '../fixtures/test-data';
import { expectMinimumTarget } from '../helpers/visual-ux';

test.describe('Project card visual UX', () => {
  test('search and project actions provide comfortable pointer targets', async ({ page }) => {
    await page.goto('/proyectos');
    await dismissCookieConsent(page);

    const search = page.getByRole('searchbox', { name: /buscar proyectos/i });
    await expectMinimumTarget(search);
    await search.fill('api');
    await expectMinimumTarget(page.getByRole('button', { name: /limpiar búsqueda/i }));

    const projectAction = page.getByRole('link', { name: /repositorio.*github/i }).first();
    if (await projectAction.count()) await expectMinimumTarget(projectAction);
  });

  test('project cards use project-specific generated visuals instead of empty placeholders', async ({
    page,
  }) => {
    await page.goto('/proyectos');
    await dismissCookieConsent(page);

    await expect(page.getByText('Sin imagen', { exact: true })).toHaveCount(0);
    await expect(page.locator('[data-project-visual]').first()).toBeVisible();
  });
});
