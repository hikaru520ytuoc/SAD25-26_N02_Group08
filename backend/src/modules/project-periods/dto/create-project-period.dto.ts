import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectPeriodDto {
  @ApiProperty({ example: 'Đợt đồ án tốt nghiệp học kỳ 1 năm 2025-2026' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '2025-2026' })
  @IsString()
  @IsNotEmpty()
  academicYear: string;

  @ApiProperty({ example: 'HK1' })
  @IsString()
  @IsNotEmpty()
  semester: string;

  @ApiProperty({ example: '2025-09-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-01-15' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: '2025-09-05' })
  @IsOptional()
  @IsDateString()
  registrationStartDate?: string;

  @ApiPropertyOptional({ example: '2025-09-30' })
  @IsOptional()
  @IsDateString()
  registrationEndDate?: string;
}
