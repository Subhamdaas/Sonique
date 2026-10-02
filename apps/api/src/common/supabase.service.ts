import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;

  onModuleInit() {
    if (env.isSupabaseConfigured && env.supabaseUrl) {
      const apiKey = env.supabaseServiceRoleKey || env.supabaseAnonKey;
      if (apiKey) {
        try {
          this.client = createClient(env.supabaseUrl, apiKey, {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            },
          });
          this.logger.log('Supabase client initialized successfully');
        } catch (err: any) {
          this.logger.error(`Failed to initialize Supabase client: ${err.message}`);
        }
      }
    } else {
      this.logger.log('Supabase credentials not configured; using local storage & database fallback');
    }
  }

  getClient(): SupabaseClient | null {
    return this.client;
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async uploadToStorage(
    bucket: string,
    filePath: string,
    fileBuffer: Buffer,
    contentType: string,
  ): Promise<{ url: string; path: string } | null> {
    if (!this.client) {
      return null;
    }

    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .upload(filePath, fileBuffer, {
          contentType,
          upsert: true,
        });

      if (error) {
        this.logger.error(`Supabase Storage upload error: ${error.message}`);
        return null;
      }

      const { data: publicUrlData } = this.client.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return {
        url: publicUrlData.publicUrl,
        path: data.path,
      };
    } catch (err: any) {
      this.logger.error(`Supabase upload exception: ${err.message}`);
      return null;
    }
  }
}
