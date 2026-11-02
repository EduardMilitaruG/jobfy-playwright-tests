import { test, expect } from '../fixtures/db';

// Runs in the "api-destructive" project, after every other project has
// finished, because it changes the row count that other tests read.
test('DELETE /api/jobs/:id removes the job', async ({ request, createJob }) => {
  const id = await createJob();
  expect((await request.get(`/api/jobs/${id}`)).status()).toBe(200);

  const res = await request.delete(`/api/jobs/${id}`);

  expect(res.status()).toBe(200);
  expect(await res.json()).toEqual({ message: 'Job deleted', id });
  // The real proof: it's gone.
  expect((await request.get(`/api/jobs/${id}`)).status()).toBe(404);
});
