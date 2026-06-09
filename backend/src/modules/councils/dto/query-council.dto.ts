import { ApiPropertyOptional } from '@nestjs/swagger';
import { DefenseCouncilStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class QueryCouncilDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectPeriodId?: string;

  @ApiPropertyOptional({ enum: DefenseCouncilStatus })
  @IsOptional()
  @IsEnum(DefenseCouncilStatus)
  status?: DefenseCouncilStatus;
}
