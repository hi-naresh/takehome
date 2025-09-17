import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from '../../src/app.module';
import { SupabaseService } from '../../src/common/supabase';
import { IntegrationTestHelper } from '../utils/integration-setup';

describe('Database Services Integration', () => {
  let app: INestApplication;
  let supabaseService: SupabaseService;

  beforeAll(async () => {
    app = await IntegrationTestHelper.createTestApp(AppModule);
    supabaseService = app.get(SupabaseService);
  });

  afterAll(async () => {
    await IntegrationTestHelper.closeTestApp(app);
  });

  describe('Supabase Service Integration', () => {
    it('should have Supabase service available', () => {
      expect(supabaseService).toBeDefined();
    });

    it('should get Supabase client', () => {
      const client = supabaseService.getClient();
      expect(client).toBeDefined();
    });

    it('should check database health', async () => {
      const isHealthy = await supabaseService.isHealthy();
      expect(typeof isHealthy).toBe('boolean');
    });
  });
});
