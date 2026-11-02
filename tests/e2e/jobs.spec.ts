import { test, expect, type Page } from '@playwright/test';
import { SEEDED_JOBS } from '../fixtures/seed-data';

const jobLink = (page: Page, title: string) => page.getByRole('link', { name: title, exact: true });
const jobRow = (page: Page, title: string) =>
  page.getByRole('row').filter({ has: jobLink(page, title) });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Wait for data, not for a timer.
  await expect(jobLink(page, SEEDED_JOBS.react.jobTitle)).toBeVisible();
});

test('lists every seeded job', async ({ page }) => {
  for (const job of Object.values(SEEDED_JOBS)) {
    await expect(jobLink(page, job.jobTitle)).toBeVisible();
  }
});

test('Jobs tab badge matches the total reported by the API', async ({ page, request }) => {
  const { total } = await (await request.get('/api/jobs?limit=1')).json();

  await expect(page.getByRole('button', { name: 'Jobs' })).toContainText(`(${total})`);
});

test('a job row shows company, location and source', async ({ page }) => {
  const job = SEEDED_JOBS.python;
  const row = jobRow(page, job.jobTitle);

  await expect(row).toContainText(job.company);
  await expect(row).toContainText(job.location);
  await expect(row).toContainText(job.source);
  await expect(row).toContainText('FastAPI'); // a tag
});

test('job title links to the posting in a new tab', async ({ page }) => {
  const link = jobLink(page, SEEDED_JOBS.devops.jobTitle);

  await expect(link).toHaveAttribute('href', SEEDED_JOBS.devops.applyLink);
  await expect(link).toHaveAttribute('target', '_blank');
  // Security: new tabs opened from user data must not get window.opener.
  await expect(link).toHaveAttribute('rel', /noopener/);
});

test.describe('search', () => {
  test('filters by title', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Search jobs' }).fill('DevOps');

    await expect(jobLink(page, SEEDED_JOBS.devops.jobTitle)).toBeVisible();
    await expect(jobLink(page, SEEDED_JOBS.react.jobTitle)).toBeHidden();
  });

  test('also matches tags', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Search jobs' }).fill('python');

    await expect(jobLink(page, SEEDED_JOBS.python.jobTitle)).toBeVisible();
    // "Data Scientist" has no "python" in the title; it matches on its tags.
    await expect(jobLink(page, SEEDED_JOBS.dataScientist.jobTitle)).toBeVisible();
    await expect(jobLink(page, SEEDED_JOBS.devops.jobTitle)).toBeHidden();
  });

  test('sends the term to the API after debouncing', async ({ page }) => {
    const searchRequest = page.waitForRequest(
      (req) => req.url().includes('/api/jobs') && new URL(req.url()).searchParams.get('search') === 'react',
    );
    await page.getByRole('textbox', { name: 'Search jobs' }).pressSequentially('react');

    // One request with the full term, not one per keystroke.
    await searchRequest;
  });

  test('shows the empty state when nothing matches', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Search jobs' }).fill('zzz-no-such-job-zzz');

    await expect(page.getByText(/No jobs found/)).toBeVisible();
    await expect(page.getByRole('table')).toBeHidden();
  });

  test('clearing the search restores the full list', async ({ page }) => {
    const search = page.getByRole('textbox', { name: 'Search jobs' });
    await search.fill('DevOps');
    await expect(jobLink(page, SEEDED_JOBS.react.jobTitle)).toBeHidden();

    await search.clear();

    await expect(jobLink(page, SEEDED_JOBS.react.jobTitle)).toBeVisible();
  });
});

test.describe('source filter', () => {
  test('shows only jobs from the selected source', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Filter by source' }).selectOption('LinkedIn');

    await expect(jobLink(page, SEEDED_JOBS.devops.jobTitle)).toBeVisible();
    await expect(jobLink(page, SEEDED_JOBS.react.jobTitle)).toBeHidden();
    await expect(jobLink(page, SEEDED_JOBS.python.jobTitle)).toBeHidden();
  });

  test('combines with search', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Filter by source' }).selectOption('InfoJobs');
    await page.getByRole('textbox', { name: 'Search jobs' }).fill('python');

    await expect(jobLink(page, SEEDED_JOBS.python.jobTitle)).toBeVisible();
    // Matches "python" but comes from Indeed, so the source filter excludes it.
    await expect(jobLink(page, SEEDED_JOBS.dataScientist.jobTitle)).toBeHidden();
  });

  test('offers one option per source in the data', async ({ page, request }) => {
    const { bySource } = await (await request.get('/api/stats')).json();
    const select = page.getByRole('combobox', { name: 'Filter by source' });

    // "All Sources" plus one per source.
    await expect(select.getByRole('option')).toHaveCount(bySource.length + 1);
  });
});
