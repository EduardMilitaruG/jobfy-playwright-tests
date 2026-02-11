// Integration tests for Jobs API using Supertest

const request = require('supertest');

const API_URL = process.env.API_URL || 'http://localhost:8000';

describe('Jobs API Integration Tests', () => {
  describe('GET /jobs', () => {
    test('should return list of jobs', async () => {
      const response = await request(API_URL)
        .get('/jobs')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should return jobs with correct structure', async () => {
      const response = await request(API_URL)
        .get('/jobs')
        .expect(200);

      if (response.body.length > 0) {
        const job = response.body[0];
        expect(job).toHaveProperty('id');
        expect(job).toHaveProperty('title');
        expect(job).toHaveProperty('company');
        expect(job).toHaveProperty('source');
      }
    });

    test('should handle query parameters', async () => {
      const response = await request(API_URL)
        .get('/jobs?source=RemoteOK')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      // If there are results, verify they match the filter
      if (response.body.length > 0) {
        response.body.forEach(job => {
          expect(job.source).toBe('RemoteOK');
        });
      }
    });
  });

  describe('GET /jobs/:id', () => {
    let existingJobId;

    beforeAll(async () => {
      // Get a job ID to use in tests
      const response = await request(API_URL).get('/jobs');
      if (response.body.length > 0) {
        existingJobId = response.body[0].id;
      }
    });

    test('should return a specific job by ID', async () => {
      if (!existingJobId) {
        console.warn('No jobs available to test GET /jobs/:id');
        return;
      }

      const response = await request(API_URL)
        .get(`/jobs/${existingJobId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id', existingJobId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('company');
    });

    test('should return 404 for non-existent job', async () => {
      const response = await request(API_URL)
        .get('/jobs/nonexistent-id-12345')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /jobs', () => {
    test('should create a new job', async () => {
      const newJob = {
        title: 'Test Engineer',
        company: 'Test Company',
        location: 'Remote',
        source: 'Manual',
        url: 'https://example.com/test-job',
        description: 'This is a test job posting'
      };

      const response = await request(API_URL)
        .post('/jobs')
        .send(newJob)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newJob.title);
      expect(response.body.company).toBe(newJob.company);
    });

    test('should validate required fields', async () => {
      const invalidJob = {
        // Missing required fields
        company: 'Test Company'
      };

      const response = await request(API_URL)
        .post('/jobs')
        .send(invalidJob)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /jobs/:id', () => {
    let jobToDelete;

    beforeEach(async () => {
      // Create a job to delete
      const newJob = {
        title: 'Job to Delete',
        company: 'Delete Company',
        location: 'Remote',
        source: 'Test',
        url: 'https://example.com/delete',
        description: 'This job will be deleted'
      };

      const response = await request(API_URL)
        .post('/jobs')
        .send(newJob);

      jobToDelete = response.body;
    });

    test('should delete an existing job', async () => {
      await request(API_URL)
        .delete(`/jobs/${jobToDelete.id}`)
        .expect(200);

      // Verify job is deleted
      await request(API_URL)
        .get(`/jobs/${jobToDelete.id}`)
        .expect(404);
    });

    test('should return 404 when deleting non-existent job', async () => {
      await request(API_URL)
        .delete('/jobs/nonexistent-id-12345')
        .expect(404);
    });
  });

  describe('DELETE /jobs (clear all)', () => {
    test('should clear all jobs', async () => {
      const response = await request(API_URL)
        .delete('/jobs')
        .expect(200);

      expect(response.body).toHaveProperty('message');

      // Verify jobs are cleared
      const jobsResponse = await request(API_URL).get('/jobs');
      expect(jobsResponse.body).toEqual([]);
    });
  });
});
