import { request } from '@playwright/test';

// Runs once before all tests. If JobFy v2 isn't up, stop here with one clear
// error instead of letting every test time out on its own.
export default async function globalSetup() {
  const apiUrl = process.env.API_URL ?? 'http://localhost:3000';
  const ctx = await request.newContext();
  try {
    const res = await ctx.get(`${apiUrl}/api/health`, { timeout: 5_000 });
    if (!res.ok()) throw new Error(`HTTP ${res.status()}`);
  } catch (err) {
    throw new Error(
      `JobFy v2 backend is not reachable at ${apiUrl}/api/health (${String(err)}).\n` +
        'Start it first; see "Running locally" in the README.',
    );
  } finally {
    await ctx.dispose();
  }
}
