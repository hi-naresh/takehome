import { Injectable, Logger } from '@nestjs/common';
import { FileUploadService } from '../../../core/util/file-uploader';
import pdfParse = require('pdf-parse');

@Injectable()
export class ContractUploadService {
  private readonly logger = new Logger(ContractUploadService.name);

  constructor(private readonly fileUploadService: FileUploadService) {}

  async uploadAndParsePdf(file: Express.Multer.File): Promise<{
    filePath: string;
    publicUrl: string;
    pdfText: string;
  }> {
    try {
      this.logger.log(`Processing PDF upload: ${file.originalname}`);

      // Upload file to storage
      const uploadResult = await this.fileUploadService.uploadFile(file);

      // Extract text from PDF
      const pdfText = await this.extractTextFromPdf(file.buffer);

      this.logger.log(`PDF processed successfully: ${uploadResult.filePath}`);

      return {
        filePath: uploadResult.filePath,
        publicUrl: uploadResult.publicUrl,
        pdfText,
      };
    } catch (error) {
      this.logger.error('PDF upload and parsing failed', error);
      throw new Error(
        `PDF upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      this.logger.error('PDF text extraction failed', error);
      throw new Error(
        `PDF text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
