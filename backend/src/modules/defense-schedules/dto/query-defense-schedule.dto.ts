import { ApiPropertyOptional } from '@nestjs/swagger';
import { DefenseScheduleStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class QueryDefenseScheduleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectPeriodId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  councilId?: string;

  @ApiPropertyOptional({ enum: DefenseScheduleStatus })
  @IsOptional()
  @IsEnum(DefenseScheduleStatus)
  status?: DefenseScheduleStatus;
}
