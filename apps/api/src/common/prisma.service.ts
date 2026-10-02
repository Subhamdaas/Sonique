import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString =
      process.env.DATABASE_URL ||
      'postgresql://sonique:sonique_password@localhost:5432/sonique';

    const isCloudOrSupabase =
      connectionString.includes('supabase.co') ||
      connectionString.includes('supabase.com') ||
      connectionString.includes('pooler.supabase.com') ||
      connectionString.includes('sslmode=require');

    const cleanConnectionString = connectionString.split('?')[0];

    const pool = new Pool({
      connectionString: cleanConnectionString,
      ssl: isCloudOrSupabase ? { rejectUnauthorized: false } : undefined,
    });

    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connected to database successfully');
    } catch (err: any) {
      this.logger.error(`Database connection failed: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}