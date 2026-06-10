import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArchiveRecordStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class QueryArchiveRecordDto {
  @ApiPropertyOptional({ enum: ArchiveRecordStatus })
  @IsOptional()
  @IsEnum(ArchiveRecordStatus)
  status?: ArchiveRecordStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectPeriodId?: string;
}
