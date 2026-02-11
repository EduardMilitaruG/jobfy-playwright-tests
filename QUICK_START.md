# Quick Start Guide

Get up and running with the JobFy test suite in minutes.

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers
npx playwright install
```

## Running Tests

### Quick Commands

```bash
# Run everything
npm test

# E2E tests only (fastest for UI validation)
npm run test:e2e

# Unit tests only (fastest for logic validation)
npm run test:unit

# Watch mode for development
npm run test:unit:watch
```

## Common Workflows

### Development Workflow

```bash
# 1. Start with unit tests in watch mode
npm run test:unit:watch

# 2. Write your code and tests
# Tests auto-run on file changes

# 3. Run E2E tests when ready
npm run test:e2e:chromium  # Single browser for speed
```

### Pre-Commit Workflow

```bash
# Run all tests before committing
npm test

# Generate coverage
npm run coverage

# View coverage report
npm run report:coverage
```

### Debugging Workflow

```bash
# Debug E2E test
npm run debug

# Debug Jest test
npm run debug:jest

# Run single test file
npx playwright test tests/jobs.spec.js --debug
npx jest tests/unit/utils/string.test.js --verbose
```

## Test Types Quick Reference

| Command | Type | Speed | Use Case |
|---------|------|-------|----------|
| `npm run test:unit` | Unit | ⚡️ Fast | Logic testing |
| `npm run test:integration` | API | ⚡️ Fast | API testing |
| `npm run test:e2e:chromium` | E2E | 🐢 Slow | UI testing (single browser) |
| `npm run test:e2e` | E2E | 🐌 Slowest | Full cross-browser testing |

## Coverage Reports

```bash
# Generate and view coverage
npm run coverage:jest
npm run report:coverage

# Location: coverage/jest/index.html
```

## Environment Setup

Create `.env` file (optional):

```env
BASE_URL=http://localhost:5173
API_URL=http://localhost:8000
```

## Troubleshooting

### Port in Use

```bash
# Kill processes on ports
lsof -ti:5173 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

### Browsers Not Installed

```bash
npx playwright install --with-deps
```

### Tests Failing

```bash
# Check if app is running
curl http://localhost:5173
curl http://localhost:8000/jobs

# View detailed error logs
npm run test:e2e -- --reporter=list
npm run test:unit -- --verbose
```

## Next Steps

- Read [TESTING.md](TESTING.md) for comprehensive documentation
- Check [README.md](README.md) for full test coverage details
- Review existing tests in `/tests` directory for examples

## Tips

- Use watch mode during development for instant feedback
- Run unit tests first (fastest)
- Run E2E tests on single browser during development
- Full test suite before committing
- Check coverage reports to identify gaps

## Help

```bash
# Playwright help
npx playwright test --help

# Jest help
npx jest --help

# View HTML reports
npm run report:e2e     # E2E report
npm run report:jest    # Unit/Integration report
```
