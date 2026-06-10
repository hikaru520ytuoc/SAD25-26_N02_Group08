import { ApiPropertyOptional } from '@nestjs/swagger';
import { FinalResultStatus, ResultPublicationStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class QueryResultDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectPeriodId?: string;

  @ApiPropertyOptional({ enum: FinalResultStatus })
  @IsOptional()
  @IsEnum(FinalResultStatus)
  resultStatus?: FinalResultStatus;

  @ApiPropertyOptional({ enum: ResultPublicationStatus })
  @IsOptional()
  @IsEnum(ResultPublicationStatus)
  publicationStatus?: ResultPublicationStatus;
}
