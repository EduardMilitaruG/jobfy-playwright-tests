# Coverage Report Guide

Complete guide to understanding and working with test coverage in the JobFy test suite.

## Coverage Overview

The project enforces minimum coverage thresholds across all test types:

| Metric | Threshold | Description |
|--------|-----------|-------------|
| **Lines** | 70% | Percentage of code lines executed |
| **Functions** | 70% | Percentage of functions called |
| **Branches** | 70% | Percentage of code branches taken |
| **Statements** | 70% | Percentage of statements executed |

## Generating Coverage

### All Coverage Reports

```bash
# Generate coverage for all test types
npm run coverage

# This runs:
# - npm run coverage:jest    (Unit + Integration)
# - npm run coverage:e2e     (E2E with C8)
```

### Jest Coverage (Unit + Integration)

```bash
# Generate Jest coverage
npm run coverage:jest

# Report location: coverage/jest/
```

### Viewing Coverage Reports

```bash
# Open Jest coverage report in browser
npm run report:coverage

# Or manually:
open coverage/jest/index.html           # macOS
xdg-open coverage/jest/index.html       # Linux
start coverage/jest/index.html          # Windows
```

## Understanding Coverage Reports

### HTML Report Structure

```
coverage/jest/
├── index.html              # Main coverage dashboard
├── lcov.info              # LCOV format (for CI)
├── coverage-summary.json  # JSON summary
└── [source-files].html    # Individual file coverage
```

### Coverage Dashboard

The HTML report shows:

1. **Overall Coverage**: Total coverage percentages
2. **File List**: Coverage per file
3. **Color Coding**:
   - 🟢 Green: Good coverage (>80%)
   - 🟡 Yellow: Moderate coverage (50-80%)
   - 🔴 Red: Low coverage (<50%)

### Line-by-Line Coverage

Click any file to see:
- ✅ Green: Line executed
- 🔴 Red: Line not executed
- 🟡 Yellow: Branch partially covered
- Gray: Non-executable line (comments, etc.)

## Coverage Configuration

### Jest Coverage (jest.config.js)

```javascript
collectCoverage: true,
coverageDirectory: 'coverage/jest',
coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

coverageThresholds: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
},

collectCoverageFrom: [
  'src/**/*.{js,jsx}',
  'api/**/*.{js,jsx}',
  '!src/**/*.test.{js,jsx}',
  '!**/node_modules/**'
]
```

### C8 Coverage (.c8rc.json)

```json
{
  "all": true,
  "include": ["src/**/*.js", "api/**/*.js"],
  "exclude": ["tests/**", "coverage/**"],
  "reporter": ["text", "html", "lcov"],
  "report-dir": "./coverage/c8",
  "check-coverage": true,
  "lines": 70,
  "functions": 70,
  "branches": 70
}
```

## Improving Coverage

### Identify Uncovered Code

1. Generate coverage report:
   ```bash
   npm run coverage:jest
   ```

2. Open HTML report:
   ```bash
   npm run report:coverage
   ```

3. Look for red lines (uncovered code)

4. Write tests for uncovered paths

### Common Uncovered Code

- **Error Handlers**: Test error conditions
- **Edge Cases**: Test boundary conditions
- **Async Operations**: Test callbacks and promises
- **Conditional Branches**: Test all if/else paths

### Example: Improving Branch Coverage

**Uncovered Code:**
```javascript
function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}
```

**Add Test for Uncovered Branch:**
```javascript
test('should throw error on division by zero', () => {
  expect(() => divide(10, 0)).toThrow('Division by zero');
});
```

## Coverage in CI/CD

### GitHub Actions Integration

```yaml
- name: Run tests with coverage
  run: npm run coverage:jest

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v4
  with:
    file: ./coverage/jest/lcov.info
```

### Coverage Badges

Add to README.md:

```markdown
![Coverage](https://img.shields.io/badge/Coverage-85%25-brightgreen)
```

Or use Codecov:

```markdown
![Codecov](https://codecov.io/gh/username/repo/branch/main/graph/badge.svg)
```

## Coverage Best Practices

### What to Cover

✅ **High Priority:**
- Business logic
- Utility functions
- API integrations
- Error handling
- User-facing features

❌ **Low Priority:**
- Configuration files
- Type definitions
- Simple getters/setters
- Third-party integrations (mock instead)

### Coverage Goals

