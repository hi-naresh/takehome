import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from '../../src/app.module';
import { ContractExtractionService } from '../../src/core/ai/services/extraction.service';
import { ContractPromptService } from '../../src/core/ai/services/prompt.service';
import { OpenAIProvider } from '../../src/core/ai/providers/openai.provider';
import { AI_PROVIDER, PROMPT_SERVICE } from '../../src/core/ai/ai.tokens';
import { IntegrationTestHelper } from '../utils/integration-setup';

describe('AI Services Integration', () => {
  let app: INestApplication;
  let extractionService: ContractExtractionService;
  let promptService: ContractPromptService;
  let aiProvider: OpenAIProvider;

  beforeAll(async () => {
    app = await IntegrationTestHelper.createTestApp(AppModule);
    extractionService = app.get(ContractExtractionService);
    promptService = app.get<ContractPromptService>(PROMPT_SERVICE);
    aiProvider = app.get<OpenAIProvider>(AI_PROVIDER);
  });

  afterAll(async () => {
    await IntegrationTestHelper.closeTestApp(app);
  });

  describe('AI Service Integration', () => {
    it('should have all AI services available', () => {
      expect(extractionService).toBeDefined();
      expect(promptService).toBeDefined();
      expect(aiProvider).toBeDefined();
    });

    it('should generate prompt correctly', () => {
      const pdfText = 'Sample contract text';
      const fileName = 'test.pdf';

      const prompt = promptService.generateExtractionPrompt(pdfText, fileName);

      expect(prompt).toContain(pdfText);
      expect(prompt).toContain(fileName);
      expect(prompt).toContain('contractHolderName');
    });

    it('should check AI provider health', async () => {
      const isHealthy = await aiProvider.isHealthy();
      expect(typeof isHealthy).toBe('boolean');
    });
  });
});
