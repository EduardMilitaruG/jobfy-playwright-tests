import { test as base } from '@playwright/test';
import pg from 'pg';

// JobFy v2 has no "create job" endpoint (jobs only arrive via scraping), so a
// test that deletes a job inserts its own row straight into Postgres. That way
// destructive tests never touch the seeded jobs other tests rely on.
const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://jobfy:jobfy@localhost:5432/jobfy';

type DbFixtures = {
  /** Inserts a throwaway job and returns its id. Removed after the test if still present. */
  createJob: (overrides?: { jobTitle?: string }) => Promise<number>;
};

export const test = base.extend<DbFixtures>({
  createJob: async ({}, use, testInfo) => {
    const client = new pg.Client({ connectionString: DATABASE_URL });
    await client.connect();
    const created: number[] = [];

    await use(async (overrides = {}) => {
      const unique = `${testInfo.testId}-${Date.now()}-${created.length}`;
      const { rows } = await client.query<{ id: number }>(
        `INSERT INTO jobs (job_title, company, location, salary, tags, apply_link, source)
         VALUES ($1, 'QA Test Co', 'Remote', 'N/A', 'Playwright', $2, 'RemoteOK')
         RETURNING id`,
        [overrides.jobTitle ?? `QA temp job ${unique}`, `https://example.test/qa/${unique}`],
      );
      created.push(rows[0].id);
      return rows[0].id;
    });

    // Teardown runs even if the test failed half-way.
    if (created.length) await client.query('DELETE FROM jobs WHERE id = ANY($1)', [created]);
    await client.end();
  },
});

export { expect } from '@playwright/test';
