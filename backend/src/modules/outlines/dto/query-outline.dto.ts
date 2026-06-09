import { ApiPropertyOptional } from '@nestjs/swagger';
import { OutlineStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class QueryOutlineDto {
  @ApiPropertyOptional({ enum: OutlineStatus })
  @IsOptional()
  @IsEnum(OutlineStatus)
  status?: OutlineStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  projectPeriodId?: string;
}
