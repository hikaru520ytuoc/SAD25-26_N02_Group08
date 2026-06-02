import { ApiPropertyOptional } from '@nestjs/swagger';
import { EligibilityStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class QueryStudentEligibilityDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  projectPeriodId?: string;

  @ApiPropertyOptional({ enum: EligibilityStatus })
  @IsOptional()
  @IsEnum(EligibilityStatus)
  eligibilityStatus?: EligibilityStatus;
}
