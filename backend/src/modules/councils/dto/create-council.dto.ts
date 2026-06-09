import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DefenseCouncilStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateCouncilDto {
  @ApiProperty({ example: 'Hội đồng bảo vệ đồ án tốt nghiệp số 01' })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty({ example: '11111111-1111-4111-8111-111111111111' })
  @IsUUID()
  projectPeriodId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  facultyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: DefenseCouncilStatus, default: DefenseCouncilStatus.DRAFT })
  @IsOptional()
  @IsEnum(DefenseCouncilStatus)
  status?: DefenseCouncilStatus;
}
