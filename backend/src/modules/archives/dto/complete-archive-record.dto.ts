import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CompleteArchiveRecordDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  archiveNote?: string;
}
