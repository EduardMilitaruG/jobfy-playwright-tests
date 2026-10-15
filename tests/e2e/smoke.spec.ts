import { test, expect } from '@playwright/test';

test('app loads and shows the seeded jobs', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('JobFy v2');
  await expect(page.getByRole('heading', { name: 'JobFy' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Senior React Developer' })).toBeVisible();
});
