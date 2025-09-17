import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../../common/supabase';
import { ContractExtractionService } from '../../../core/ai/services/extraction.service';
import {
  ContractInsert,
  ContractUpdate,
  Contract,
} from '../../../types/database';
import {
  ExtractionRequest,
  ExtractionResult,
} from '../../../core/ai/ai.contracts';

// Extended extraction result that includes additional fields from AI service
export interface ExtendedExtractionResult extends ExtractionResult {
  wordCount: number;
  isImageBasedPdf: boolean;
}

@Injectable()
export class ContractExtractService {
  private readonly logger = new Logger(ContractExtractService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly extractionService: ContractExtractionService,
  ) {}

  async extractContractData(
    request: ExtractionRequest,
    userId: string,
    filePath: string,
  ): Promise<ExtendedExtractionResult & { userId: string; filePath: string }> {
    try {
      this.logger.log(`Extracting contract data for user: ${userId}`);

      // Extract data using AI
      const extractedData =
        await this.extractionService.extractContractData(request);

      return {
        ...extractedData,
        userId,
        filePath,
      };
    } catch (error) {
      this.logger.error('Contract extraction failed', error);
      throw new Error(
        `Contract extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // TODO: Implement image-based contract extraction later
  // async extractContractDataFromImage(
  //   fileBuffer: Buffer,
  //   fileName: string,
  //   userId: string,
  //   filePath: string,
  // ): Promise<any> {
  //   try {
  //     this.logger.log(`Extracting contract data from image for user: ${userId}`);

  //     // Extract data using AI vision
  //     const extractedData =
  //       await this.extractionService.extractContractDataFromImage(fileBuffer, fileName);

  //     return {
  //       ...extractedData,
  //       userId,
  //       filePath,
  //     };
  //   } catch (error) {
  //     this.logger.error('Image-based contract extraction failed', error);
  //     throw new Error(`Image-based contract extraction failed: ${error.message}`);
  //   }
  // }

  async saveContract(
    extractedData: ExtendedExtractionResult,
    userId: string,
    filePath: string,
  ): Promise<Contract> {
    try {
      this.logger.log(`Saving contract for user: ${userId}`);

      // Prepare contract data for database
      const contractData: ContractInsert = {
        user_id: userId,
        contract_holder_name: extractedData.contractHolderName,
        contract_identifier: extractedData.contractId,
        renewal_date: extractedData.renewalDate,
        service_product: extractedData.serviceProduct,
        contact_email: extractedData.contactEmail,
        file_path: filePath,
      };

      // Save to database
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = (await this.supabaseService
        .getClient()
        .from('contracts')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        .insert(contractData as any)
        .select()
        .single()) as any;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (response.error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        throw new Error(`Database save failed: ${response.error.message}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!response.data) {
        throw new Error('Database save failed: No data returned');
      }

      this.logger.log(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Contract saved successfully with ID: ${response.data.id}`,
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      return response.data;
    } catch (error) {
      this.logger.error('Contract save failed', error);
      throw new Error(
        `Contract save failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // Keep the old method for backward compatibility
  async extractAndSaveContract(
    request: ExtractionRequest,
    userId: string,
    filePath: string,
  ): Promise<Contract> {
    const extractedData = await this.extractContractData(
      request,
      userId,
      filePath,
    );
    return await this.saveContract(extractedData, userId, filePath);
  }

  async updateContract(
    contractId: string,
    updates: ContractUpdate,
  ): Promise<Contract> {
    try {
      this.logger.log(`Updating contract: ${contractId}`);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const response = await (
        this.supabaseService.getClient().from('contracts') as any
      )
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .update(updates)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .eq('id', contractId)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .select()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .single();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (response.error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        throw new Error(`Contract update failed: ${response.error.message}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!response.data) {
        throw new Error('Contract update failed: No data returned');
      }

      this.logger.log(`Contract updated successfully: ${contractId}`);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      return response.data;
    } catch (error) {
      this.logger.error('Contract update failed', error);
      throw new Error(
        `Contract update failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getContract(contractId: string): Promise<Contract | null> {
    try {
      const response = await this.supabaseService
        .getClient()
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (response.error) {
        if (response.error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Contract retrieval failed: ${response.error.message}`);
      }

      return response.data as Contract;
    } catch (error) {
      this.logger.error('Contract retrieval failed', error);
      throw new Error(
        `Contract retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getUserContracts(userId: string): Promise<Contract[]> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('contracts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`User contracts retrieval failed: ${error.message}`);
      }

      return (data as Contract[]) || [];
    } catch (error) {
      this.logger.error('User contracts retrieval failed', error);
      throw new Error(
        `User contracts retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
