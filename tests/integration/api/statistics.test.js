// Integration tests for Statistics API using Supertest

const request = require('supertest');

const API_URL = process.env.API_URL || 'http://localhost:8000';

describe('Statistics API Integration Tests', () => {
  describe('GET /statistics', () => {
    test('should return statistics data', async () => {
      const response = await request(API_URL)
        .get('/statistics')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    test('should return statistics with correct structure', async () => {
      const response = await request(API_URL)
        .get('/statistics')
        .expect(200);

      // Check for expected statistics properties
      expect(response.body).toHaveProperty('totalJobs');
      expect(typeof response.body.totalJobs).toBe('number');

      if (response.body.bySource) {
        expect(typeof response.body.bySource).toBe('object');
      }

      if (response.body.byDate) {
        expect(Array.isArray(response.body.byDate)).toBe(true);
      }
    });
  });

  describe('GET /statistics/sources', () => {
    test('should return statistics by source', async () => {
      const response = await request(API_URL)
        .get('/statistics/sources')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(typeof response.body).toBe('object');
    });

    test('should return valid source data', async () => {
      const response = await request(API_URL)
        .get('/statistics/sources')
        .expect(200);

      Object.entries(response.body).forEach(([source, count]) => {
        expect(typeof source).toBe('string');
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('GET /statistics/trends', () => {
    test('should return trend data', async () => {
      const response = await request(API_URL)
        .get('/statistics/trends')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body) || typeof response.body === 'object').toBe(true);
    });

    test('should accept time range parameters', async () => {
      const response = await request(API_URL)
        .get('/statistics/trends?period=7days')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('GET /statistics/summary', () => {
    test('should return summary statistics', async () => {
      const response = await request(API_URL)
        .get('/statistics/summary')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('totalJobs');
      expect(typeof response.body.totalJobs).toBe('number');
    });

    test('should include additional summary metrics', async () => {
      const response = await request(API_URL)
        .get('/statistics/summary')
        .expect(200);

      // Check for common statistics properties
      const expectedProps = ['totalJobs', 'sources', 'recentActivity'];
      const hasAtLeastOne = expectedProps.some(prop =>
        response.body.hasOwnProperty(prop)
      );

      expect(hasAtLeastOne).toBe(true);
    });
  });

  describe('Statistics Data Validation', () => {
    test('should return consistent data across endpoints', async () => {
      const [statsResponse, sourcesResponse, summaryResponse] = await Promise.all([
        request(API_URL).get('/statistics'),
        request(API_URL).get('/statistics/sources'),
        request(API_URL).get('/statistics/summary')
      ]);

      expect(statsResponse.status).toBe(200);
      expect(sourcesResponse.status).toBe(200);
      expect(summaryResponse.status).toBe(200);

      // Verify total jobs count is consistent (if present in multiple responses)
      if (statsResponse.body.totalJobs && summaryResponse.body.totalJobs) {
        expect(statsResponse.body.totalJobs).toBe(summaryResponse.body.totalJobs);
      }
    });

    test('should handle empty data gracefully', async () => {
      // Clear all jobs first
      await request(API_URL).delete('/jobs');

      const response = await request(API_URL)
        .get('/statistics')
        .expect(200);

      expect(response.body.totalJobs).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid query parameters', async () => {
      const response = await request(API_URL)
        .get('/statistics/trends?period=invalid')
        .expect((res) => {
          expect([200, 400]).toContain(res.status);
        });

      if (response.status === 400) {
        expect(response.body).toHaveProperty('error');
      }
    });
  });
});
