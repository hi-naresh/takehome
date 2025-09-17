import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OpenAIProvider } from '../../src/core/ai/providers/openai.provider';
import { CompletionRequest } from '../../src/core/ai/ai.contracts';

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    // Clear all mocks first
    jest.clearAllMocks();

    // Set up the mock config service
    mockConfigService.get.mockImplementation(
      (key: string, defaultValue?: unknown) => {
        const config: Record<string, unknown> = {
          OPENAI_API_KEY: 'test-api-key',
          OPENAI_MODEL: 'gpt-3.5-turbo',
        };
        return config[key] || defaultValue;
      },
    );

    // Mock the OpenAI constructor
    const mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
      models: {
        list: jest.fn(),
      },
    };

    jest.doMock('openai', () => ({
      __esModule: true,
      default: jest.fn().mockImplementation(() => mockOpenAI),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAIProvider,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    provider = module.get<OpenAIProvider>(OpenAIProvider);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should throw error if API key is missing', async () => {
    const mockConfigServiceWithoutKey = {
      get: jest.fn().mockReturnValue(undefined),
    };

    await expect(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          OpenAIProvider,
          {
            provide: ConfigService,
            useValue: mockConfigServiceWithoutKey,
          },
        ],
      }).compile();

      module.get<OpenAIProvider>(OpenAIProvider);
    }).rejects.toThrow('OPENAI_API_KEY is required');
  });

  it('should complete request successfully', async () => {
    // Get the mocked OpenAI instance
    const mockOpenAI = (provider as any).client;

    // Set up the mock to return a promise
    mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
      choices: [{ message: { content: 'Test response' } }],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 5,
        total_tokens: 15,
      },
      model: 'gpt-3.5-turbo',
    });

    const request: CompletionRequest = {
      prompt: 'Test prompt',
      maxTokens: 100,
      temperature: 0.5,
    };

    const result = await provider.complete(request);

    expect(result.text).toBe('Test response');
    expect(result.usage).toEqual({
      promptTokens: 10,
      completionTokens: 5,
      totalTokens: 15,
    });
    expect(result.model).toBe('gpt-3.5-turbo');
  });

  it('should handle completion errors', async () => {
    const mockOpenAI = (provider as any).client;

    mockOpenAI.chat.completions.create = jest
      .fn()
      .mockRejectedValue(new Error('API Error'));

    const request: CompletionRequest = {
      prompt: 'Test prompt',
    };

    await expect(provider.complete(request)).rejects.toThrow(
      'OpenAI completion failed: API Error',
    );
  });

  it('should check health successfully', async () => {
    const mockOpenAI = (provider as any).client;

    mockOpenAI.models.list = jest.fn().mockResolvedValue({});

    const isHealthy = await provider.isHealthy();
    expect(isHealthy).toBe(true);
  });

  it('should handle health check failure', async () => {
    const mockOpenAI = (provider as any).client;

    mockOpenAI.models.list = jest
      .fn()
      .mockRejectedValue(new Error('Health check failed'));

    const isHealthy = await provider.isHealthy();
    expect(isHealthy).toBe(false);
  });
});
