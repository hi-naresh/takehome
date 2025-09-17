import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UploadDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
