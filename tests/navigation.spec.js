// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the homepage with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/JobFy/i);
  });

  test('should display the logo and header', async ({ page }) => {
    const logo = page.locator('.logo h1');
    await expect(logo).toHaveText('JobFy');

    const tagline = page.locator('.tagline');
    await expect(tagline).toHaveText('Job Scraper Dashboard');
  });

  test('should have three navigation tabs', async ({ page }) => {
    const tabs = page.locator('.tabs .tab');
    await expect(tabs).toHaveCount(3);

    await expect(tabs.nth(0)).toContainText('Jobs');
    await expect(tabs.nth(1)).toContainText('Statistics');
    await expect(tabs.nth(2)).toContainText('Scrape');
  });

  test('should navigate to Jobs tab by default', async ({ page }) => {
    const jobsTab = page.locator('.tab').filter({ hasText: 'Jobs' });
    await expect(jobsTab).toHaveClass(/active/);
  });

  test('should navigate to Statistics tab', async ({ page }) => {
    const statsTab = page.locator('.tab').filter({ hasText: 'Statistics' });
    await statsTab.click();

    await expect(statsTab).toHaveClass(/active/);
  });

  test('should navigate to Scrape tab', async ({ page }) => {
    const scrapeTab = page.locator('.tab').filter({ hasText: 'Scrape' });
    await scrapeTab.click();

    await expect(scrapeTab).toHaveClass(/active/);
  });

  test('should display footer', async ({ page }) => {
    const footer = page.locator('.footer');
    await expect(footer).toContainText('JobFy');
  });
});
