import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private readonly client: SupabaseClient<Database>;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!url || !key) {
      throw new Error('Supabase configuration is missing');
    }

    this.client = createClient<Database>(url, key);
    this.logger.log('Supabase client initialized');
  }

  getClient(): SupabaseClient<Database> {
    return this.client;
  }

  async isHealthy(): Promise<boolean> {
    try {
      const { error } = await this.client.from('users').select('id').limit(1);
      return !error;
    } catch (error) {
      this.logger.warn('Supabase health check failed', error);
      return false;
    }
  }
}
