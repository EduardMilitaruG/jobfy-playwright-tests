import { test, expect } from '@playwright/test';
import { SEEDED_JOBS } from '../fixtures/seed-data';

// Runs only in the "mobile-chrome" project (Pixel 5: 393x851, touch, mobile UA).

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: SEEDED_JOBS.react.jobTitle })).toBeVisible();
});

test('page does not scroll horizontally', async ({ page }) => {
  // Regression test for bug #3 (the ~486px tab bar used to widen the page on a
  // 393px phone; it now scrolls inside itself).
  // A wide table is allowed to scroll inside its own container, but the page
  // itself must fit the viewport.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test('header status is hidden on small screens', async ({ page }) => {
  await expect(page.getByText('System Online')).toBeHidden();
});

test('search box spans the content width', async ({ page }) => {
  const search = page.getByRole('textbox', { name: 'Search jobs' });
  const box = await search.boundingBox();
  const viewport = page.viewportSize()!;

  expect(box).not.toBeNull();
  // Leaves room for page padding, but uses most of the screen.
  expect(box!.width).toBeGreaterThan(viewport.width * 0.7);
});

test('search and tab navigation work with touch', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Search jobs' }).fill('DevOps');
  await expect(page.getByRole('link', { name: SEEDED_JOBS.devops.jobTitle })).toBeVisible();
  await expect(page.getByRole('link', { name: SEEDED_JOBS.react.jobTitle })).toBeHidden();

  await page.getByRole('button', { name: 'Stats' }).tap();
  await expect(page.getByRole('heading', { name: 'Jobs by Source' })).toBeVisible();
});
