import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum ProjectPeriodExtensionType {
  REGISTRATION = 'REGISTRATION',
  PERIOD = 'PERIOD',
  BOTH = 'BOTH',
}

export class ExtendProjectPeriodDto {
  @ApiProperty({ enum: ProjectPeriodExtensionType })
  @IsEnum(ProjectPeriodExtensionType)
  type: ProjectPeriodExtensionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  registrationEndDate?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  notifyUsers?: boolean = true;
}
