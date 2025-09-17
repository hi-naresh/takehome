import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  AIProvider,
  ExtractionRequest,
  ExtractionResult,
} from '../ai.contracts';
import { AI_PROVIDER, PROMPT_SERVICE } from '../ai.tokens';
import { PromptService } from './prompt.service';

@Injectable()
export class ContractExtractionService {
  private readonly logger = new Logger(ContractExtractionService.name);

  constructor(
    @Inject(AI_PROVIDER) private readonly aiProvider: AIProvider,
    @Inject(PROMPT_SERVICE) private readonly promptService: PromptService,
  ) {}

  async extractContractData(
    request: ExtractionRequest,
  ): Promise<
    ExtractionResult & { wordCount: number; isImageBasedPdf: boolean }
  > {
    return this.extractContractDataFromText(request);
  }

  // TODO: Implement image-based contract extraction later
  // async extractContractDataFromImage(
  //   fileBuffer: Buffer,
  //   fileName: string,
  // ): Promise<ExtractionResult> {
  //   try {
  //     // TODO: Implement image-based contract extraction
  //     return {
  //       contractHolderName: null,
  //       contractId: null,
  //       renewalDate: null,
  //       serviceProduct: null,
  //       contactEmail: null,
  //     };
  //   } catch (error) {
  //     this.logger.error('Image-based contract extraction failed', error);
  //     throw new Error(
  //       `Image-based contract extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
  //     );
  //   }
  // }

  async extractContractDataFromText(
    request: ExtractionRequest,
  ): Promise<
    ExtractionResult & { wordCount: number; isImageBasedPdf: boolean }
  > {
    try {
      this.logger.log(`Extracting contract data from: ${request.fileName}`);

      // Debug: Log parsed text statistics
      const wordCount = request.pdfText.trim().split(/\s+/).length;
      const charCount = request.pdfText.length;
      this.logger.debug(
        `Parsed text statistics - Words: ${wordCount}, Characters: ${charCount}`,
      );

      // Check if this is likely an image-based PDF (very low word count)
      const isImageBasedPdf = wordCount < 20; // Threshold for image-based PDF detection
      if (isImageBasedPdf) {
        this.logger.warn(
          `Detected potential image-based PDF with only ${wordCount} words. Consider using AI vision processing.`,
        );
      }

      const prompt = this.promptService.generateExtractionPrompt(
        request.pdfText,
        request.fileName,
      );

      const completion = await this.aiProvider.complete({
        prompt,
        maxTokens: 1000,
        temperature: 0.1,
      });

      const extractedData = this.parseExtractionResult(completion.text);

      this.logger.log('Contract data extracted successfully');
      return {
        ...extractedData,
        wordCount,
        isImageBasedPdf,
      };
    } catch (error) {
      this.logger.error('Contract extraction failed', error);
      throw new Error(
        `Contract extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private parseExtractionResult(text: string): ExtractionResult {
    try {
      // Clean the text to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const jsonString = jsonMatch[0];
      const parsed = JSON.parse(jsonString) as Record<string, unknown>;

      // Validate required fields
      const result: ExtractionResult = {
        contractHolderName:
          typeof parsed.contractHolderName === 'string'
            ? parsed.contractHolderName
            : null,
        contractId:
          typeof parsed.contractId === 'string' ? parsed.contractId : null,
        renewalDate:
          typeof parsed.renewalDate === 'string' ? parsed.renewalDate : null,
        serviceProduct:
          typeof parsed.serviceProduct === 'string'
            ? parsed.serviceProduct
            : null,
        contactEmail:
          typeof parsed.contactEmail === 'string' ? parsed.contactEmail : null,
      };

      return result;
    } catch (error) {
      this.logger.error('Failed to parse extraction result', {
        text,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error(
        `Failed to parse extraction result: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
