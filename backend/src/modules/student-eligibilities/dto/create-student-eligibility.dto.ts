import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AcademicStatus, EligibilityStatus, InternshipStatus } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

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

  @ApiPropertyOptional({ example: 118, description: 'Số tín chỉ đã tích lũy, nhập thủ công khi xét điều kiện' })
  @IsOptional()
  @IsInt()
  @Min(0)
  completedCredits?: number;

  @ApiPropertyOptional({ example: 110, description: 'Số tín chỉ tối thiểu/yêu cầu để được làm đồ án' })
  @IsOptional()
  @IsInt()
  @Min(0)
  requiredCredits?: number;

  @ApiPropertyOptional({ example: 2.8, description: 'GPA/CPA của sinh viên, nhập thủ công' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  gpa?: number;

  @ApiPropertyOptional({ example: false, description: 'Sinh viên còn nợ môn tiên quyết hay không' })
  @IsOptional()
  @IsBoolean()
  hasPrerequisiteDebt?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Sinh viên còn nợ học phí hay không' })
  @IsOptional()
  @IsBoolean()
  hasTuitionDebt?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Sinh viên đang có tình trạng kỷ luật hay không' })
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
