import { ApiPropertyOptional } from '@nestjs/swagger';
import { AcademicStatus, EligibilityStatus, InternshipStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateStudentEligibilityDto {
  @ApiPropertyOptional({ enum: InternshipStatus })
  @IsOptional()
  @IsEnum(InternshipStatus)
  internshipStatus?: InternshipStatus;

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
