import { ApiPropertyOptional } from '@nestjs/swagger';
import { RevisionRequestStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class QueryRevisionDto {
  @ApiPropertyOptional({ enum: RevisionRequestStatus })
  @IsOptional()
  @IsEnum(RevisionRequestStatus)
  status?: RevisionRequestStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectPeriodId?: string;
}
