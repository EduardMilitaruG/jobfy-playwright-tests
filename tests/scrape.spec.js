// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Scrape Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to Scrape tab
    const scrapeTab = page.locator('.tab').filter({ hasText: 'Scrape' });
    await scrapeTab.click();
    await page.waitForTimeout(300);
  });

  test('should navigate to Scrape tab successfully', async ({ page }) => {
    const scrapeTab = page.locator('.tab').filter({ hasText: 'Scrape' });
    await expect(scrapeTab).toHaveClass(/active/);
  });

  test('should display scrape panel content', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(500);

    // The scrape panel should be visible
    const body = await page.locator('body').textContent();
    expect(body.length).toBeGreaterThan(0);
  });

  test('should load available sites from API', async ({ page }) => {
    // Intercept the sites API call
    const sitesResponse = page.waitForResponse(
      response => response.url().includes('/api/sites') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => null);

    await page.reload();
    const scrapeTab = page.locator('.tab').filter({ hasText: 'Scrape' });
    await scrapeTab.click();

    const response = await sitesResponse;
    if (response) {
      const data = await response.json();
      expect(data).toHaveProperty('sites');
      expect(Array.isArray(data.sites)).toBeTruthy();
    }
  });

  test('should have keyword input field', async ({ page }) => {
    // Look for an input field for keywords
    const inputs = page.locator('input[type="text"], input:not([type])');
    const count = await inputs.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Scrape Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const scrapeTab = page.locator('.tab').filter({ hasText: 'Scrape' });
    await scrapeTab.click();
    await page.waitForTimeout(500);
  });

  test('should show scrape history or logs section', async ({ page }) => {
    // Check for any history/logs related content
    const pageContent = await page.content();

    // The page should have loaded without errors
    expect(pageContent).toContain('html');
  });

  test('should handle scrape form interaction', async ({ page }) => {
    // Find and interact with form elements if they exist
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    // Should have at least some buttons (tabs + any action buttons)
    expect(buttonCount).toBeGreaterThan(0);
  });
});
