import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { SupabaseService } from '../common/supabase.service';

@Module({
  controllers: [StorageController],
  providers: [StorageService, SupabaseService],
  exports: [StorageService],
})
export class StorageModule {}
