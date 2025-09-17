import { Test, TestingModule } from '@nestjs/testing';
import { ContractUploadService } from '../../src/modules/contracts/services/upload.service';
import { FileUploadService } from '../../src/core/util/file-uploader';
import * as pdfParse from 'pdf-parse';

// Mock pdf-parse
jest.mock('pdf-parse', () => jest.fn());

describe('ContractUploadService', () => {
  let service: ContractUploadService;
  let mockFileUploadService: jest.Mocked<FileUploadService>;

  beforeEach(async () => {
    const mockFileUploadServiceValue = {
      uploadFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractUploadService,
        {
          provide: FileUploadService,
          useValue: mockFileUploadServiceValue,
        },
      ],
    }).compile();

    service = module.get<ContractUploadService>(ContractUploadService);
    mockFileUploadService = module.get(FileUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should upload and parse PDF successfully', async () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'contract.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('PDF content'),
      destination: '',
      filename: 'contract.pdf',
      path: '',
      stream: null as any,
    };

    const mockUploadResult = {
      filePath: 'uploads/test-file.pdf',
      publicUrl:
        'https://test.supabase.co/storage/v1/object/public/contracts/uploads/test-file.pdf',
      fileSize: 1024,
    };

    const mockPdfText = 'This is extracted PDF text content';

    mockFileUploadService.uploadFile.mockResolvedValue(mockUploadResult);
    (pdfParse as jest.Mock).mockResolvedValue({ text: mockPdfText });

    const result = await service.uploadAndParsePdf(mockFile);

    expect(result).toEqual({
      filePath: mockUploadResult.filePath,
      publicUrl: mockUploadResult.publicUrl,
      pdfText: mockPdfText,
    });

    expect(mockFileUploadService.uploadFile).toHaveBeenCalledWith(mockFile);
    expect(pdfParse).toHaveBeenCalledWith(mockFile.buffer);
  });

  it('should handle file upload errors', async () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'contract.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('PDF content'),
      destination: '',
      filename: 'contract.pdf',
      path: '',
      stream: null as any,
    };

    mockFileUploadService.uploadFile.mockRejectedValue(
      new Error('Upload failed'),
    );

    await expect(service.uploadAndParsePdf(mockFile)).rejects.toThrow(
      'PDF upload failed: Upload failed',
    );
  });

  it('should handle PDF parsing errors', async () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'contract.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('Invalid PDF content'),
      destination: '',
      filename: 'contract.pdf',
      path: '',
      stream: null as any,
    };

    const mockUploadResult = {
      filePath: 'uploads/test-file.pdf',
      publicUrl:
        'https://test.supabase.co/storage/v1/object/public/contracts/uploads/test-file.pdf',
      fileSize: 1024,
    };

    mockFileUploadService.uploadFile.mockResolvedValue(mockUploadResult);
    (pdfParse as jest.Mock).mockRejectedValue(new Error('PDF parsing failed'));

    await expect(service.uploadAndParsePdf(mockFile)).rejects.toThrow(
      'PDF upload failed: PDF text extraction failed: PDF parsing failed',
    );
  });

  it('should handle unknown errors', async () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'contract.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('PDF content'),
      destination: '',
      filename: 'contract.pdf',
      path: '',
      stream: null as any,
    };

    mockFileUploadService.uploadFile.mockRejectedValue('Unknown error');

    await expect(service.uploadAndParsePdf(mockFile)).rejects.toThrow(
      'PDF upload failed: Unknown error',
    );
  });
});
