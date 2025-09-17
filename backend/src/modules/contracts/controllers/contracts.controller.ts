import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpCode,
  Logger,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { ContractUploadService } from '../services/upload.service';
import {
  ContractExtractService,
  ExtendedExtractionResult,
} from '../services/extract.service';
import { ContractReminderBusinessService } from '../services/reminder.service';
import {
  UpdateContractDto,
  ContractResponseDto,
} from '../dtos/contracts-crud.dto';
import { ScheduleReminderDto, ReminderStatusDto } from '../dtos/reminder.dto';
import { Contract } from '../../../types/database';

@ApiTags('contracts')
@Controller('contracts')
export class ContractsController {
  private readonly logger = new Logger(ContractsController.name);

  constructor(
    private readonly uploadService: ContractUploadService,
    private readonly extractService: ContractExtractService,
    private readonly reminderService: ContractReminderBusinessService,
  ) {}

  private mapContractToResponseDto(contract: Contract): ContractResponseDto {
    return {
      id: contract.id,
      userId: contract.user_id || undefined,
      contractHolderName: contract.contract_holder_name || undefined,
      contractIdentifier: contract.contract_identifier || undefined,
      renewalDate: contract.renewal_date || undefined,
      serviceProduct: contract.service_product || undefined,
      contactEmail: contract.contact_email || undefined,
      filePath: contract.file_path || undefined,
      createdAt: contract.created_at,
      updatedAt: contract.updated_at,
    };
  }

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload and extract contract data from PDF (without saving)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Contract data extracted successfully',
  })
  async uploadAndExtract(
    @UploadedFile() file: Express.Multer.File,
    @Query('userId') userId: string = '550e8400-e29b-41d4-a716-446655440000', // Mock user for demo
  ): Promise<{
    success: boolean;
    data: {
      extractedData: ExtendedExtractionResult & {
        userId: string;
        filePath: string;
      };
      filePath: string;
      publicUrl: string;
    };
  }> {
    try {
      this.logger.log(`Processing contract upload for user: ${userId}`);

      // Validate file upload
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      // Upload and parse PDF
      const { filePath, publicUrl, pdfText } =
        await this.uploadService.uploadAndParsePdf(file);

      // Extract contract data (without saving to database)
      const extractedData = await this.extractService.extractContractData(
        { pdfText, fileName: file.originalname },
        userId,
        filePath,
      );

      return {
        success: true,
        data: {
          extractedData,
          filePath,
          publicUrl,
        },
      };
    } catch (error) {
      this.logger.error('Contract upload and extraction failed', error);
      throw error;
    }
  }

  @Post('save')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Save extracted contract data to database' })
  @ApiResponse({ status: 201, description: 'Contract saved successfully' })
  async saveContract(
    @Body()
    contractData: {
      extractedData: ExtendedExtractionResult;
      userId: string;
      filePath: string;
    },
  ) {
    try {
      this.logger.log(`Saving contract for user: ${contractData.userId}`);

      // Validate extracted data before saving
      if (!this.isValidContractData(contractData.extractedData)) {
        throw new Error(
          'Invalid contract data: Missing required fields or insufficient information',
        );
      }

      // Save contract to database
      const contract = await this.extractService.saveContract(
        contractData.extractedData,
        contractData.userId,
        contractData.filePath,
      );

      return {
        success: true,
        data: {
          contract,
        },
      };
    } catch (error) {
      this.logger.error('Contract save failed', error);
      throw error;
    }
  }

  private isValidContractData(data: ExtendedExtractionResult): boolean {
    // Check if we have meaningful contract data
    const hasValidHolder =
      data.contractHolderName && data.contractHolderName.trim().length > 0;
    const hasValidService =
      data.serviceProduct && data.serviceProduct.trim().length > 0;
    const hasValidEmail = data.contactEmail && data.contactEmail.includes('@');

    // At least 2 out of 3 key fields should be present for a valid contract
    const validFields = [hasValidHolder, hasValidService, hasValidEmail].filter(
      Boolean,
    ).length;

    return validFields >= 2;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contract by ID' })
  @ApiResponse({ status: 200, description: 'Contract retrieved successfully' })
  async getContract(@Param('id') id: string): Promise<ContractResponseDto> {
    const contract = await this.extractService.getContract(id);
    if (!contract) {
      throw new Error('Contract not found');
    }
    return this.mapContractToResponseDto(contract);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all contracts for a user' })
  @ApiResponse({
    status: 200,
    description: 'User contracts retrieved successfully',
  })
  async getUserContracts(
    @Param('userId') userId: string,
  ): Promise<ContractResponseDto[]> {
    const contracts = await this.extractService.getUserContracts(userId);
    return contracts.map((contract) => this.mapContractToResponseDto(contract));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update contract' })
  @ApiResponse({ status: 200, description: 'Contract updated successfully' })
  async updateContract(
    @Param('id') id: string,
    @Body() updateDto: UpdateContractDto,
  ): Promise<ContractResponseDto> {
    // Map DTO to database update type
    const contractUpdate = {
      contract_holder_name: updateDto.contractHolderName,
      contract_identifier: updateDto.contractIdentifier,
      renewal_date: updateDto.renewalDate,
      service_product: updateDto.serviceProduct,
      contact_email: updateDto.contactEmail,
      file_path: updateDto.filePath,
    };

    const contract = await this.extractService.updateContract(
      id,
      contractUpdate,
    );
    return this.mapContractToResponseDto(contract);
  }

  @Post(':id/reminder')
  @ApiOperation({ summary: 'Schedule reminder for contract renewal' })
  @ApiResponse({ status: 200, description: 'Reminder scheduled successfully' })
  scheduleReminder(
    @Param('id') contractId: string,
    @Body() scheduleDto: Omit<ScheduleReminderDto, 'contractId'>,
  ): { success: boolean } {
    this.reminderService.scheduleReminder({
      ...scheduleDto,
      contractId,
    });

    return { success: true };
  }

  @Get(':id/reminder/status')
  @ApiOperation({ summary: 'Get reminder status for contract' })
  @ApiResponse({
    status: 200,
    description: 'Reminder status retrieved successfully',
  })
  async getReminderStatus(
    @Param('id') contractId: string,
  ): Promise<ReminderStatusDto> {
    return this.reminderService.getReminderStatus(contractId);
  }

  @Get('user/:userId/upcoming-renewals')
  @ApiOperation({ summary: 'Get upcoming contract renewals for user' })
  @ApiResponse({
    status: 200,
    description: 'Upcoming renewals retrieved successfully',
  })
  async getUpcomingRenewals(
    @Param('userId') userId: string,
    @Query('daysAhead') daysAhead: number = 30,
  ) {
    const renewals = await this.reminderService.getUpcomingRenewals(
      userId,
      daysAhead,
    );
    return { success: true, data: renewals };
  }
}
