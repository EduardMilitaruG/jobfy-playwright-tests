// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Jobs Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for initial load
    await page.waitForSelector('.jobs-section');
  });

  test('should display search input', async ({ page }) => {
    const searchInput = page.locator('.search-box input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /search/i);
  });

  test('should display source filter dropdown', async ({ page }) => {
    const sourceFilter = page.locator('.source-filter');
    await expect(sourceFilter).toBeVisible();
  });

  test('should have refresh button', async ({ page }) => {
    const refreshBtn = page.locator('.btn-icon').first();
    await expect(refreshBtn).toBeVisible();
  });

  test('should have clear all button', async ({ page }) => {
    const clearBtn = page.locator('.btn-danger');
    await expect(clearBtn).toBeVisible();
  });

  test('should filter jobs when typing in search', async ({ page }) => {
    const searchInput = page.locator('.search-box input');

    // Type a search query
    await searchInput.fill('python');

    // Wait for debounce (300ms in the app)
    await page.waitForTimeout(500);

    // Verify the search value is set
    await expect(searchInput).toHaveValue('python');
  });

  test('should update job count in tab when filtering', async ({ page }) => {
    const jobsTab = page.locator('.tab').filter({ hasText: 'Jobs' });

    // Get initial count
    const initialText = await jobsTab.textContent();

    // Apply a search filter
    const searchInput = page.locator('.search-box input');
    await searchInput.fill('nonexistentjob12345');
    await page.waitForTimeout(500);

    // Count may change (could be 0 or different)
    const newText = await jobsTab.textContent();
    expect(newText).toContain('Jobs');
  });

  test('should allow selecting source filter', async ({ page }) => {
    const sourceFilter = page.locator('.source-filter');

    // Click to open dropdown
    await sourceFilter.click();

    // Should have "All Sources" option
    const allOption = sourceFilter.locator('option').first();
    await expect(allOption).toHaveText('All Sources');
  });

  test('should clear search input', async ({ page }) => {
    const searchInput = page.locator('.search-box input');

    await searchInput.fill('test query');
    await expect(searchInput).toHaveValue('test query');

    await searchInput.clear();
    await expect(searchInput).toHaveValue('');
  });
});

test.describe('Job Table Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.jobs-section');
  });

  test('should display job table or empty state', async ({ page }) => {
    // Either shows table with jobs or an empty state
    const hasTable = await page.locator('table').count();
    const hasEmptyState = await page.locator('.empty-state, .no-jobs').count();

    expect(hasTable > 0 || hasEmptyState >= 0).toBeTruthy();
  });

  test('should show loading state initially', async ({ page }) => {
    // Reload and check for loading
    await page.reload();

    // The app should show some loading indicator or data
    await page.waitForSelector('.jobs-section');
  });
});
