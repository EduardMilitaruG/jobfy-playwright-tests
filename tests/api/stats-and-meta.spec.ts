import { test, expect } from '@playwright/test';

test.describe('GET /api/health', () => {
  test('reports ok', async ({ request }) => {
    const res = await request.get('/api/health');

    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });
});

test.describe('GET /api/stats', () => {
  test('returns all aggregate sections with {name, count} entries', async ({ request }) => {
    const res = await request.get('/api/stats');
    expect(res.status()).toBe(200);
    const stats = await res.json();

    expect(stats.totalJobs).toEqual(expect.any(Number));
    const sections = [
      ['bySource', 'source'],
      ['byCompany', 'company'],
      ['byLocation', 'location'],
      ['topTags', 'tag'],
    ] as const;
    for (const [section, key] of sections) {
      expect(Array.isArray(stats[section]), `${section} is an array`).toBe(true);
      for (const entry of stats[section]) {
        expect(entry).toEqual({ [key]: expect.any(String), count: expect.any(Number) });
      }
    }
  });

  test('is consistent with the jobs endpoint', async ({ request }) => {
    const stats = await (await request.get('/api/stats')).json();
    const jobs = await (await request.get('/api/jobs?limit=1')).json();

    // Two independent queries over the same table must agree.
    expect(stats.totalJobs).toBe(jobs.total);

    // Every job has exactly one source, so per-source counts sum to the total.
    const sumBySource = stats.bySource.reduce((n: number, s: { count: number }) => n + s.count, 0);
    expect(sumBySource).toBe(stats.totalJobs);
  });
});

test.describe('GET /api/sites', () => {
  test('lists the five supported job boards', async ({ request }) => {
    const res = await request.get('/api/sites');
    expect(res.status()).toBe(200);
    const { sites } = await res.json();

    expect(sites.map((s: { id: string }) => s.id).sort()).toEqual(
      ['indeed', 'infojobs', 'linkedin', 'remoteok', 'tecnoempleo'],
    );
    for (const site of sites) {
      expect(site).toEqual({
        id: expect.any(String),
        name: expect.any(String),
        requiresAuth: expect.any(Boolean),
      });
    }
  });
});

// Only invalid payloads here: a valid POST /api/scrape would hit real job
// boards, which tests must never do. Validation rejects these before any
// scraping starts.
test.describe('POST /api/scrape validation', () => {
  const cases = [
    { name: 'missing sites', body: {} },
    { name: 'empty sites array', body: { sites: [] } },
    { name: 'unknown site id', body: { sites: ['monster'] } },
    { name: 'keyword over 100 chars', body: { sites: ['remoteok'], keyword: 'x'.repeat(101) } },
  ];
  for (const { name, body } of cases) {
    test(`rejects ${name} with 400`, async ({ request }) => {
      const res = await request.post('/api/scrape', { data: body });

      expect(res.status()).toBe(400);
      expect((await res.json()).error).toBe('Validation error');
    });
  }
});

// Same idea for CV matching: only requests that fail before the Groq API call.
test.describe('POST /api/cv-match validation', () => {
  test('rejects a request with no file', async ({ request }) => {
    const res = await request.post('/api/cv-match', { multipart: {} });

    expect(res.status()).toBe(400);
    expect(await res.json()).toEqual({ error: 'PDF file required' });
  });

  test('rejects a non-PDF file even if it claims to be a PDF', async ({ request }) => {
    const res = await request.post('/api/cv-match', {
      multipart: {
        resume: {
          name: 'cv.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from('this is plain text, not a PDF'),
        },
      },
    });

    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/valid PDF/);
  });

  test('from-text rejects an empty resume', async ({ request }) => {
    const res = await request.post('/api/cv-match/from-text', { data: { resumeText: '' } });

    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe('Validation error');
  });
});
