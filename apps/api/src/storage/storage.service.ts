import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadFile {
  buffer: Buffer;
  originalname: string;
  size: number;
  mimetype: string;
}

@Injectable()
export class StorageService {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  saveFile(file: UploadFile): { url: string; filename: string; size: number; mimetype: string } {
    if (!file || !file.buffer) {
      throw new BadRequestException('No valid file buffer provided');
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.jpg', '.jpeg', '.png', '.webp'];

    if (!allowed.includes(ext)) {
      throw new BadRequestException(`File extension ${ext} not supported. Allowed: ${allowed.join(', ')}`);
    }

    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const targetPath = path.join(this.uploadDir, uniqueName);

    fs.writeFileSync(targetPath, file.buffer);

    return {
      url: `http://localhost:4000/uploads/${uniqueName}`,
      filename: uniqueName,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
