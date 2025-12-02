import { IsBoolean, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class FeedbackDto {
  @IsOptional()
  @IsBoolean()
  isHelpful?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
