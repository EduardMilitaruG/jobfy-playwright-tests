# JobFy Complete Test Suite

![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Coverage](https://img.shields.io/badge/Coverage-70%25+-brightgreen?style=for-the-badge)

Comprehensive test suite for the [JobFy](https://github.com/EduardMilitaruG/JobFy) job scraper dashboard application, featuring E2E tests, unit tests, and API integration tests with full coverage reporting.

## Test Coverage

### E2E Tests (Playwright)

| Category | Tests | Description |
|----------|-------|-------------|
| **Navigation** | 7 | Tab navigation, header, footer, routing |
| **Jobs Tab** | 10 | Search, filtering, job table, controls |
| **Statistics** | 4 | Stats page, charts, data loading |
| **Scrape Panel** | 5 | Scrape functionality, site selection |
| **API Endpoints** | 12 | REST API validation, error handling |
| **Responsive** | 10 | Mobile, tablet, desktop viewports |

**E2E Total: 48 tests** across 6 spec files.

### Unit Tests (Jest)

| Category | Tests | Description |
|----------|-------|-------------|
| **String Utils** | 10 | capitalize, truncate, slugify |
| **Validation** | 12 | Email, URL, sanitization |
| **Array Utils** | 15 | unique, chunk, groupBy, sortBy, filter |

**Unit Total: 37 tests** across 3 test files.

### Integration Tests (Supertest)

| Category | Tests | Description |
|----------|-------|-------------|
| **Jobs API** | 10 | CRUD operations, validation |
| **Scrape API** | 8 | Scraping, site management |
| **Statistics API** | 7 | Data aggregation, trends |

**Integration Total: 25 tests** across 3 test files.

---

**Grand Total: 110+ tests** with coverage reporting for all test types.

## Tech Stack

- **Playwright** - E2E cross-browser testing framework
- **Jest** - Unit and integration testing framework
- **Supertest** - HTTP API testing library
- **Babel** - JavaScript transpiler for Jest
- **C8** - Code coverage tool
- **JavaScript** - Test language
- **Node.js** - Runtime environment

## Prerequisites

- Node.js 18+
- JobFy application running locally:
  - Backend: `http://localhost:8000`
  - Frontend: `http://localhost:5173`

## Installation

```bash
# Clone the repository
git clone https://github.com/EduardMilitaruG/jobfy-playwright-tests.git
cd jobfy-playwright-tests

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

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

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific browser
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
npm run test:e2e:mobile

# Run API E2E tests only
npm run test:e2e:api

# Debug E2E tests
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
```

### Integration Tests (Supertest)

```bash
# Run all integration tests
npm run test:integration

# Watch mode
npm run test:integration:watch

# With coverage
npm run test:integration:coverage
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

### Coverage Reports

```bash
# Generate all coverage reports
npm run coverage

# Jest coverage only
npm run coverage:jest

# E2E coverage only
npm run coverage:e2e

# View coverage reports
npm run report:coverage    # Jest coverage
npm run report:e2e        # E2E test report
npm run report:jest       # Jest test report
```

## Test Structure

```
jobfy-playwright-tests/
├── tests/
│   ├── *.spec.js                    # E2E tests (Playwright)
│   │   ├── navigation.spec.js       # Navigation & routing
│   │   ├── jobs.spec.js             # Jobs tab functionality
│   │   ├── statistics.spec.js       # Statistics page
│   │   ├── scrape.spec.js           # Scrape panel
│   │   ├── api.spec.js              # API E2E tests
│   │   └── responsive.spec.js       # Responsive design
│   ├── unit/                        # Unit tests (Jest)
│   │   └── utils/
│   │       ├── string.test.js       # String utilities
│   │       ├── validation.test.js   # Validation functions
│   │       └── array.test.js        # Array operations
│   ├── integration/                 # Integration tests (Supertest)
│   │   └── api/
│   │       ├── jobs.test.js         # Jobs API tests
│   │       ├── scrape.test.js       # Scrape API tests
│   │       └── statistics.test.js   # Statistics API tests
│   └── setup/
│       └── jest.setup.js            # Jest configuration
├── coverage/                        # Coverage reports
│   ├── jest/                        # Jest coverage
│   └── c8/                          # E2E coverage
├── playwright.config.js             # Playwright configuration
├── jest.config.js                   # Jest configuration
├── babel.config.js                  # Babel configuration
├── .c8rc.json                       # C8 coverage config
├── TESTING.md                       # Comprehensive testing docs
├── package.json
└── README.md
```

## Configuration

The test suite can be configured via environment variables:

```bash
# Set custom frontend URL
BASE_URL=http://localhost:3000 npm test

# Set custom API URL (for API tests)
API_URL=http://localhost:8080 npm run test:api

# Run in CI mode (with retries)
CI=true npm test
```

## Browser Support

| Browser | Project Name | Status |
|---------|--------------|--------|
| Chrome | chromium | ✅ |
| Firefox | firefox | ✅ |
| Safari | webkit | ✅ |
| Mobile Chrome | mobile-chrome | ✅ |

## Test Reports

### E2E Test Reports (Playwright)

After running E2E tests, view the HTML report:

```bash
npm run report:e2e
```

Reports include:
- Test results with pass/fail status
- Screenshots on failure
- Video recordings on failure
- Trace files for debugging
- Cross-browser test results

### Unit & Integration Test Reports (Jest)

After running Jest tests with coverage:

```bash
npm run test:jest:coverage
npm run report:jest
```

Reports include:
- Test results with detailed assertions
- Execution time for each test
- Code coverage metrics (lines, functions, branches, statements)
- HTML coverage report with line-by-line coverage

### Coverage Reports

View detailed coverage reports:

```bash
# Jest coverage (unit + integration)
npm run report:coverage

# Location: coverage/jest/index.html
```

Coverage thresholds:
- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Playwright Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run tests
        run: npm test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Skills Demonstrated

- **E2E Testing** - Full user journey testing with Playwright
- **Unit Testing** - Isolated function testing with Jest
- **Integration Testing** - API endpoint validation with Supertest
- **Test Coverage** - Comprehensive coverage reporting (70%+)
- **Cross-browser Testing** - Chrome, Firefox, Safari
- **Responsive Testing** - Mobile, tablet, desktop
- **Test Automation** - CI/CD integration ready
- **Page Object Pattern** - Maintainable test structure
- **AAA Pattern** - Arrange-Act-Assert testing methodology
- **Mocking & Stubbing** - Test isolation techniques
- **Continuous Testing** - Watch mode and fast feedback loops

## Documentation

- [TESTING.md](TESTING.md) - Comprehensive testing documentation
  - Detailed test structure
  - Writing tests guide
  - Coverage reporting
  - CI/CD integration
  - Troubleshooting guide

## Related Projects

- [JobFy](https://github.com/EduardMilitaruG/JobFy) - The application being tested

## Author

**Eduard Militaru**
- GitHub: [@EduardMilitaruG](https://github.com/EduardMilitaruG)
- LinkedIn: [Eduard Militaru](https://linkedin.com/in/eduardmilitaru)

## License

MIT License
