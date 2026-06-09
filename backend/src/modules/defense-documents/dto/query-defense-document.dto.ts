import { ApiPropertyOptional } from '@nestjs/swagger';
import { DefenseDocumentStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class QueryDefenseDocumentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectPeriodId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  councilId?: string;

  @ApiPropertyOptional({ enum: DefenseDocumentStatus })
  @IsOptional()
  @IsEnum(DefenseDocumentStatus)
  status?: DefenseDocumentStatus;
}
