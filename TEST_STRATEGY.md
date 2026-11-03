# Test strategy: JobFy v2

This document explains what this suite tests, what it deliberately doesn't, and why. The
[README](README.md) covers how to run it.

## The product and its risks

JobFy v2 collects job offers from five job boards into one list. Users search and filter the list,
look at stats, and score their CV against jobs with an LLM (Groq). There are no user accounts:
it's a single-user tool backed by one Postgres table of jobs.

The risks that drive the test design, from most to least important:

| Risk | Impact | Where it's tested |
|---|---|---|
| The job list shows wrong, missing or duplicate jobs (bad pagination, filters, search) | The core feature is wrong without anyone noticing | `api/jobs.spec.ts`, `e2e/jobs.spec.ts` |
| A destructive action deletes the wrong data or can't be cancelled | Data loss; scraped jobs can't be recovered | `e2e/job-actions.spec.ts`, `api/jobs-delete.destructive.spec.ts` |
| Bad input crashes a request instead of getting a clear error | Users see "Internal server error" with no way to fix their input; real errors drown in the logs | `api/robustness.spec.ts`, validation cases in the other API specs |
| The UI and the API disagree (counts, stats, chart labels) | Users stop trusting the numbers | `e2e/stats.spec.ts`, `api/stats-and-meta.spec.ts` |
| The layout breaks on phones | People often check job offers on their phone | `e2e/layout.mobile.spec.ts` |
| Scrapers break when a job board changes its HTML | No new jobs come in | **Not automated here** (see below) |

## Test levels

| Level | Where | Count | What belongs there |
|---|---|---:|---|
| Unit and integration | JobFy-v2 repo (Vitest + Supertest) | 72 | Validation schemas, services, React components. Fast, run on every JobFy commit |
| API | `tests/api/`, project `api` | 46 | The HTTP contract against the real backend and a real database: status codes, response shapes, error bodies, boundaries |
| End-to-end | `tests/e2e/`, projects `chromium` and `mobile-chrome` | 29 | User journeys through the real UI, plus layout on a phone viewport |

The split follows one rule: **test each behaviour at the lowest level that can see it.** Input
validation and error codes are API tests, because driving them through the browser would be
slower and less precise. Browser tests are kept for what only a browser shows: rendering,
navigation, confirm dialogs, debounced search and layout.

## Test data

- **Read-only tests use the seed.** `tests/fixtures/seed-data.ts` mirrors JobFy's
  `prisma/seed.ts`. Count checks compare one endpoint against another instead of hard-coding
  numbers, so a scrape run on a dev database doesn't break them.
- **Tests that write create their own data.** The real `DELETE` test inserts a row through a `pg`
  fixture and always cleans it up. It runs in its own Playwright project after every read-only
  project has finished.
- **UI tests for destructive actions mock the network.** Delete and Clear all intercept the request
  with `page.route()`, so the dialog and the request are real but the database is never touched.

## Not automated, on purpose

| Area | Why not | How it's covered instead |
|---|---|---|
| Real scraping | Hits third-party sites: slow, flaky, often against their terms, and the results change daily | Here, only input validation. In JobFy-v2, Jest tests run the Tecnoempleo, InfoJobs, LinkedIn and Indeed parsers on saved HTML pages |
| AI CV scoring and cover letters | Calls the paid Groq API and the output isn't deterministic | Everything before the API call is tested: file type, size, PDF magic bytes, payload validation, missing job |
| Cross-browser (Firefox, WebKit) | The UI uses no browser-specific APIs; one desktop and one mobile viewport catch layout bugs for less CI time | Chromium desktop + Pixel 5 emulation |
| Visual regression | The UI is still changing; screenshot baselines would need updating with nearly every commit | Role-based assertions on content and layout |
| Load and performance | Single-user tool with one table of a few hundred rows | None yet |

## Known gaps

- The saved HTML pages only prove the parsers work on markup from the day it was saved. Nothing
  checks the live job boards, so a markup change is only noticed when a real scrape returns
  nothing. A scheduled canary scrape of one page per board would catch it.
- The RemoteOK scraper reads a JSON API and has no parser test.
- No accessibility audit (axe-core) on the UI. My portfolio suite has one; this one should too.

## Defect handling

1. A bug found while writing tests gets a test that asserts the **correct** behaviour, marked
   `test.fail()` with the bug number and cause. CI stays green, and the bug is documented in the code.
2. The bug is logged in the README's [Bugs found](README.md#bugs-found) table with the expected and
   actual result and a severity.
3. When it's fixed in JobFy v2, Playwright reports the test as an unexpected pass. The marker is
   removed, and the test stays as a regression check.

**Severity** is about impact on the user, not on the code:

| Severity | Meaning |
|---|---|
| High | Data loss, wrong data shown as correct, or a core feature unusable |
| Medium | A user hits it in normal use and gets no useful way forward |
| Low | Needs unusual input, or only affects API clients and logs |

## Risks outside the suite

These are design findings rather than test failures:

- **No authentication, including on `DELETE /api/jobs`,** which wipes every job. That's fine
  while JobFy only runs locally. It must change before the API is deployed anywhere public.
- **`cors()` allows every origin.** That has no effect without authentication, but should become an
  allowlist at the same time authentication is added.
- **`X-Powered-By: Express` is sent on every response.** It's a small information leak;
  `app.disable('x-powered-by')` or `helmet` removes it.

## CI and exit criteria

Every push, every pull request and every night, CI starts Postgres, migrates and seeds it, starts
the JobFy backend and frontend, and runs the full suite (see the README's [CI](README.md#ci)
section). A run passes when:

- the typecheck passes,
- and every test passes, or fails as expected under its `test.fail()` marker.

CI allows one retry. Playwright marks a test that only passed on retry as flaky in the report,
and a flaky test gets fixed rather than tolerated.
