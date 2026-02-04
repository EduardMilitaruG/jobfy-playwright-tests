# JobFy Playwright Test Suite

![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)

End-to-end test suite for the [JobFy](https://github.com/EduardMilitaruG/JobFy) job scraper dashboard application, built with Playwright.

## Test Coverage

| Category | Tests | Description |
|----------|-------|-------------|
| **Navigation** | 7 | Tab navigation, header, footer, routing |
| **Jobs Tab** | 10 | Search, filtering, job table, controls |
| **Statistics** | 4 | Stats page, charts, data loading |
| **Scrape Panel** | 5 | Scrape functionality, site selection |
| **API Endpoints** | 12 | REST API validation, error handling |
| **Responsive** | 10 | Mobile, tablet, desktop viewports |

**Total: 48 tests** across 5 spec files.

## Tech Stack

- **Playwright** - Cross-browser testing framework
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

```bash
# Run all tests
npm test

# Run with UI mode (interactive)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Run specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Run mobile tests only
npm run test:mobile

# Run API tests only
npm run test:api

# Debug mode
npm run debug

# View HTML report
npm run report
```

## Test Structure

```
jobfy-playwright-tests/
├── tests/
│   ├── navigation.spec.js   # Navigation & routing tests
│   ├── jobs.spec.js         # Jobs tab functionality
│   ├── statistics.spec.js   # Statistics page tests
│   ├── scrape.spec.js       # Scrape panel tests
│   ├── api.spec.js          # API endpoint tests
│   └── responsive.spec.js   # Responsive design tests
├── playwright.config.js     # Playwright configuration
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

After running tests, view the HTML report:

```bash
npm run report
```

Reports include:
- Test results with pass/fail status
- Screenshots on failure
- Video recordings on failure
- Trace files for debugging

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

- **E2E Testing** - Full user journey testing
- **API Testing** - REST endpoint validation
- **Cross-browser Testing** - Chrome, Firefox, Safari
- **Responsive Testing** - Mobile, tablet, desktop
- **Test Automation** - CI/CD integration ready
- **Page Object Pattern** - Maintainable test structure

## Related Projects

- [JobFy](https://github.com/EduardMilitaruG/JobFy) - The application being tested

## Author

**Eduard Militaru**
- GitHub: [@EduardMilitaruG](https://github.com/EduardMilitaruG)
- LinkedIn: [Eduard Militaru](https://linkedin.com/in/eduardmilitaru)

## License

MIT License
