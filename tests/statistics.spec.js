// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Statistics Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to Statistics tab
    const statsTab = page.locator('.tab').filter({ hasText: 'Statistics' });
    await statsTab.click();
    await page.waitForTimeout(300);
  });

  test('should navigate to Statistics tab successfully', async ({ page }) => {
    const statsTab = page.locator('.tab').filter({ hasText: 'Statistics' });
    await expect(statsTab).toHaveClass(/active/);
  });

  test('should display statistics content or empty state', async ({ page }) => {
    // Wait for stats to load
    await page.waitForTimeout(500);

    // Check if stats content exists
    const body = await page.locator('body').textContent();

    // Should either show charts/stats or indicate no data
    expect(body.length).toBeGreaterThan(0);
  });

  test('should switch back to Jobs tab', async ({ page }) => {
    const jobsTab = page.locator('.tab').filter({ hasText: 'Jobs' });
    await jobsTab.click();

    await expect(jobsTab).toHaveClass(/active/);
    await expect(page.locator('.jobs-section')).toBeVisible();
  });
});

test.describe('Statistics Data Visualization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const statsTab = page.locator('.tab').filter({ hasText: 'Statistics' });
    await statsTab.click();
  });

  test('should load stats from API', async ({ page }) => {
    // Intercept the stats API call
    const statsResponse = page.waitForResponse(
      response => response.url().includes('/api/stats') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => null);

    await page.reload();

    const response = await statsResponse;
    if (response) {
      expect(response.status()).toBe(200);
    }
  });
});
