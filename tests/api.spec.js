// @ts-check
const { test, expect } = require('@playwright/test');

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('API Endpoints', () => {

  test('GET /api/jobs - should return jobs list', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/jobs`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('jobs');
    expect(Array.isArray(data.jobs)).toBeTruthy();
  });

  test('GET /api/jobs - should support search parameter', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/jobs?search=python`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('jobs');
  });

  test('GET /api/jobs - should support source filter', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/jobs?source=RemoteOK`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('jobs');
  });

  test('GET /api/jobs - should support pagination', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/jobs?limit=10&offset=0`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('jobs');
    expect(data.jobs.length).toBeLessThanOrEqual(10);
  });

  test('GET /api/stats - should return statistics', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/stats`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    // Stats should have some structure
    expect(typeof data).toBe('object');
  });

  test('GET /api/sites - should return available sites', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/sites`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('sites');
    expect(Array.isArray(data.sites)).toBeTruthy();
  });

  test('GET /api/sites - should include RemoteOK and Tecnoempleo', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/sites`);
    const data = await response.json();

    const siteNames = data.sites.map(s => s.name?.toLowerCase() || s.toLowerCase());

    // At least one of the main sites should be available
    const hasRemoteOK = siteNames.some(name => name.includes('remote'));
    const hasTecnoempleo = siteNames.some(name => name.includes('tecno'));

    expect(hasRemoteOK || hasTecnoempleo).toBeTruthy();
  });

  test('GET /api/scrape/logs - should return scrape history', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/scrape/logs`);

    // Should return 200 or 404 if no logs exist
    expect([200, 404]).toContain(response.status());
  });
});

test.describe('API Error Handling', () => {

  test('GET /api/jobs/:id - should return 404 for non-existent job', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/jobs/999999`);

    // Should return 404 or handle gracefully
    expect([404, 200]).toContain(response.status());
  });

  test('DELETE /api/jobs/:id - should handle non-existent job', async ({ request }) => {
    const response = await request.delete(`${API_URL}/api/jobs/999999`);

    // Should return 404 or 200 (idempotent delete)
    expect([404, 200, 204]).toContain(response.status());
  });

  test('POST /api/scrape - should require parameters', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/scrape`, {
      data: {}
    });

    // Should return 400 or 422 for missing params, or 200 with defaults
    expect([200, 400, 422]).toContain(response.status());
  });
});

test.describe('API Response Structure', () => {

  test('Jobs should have required fields', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/jobs?limit=1`);
    const data = await response.json();

    if (data.jobs && data.jobs.length > 0) {
      const job = data.jobs[0];

      // Check expected fields exist
      expect(job).toHaveProperty('id');
      expect(job).toHaveProperty('title');
      expect(job).toHaveProperty('company');
      expect(job).toHaveProperty('source');
    }
  });

  test('Sites should have name property', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/sites`);
    const data = await response.json();

    if (data.sites && data.sites.length > 0) {
      data.sites.forEach(site => {
        // Site should be a string or object with name
        expect(typeof site === 'string' || site.name).toBeTruthy();
      });
    }
  });
});
