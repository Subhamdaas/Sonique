import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateTrackDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  artist!: string;

  @IsOptional()
  @IsString()
  album?: string;

  @IsInt()
  @Min(1)
  duration!: number;

  @IsUrl()
  audioUrl!: string;

  @IsOptional()
  @IsUrl()
  coverUrl?: string;

  @IsOptional()
  @IsString()
  genre?: string;
}