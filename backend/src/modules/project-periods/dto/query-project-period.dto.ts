import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectPeriodStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class QueryProjectPeriodDto {
  @ApiPropertyOptional({ enum: ProjectPeriodStatus })
  @IsOptional()
  @IsEnum(ProjectPeriodStatus)
  status?: ProjectPeriodStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
