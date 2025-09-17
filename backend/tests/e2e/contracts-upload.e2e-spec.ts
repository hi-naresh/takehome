import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { ContractUploadService } from '../../src/modules/contracts/services/upload.service';
import { ContractExtractionService } from '../../src/core/ai/services/extraction.service';
import { FileUploadService } from '../../src/core/util/file-uploader';
import { E2ETestHelper } from '../utils/e2e-setup';

describe('Contracts Upload E2E', () => {
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
      .overrideProvider(ContractUploadService)
      .useValue({
        uploadAndParsePdf: jest.fn().mockResolvedValue({
          filePath: 'uploads/test-contract.pdf',
          publicUrl:
            'https://test.supabase.co/storage/v1/object/public/contracts/uploads/test-contract.pdf',
          pdfText: 'Sample contract text content',
        }),
      })
      .overrideProvider(ContractExtractionService)
      .useValue({
        extractContractData: jest.fn().mockResolvedValue({
          contractHolderName: 'John Doe',
          contractId: 'CONTRACT-123',
          renewalDate: '2024-12-31',
          serviceProduct: 'Cloud Storage',
          contactEmail: 'john.doe@example.com',
          wordCount: 5,
          isImageBasedPdf: false,
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /contracts/upload', () => {
    it('should upload and extract contract data successfully', () => {
      const mockFile = Buffer.from('PDF content');

      return request(app.getHttpServer())
        .post('/contracts/upload?userId=550e8400-e29b-41d4-a716-446655440000')
        .attach('file', mockFile, 'test-contract.pdf')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('extractedData');
          expect(res.body.data).toHaveProperty('filePath');
          expect(res.body.data).toHaveProperty('publicUrl');
          expect(res.body.data.extractedData).toHaveProperty(
            'contractHolderName',
            'John Doe',
          );
          expect(res.body.data.extractedData).toHaveProperty(
            'contractId',
            'CONTRACT-123',
          );
        });
    });

    it('should handle missing file', () => {
      return request(app.getHttpServer())
        .post('/contracts/upload?userId=550e8400-e29b-41d4-a716-446655440000')
        .expect(400);
    });

    it('should handle invalid file type', () => {
      const mockFile = Buffer.from('Not a PDF');

      return request(app.getHttpServer())
        .post('/contracts/upload?userId=550e8400-e29b-41d4-a716-446655440000')
        .attach('file', mockFile, 'test.txt')
        .expect(200); // The service should still process it
    });

    it('should handle upload service errors', async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
          }),
          AppModule,
        ],
      })
        .overrideProvider(ContractUploadService)
        .useValue({
          uploadAndParsePdf: jest
            .fn()
            .mockRejectedValue(new Error('Upload failed')),
        })
        .overrideProvider(ContractExtractionService)
        .useValue({
          extractContractData: jest.fn(),
        })
        .compile();

      const testApp = moduleFixture.createNestApplication();
      await testApp.init();

      const mockFile = Buffer.from('PDF content');

      await request(testApp.getHttpServer())
        .post('/contracts/upload?userId=550e8400-e29b-41d4-a716-446655440000')
        .attach('file', mockFile, 'test-contract.pdf')
        .expect(500);

      await testApp.close();
    });

    it('should exercise real pdf-parse; fail gracefully without import error', async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
          }),
          AppModule,
        ],
      })
        // Do NOT override ContractUploadService so that real pdf-parse path is used
        // Stub FileUploadService to avoid network calls
        .overrideProvider(FileUploadService)
        .useValue({
          uploadFile: jest.fn().mockResolvedValue({
            filePath: 'uploads/test.pdf',
            publicUrl: 'https://public/url/test.pdf',
            fileSize: 10,
          }),
        })
        // Stub ContractExtractionService to avoid external calls
        .overrideProvider(ContractExtractionService)
        .useValue({
          extractContractData: jest.fn().mockResolvedValue({
            contractHolderName: 'Someone',
            contractId: 'X',
            renewalDate: '2026-01-01',
            serviceProduct: 'X',
            contactEmail: 'x@example.com',
            wordCount: 1,
            isImageBasedPdf: false,
          }),
        })
        .compile();

      const testApp = moduleFixture.createNestApplication();
      await testApp.init();

      const mockFile = Buffer.from(
        '%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>',
      );

      // Exercise the upload + pdf-parse path. Parsing may fail for this minimal buffer,
      // but we assert the error is NOT the interop one we fixed earlier.
      const res = await request(testApp.getHttpServer())
        .post('/contracts/upload?userId=550e8400-e29b-41d4-a716-446655440000')
        .attach('file', mockFile, 'minimal.pdf')
        .expect((r) => {
          // Accept either success (pdf parsed) or 500 error (parsing failed),
          // but must not be the import/interop error.
          if (r.status !== 200 && r.status !== 500) {
            throw new Error(`Unexpected status ${r.status}`);
          }
        });

      if (res.status === 500) {
        expect(res.body?.message ?? '').toContain('PDF text extraction failed');
        expect(String(res.body?.message ?? '')).not.toContain(
          'is not a function',
        );
      }

      await testApp.close();
    });
  });
});
