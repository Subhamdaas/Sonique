import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService, UploadFile } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
    })
  )
  uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('File is required in formData under key "file"');
    }
    return this.storageService.saveFile(file as UploadFile);
  }
}
