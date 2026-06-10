import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ApproveArchiveRecordDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  archiveNote?: string;
}
