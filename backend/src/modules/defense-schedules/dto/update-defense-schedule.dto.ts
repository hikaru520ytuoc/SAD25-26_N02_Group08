import { ApiPropertyOptional } from '@nestjs/swagger';
import { DefenseScheduleStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class UpdateDefenseScheduleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  councilId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  room?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  defenseDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ enum: DefenseScheduleStatus })
  @IsOptional()
  @IsEnum(DefenseScheduleStatus)
  status?: DefenseScheduleStatus;
}
