import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { ContractExtractService } from '../../src/modules/contracts/services/extract.service';
import { ContractReminderBusinessService } from '../../src/modules/contracts/services/reminder.service';
import { E2ETestHelper } from '../utils/e2e-setup';

describe('Contracts E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Set test environment variables
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.OPENAI_MODEL = 'gpt-3.5-turbo';
    process.env.NODE_ENV = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        AppModule,
      ],
    })
      .overrideProvider(ContractExtractService)
      .useValue({
        getUserContracts: jest.fn().mockResolvedValue([]),
        getContractById: jest.fn().mockResolvedValue(null),
      })
      .overrideProvider(ContractReminderBusinessService)
      .useValue({
        getReminderStatus: jest.fn().mockResolvedValue({
          contractId: 'mock-contract-id',
          daysUntilRenewal: 30,
          reminderScheduled: false,
        }),
        getUpcomingRenewals: jest.fn().mockResolvedValue({
          success: true,
          data: [],
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/ (GET)', () => {
    it('should return hello world', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('/contracts/user/:userId (GET)', () => {
    it('should return user contracts', () => {
      return request(app.getHttpServer())
        .get('/contracts/user/550e8400-e29b-41d4-a716-446655440000')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/contracts/:id/reminder/status (GET)', () => {
    it('should return reminder status', () => {
      return request(app.getHttpServer())
        .get('/contracts/mock-contract-id/reminder/status')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('contractId');
          expect(res.body).toHaveProperty('daysUntilRenewal');
          expect(res.body).toHaveProperty('reminderScheduled');
        });
    });
  });

  describe('/contracts/user/:userId/upcoming-renewals (GET)', () => {
    it('should return upcoming renewals', () => {
      return request(app.getHttpServer())
        .get(
          '/contracts/user/550e8400-e29b-41d4-a716-446655440000/upcoming-renewals?daysAhead=30',
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('success', true);
          expect(res.body.data).toHaveProperty('data');
          expect(Array.isArray(res.body.data.data)).toBe(true);
        });
    });
  });

  // Note: Upload endpoint test would require actual file upload and AI provider setup
  // This would be tested in integration tests with proper mocks
});
