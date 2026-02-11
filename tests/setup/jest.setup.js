// Jest setup file - runs before all tests

// Set test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console output during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: console.error, // Keep errors visible
};

// Global test utilities
global.testUtils = {
  // Wait for a promise to resolve
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock API response
  mockResponse: (data, status = 200) => ({
    status,
    data,
    ok: status >= 200 && status < 300
  }),

  // Generate mock job data
  createMockJob: (overrides = {}) => ({
    id: Math.random().toString(36).substr(2, 9),
    title: 'Software Engineer',
    company: 'Tech Company',
    location: 'Remote',
    source: 'RemoteOK',
    url: 'https://example.com/job',
    description: 'Job description here',
    createdAt: new Date().toISOString(),
    ...overrides
  })
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
