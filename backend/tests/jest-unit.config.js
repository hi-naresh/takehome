const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,
  displayName: 'Unit Tests',
  testMatch: ['<rootDir>/unit/**/*.spec.ts'],
  collectCoverageFrom: [
    '../src/**/*.(t|j)s',
    '!../src/**/*.spec.ts',
    '!../src/**/*.e2e-spec.ts',
    '!../src/**/*.interface.ts',
    '!../src/**/*.dto.ts',
    '!../src/**/*.module.ts',
    '!../src/main.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
