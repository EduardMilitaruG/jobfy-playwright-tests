# JobFy Testing Documentation

Comprehensive testing guide for the JobFy application test suite.

## Table of Contents

- [Overview](#overview)
- [Test Types](#test-types)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Coverage Reports](#coverage-reports)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

---

## Overview

This test suite provides comprehensive testing coverage for the JobFy application across three testing levels:

1. **E2E Tests (Playwright)**: Test complete user workflows in real browsers
2. **Unit Tests (Jest)**: Test individual functions and utilities in isolation
3. **Integration Tests (Supertest)**: Test API endpoints and integrations

### Test Statistics

- **E2E Tests**: 48 tests across 6 spec files
- **Unit Tests**: 30+ tests for utility functions
- **Integration Tests**: 25+ API integration tests
- **Total Coverage**: 100+ tests

---

## Test Types

### 1. E2E Tests (Playwright)

Located in `/tests/*.spec.js`

**Purpose**: Validate complete user workflows across multiple browsers

**Test Files**:
- `navigation.spec.js` - Navigation and routing (7 tests)
- `jobs.spec.js` - Jobs tab functionality (10 tests)
- `statistics.spec.js` - Statistics page (4 tests)
- `scrape.spec.js` - Scrape panel (5 tests)
- `api.spec.js` - API endpoints (12 tests)
- `responsive.spec.js` - Responsive design (10 tests)

**Browser Coverage**:
- Chromium (Desktop Chrome)
- Firefox
- WebKit (Safari)
- Mobile Chrome (Pixel 5)

### 2. Unit Tests (Jest)

Located in `/tests/unit/**/*.test.js`

**Purpose**: Test individual functions and utilities in isolation

**Test Files**:
- `utils/string.test.js` - String manipulation utilities
- `utils/validation.test.js` - Input validation functions
- `utils/array.test.js` - Array operations and filtering

**Coverage**:
- String utilities (capitalize, truncate, slugify)
- Validation (email, URL, sanitization)
- Array operations (unique, chunk, groupBy, sortBy)
- Job filtering and sorting logic

### 3. Integration Tests (Supertest)

Located in `/tests/integration/api/**/*.test.js`

**Purpose**: Test API endpoints and integrations

**Test Files**:
- `jobs.test.js` - Jobs API endpoints (GET, POST, DELETE)
- `scrape.test.js` - Scraping functionality and history
- `statistics.test.js` - Statistics and analytics endpoints

**Coverage**:
- CRUD operations on jobs
- Scraping site management
- Statistics aggregation
- Error handling and validation
- Response structure validation

---

## Setup

### Prerequisites

```bash
# Node.js 16+ required
node --version

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file (optional):

```env
# Frontend URL (default: http://localhost:5173)
BASE_URL=http://localhost:5173

# Backend API URL (default: http://localhost:8000)
API_URL=http://localhost:8000

# CI mode (set automatically on CI)
CI=false
```

### Install Playwright Browsers

```bash
npx playwright install
```

---

## Running Tests

### All Tests

```bash
# Run all test types (E2E + Unit + Integration)
npm test
npm run test:all
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific browser
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
npm run test:e2e:mobile

# Run specific test file
npx playwright test tests/jobs.spec.js

# Debug mode
npm run debug
```

### Unit Tests (Jest)

```bash
# Run all unit tests
npm run test:unit

# Watch mode (re-run on changes)
npm run test:unit:watch

# With coverage
npm run test:unit:coverage

# Run specific test file
npx jest tests/unit/utils/string.test.js
```

### Integration Tests (Supertest)

```bash
# Run all integration tests
npm run test:integration

# Watch mode
npm run test:integration:watch

# With coverage
npm run test:integration:coverage

# Run specific test file
npx jest tests/integration/api/jobs.test.js
```

### All Jest Tests

```bash
# Run all Jest tests (unit + integration)
npm run test:jest

# Watch mode
npm run test:jest:watch

# With coverage
npm run test:jest:coverage

# Debug Jest tests
npm run debug:jest
```

---

## Coverage Reports

### Generate Coverage

```bash
# Generate all coverage reports
npm run coverage

# Jest coverage only
npm run coverage:jest

# Playwright coverage only (requires instrumented code)
npm run coverage:e2e
```

### View Coverage Reports

```bash
# View Jest coverage report
npm run report:coverage

# View E2E test report
npm run report:e2e

# View Jest test report
npm run report:jest
```

### Coverage Report Locations

```
coverage/
├── jest/
│   ├── index.html          # Jest coverage HTML report
│   ├── test-report.html    # Jest test results report
│   ├── lcov.info           # LCOV format for CI
│   └── coverage-summary.json
└── c8/
    ├── index.html          # C8 coverage HTML report
    └── lcov.info
```

### Coverage Thresholds

The project enforces minimum coverage thresholds:

- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 70%
- **Statements**: 70%

Tests will fail if coverage falls below these thresholds.

---

## Writing Tests

### E2E Test Example (Playwright)

```javascript
// tests/example.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should perform action', async ({ page }) => {
    // Arrange
    const button = page.locator('[data-testid="submit-button"]');

    // Act
    await button.click();

    // Assert
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

### Unit Test Example (Jest)

```javascript
// tests/unit/utils/example.test.js
describe('Function Name', () => {
  test('should return expected result', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

### Integration Test Example (Supertest)

```javascript
// tests/integration/api/example.test.js
const request = require('supertest');

const API_URL = process.env.API_URL || 'http://localhost:8000';

describe('API Endpoint', () => {
  test('should return data', async () => {
    const response = await request(API_URL)
      .get('/endpoint')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('data');
  });
});
```

### Best Practices

#### E2E Tests
- Use `test.beforeEach()` for common setup
- Wait for `networkidle` state before assertions
- Use descriptive test names
- Group related tests with `test.describe()`
- Take screenshots on failure (automatic)

#### Unit Tests
- Follow AAA pattern (Arrange, Act, Assert)
- Test edge cases and error conditions
- Keep tests isolated and independent
- Mock external dependencies
- Use descriptive test names

#### Integration Tests
- Test actual API endpoints
- Verify response structure and status codes
- Test error handling
- Clean up test data in `afterEach()`
- Use environment variables for API URLs

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run all tests
        run: npm run test:all

      - name: Generate coverage
        run: npm run coverage

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/jest/lcov.info

      - name: Upload test reports
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-reports
          path: |
            playwright-report/
            coverage/
```

### Environment Variables for CI

```bash
CI=true                              # Enable CI mode
BASE_URL=http://localhost:5173       # Frontend URL
API_URL=http://localhost:8000        # Backend API URL
```

---

## Troubleshooting

### Common Issues

#### 1. Playwright Browser Installation

**Problem**: Browsers not installed

**Solution**:
```bash
npx playwright install
npx playwright install --with-deps  # With system dependencies
```

#### 2. Port Already in Use

**Problem**: `EADDRINUSE: address already in use`

**Solution**:
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

#### 3. API Tests Failing

**Problem**: API tests return 404 or connection errors

**Solution**:
- Ensure backend server is running on port 8000
- Check `API_URL` environment variable
- Verify API endpoints exist

#### 4. Coverage Thresholds Not Met

**Problem**: Tests fail due to low coverage

**Solution**:
- Add more tests for uncovered code
- Temporarily lower thresholds in `jest.config.js`
- Exclude files from coverage with `collectCoverageFrom`

#### 5. Flaky E2E Tests

**Problem**: Tests pass/fail intermittently

**Solution**:
- Add proper wait conditions (`waitForLoadState`)
- Increase timeout for slow operations
- Use `test.retry()` for flaky tests
- Check for race conditions

#### 6. Jest Import Errors

**Problem**: `Cannot use import statement outside a module`

**Solution**:
- Ensure `babel.config.js` is present
- Check `transform` configuration in `jest.config.js`
- Use `.js` extension for test files

### Debug Commands

```bash
# Debug E2E test
npm run debug

# Debug Jest test with inspector
npm run debug:jest

# Run single test file
npx playwright test tests/jobs.spec.js --debug
npx jest tests/unit/utils/string.test.js --verbose

# View test output
npm run report:e2e
npm run report:jest
```

### Getting Help

- Check test output for error messages
- Review screenshots in `test-results/` directory
- Check HTML reports for detailed information
- Enable verbose mode for more details

---

## Test Maintenance

### Adding New Tests

1. Create test file in appropriate directory:
   - E2E: `/tests/*.spec.js`
   - Unit: `/tests/unit/**/*.test.js`
   - Integration: `/tests/integration/**/*.test.js`

2. Follow naming conventions:
   - E2E: `feature.spec.js`
   - Jest: `feature.test.js`

3. Run tests to verify:
   ```bash
   npm run test:e2e:ui    # For E2E
   npm run test:unit:watch # For unit tests
   ```

### Updating Dependencies

```bash
# Update Playwright
npm install --save-dev @playwright/test@latest

# Update Jest
npm install --save-dev jest@latest

# Update all dependencies
npm update
```

### Code Coverage Goals

Aim for:
- **80%+ line coverage**
- **75%+ branch coverage**
- **80%+ function coverage**

Focus on:
- Critical business logic
- Error handling paths
- Edge cases
- User-facing features

---

## Performance

### Test Execution Times

Approximate execution times:

- **E2E Tests**: 2-5 minutes (all browsers)
- **Unit Tests**: 5-10 seconds
- **Integration Tests**: 10-30 seconds
- **Total Suite**: 3-6 minutes

### Optimization Tips

1. **Parallel Execution**: Enabled by default in Playwright
2. **Selective Testing**: Run only changed tests during development
3. **Skip Browsers**: Run single browser during development
4. **Watch Mode**: Use for rapid development
5. **Coverage Collection**: Disable during development for speed

```bash
# Fast development workflow
npm run test:e2e:chromium  # Single browser
npm run test:unit:watch    # Watch mode
```

---

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Jest Documentation](https://jestjs.io)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com)

---

## Support

For issues or questions:
- Open an issue on [GitHub](https://github.com/EduardMilitaruG/jobfy-playwright-tests)
- Review existing test files for examples
- Check this documentation

---

**Last Updated**: February 2026
**Version**: 2.0.0
