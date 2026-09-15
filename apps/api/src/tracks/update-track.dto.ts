import { IsNumber, IsOptional, Matches, IsString, IsUrl, Min ,MinLength,} from 'class-validator';

export class UpdateTrackDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Matches(/\S/, {
  message: 'title cannot contain only whitespace',
  })
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @Matches(/\S/, {
  message: 'artist cannot contain only whitespace',
  })
  artist?: string;

  @IsOptional()
  @IsString()
  album?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @IsOptional()
  @IsUrl()
  audioUrl?: string;

  @IsOptional()
  @IsUrl()
  coverUrl?: string;

  @IsOptional()
  @IsString()
  genre?: string;
}