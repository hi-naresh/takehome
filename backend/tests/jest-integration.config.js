const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,
  displayName: 'Integration Tests',
  testMatch: ['<rootDir>/integration/**/*.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/utils/setup.ts', '<rootDir>/utils/integration-setup.ts'],
  testTimeout: 30000,
  transformIgnorePatterns: [
    'node_modules/(?!(uuid|@supabase|@faker-js)/)',
  ],
};
