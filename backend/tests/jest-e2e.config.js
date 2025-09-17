const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,
  displayName: 'E2E Tests',
  testMatch: ['<rootDir>/e2e/**/*.e2e-spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/utils/setup.ts', '<rootDir>/utils/e2e-setup.ts'],
  testTimeout: 60000,
  maxWorkers: 1, // Run e2e tests sequentially
  transformIgnorePatterns: [
    'node_modules/(?!(uuid|@supabase)/)',
  ],
  moduleNameMapper: {
    '^uuid$': 'uuid',
  },
};
