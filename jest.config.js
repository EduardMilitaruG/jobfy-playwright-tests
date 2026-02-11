module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage/jest',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Files to collect coverage from
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    'api/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/**/*.spec.{js,jsx}',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],

  // Test match patterns
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.test.js'
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],

  // Module paths
  moduleDirectories: ['node_modules', 'src'],

  // Transform files with babel
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },

  // Reporters
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'JobFy Test Report - Unit & Integration Tests',
        outputPath: 'coverage/jest/test-report.html',
        includeFailureMsg: true,
        includeConsoleLog: true,
        theme: 'darkTheme',
        sort: 'status'
      }
    ]
  ],

  // Verbose output
  verbose: true,

  // Test timeout
  testTimeout: 10000
};
