import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { env } from '../config/env';
import { SupabaseService } from '../common/supabase.service';

export interface UploadFile {
  buffer: Buffer;
  originalname: string;
  size: number;
  mimetype: string;
}

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  '.mp3': ['audio/mpeg', 'audio/mp3'],
  '.wav': ['audio/wav', 'audio/wave', 'audio/x-wav'],
  '.ogg': ['audio/ogg', 'application/ogg'],
  '.m4a': ['audio/m4a', 'audio/x-m4a', 'audio/mp4'],
  '.aac': ['audio/aac', 'audio/x-aac'],
  '.flac': ['audio/flac', 'audio/x-flac'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.webp': ['image/webp'],
};

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor(private readonly supabaseService: SupabaseService) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(
    file: UploadFile,
  ): Promise<{ url: string; filename: string; size: number; mimetype: string }> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No valid file buffer provided');
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const validMimes = ALLOWED_MIME_TYPES[ext];

    if (!validMimes) {
      throw new BadRequestException(
        `File extension ${ext} not supported. Allowed: ${Object.keys(ALLOWED_MIME_TYPES).join(', ')}`,
      );
    }

    // Validate MIME type matches extension
    const mime = (file.mimetype || '').toLowerCase();
    if (!validMimes.some((vm) => mime.includes(vm) || vm.includes(mime))) {
      throw new BadRequestException(
        `File MIME type "${file.mimetype}" does not match extension "${ext}". Expected: ${validMimes.join(', ')}`,
      );
    }

    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;

    // 1. Try Supabase Storage if configured
    if (this.supabaseService.isConfigured()) {
      const folder = ext.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/) ? 'audio' : 'images';
      const storagePath = `${folder}/${uniqueName}`;
      const bucket = env.supabaseStorageBucket;

      const result = await this.supabaseService.uploadToStorage(
        bucket,
        storagePath,
        file.buffer,
        file.mimetype,
      );

      if (result) {
        this.logger.log(`Uploaded ${uniqueName} to Supabase Storage bucket "${bucket}"`);
        return {
          url: result.url,
          filename: uniqueName,
          size: file.size,
          mimetype: file.mimetype,
        };
      }
    }

    // 2. Fallback to local disk storage
    const targetPath = path.join(this.uploadDir, uniqueName);
    fs.writeFileSync(targetPath, file.buffer);

    const baseUrl = env.apiUrl.replace(/\/+$/, '');
    return {
      url: `${baseUrl}/uploads/${uniqueName}`,
      filename: uniqueName,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
