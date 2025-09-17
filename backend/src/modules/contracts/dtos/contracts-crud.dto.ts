import {
  IsString,
  IsOptional,
  IsEmail,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class CreateContractDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  contractHolderName?: string;

  @IsOptional()
  @IsString()
  contractIdentifier?: string;

  @IsOptional()
  @IsDateString()
  renewalDate?: string;

  @IsOptional()
  @IsString()
  serviceProduct?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  filePath?: string;
}

export class UpdateContractDto {
  @IsOptional()
  @IsString()
  contractHolderName?: string;

  @IsOptional()
  @IsString()
  contractIdentifier?: string;

  @IsOptional()
  @IsDateString()
  renewalDate?: string;

  @IsOptional()
  @IsString()
  serviceProduct?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  filePath?: string;
}

export class ContractResponseDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  contractHolderName?: string;

  @IsOptional()
  @IsString()
  contractIdentifier?: string;

  @IsOptional()
  @IsDateString()
  renewalDate?: string;

  @IsOptional()
  @IsString()
  serviceProduct?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  filePath?: string;

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;
}
