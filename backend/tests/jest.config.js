module.exports = {
  transform: {
    '^.+\\.(t|j)s$': [
      '@swc/jest',
      {
        jsc: {
          target: 'es2022',
          parser: {
            syntax: 'typescript',
            tsx: false,
            decorators: true,
          },
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
          },
        },
        module: {
          type: 'commonjs',
        },
      },
    ],
  },
  testEnvironment: 'node',
  roots: ['<rootDir>/../src', '<rootDir>'],
  testMatch: [
    '<rootDir>/unit/**/*.spec.ts',
    '<rootDir>/integration/**/*.spec.ts',
    '<rootDir>/e2e/**/*.e2e-spec.ts',
  ],
  collectCoverageFrom: [
    '../src/**/*.(t|j)s',
    '!../src/**/*.spec.ts',
    '!../src/**/*.e2e-spec.ts',
    '!../src/**/*.interface.ts',
    '!../src/**/*.dto.ts',
    '!../src/**/*.module.ts',
  ],
  coverageDirectory: '../coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^uuid$': 'uuid',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(uuid|@supabase|@faker-js)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/utils/setup.ts'],
  testTimeout: 10000,
  verbose: true,
};
