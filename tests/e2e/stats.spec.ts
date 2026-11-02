import { test, expect, type Page } from '@playwright/test';

// StatCard renders <span value/><span label/> with no ARIA role, so the
// locator anchors on the visible label text and reads its parent. Adding
// role/aria attributes to StatCard would let this use getByRole instead.
const statCard = (page: Page, label: string) =>
  page.getByText(label, { exact: true }).locator('..');

test('stat cards show the same numbers as /api/stats', async ({ page, request }) => {
  const stats = await (await request.get('/api/stats')).json();

  await page.goto('/');
  await page.getByRole('button', { name: 'Stats' }).click();

  await expect(statCard(page, 'Total Jobs')).toContainText(String(stats.totalJobs));
  await expect(statCard(page, 'Companies')).toContainText(String(stats.byCompany.length));
  await expect(statCard(page, 'Locations')).toContainText(String(stats.byLocation.length));
  await expect(statCard(page, 'Unique Tags')).toContainText(String(stats.topTags.length));
});

test('Top Companies chart labels every company', async ({ page, request }) => {
  const { byCompany } = await (await request.get('/api/stats')).json();

  await page.goto('/');
  await page.getByRole('button', { name: 'Stats' }).click();

  for (const { company } of byCompany) {
    await expect(page.getByText(company, { exact: true }).first()).toBeVisible();
  }
});
