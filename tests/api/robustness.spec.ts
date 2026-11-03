import { test, expect, type APIResponse } from '@playwright/test';
import { SEEDED_JOB_COUNT, MISSING_JOB_ID } from '../fixtures/seed-data';

// Negative and boundary tests: what the API does with input a real client
// shouldn't send but an attacker, a buggy client or a proxy will.
//
// The contract checked here: a bad request gets a 4xx with a JSON
// `{ error }` body. A 500 means the server didn't anticipate the input.
//
// Tests tagged @bugN are regression tests for the bugs this spec found (see
// the README); all were fixed in JobFy-v2#3.

// One past the largest Postgres `integer`, the type of every id column.
const INT4_OVERFLOW = 2_147_483_648;

async function expectJsonError(res: APIResponse, status: number) {
  expect(res.status()).toBe(status);
  expect(res.headers()['content-type']).toContain('application/json');
  const body = await res.json();
  expect(body.error).toEqual(expect.any(String));
  // Error bodies must not leak internals (stack traces, SQL, file paths).
  expect(JSON.stringify(body)).not.toMatch(/at .+\.(ts|js):\d+|prisma|SELECT |node_modules/i);
}

test.describe('Request body parsing', () => {
  test('malformed JSON is rejected with 400 @bug4', async ({ request }) => {
    const res = await request.post('/api/scrape', {
      headers: { 'content-type': 'application/json' },
      data: '{"sites": [',
    });
    await expectJsonError(res, 400);
  });

  test('a JSON body over the 100 kB limit is rejected with 413 @bug5', async ({ request }) => {
    const res = await request.post('/api/cv-match/from-text', {
      data: { resumeText: 'a'.repeat(120_000) },
    });
    await expectJsonError(res, 413);
  });

  test('a wrongly typed field is rejected with 400 and names the field', async ({ request }) => {
    const res = await request.post('/api/cv-match/from-text', {
      data: { resumeText: 'QA engineer', jobIds: '1' },
    });
    await expectJsonError(res, 400);
    expect((await res.json()).details[0].path).toEqual(['jobIds']);
  });
});

// Uploads are rejected before anything reaches the Groq API.
test.describe('CV upload limits', () => {
  test('a file that is not declared as a PDF is rejected with 400 @bug6', async ({ request }) => {
    const res = await request.post('/api/cv-match', {
      multipart: {
        resume: { name: 'cv.txt', mimeType: 'text/plain', buffer: Buffer.from('plain text CV') },
      },
    });
    await expectJsonError(res, 400);
  });

  test('a PDF over the 5 MB limit is rejected with 413 @bug7', async ({ request }) => {
    const res = await request.post('/api/cv-match', {
      multipart: {
        resume: {
          name: 'cv.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(6 * 1024 * 1024)]),
        },
      },
    });
    await expectJsonError(res, 413);
  });
});

test.describe('Path ids', () => {
  test('GET /api/scrape/logs/:id rejects a non-numeric id with 400 @bug8', async ({ request }) => {
    await expectJsonError(await request.get('/api/scrape/logs/abc'), 400);
  });

  test('GET /api/scrape/logs/:id returns 404 for a missing log', async ({ request }) => {
    await expectJsonError(await request.get(`/api/scrape/logs/${MISSING_JOB_ID}`), 404);
  });

  // An id the database type can't hold can't exist: 400 or 404 are both
  // reasonable, a 500 is not.
  for (const path of ['/api/jobs', '/api/scrape/logs']) {
    test(`GET ${path}/:id handles an id above the int4 range @bug9`, async ({ request }) => {
      const res = await request.get(`${path}/${INT4_OVERFLOW}`);
      expect([400, 404]).toContain(res.status());
      await expectJsonError(res, res.status());
    });
  }

  test('POST /api/cv-match/cover-letter returns 404 for a missing job @bug10', async ({
    request,
  }) => {
    // The job lookup happens before the AI call, so this never reaches Groq.
    const res = await request.post('/api/cv-match/cover-letter', {
      data: { resumeText: 'QA engineer with Playwright experience', jobId: MISSING_JOB_ID },
    });
    await expectJsonError(res, 404);
  });
});

test.describe('Search input', () => {
  // None of the seeded titles, companies or tags contain these characters,
  // so a literal search must find nothing.
  for (const char of ['%', '_']) {
    test(`"${char}" is matched literally, not as a SQL wildcard @bug11`, async ({ request }) => {
      const res = await request.get('/api/jobs', { params: { search: char } });
      expect(res.status()).toBe(200);
      expect((await res.json()).total).toBe(0);
    });
  }

  const literalInputs = [
    { name: 'SQL injection attempt', search: "' OR 1=1 --" },
    { name: 'HTML/script tag', search: '<script>alert(1)</script>' },
    { name: 'non-ASCII text', search: 'ingeniería ñ 测试 🚀' },
  ];
  for (const { name, search } of literalInputs) {
    test(`treats ${name} as plain text`, async ({ request }) => {
      const res = await request.get('/api/jobs', { params: { search } });

      expect(res.status()).toBe(200);
      expect(await res.json()).toMatchObject({ data: [], total: 0 });
    });
  }

  test('a repeated query parameter is rejected with 400', async ({ request }) => {
    await expectJsonError(await request.get('/api/jobs?search=react&search=python'), 400);
  });

  test('a fractional limit is rejected with 400', async ({ request }) => {
    await expectJsonError(await request.get('/api/jobs?limit=1.5'), 400);
  });

  test('an offset past the end returns an empty page with the real total', async ({ request }) => {
    const res = await request.get('/api/jobs', { params: { offset: 1_000_000 } });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
    expect(body.total).toBeGreaterThanOrEqual(SEEDED_JOB_COUNT);
  });
});

test.describe('Unknown routes', () => {
  const cases = [
    { name: 'an unknown path', method: 'get', path: '/api/does-not-exist' },
    { name: 'an unsupported method', method: 'put', path: '/api/jobs/1' },
  ] as const;
  for (const { name, method, path } of cases) {
    test(`${name} gets a JSON 404, not an HTML page @bug12`, async ({ request }) => {
      await expectJsonError(await request[method](path), 404);
    });
  }
});
