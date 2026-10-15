import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('home page loads on the Jobs tab', async ({ page }) => {
  await expect(page).toHaveTitle('JobFy v2');
  await expect(page.getByRole('heading', { name: 'JobFy', level: 1 })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Search jobs' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Job Title' })).toBeVisible();
});

test('Stats tab shows the four chart sections', async ({ page }) => {
  await page.getByRole('button', { name: 'Stats' }).click();

  for (const heading of ['Jobs by Source', 'Top Companies', 'Most Requested Skills', 'Top Locations']) {
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
  // The jobs table is gone: tabs swap content, they don't stack it.
  await expect(page.getByRole('textbox', { name: 'Search jobs' })).toBeHidden();
});

test('Scrape tab shows the form without starting a scrape', async ({ page }) => {
  // Safety net: if anything ever tried to start a real scrape, fail loudly.
  await page.route('**/api/scrape', (route) =>
    route.request().method() === 'POST' ? route.abort() : route.continue(),
  );

  await page.getByRole('button', { name: 'Scrape' }).click();

  await expect(page.getByRole('heading', { name: 'Start New Scrape' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Recent Scrape Logs' })).toBeVisible();
  await expect(page.getByPlaceholder('e.g., python, react, data engineer')).toBeVisible();
  await expect(page.getByPlaceholder('e.g., Madrid, Remote')).toBeVisible();
});

test('Scrape: sites that need credentials are disabled', async ({ page }) => {
  await page.getByRole('button', { name: 'Scrape' }).click();

  await expect(page.getByRole('button', { name: /InfoJobs/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: /LinkedIn/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'RemoteOK' })).toBeEnabled();
});

test('Scrape: Start is disabled once no site is selected', async ({ page }) => {
  await page.getByRole('button', { name: 'Scrape' }).click();
  const start = page.getByRole('button', { name: 'Start Scraping' });

  // RemoteOK is preselected, so Start begins enabled.
  await expect(start).toBeEnabled();
  await page.getByRole('button', { name: 'RemoteOK' }).click(); // deselect
  await expect(start).toBeDisabled();
});

test('CV Match tab shows the upload form', async ({ page }) => {
  await page.getByRole('button', { name: 'CV Match' }).click();

  await expect(page.getByRole('heading', { name: 'AI CV Matcher' })).toBeVisible();
  await expect(page.getByLabel('Upload CV PDF')).toBeAttached();
});

test('switching back to Jobs keeps the list', async ({ page }) => {
  await page.getByRole('button', { name: 'Stats' }).click();
  await page.getByRole('button', { name: 'Jobs' }).click();

  await expect(page.getByRole('link', { name: 'Senior React Developer' })).toBeVisible();
});
