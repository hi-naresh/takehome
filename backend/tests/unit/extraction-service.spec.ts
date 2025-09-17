import { Test, TestingModule } from '@nestjs/testing';
import { ContractExtractionService } from '../../src/core/ai/services/extraction.service';
import { AIProvider, CompletionResult } from '../../src/core/ai/ai.contracts';
import { AI_PROVIDER, PROMPT_SERVICE } from '../../src/core/ai/ai.tokens';
import { PromptService } from '../../src/core/ai/services/prompt.service';

describe('ContractExtractionService', () => {
  let service: ContractExtractionService;
  let mockAIProvider: jest.Mocked<AIProvider>;
  let mockPromptService: jest.Mocked<PromptService>;

  beforeEach(async () => {
    const mockAIProviderValue = {
      complete: jest.fn(),
      isHealthy: jest.fn(),
    };

    const mockPromptServiceValue = {
      generateExtractionPrompt: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractExtractionService,
        {
          provide: AI_PROVIDER,
          useValue: mockAIProviderValue,
        },
        {
          provide: PROMPT_SERVICE,
          useValue: mockPromptServiceValue,
        },
      ],
    }).compile();

    service = module.get<ContractExtractionService>(ContractExtractionService);
    mockAIProvider = module.get(AI_PROVIDER);
    mockPromptService = module.get(PROMPT_SERVICE);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should extract contract data successfully', async () => {
    const mockCompletion: CompletionResult = {
      text: `
      {
        "contractHolderName": "John Doe",
        "contractId": "CONTRACT-123",
        "renewalDate": "2024-12-31",
        "serviceProduct": "Cloud Storage",
        "contactEmail": "john.doe@example.com"
      }
      `,
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      model: 'gpt-3.5-turbo',
    };

    mockPromptService.generateExtractionPrompt.mockReturnValue('Mock prompt');
    mockAIProvider.complete.mockResolvedValue(mockCompletion);

    const request = {
      pdfText: 'Contract text content...',
      fileName: 'contract.pdf',
    };

    const result = await service.extractContractData(request);

    expect(result).toEqual({
      contractHolderName: 'John Doe',
      contractId: 'CONTRACT-123',
      renewalDate: '2024-12-31',
      serviceProduct: 'Cloud Storage',
      contactEmail: 'john.doe@example.com',
      wordCount: 3,
      isImageBasedPdf: true,
    });

    expect(mockPromptService.generateExtractionPrompt).toHaveBeenCalledWith(
      request.pdfText,
      request.fileName,
    );
    expect(mockAIProvider.complete).toHaveBeenCalled();
  });

  it('should handle null values in extraction', async () => {
    const mockCompletion: CompletionResult = {
      text: `
      {
        "contractHolderName": null,
        "contractId": "CONTRACT-123",
        "renewalDate": null,
        "serviceProduct": "Cloud Storage",
        "contactEmail": null
      }
      `,
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
    };

    mockPromptService.generateExtractionPrompt.mockReturnValue('Mock prompt');
    mockAIProvider.complete.mockResolvedValue(mockCompletion);

    const request = {
      pdfText: 'Contract text content...',
      fileName: 'contract.pdf',
    };

    const result = await service.extractContractData(request);

    expect(result).toEqual({
      contractHolderName: null,
      contractId: 'CONTRACT-123',
      renewalDate: null,
      serviceProduct: 'Cloud Storage',
      contactEmail: null,
      wordCount: 3,
      isImageBasedPdf: true,
    });
  });

  it('should handle AI provider errors', async () => {
    mockPromptService.generateExtractionPrompt.mockReturnValue('Mock prompt');
    mockAIProvider.complete.mockRejectedValue(new Error('AI provider error'));

    const request = {
      pdfText: 'Contract text content...',
      fileName: 'contract.pdf',
    };

    await expect(service.extractContractData(request)).rejects.toThrow(
      'Contract extraction failed: AI provider error',
    );
  });

  it('should handle invalid JSON response', async () => {
    const mockCompletion: CompletionResult = {
      text: 'Invalid response without JSON',
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
    };

    mockPromptService.generateExtractionPrompt.mockReturnValue('Mock prompt');
    mockAIProvider.complete.mockResolvedValue(mockCompletion);

    const request = {
      pdfText: 'Contract text content...',
      fileName: 'contract.pdf',
    };

    await expect(service.extractContractData(request)).rejects.toThrow(
      'Failed to parse extraction result',
    );
  });

  it('should handle malformed JSON response', async () => {
    const mockCompletion: CompletionResult = {
      text: '{ "contractHolderName": "John Doe", invalid json }',
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
    };

    mockPromptService.generateExtractionPrompt.mockReturnValue('Mock prompt');
    mockAIProvider.complete.mockResolvedValue(mockCompletion);

    const request = {
      pdfText: 'Contract text content...',
      fileName: 'contract.pdf',
    };

    await expect(service.extractContractData(request)).rejects.toThrow(
      'Failed to parse extraction result',
    );
  });
});
