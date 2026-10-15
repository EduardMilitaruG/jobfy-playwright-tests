# JobFy v2 – Playwright E2E & API tests

[![E2E](https://github.com/EduardMilitaruG/jobfy-playwright-tests/actions/workflows/e2e.yml/badge.svg)](https://github.com/EduardMilitaruG/jobfy-playwright-tests/actions/workflows/e2e.yml)

End-to-end and API tests for [JobFy v2](https://github.com/EduardMilitaruG/JobFy-v2), a job-board
aggregator built as a monorepo with Express, Prisma, PostgreSQL, React and Vite. The tests are
written in **Playwright + TypeScript** and run against the real app with a seeded database.
Every push and every night, GitHub Actions spins up the whole app and runs the suite against it.

**55 tests in 8 spec files.** Three of them deliberately document bugs found in JobFy v2
(see [Bugs found](#bugs-found)).

## What's covered

| Project | Spec file | Tests | What it checks |
|---|---|---:|---|
| `api` | `tests/api/jobs.spec.ts` | 14 | `GET /api/jobs`: response shape, pagination without overlap, search over title and tags, source filter, empty results; 5 data-driven Zod validation cases (400 plus the failing field); `GET /api/jobs/:id` (match with list, 404); known bugs on bad and missing ids |
| `api` | `tests/api/stats-and-meta.spec.ts` | 11 | `/api/health`; `/api/stats` shape and consistency with `/api/jobs`; `/api/sites`; input validation for `/api/scrape` and `/api/cv-match` |
| `api-destructive` | `tests/api/jobs-delete.destructive.spec.ts` | 1 | A real `DELETE /api/jobs/:id` on a row the test inserts itself |
| `chromium` | `tests/e2e/navigation.spec.ts` | 7 | Every tab renders its content; scrape form guards (auth-only sites disabled, Start disabled with no site) |
| `chromium` | `tests/e2e/jobs.spec.ts` | 12 | Seeded jobs listed, tab badge matches the API, row content, external links (`target=_blank`, `rel=noopener`), debounced search, empty state, source filter alone and combined with search |
| `chromium` | `tests/e2e/job-actions.spec.ts` | 4 | Delete with confirm and with cancel, Clear all, error banner when the API fails, all using network mocks |
| `chromium` | `tests/e2e/stats.spec.ts` | 2 | Stat cards and chart labels match `/api/stats` |
| `mobile-chrome` | `tests/e2e/layout.mobile.spec.ts` | 4 | Pixel 5 viewport: no horizontal scroll, header status hidden, full-width search, touch navigation |

**Not covered:** actual scraping and AI CV scoring. Both call third-party services (job boards and
the Groq API), so the tests only check the input validation that runs before those calls.

## How the suite is designed

- **Locators that describe what the user sees.** Locators use roles and labels such as `getByRole('row').filter({ has: getByRole('link', { name }) })`,
  `getByPlaceholder` and `getByLabel`, never CSS classes. The one exception is the stat cards, which
  have no accessible role; the comment in `stats.spec.ts` explains why.
- **Seeded data, never real job boards.** Expected values live in `tests/fixtures/seed-data.ts`,
  which mirrors JobFy's `prisma/seed.ts`. Count checks compare the UI against the API instead of
  hard-coding numbers.
- **Destructive flows don't touch the shared data.**
  - **In the UI:** delete and clear-all intercept the request with `page.route()`. The confirm dialog, the
    outgoing request and the row disappearing are all real, but the database stays unchanged.
  - **In the API:** the real delete runs on a row the test inserts itself. A `pg` fixture creates the row and
    always removes it afterwards. The test runs in its own project, which uses `dependencies` so that
    it starts only after all read-only tests have finished.
- **Known bugs use `test.fail()`.** The suite stays green while the bug is documented. When the bug
  is fixed, Playwright reports an unexpected pass, so the test can't silently go out of date.
- **Fail fast.** `tests/global-setup.ts` checks `/api/health` once and stops with a clear
  message if the backend isn't running, instead of 55 separate timeouts.

## Bugs found

These were found while writing the suite against JobFy v2 (`main`). Each one has a `test.fail()`
test that asserts the correct behaviour.

| # | Bug | Expected | Actual | Test |
|---|---|---|---|---|
| 1 | `GET /api/jobs/abc` (non-numeric id) | 400 | 500. The id is never validated, so `Number('abc')` gives `NaN` and Prisma throws | `api/jobs.spec.ts` |
| 2 | `DELETE /api/jobs/999999` (missing id) | 404 | 500. Prisma's `P2025` "record not found" error isn't handled | `api/jobs.spec.ts` |
| 3 | Tab bar on a 393 px phone | Fits the screen | 94 px too wide. `.tabs` neither wraps nor scrolls, so "CV Match" is off-screen and the page scrolls sideways | `e2e/layout.mobile.spec.ts` |

## Running locally

**Prerequisites:** Node 20+, Docker (for Postgres), and both repos side by side:

```text
jobfy-qa/
├── JobFy-v2/
└── jobfy-playwright-tests/
```

**1. Start JobFy v2** (from `JobFy-v2/`):

```bash
docker compose up -d postgres
npm ci
npm run build -w packages/shared
cd packages/backend
export DATABASE_URL=postgresql://jobfy:jobfy@localhost:5432/jobfy
npx prisma migrate deploy
npx tsx prisma/seed.ts          # safe to re-run (skipDuplicates on apply_link)
GROQ_API_KEY=dummy npx tsx src/index.ts      # backend on :3000
```

In a second terminal, from `JobFy-v2/packages/frontend`:

```bash
npx vite --port 5173            # frontend on :5173, proxies /api to :3000
```

`GROQ_API_KEY` just has to be non-empty. CV matching itself won't work with a dummy key, and the tests don't need it to.

**2. Run the tests** (from `jobfy-playwright-tests/`):

```bash
npm ci
npx playwright install chromium
npm test
```

| Command | Runs |
|---|---|
| `npm test` | All 55 tests (all projects) |
| `npm run test:api` | API tests only, no browser |
| `npm run test:e2e` | Desktop Chromium UI tests |
| `npm run test:mobile` | Pixel 5 layout tests |
| `npm run test:ui` | Playwright UI mode, for watching and debugging |
| `npm run report` | Opens the last HTML report |
| `npm run typecheck` | `tsc --noEmit` |

If JobFy runs on other ports or another database, set these environment variables:

| Variable | Default |
|---|---|
| `BASE_URL` | `http://localhost:5173` |
| `API_URL` | `http://localhost:3000` |
| `DATABASE_URL` | `postgresql://jobfy:jobfy@localhost:5432/jobfy` (used by the delete fixture) |

## CI

`.github/workflows/e2e.yml` runs on every push to `main`, on pull requests, every night, and on demand. To test
a specific JobFy branch or commit, run it manually and set the `jobfy_ref` input. Each run:

1. Starts a Postgres 16 service container.
2. Checks out this repo and `EduardMilitaruG/JobFy-v2`.
3. Installs JobFy, runs `prisma migrate deploy`, and seeds the database.
4. Starts the backend and frontend, then waits on `/api/health` both directly and through the Vite proxy.
5. Runs a typecheck, then all Playwright projects on Chromium (the browser is cached by Playwright version).
6. Uploads the HTML report as the `playwright-report` artifact. On failure it also uploads traces
   and the backend and frontend logs.

## Project structure

```text
playwright.config.ts         projects: api, chromium, mobile-chrome, api-destructive
tests/
├── global-setup.ts          backend health check before any test
├── fixtures/
│   ├── seed-data.ts         expected seeded jobs
│   └── db.ts                createJob fixture (pg insert + cleanup)
├── api/                     request-based API tests
└── e2e/                     browser tests (*.mobile.spec.ts → mobile project)
.github/workflows/e2e.yml
```

## History

Version 1 of this repo targeted the original JobFy (FastAPI on :8000) and also included Jest
"unit tests" that only exercised helper functions defined inside the test files. All of that was
removed in v3.0.0, and the suite was rebuilt against JobFy v2. The test counts above are the
current, real ones.
