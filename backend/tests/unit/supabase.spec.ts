import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../src/common/supabase';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('SupabaseService', () => {
  let service: SupabaseService;
  let configService: ConfigService;
  let mockSupabaseClient: any;

  beforeEach(async () => {
    // Mock Supabase client
    mockSupabaseClient = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({
            data: [{ id: 'test-id' }],
            error: null,
          }),
        }),
      }),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        const config: Record<string, string> = {
          SUPABASE_URL: 'https://test.supabase.co',
          SUPABASE_ANON_KEY: 'test-anon-key',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<SupabaseService>(SupabaseService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error if Supabase configuration is missing', async () => {
    const mockConfigServiceWithoutKeys = {
      get: jest.fn().mockReturnValue(undefined),
    };

    await expect(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          SupabaseService,
          {
            provide: ConfigService,
            useValue: mockConfigServiceWithoutKeys,
          },
        ],
      }).compile();

      module.get<SupabaseService>(SupabaseService);
    }).rejects.toThrow('Supabase configuration is missing');
  });

  it('should return Supabase client', () => {
    const client = service.getClient();
    expect(client).toBe(mockSupabaseClient);
  });

  it('should check health successfully', async () => {
    const isHealthy = await service.isHealthy();
    expect(isHealthy).toBe(true);
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
  });

  it('should return false when health check fails', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }),
    });

    const isHealthy = await service.isHealthy();
    expect(isHealthy).toBe(false);
  });

  it('should return false when health check throws error', async () => {
    mockSupabaseClient.from.mockImplementation(() => {
      throw new Error('Connection failed');
    });

    const isHealthy = await service.isHealthy();
    expect(isHealthy).toBe(false);
  });
});
