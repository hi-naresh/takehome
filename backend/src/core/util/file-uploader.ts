import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../../types/database';

export interface UploadResult {
  filePath: string;
  publicUrl: string;
  fileSize: number;
}

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private readonly supabase: SupabaseClient<Database>;
  private readonly supabaseAdmin?: SupabaseClient<Database>;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_ANON_KEY');
    const serviceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!url || !key) {
      throw new Error('Supabase configuration is missing');
    }

    this.supabase = createClient(url, key);

    // Create admin client for bucket operations if service role key is available
    if (serviceRoleKey) {
      this.supabaseAdmin = createClient(url, serviceRoleKey);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    bucketName: string = 'contracts',
  ): Promise<UploadResult> {
    try {
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = `uploads/${fileName}`;

      // First, try to create the bucket if it doesn't exist
      await this.ensureBucketExists(bucketName);

      const { error } = await this.supabase.storage
        .from(bucketName)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        this.logger.error('Upload error details:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      const { data } = this.supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      this.logger.log(`File uploaded successfully: ${filePath}`);

      return {
        filePath,
        publicUrl: data.publicUrl,
        fileSize: file.size,
      };
    } catch (error) {
      this.logger.error('File upload failed', error);
      throw new Error(
        `File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async ensureBucketExists(bucketName: string): Promise<void> {
    try {
      // Only check bucket existence if we have admin access
      if (!this.supabaseAdmin) {
        this.logger.log(
          `Skipping bucket existence check (no admin access). Proceeding with upload to '${bucketName}'`,
        );
        return;
      }

      // Try to get the bucket to see if it exists using admin client
      const { data: buckets, error: listError } =
        await this.supabaseAdmin.storage.listBuckets();

      if (listError) {
        this.logger.warn('Could not list buckets:', listError.message);
        return;
      }

      const bucketExists = buckets?.some(
        (bucket) => bucket.name === bucketName,
      );

      if (!bucketExists) {
        this.logger.warn(
          `Bucket '${bucketName}' does not exist. Please create it in Supabase dashboard.`,
        );
      } else {
        this.logger.log(`Bucket '${bucketName}' exists and is accessible.`);
      }
    } catch (error) {
      this.logger.warn('Could not check bucket existence:', error);
    }
  }

  async deleteFile(
    filePath: string,
    bucketName: string = 'contracts',
  ): Promise<void> {
    try {
      const { error } = await this.supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }

      this.logger.log(`File deleted successfully: ${filePath}`);
    } catch (error) {
      this.logger.error('File deletion failed', error);
      throw new Error(
        `File deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
