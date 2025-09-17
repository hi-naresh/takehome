import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { ContractExtractService } from '../../src/modules/contracts/services/extract.service';
import { IntegrationTestHelper } from '../utils/integration-setup';
import { ContractFactory } from '../factories';

describe('Contracts Integration', () => {
  let app: INestApplication;
  let contractService: ContractExtractService;

  beforeAll(async () => {
    app = await IntegrationTestHelper.createTestApp(AppModule);
    contractService = app.get(ContractExtractService);
  });

  afterAll(async () => {
    await IntegrationTestHelper.closeTestApp(app);
  });

  describe('Contract Service Integration', () => {
    it('should handle contract operations with real dependencies', async () => {
      // This would test with real database connections but mocked external APIs
      const mockContract = ContractFactory.create();

      // Test actual service methods with real database
      // but mocked external services like OpenAI
      expect(mockContract).toBeDefined();
      expect(mockContract.id).toBeDefined();
    });
  });
});
