import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateCouncilScoreDto {
  @ApiPropertyOptional({ minimum: 0, maximum: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  score?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}
