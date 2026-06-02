import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AcademicStatus, EligibilityStatus, InternshipStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateStudentEligibilityDto {
  @ApiProperty()
  @IsUUID('4')
  studentId: string;

  @ApiProperty()
  @IsUUID('4')
  projectPeriodId: string;

  @ApiProperty({ enum: InternshipStatus })
  @IsEnum(InternshipStatus)
  internshipStatus: InternshipStatus;

  @ApiPropertyOptional({ enum: AcademicStatus })
  @IsOptional()
  @IsEnum(AcademicStatus)
  academicStatus?: AcademicStatus;

  @ApiPropertyOptional({ enum: EligibilityStatus })
  @IsOptional()
  @IsEnum(EligibilityStatus)
  eligibilityStatus?: EligibilityStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
