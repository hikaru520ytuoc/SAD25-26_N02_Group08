import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DefenseSessionStatus } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDefenseSessionDto {
  @ApiProperty()
  @IsUUID()
  defenseScheduleId!: string;

  @ApiPropertyOptional({ enum: DefenseSessionStatus })
  @IsOptional()
  @IsEnum(DefenseSessionStatus)
  sessionStatus?: DefenseSessionStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  generalComment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  conclusion?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  revisionRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  revisionNote?: string;
}
