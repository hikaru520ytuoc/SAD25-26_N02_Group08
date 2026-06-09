import { ApiPropertyOptional } from '@nestjs/swagger';
import { DefenseRegistrationStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class QueryDefenseRegistrationDto {
  @ApiPropertyOptional({ enum: DefenseRegistrationStatus })
  @IsOptional()
  @IsEnum(DefenseRegistrationStatus)
  status?: DefenseRegistrationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  projectPeriodId?: string;
}
