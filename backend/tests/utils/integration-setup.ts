// Integration test setup
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

// Global integration test utilities
export class IntegrationTestHelper {
  static async createTestApp(moduleClass: any): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [moduleClass],
    }).compile();

    const app = moduleFixture.createNestApplication();
    await app.init();
    return app;
  }

  static async closeTestApp(app: INestApplication): Promise<void> {
    await app.close();
  }
}

// Set up test database or external services for integration tests
beforeAll(async () => {
  // Initialize test database, external services, etc.
  process.env.SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'test-anon-key';
  process.env.OPENAI_API_KEY = 'test-openai-key';
});

afterAll(async () => {
  // Clean up test database, external services, etc.
});
