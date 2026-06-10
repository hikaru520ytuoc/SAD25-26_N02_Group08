import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class GenerateResultDto {
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  revisionRequired?: boolean;
}
