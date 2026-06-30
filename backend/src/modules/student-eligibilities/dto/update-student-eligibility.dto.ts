import { ApiPropertyOptional } from '@nestjs/swagger';
import { AcademicStatus, EligibilityStatus, InternshipStatus } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateStudentEligibilityDto {
  @ApiPropertyOptional({ enum: InternshipStatus })
  @IsOptional()
  @IsEnum(InternshipStatus)
  internshipStatus?: InternshipStatus;

  @ApiPropertyOptional({ enum: AcademicStatus })
  @IsOptional()
  @IsEnum(AcademicStatus)
  academicStatus?: AcademicStatus;

  @ApiPropertyOptional({ example: 118 })
  @IsOptional()
  @IsInt()
  @Min(0)
  completedCredits?: number;

  @ApiPropertyOptional({ example: 110 })
  @IsOptional()
  @IsInt()
  @Min(0)
  requiredCredits?: number;

  @ApiPropertyOptional({ example: 2.8 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  gpa?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  hasPrerequisiteDebt?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  hasTuitionDebt?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  hasDisciplinaryAction?: boolean;

  @ApiPropertyOptional({ enum: EligibilityStatus })
  @IsOptional()
  @IsEnum(EligibilityStatus)
  eligibilityStatus?: EligibilityStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
