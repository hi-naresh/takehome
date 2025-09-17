import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class ScheduleReminderDto {
  @IsUUID()
  contractId: string;

  @IsString()
  renewalDate: string;

  @IsNumber()
  daysBeforeRenewal: number;

  @IsBoolean()
  enabled: boolean;
}

export class ReminderStatusDto {
  @IsUUID()
  contractId: string;

  @IsNumber()
  daysUntilRenewal: number;

  @IsBoolean()
  reminderScheduled: boolean;

  @IsOptional()
  @IsString()
  reminderDate?: string;
}
