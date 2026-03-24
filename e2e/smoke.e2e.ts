import { test, expect } from './fixtures/base.fixture';

test.describe('Smoke Tests', () => {
  test('landing page should load successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('landing page should have a title', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('customer route should be accessible', async ({ page }) => {
    await page.goto('/customer');
    await expect(page.locator('body')).toBeVisible();
  });

  test('supplier route should be accessible', async ({ page }) => {
    await page.goto('/supplier');
    await expect(page.locator('body')).toBeVisible();
  });

  test('admin route should be accessible', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('body')).toBeVisible();
  });
});