| Code Type | Target Coverage |
|-----------|-----------------|
| Utility Functions | 90%+ |
| Business Logic | 85%+ |
| API Endpoints | 80%+ |
| UI Components | 70%+ |
| Configuration | 50%+ |

### Don't Chase 100%

- 100% coverage doesn't guarantee bug-free code
- Focus on meaningful tests, not just coverage numbers
- Some code is better validated through E2E tests
- Diminishing returns after 85-90%

## Coverage Metrics Explained

### Line Coverage

**What it measures**: Percentage of code lines executed

**Example:**
```javascript
function example(x) {
  const y = x * 2;      // ✅ Covered
  if (y > 10) {
    return 'large';     // ❌ Not covered (y never > 10 in tests)
  }
  return 'small';       // ✅ Covered
}
```

**Coverage**: 75% (3/4 lines)

### Function Coverage

**What it measures**: Percentage of functions called at least once

**Example:**
```javascript
function add(a, b) { return a + b; }     // ✅ Called in tests
function subtract(a, b) { return a - b; } // ❌ Never called
```

**Coverage**: 50% (1/2 functions)

### Branch Coverage

**What it measures**: Percentage of code branches taken

**Example:**
```javascript
function check(x) {
  if (x > 0) {
    return 'positive';  // ✅ Tested
  } else {
    return 'negative';  // ❌ Not tested
  }
}
```

**Coverage**: 50% (1/2 branches)

### Statement Coverage

**What it measures**: Percentage of statements executed

**Example:**
```javascript
function process(data) {
  const result = [];              // ✅ Executed
  data.forEach(item => {
    result.push(item * 2);        // ✅ Executed
  });
  return result;                  // ✅ Executed
}
```

**Coverage**: 100% (3/3 statements)

## Excluding Code from Coverage

### Jest

Use inline comments:

```javascript
/* istanbul ignore next */
function debugHelper() {
  console.log('Debug info');
}

/* istanbul ignore if */
if (process.env.NODE_ENV === 'development') {
  // Development-only code
}
```

### Configuration Exclusion

In `jest.config.js`:

```javascript
collectCoverageFrom: [
  'src/**/*.js',
  '!src/**/*.test.js',      // Exclude tests
  '!src/config/**',         // Exclude config
  '!src/types/**',          // Exclude types
]
```

## Coverage Troubleshooting

### Issue: Coverage Not Generating

**Solution:**
```bash
# Clear cache and regenerate
rm -rf coverage/
npm run coverage:jest
```

### Issue: Coverage Too Low

**Solutions:**
1. Write more tests for uncovered code
2. Check if test files are being excluded
3. Verify `collectCoverageFrom` patterns
4. Review coverage report to identify gaps

### Issue: Coverage Report Not Opening

**Solution:**
```bash
# Try different commands
npm run report:coverage
open coverage/jest/index.html
xdg-open coverage/jest/index.html
```

### Issue: False Negatives in Coverage

**Solution:**
```bash
# Clear coverage cache
rm -rf coverage/
rm -rf .nyc_output/
npm run coverage:jest
```

## Coverage Commands Cheat Sheet

```bash
# Generate coverage
npm run coverage              # All coverage
npm run coverage:jest         # Jest only
npm run coverage:e2e          # E2E only

# View reports
npm run report:coverage       # Jest HTML report
npm run report:jest          # Jest test report
npm run report:e2e           # E2E test report

# Unit tests with coverage
npm run test:unit:coverage

# Integration tests with coverage
npm run test:integration:coverage

# All Jest tests with coverage
npm run test:jest:coverage
```

## CI Integration Examples

### GitLab CI

```yaml
test:coverage:
  script:
    - npm run coverage:jest
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/jest/cobertura-coverage.xml
```

### CircleCI

```yaml
- run:
    name: Run tests with coverage
    command: npm run coverage:jest

- store_artifacts:
    path: coverage/jest
    destination: coverage-report
```

## Resources

- [Jest Coverage Documentation](https://jestjs.io/docs/configuration#collectcoverage-boolean)
- [C8 Documentation](https://github.com/bcoe/c8)
- [Istanbul Coverage](https://istanbul.js.org/)
- [Codecov](https://codecov.io/)

---

**Remember**: Coverage is a tool, not a goal. Write meaningful tests that catch bugs, not just tests that increase coverage numbers.
