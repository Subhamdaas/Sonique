import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePlaylistDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  coverUrl?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class UpdatePlaylistDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  coverUrl?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class AddPlaylistTrackDto {
  @IsString()
  @IsNotEmpty()
  trackId!: string;
}

export class TrackPositionDto {
  @IsString()
  @IsNotEmpty()
  trackId!: string;

  @IsInt()
  @Min(0)
  position!: number;
}

export class ReorderTracksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrackPositionDto)
  positions!: TrackPositionDto[];
}
