import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ApproveRevisionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  feedback?: string;
}
