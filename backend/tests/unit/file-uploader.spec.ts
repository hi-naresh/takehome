import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FileUploadService } from '../../src/core/util/file-uploader';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234'),
}));

describe('FileUploadService', () => {
  let service: FileUploadService;
  let configService: ConfigService;
  let mockSupabaseClient: any;

  beforeEach(async () => {
    // Mock Supabase client
    mockSupabaseClient = {
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue({
            data: { path: 'uploads/mock-uuid-1234.pdf' },
            error: null,
          }),
          getPublicUrl: jest.fn().mockReturnValue({
            data: {
              publicUrl:
                'https://test.supabase.co/storage/v1/object/public/contracts/uploads/mock-uuid-1234.pdf',
            },
          }),
        }),
        listBuckets: jest.fn().mockResolvedValue({
          data: [{ name: 'contracts' }],
          error: null,
        }),
        createBucket: jest.fn().mockResolvedValue({
          data: { name: 'contracts' },
          error: null,
        }),
      },
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        const config: Record<string, string> = {
          SUPABASE_URL: 'https://test.supabase.co',
          SUPABASE_ANON_KEY: 'test-anon-key',
          SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileUploadService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
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
          FileUploadService,
          {
            provide: ConfigService,
            useValue: mockConfigServiceWithoutKeys,
          },
        ],
      }).compile();

      module.get<FileUploadService>(FileUploadService);
    }).rejects.toThrow('Supabase configuration is missing');
  });

  it('should upload file successfully', async () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('test content'),
      destination: '',
      filename: 'test.pdf',
      path: '',
      stream: null as any,
    };

    const result = await service.uploadFile(mockFile);

    expect(result).toEqual({
      filePath: 'uploads/mock-uuid-1234.pdf',
      publicUrl:
        'https://test.supabase.co/storage/v1/object/public/contracts/uploads/mock-uuid-1234.pdf',
      fileSize: 1024,
    });

    expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('contracts');
  });

  it('should handle upload errors', async () => {
    mockSupabaseClient.storage.from.mockReturnValue({
      upload: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Upload failed' },
      }),
    });

    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('test content'),
      destination: '',
      filename: 'test.pdf',
      path: '',
      stream: null as any,
    };

    await expect(service.uploadFile(mockFile)).rejects.toThrow('Upload failed');
  });

  it('should check bucket existence with admin client', async () => {
    // Create a new service instance with admin client
    const mockSupabaseAdmin = {
      storage: {
        listBuckets: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      },
    };

    const mockConfigServiceWithAdmin = {
      get: jest.fn().mockImplementation((key: string) => {
        const config: Record<string, string> = {
          SUPABASE_URL: 'https://test.supabase.co',
          SUPABASE_ANON_KEY: 'test-anon-key',
          SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        };
        return config[key];
      }),
    };

    // Mock the createClient to return different clients for different keys
    (createClient as jest.Mock).mockImplementation(
      (url: string, key: string) => {
        if (key === 'test-service-role-key') {
          return mockSupabaseAdmin;
        }
        return mockSupabaseClient;
      },
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileUploadService,
        {
          provide: ConfigService,
          useValue: mockConfigServiceWithAdmin,
        },
      ],
    }).compile();

    const serviceWithAdmin = module.get<FileUploadService>(FileUploadService);

    // Mock the upload after bucket check
    mockSupabaseClient.storage.from.mockReturnValue({
      upload: jest.fn().mockResolvedValue({
        data: { path: 'uploads/mock-uuid-1234.pdf' },
        error: null,
      }),
      getPublicUrl: jest.fn().mockReturnValue({
        data: {
          publicUrl:
            'https://test.supabase.co/storage/v1/object/public/new-bucket/uploads/mock-uuid-1234.pdf',
        },
      }),
    });

    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('test content'),
      destination: '',
      filename: 'test.pdf',
      path: '',
      stream: null as any,
    };

    await serviceWithAdmin.uploadFile(mockFile, 'new-bucket');

    // The service checks bucket existence but doesn't create it
    expect(mockSupabaseAdmin.storage.listBuckets).toHaveBeenCalled();
  });
});
