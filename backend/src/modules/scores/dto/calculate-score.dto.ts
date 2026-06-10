import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class CalculateScoreDto {
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  revisionRequired?: boolean;
}
