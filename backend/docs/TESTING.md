## Testing Guide

This document explains the testing infrastructure, available test suites, and how to use them for the backend service.

### Quick Start

```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e          # End-to-end tests only

# Coverage and CI
npm run test:cov          # Coverage report
npm run test:ci           # Full CI pipeline
npm run test:watch        # Watch mode
```

### Test Structure

```
tests/
├── unit/                 # Unit tests - individual functions/classes
├── integration/          # Integration tests - service interactions
├── e2e/                  # End-to-end tests - full API workflows
├── factories/            # Test data factories
├── fixtures/             # Static test data
└── utils/                # Test utilities and helpers
```

## Available Test Suites

### Unit Tests (`tests/unit/`)

**Purpose**: Test individual functions, classes, and methods in isolation with mocked dependencies.

**Current Test Files**:
- `ai-provider.spec.ts` - Tests OpenAI provider functionality
- `extraction-service.spec.ts` - Tests contract data extraction service

**What They Test**:
- Service method logic and return values
- Error handling and edge cases
- Input validation and data transformation
- Mock interactions with external dependencies

**Coverage**: 80% threshold enforced for unit tests

### Integration Tests (`tests/integration/`)

**Purpose**: Test interactions between multiple services with real database connections but mocked external APIs.

**Current Test Files**:
- `contracts.integration.spec.ts` - Tests contract service interactions

**What They Test**:
- Service-to-service communication
- Database operations and data persistence
- Business logic workflows
- Data flow through multiple layers

### End-to-End Tests (`tests/e2e/`)

**Purpose**: Test complete user workflows through the API with full application stack.

**Current Test Files**:
- `app.e2e-spec.ts` - Tests basic application health
- `contracts.e2e-spec.ts` - Tests contract API endpoints

**What They Test**:
- Complete API request/response cycles
- Business process workflows
- External service integrations (mocked)

**API Endpoints Tested**:
- `GET /` - Application health check
- `GET /contracts/user/:userId` - Get user contracts
- `GET /contracts/:id/reminder/status` - Get reminder status
- `GET /contracts/user/:userId/upcoming-renewals` - Get upcoming renewals

## Test Infrastructure

### Test Data Factories (`tests/factories/`)

**ContractFactory** - Generate contract test data:
```ts
import { ContractFactory } from '../factories';

// Create single contract
const contract = ContractFactory.create();

// Create multiple contracts
const contracts = ContractFactory.createMany(5);

// Create specific contract types
const expiringContract = ContractFactory.createExpiring();
const expiredContract = ContractFactory.createExpired();
```

**UserFactory** - Generate user test data:
```ts
import { UserFactory } from '../factories';

const user = UserFactory.create();
const users = UserFactory.createMany(3);
```

### Test Utilities (`tests/utils/`)

**TestHelpers** - Common test operations:
```ts
import { TestHelpers } from '../utils/test-helpers';

// Make HTTP requests
const response = await TestHelpers.makeRequest(app, 'get', '/api/contracts');

// Validate data formats
TestHelpers.expectValidUuid(contract.id);
TestHelpers.expectValidEmail(contract.contact_email);
TestHelpers.expectValidDate(contract.renewal_date);

// Create mock files
const mockFile = TestHelpers.createMockFile('contract.pdf', 'PDF content');
```

**Setup Files**:
- `setup.ts` - Global test setup and configuration
- `integration-setup.ts` - Integration test helpers
- `e2e-setup.ts` - E2E test application setup

### Test Fixtures (`tests/fixtures/`)

**Static Test Data**:
- `contracts.json` - Predefined contract data for consistent testing

## Environment Configuration

### Test Environment Variables

Tests automatically set mock environment variables:
```ts
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.NODE_ENV = 'test';
```

### Mocking Strategy

**External Services**: All external APIs (OpenAI, Supabase) are mocked in tests
**Database**: Integration tests use real database, unit tests use mocks
**File System**: File operations are mocked for consistent testing

## Writing Tests

### Adding New Unit Tests

**Location**: `tests/unit/`
**Pattern**: `[service-name].spec.ts`

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { MyService } from '../../src/my.service';
import { ContractFactory } from '../factories';

describe('MyService', () => {
  let service: MyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyService],
    }).compile();
    service = module.get(MyService);
  });

  it('should process contract data', () => {
    const contract = ContractFactory.create();
    const result = service.processContract(contract);
    expect(result).toBeDefined();
  });
});
```

### Adding New E2E Tests

**Location**: `tests/e2e/`
**Pattern**: `[feature].e2e-spec.ts`

```ts
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { E2ETestHelper } from '../utils/e2e-setup';

describe('Feature E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await E2ETestHelper.createTestApp();
  });

  afterAll(async () => {
    await E2ETestHelper.closeTestApp(app);
  });

  it('should handle API request', () => {
    return request(app.getHttpServer())
      .get('/api/endpoint')
      .expect(200);
  });
});
```

### Adding New Integration Tests

**Location**: `tests/integration/`
**Pattern**: `[feature].integration.spec.ts`

```ts
import { INestApplication } from '@nestjs/common';
import { IntegrationTestHelper } from '../utils/integration-setup';
import { AppModule } from '../../src/app.module';

describe('Feature Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await IntegrationTestHelper.createTestApp(AppModule);
  });

  afterAll(async () => {
    await IntegrationTestHelper.closeTestApp(app);
  });

  it('should handle service interactions', async () => {
    // Test with real database
    expect(true).toBe(true);
  });
});
```

## Test Coverage

Generate coverage report:
```bash
npm run test:cov
```

Coverage output is written to `coverage/` directory. Unit tests have 80% coverage threshold enforced.

## Best Practices

### Test Naming
- Use descriptive names that explain expected behavior
- Follow pattern: `should [expected behavior] when [condition]`

### Test Structure
- Follow Arrange-Act-Assert pattern
- Keep tests independent and isolated
- Mock all external dependencies in unit tests
- Use factories for consistent test data

### Maintenance
- Keep tests up-to-date with code changes
- Clean up resources in `afterAll` hooks
- Make tests deterministic by mocking non-deterministic behavior


