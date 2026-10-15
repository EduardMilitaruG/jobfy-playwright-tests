import { test, expect } from '@playwright/test';
import { SEEDED_JOBS } from '../fixtures/seed-data';

// These tests drive destructive UI flows (delete, clear all) and an outage.
// page.route() intercepts the browser's API calls, so the UI behaviour is real
// but the shared seeded database is never modified. The real DELETE endpoint
// is covered separately in tests/api/jobs-delete.destructive.spec.ts.

const job = SEEDED_JOBS.fullStack;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: job.jobTitle })).toBeVisible();
});

test('deleting a job asks for confirmation, calls the API, and removes the row', async ({
  page,
  request,
}) => {
  const { data } = await (await request.get('/api/jobs', { params: { search: job.jobTitle } })).json();
  const jobId: number = data[0].id;

  await page.route(`**/api/jobs/${jobId}`, (route) =>
    route.request().method() === 'DELETE'
      ? route.fulfill({ json: { message: 'Job deleted', id: jobId } })
      : route.continue(),
  );
  const row = page.getByRole('row').filter({ hasText: job.jobTitle });

  await row.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText(`Delete "${job.jobTitle}" at ${job.company}?`)).toBeVisible();

  const deleteRequest = page.waitForRequest(
    (req) => req.method() === 'DELETE' && req.url().endsWith(`/api/jobs/${jobId}`),
  );
  await page.getByRole('button', { name: 'Confirm' }).click();
  await deleteRequest;

  await expect(page.getByRole('link', { name: job.jobTitle })).toBeHidden();
  // Other jobs are untouched.
  await expect(page.getByRole('link', { name: SEEDED_JOBS.react.jobTitle })).toBeVisible();
});

test('cancelling the delete dialog sends no request', async ({ page }) => {
  let deleteCalls = 0;
  page.on('request', (req) => {
    if (req.method() === 'DELETE') deleteCalls++;
  });

  await page.getByRole('row').filter({ hasText: job.jobTitle }).getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(page.getByText(/Delete ".*" at/)).toBeHidden();
  await expect(page.getByRole('link', { name: job.jobTitle })).toBeVisible();
  expect(deleteCalls).toBe(0);
});

test('Clear all empties the list after confirmation', async ({ page }) => {
  await page.route('**/api/jobs', (route) =>
    route.request().method() === 'DELETE'
      ? route.fulfill({ json: { message: 'Deleted 5 jobs' } })
      : route.continue(),
  );

  await page.getByRole('button', { name: 'Clear all' }).click();
  await expect(page.getByText('Are you sure you want to delete all jobs?')).toBeVisible();
  await page.getByRole('button', { name: 'Confirm' }).click();

  await expect(page.getByText(/No jobs found/)).toBeVisible();
});

test('shows an error banner when the jobs API fails', async ({ page }) => {
  await page.route('**/api/jobs?*', (route) => route.fulfill({ status: 500, json: { error: 'boom' } }));

  // Trigger a fresh fetch with the failing API in place.
  await page.getByRole('button', { name: 'Refresh' }).click();

  await expect(page.getByRole('alert')).toHaveText(/Failed to load jobs/);
});
