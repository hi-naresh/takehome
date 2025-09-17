import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsDateString,
} from 'class-validator';

export class ExtractDto {
  @IsString()
  @IsNotEmpty()
  pdfText: string;

  @IsString()
  @IsNotEmpty()
  fileName: string;
}

export class ExtractionResultDto {
  @IsOptional()
  @IsString()
  contractHolderName?: string;

  @IsOptional()
  @IsString()
  contractId?: string;

  @IsOptional()
  @IsDateString()
  renewalDate?: string;

  @IsOptional()
  @IsString()
  serviceProduct?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;
}
