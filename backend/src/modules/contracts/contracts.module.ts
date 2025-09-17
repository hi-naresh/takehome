import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ContractsController } from './controllers/contracts.controller';
import { ContractUploadService } from './services/upload.service';
import { ContractExtractService } from './services/extract.service';
import { ContractReminderBusinessService } from './services/reminder.service';
import { SupabaseService } from '../../common/supabase';
import { FileUploadService } from '../../core/util/file-uploader';
import { ContractReminderService } from '../../core/util/reminder-scheduler';
import { ContractExtractionService } from '../../core/ai/services/extraction.service';
import { ContractPromptService } from '../../core/ai/services/prompt.service';
import { OpenAIProvider } from '../../core/ai/providers/openai.provider';
import { AI_PROVIDER, PROMPT_SERVICE } from '../../core/ai/ai.tokens';

@Module({
  imports: [ConfigModule],
  controllers: [ContractsController],
  providers: [
    // Core services
    SupabaseService,
    FileUploadService,
    ContractReminderService,

    // AI services
    {
      provide: PROMPT_SERVICE,
      useClass: ContractPromptService,
    },
    {
      provide: AI_PROVIDER,
      useClass: OpenAIProvider,
    },
    ContractExtractionService,

    // Business services
    ContractUploadService,
    ContractExtractService,
    ContractReminderBusinessService,
  ],
  exports: [ContractExtractService, ContractReminderBusinessService],
})
export class ContractsModule {}
