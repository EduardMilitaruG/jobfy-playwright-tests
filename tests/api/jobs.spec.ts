import { test, expect } from '@playwright/test';
import { SEEDED_JOBS, SEEDED_JOB_COUNT, MISSING_JOB_ID } from '../fixtures/seed-data';

test.describe('GET /api/jobs', () => {
  test('returns a paginated list with the documented shape', async ({ request }) => {
    const res = await request.get('/api/jobs');

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      data: expect.any(Array),
      total: expect.any(Number),
      limit: 100, // schema default
      offset: 0,
    });
    expect(body.total).toBeGreaterThanOrEqual(SEEDED_JOB_COUNT);

    // Every job has the fields the frontend renders.
    for (const job of body.data) {
      expect(job).toMatchObject({
        id: expect.any(Number),
        jobTitle: expect.any(String),
        company: expect.any(String),
        location: expect.any(String),
        tags: expect.any(String),
        applyLink: expect.any(String),
        source: expect.any(String),
        createdAt: expect.any(String),
      });
    }
  });

  test('limit and offset page through results without overlap', async ({ request }) => {
    const page1 = await (await request.get('/api/jobs?limit=2&offset=0')).json();
    const page2 = await (await request.get('/api/jobs?limit=2&offset=2')).json();

    expect(page1.data).toHaveLength(2);
    expect(page2.data).toHaveLength(2);
    expect(page1.limit).toBe(2);
    expect(page2.offset).toBe(2);

    const ids1 = page1.data.map((j: { id: number }) => j.id);
    const ids2 = page2.data.map((j: { id: number }) => j.id);
    expect(ids1.filter((id: number) => ids2.includes(id))).toEqual([]);
  });

  test('search matches title or tags, case-insensitively', async ({ request }) => {
    const res = await request.get('/api/jobs', { params: { search: 'PYTHON' } });
    const body = await res.json();
    const titles = body.data.map((j: { jobTitle: string }) => j.jobTitle);

    // "Backend Engineer (Python)" matches on title, "Data Scientist" only on tags.
    expect(titles).toEqual(
      expect.arrayContaining([SEEDED_JOBS.python.jobTitle, SEEDED_JOBS.dataScientist.jobTitle]),
    );
    expect(titles).not.toContain(SEEDED_JOBS.devops.jobTitle);
  });

  test('source filter returns only jobs from that source', async ({ request }) => {
    const res = await request.get('/api/jobs', { params: { source: 'LinkedIn' } });
    const body = await res.json();

    expect(body.data.length).toBeGreaterThan(0);
    for (const job of body.data) expect(job.source).toBe('LinkedIn');
  });

  test('search with no matches returns an empty list, not an error', async ({ request }) => {
    const res = await request.get('/api/jobs', { params: { search: 'zzz-no-such-job-zzz' } });

    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ data: [], total: 0 });
  });

  // Data-driven: each invalid query param must be rejected by Zod with a 400,
  // and the error must name the offending field.
  const invalidQueries = [
    { query: 'limit=abc', field: 'limit', why: 'not a number' },
    { query: 'limit=0', field: 'limit', why: 'below minimum of 1' },
    { query: 'limit=501', field: 'limit', why: 'above maximum of 500' },
    { query: 'offset=-1', field: 'offset', why: 'negative offset' },
    { query: `search=${'a'.repeat(201)}`, field: 'search', why: 'search over 200 chars' },
  ];
  for (const { query, field, why } of invalidQueries) {
    test(`rejects ${why} with 400`, async ({ request }) => {
      const res = await request.get(`/api/jobs?${query}`);

      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.error).toBe('Validation error');
      expect(body.details[0].path).toEqual([field]);
    });
  }
});

test.describe('GET /api/jobs/:id', () => {
  test('returns a single job that matches the list entry', async ({ request }) => {
    const list = await (
      await request.get('/api/jobs', { params: { search: SEEDED_JOBS.devops.jobTitle } })
    ).json();
    const fromList = list.data[0];

    const res = await request.get(`/api/jobs/${fromList.id}`);

    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual(fromList);
  });

  test('returns 404 for an id that does not exist', async ({ request }) => {
    const res = await request.get(`/api/jobs/${MISSING_JOB_ID}`);

    expect(res.status()).toBe(404);
    expect(await res.json()).toEqual({ error: 'Job not found' });
  });

  test('returns 400 for a non-numeric id', async ({ request }) => {
    // Regression test for bug #1 (was a 500: Number('abc') -> NaN reached Prisma).
    const res = await request.get('/api/jobs/abc');
    expect(res.status()).toBe(400);
  });
});

test.describe('DELETE /api/jobs/:id', () => {
  test('returns 404 for an id that does not exist', async ({ request }) => {
    // Regression test for bug #2 (was a 500: Prisma's P2025 wasn't handled).
    const res = await request.delete(`/api/jobs/${MISSING_JOB_ID}`);
    expect(res.status()).toBe(404);
  });
});
