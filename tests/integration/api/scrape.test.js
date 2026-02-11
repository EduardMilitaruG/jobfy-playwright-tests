// Integration tests for Scrape API using Supertest

const request = require('supertest');

const API_URL = process.env.API_URL || 'http://localhost:8000';

describe('Scrape API Integration Tests', () => {
  describe('GET /scrape/sites', () => {
    test('should return list of available scraping sites', async () => {
      const response = await request(API_URL)
        .get('/scrape/sites')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('should return sites with correct structure', async () => {
      const response = await request(API_URL)
        .get('/scrape/sites')
        .expect(200);

      response.body.forEach(site => {
        expect(typeof site).toBe('string');
        expect(site.length).toBeGreaterThan(0);
      });
    });
  });

  describe('POST /scrape', () => {
    test('should accept scrape request with valid data', async () => {
      const scrapeRequest = {
        keyword: 'javascript',
        sites: ['RemoteOK']
      };

      const response = await request(API_URL)
        .post('/scrape')
        .send(scrapeRequest)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('started');
    });

    test('should validate required keyword field', async () => {
      const invalidRequest = {
        sites: ['RemoteOK']
        // Missing keyword
      };

      const response = await request(API_URL)
        .post('/scrape')
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/keyword/i);
    });

    test('should validate required sites field', async () => {
      const invalidRequest = {
        keyword: 'javascript'
        // Missing sites
      };

      const response = await request(API_URL)
        .post('/scrape')
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/sites/i);
    });

    test('should validate sites array is not empty', async () => {
      const invalidRequest = {
        keyword: 'javascript',
        sites: []
      };

      const response = await request(API_URL)
        .post('/scrape')
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should handle multiple sites in request', async () => {
      const scrapeRequest = {
        keyword: 'python developer',
        sites: ['RemoteOK', 'Tecnoempleo']
      };

      const response = await request(API_URL)
        .post('/scrape')
        .send(scrapeRequest)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /scrape/history', () => {
    test('should return scraping history', async () => {
      const response = await request(API_URL)
        .get('/scrape/history')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should return history entries with correct structure', async () => {
      const response = await request(API_URL)
        .get('/scrape/history')
        .expect(200);

      if (response.body.length > 0) {
        const entry = response.body[0];
        expect(entry).toHaveProperty('id');
        expect(entry).toHaveProperty('keyword');
        expect(entry).toHaveProperty('sites');
        expect(entry).toHaveProperty('timestamp');
        expect(entry).toHaveProperty('status');
      }
    });
  });

  describe('GET /scrape/status/:id', () => {
    let scrapeJobId;

    beforeAll(async () => {
      // Start a scrape job to get an ID
      const response = await request(API_URL)
        .post('/scrape')
        .send({
          keyword: 'test',
          sites: ['RemoteOK']
        });

      if (response.body.id) {
        scrapeJobId = response.body.id;
      }
    });

    test('should return status of a scraping job', async () => {
      if (!scrapeJobId) {
        console.warn('No scrape job ID available to test status endpoint');
        return;
      }

      const response = await request(API_URL)
        .get(`/scrape/status/${scrapeJobId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id', scrapeJobId);
      expect(response.body).toHaveProperty('status');
      expect(['pending', 'running', 'completed', 'failed']).toContain(response.body.status);
    });

    test('should return 404 for non-existent scrape job', async () => {
      const response = await request(API_URL)
        .get('/scrape/status/nonexistent-id-12345')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});
