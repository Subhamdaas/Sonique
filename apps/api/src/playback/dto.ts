import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RecordPlaybackEventDto {
  @IsString()
  @IsNotEmpty()
  trackId!: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  durationPlayed?: number;
}

export class UpdatePlaybackStateDto {
  @IsString()
  @IsOptional()
  trackId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  positionSeconds?: number;

  @IsOptional()
  queue?: any;

  @IsInt()
  @Min(0)
  @IsOptional()
  queueIndex?: number;

  @IsNumber()
  @IsOptional()
  volume?: number;

  @IsBoolean()
  @IsOptional()
  isMuted?: boolean;

  @IsBoolean()
  @IsOptional()
  shuffle?: boolean;

  @IsString()
  @IsOptional()
  repeatMode?: string;
}
