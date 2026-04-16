/**
 * Integration tests — Stats & Sites API
 *
 * Requires JobFy v2 backend running at http://localhost:3000
 */
import supertest from 'supertest';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const request = supertest(API_URL);

describe('GET /api/stats', () => {
  test('returns 200', async () => {
    const res = await request.get('/api/stats');
    expect(res.status).toBe(200);
  });

  test('response has all required fields', async () => {
    const res = await request.get('/api/stats');
    expect(res.body).toHaveProperty('totalJobs');
    expect(res.body).toHaveProperty('bySource');
    expect(res.body).toHaveProperty('byCompany');
    expect(res.body).toHaveProperty('byLocation');
    expect(res.body).toHaveProperty('topTags');
  });

  test('totalJobs is a non-negative number', async () => {
    const res = await request.get('/api/stats');
    expect(typeof res.body.totalJobs).toBe('number');
    expect(res.body.totalJobs).toBeGreaterThanOrEqual(0);
  });

  test('bySource is an array', async () => {
    const res = await request.get('/api/stats');
    expect(Array.isArray(res.body.bySource)).toBe(true);
  });

  test('bySource entries have source and count', async () => {
    const res = await request.get('/api/stats');
    res.body.bySource.forEach((entry: { source: string; count: number }) => {
      expect(entry).toHaveProperty('source');
      expect(entry).toHaveProperty('count');
      expect(typeof entry.count).toBe('number');
    });
  });

  test('byCompany entries have company and count', async () => {
    const res = await request.get('/api/stats');
    res.body.byCompany.forEach((entry: { company: string; count: number }) => {
      expect(entry).toHaveProperty('company');
      expect(entry).toHaveProperty('count');
    });
  });

  test('byLocation entries have location and count', async () => {
    const res = await request.get('/api/stats');
    res.body.byLocation.forEach((entry: { location: string; count: number }) => {
      expect(entry).toHaveProperty('location');
      expect(entry).toHaveProperty('count');
    });
  });

  test('topTags entries have tag and count', async () => {
    const res = await request.get('/api/stats');
    res.body.topTags.forEach((entry: { tag: string; count: number }) => {
      expect(entry).toHaveProperty('tag');
      expect(entry).toHaveProperty('count');
    });
  });

  test('totalJobs equals sum of bySource counts when sources exist', async () => {
    const res = await request.get('/api/stats');
    if (res.body.bySource.length > 0) {
      const sum = res.body.bySource.reduce(
        (acc: number, s: { count: number }) => acc + s.count,
        0
      );
      expect(sum).toBe(res.body.totalJobs);
    }
  });
});

describe('GET /api/sites', () => {
  test('returns 200', async () => {
    const res = await request.get('/api/sites');
    expect(res.status).toBe(200);
  });

  test('response has sites array', async () => {
    const res = await request.get('/api/sites');
    expect(Array.isArray(res.body.sites)).toBe(true);
  });

  test('returns at least 5 sites', async () => {
    const res = await request.get('/api/sites');
    expect(res.body.sites.length).toBeGreaterThanOrEqual(5);
  });

  test('all site objects have id, name, requiresAuth', async () => {
    const res = await request.get('/api/sites');
    res.body.sites.forEach((site: { id: string; name: string; requiresAuth: boolean }) => {
      expect(site).toHaveProperty('id');
      expect(site).toHaveProperty('name');
      expect(site).toHaveProperty('requiresAuth');
      expect(typeof site.requiresAuth).toBe('boolean');
    });
  });

  test('includes remoteok site', async () => {
    const res = await request.get('/api/sites');
    const ids = res.body.sites.map((s: { id: string }) => s.id);
    expect(ids).toContain('remoteok');
  });

  test('includes tecnoempleo site', async () => {
    const res = await request.get('/api/sites');
    const ids = res.body.sites.map((s: { id: string }) => s.id);
    expect(ids).toContain('tecnoempleo');
  });

  test('remoteok does not require auth', async () => {
    const res = await request.get('/api/sites');
    const remoteok = res.body.sites.find((s: { id: string }) => s.id === 'remoteok');
    expect(remoteok).toBeDefined();
    expect(remoteok.requiresAuth).toBe(false);
  });

  test('linkedin requires auth', async () => {
    const res = await request.get('/api/sites');
    const linkedin = res.body.sites.find((s: { id: string }) => s.id === 'linkedin');
    expect(linkedin).toBeDefined();
    expect(linkedin.requiresAuth).toBe(true);
  });
});

describe('GET /api/health', () => {
  test('returns 200 with status ok', async () => {
    const res = await request.get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
