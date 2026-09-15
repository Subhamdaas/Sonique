import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class RecordPlaybackEventDto {
  @IsString()
  @IsNotEmpty()
  trackId!: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  durationPlayed?: number;
}
