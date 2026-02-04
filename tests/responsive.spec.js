// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Responsive Design - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should display header on mobile', async ({ page }) => {
    await page.goto('/');

    const logo = page.locator('.logo h1');
    await expect(logo).toBeVisible();
  });

  test('should display tabs on mobile', async ({ page }) => {
    await page.goto('/');

    const tabs = page.locator('.tabs .tab');
    await expect(tabs.first()).toBeVisible();
  });

  test('should allow tab navigation on mobile', async ({ page }) => {
    await page.goto('/');

    const statsTab = page.locator('.tab').filter({ hasText: 'Statistics' });
    await statsTab.click();

    await expect(statsTab).toHaveClass(/active/);
  });

  test('should display search box on mobile', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('.search-box input');
    await expect(searchInput).toBeVisible();
  });

  test('search should be usable on mobile', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('.search-box input');
    await searchInput.tap();
    await searchInput.fill('developer');

    await expect(searchInput).toHaveValue('developer');
  });
});

test.describe('Responsive Design - Tablet', () => {
  test.use({ viewport: { width: 768, height: 1024 } }); // iPad

  test('should display all main elements', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.logo')).toBeVisible();
    await expect(page.locator('.tabs')).toBeVisible();
    await expect(page.locator('.search-box')).toBeVisible();
  });

  test('should have functional navigation', async ({ page }) => {
    await page.goto('/');

    // Navigate through all tabs
    for (const tabName of ['Jobs', 'Statistics', 'Scrape']) {
      const tab = page.locator('.tab').filter({ hasText: tabName });
      await tab.click();
      await expect(tab).toHaveClass(/active/);
    }
  });
});

test.describe('Responsive Design - Desktop', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test('should display full layout on desktop', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.header')).toBeVisible();
    await expect(page.locator('.main')).toBeVisible();
    await expect(page.locator('.footer')).toBeVisible();
  });

  test('should show all controls in jobs section', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.search-box')).toBeVisible();
    await expect(page.locator('.source-filter')).toBeVisible();
    await expect(page.locator('.btn-icon')).toBeVisible();
    await expect(page.locator('.btn-danger')).toBeVisible();
  });
});
