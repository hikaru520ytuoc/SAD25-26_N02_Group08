import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AcademicStatus, InternshipStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateStudentProfileDto {
  @ApiProperty({ example: 'SV_ST1' })
  @IsNotEmpty({ message: 'Mã sinh viên không được để trống' })
  @IsString()
  studentCode: string;

  @ApiProperty({ example: 'KTPM01' })
  @IsNotEmpty({ message: 'Lớp không được để trống' })
  @IsString()
  className: string;

  @ApiProperty({ example: 'Software Engineering' })
  @IsNotEmpty({ message: 'Ngành không được để trống' })
  @IsString()
  major: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  facultyId?: string;

  @ApiProperty({ enum: InternshipStatus })
  @IsEnum(InternshipStatus)
  internshipStatus: InternshipStatus;

  @ApiProperty({ enum: AcademicStatus })
  @IsEnum(AcademicStatus)
  academicStatus: AcademicStatus;

  @ApiProperty({ example: '11111111-1111-4111-8111-111111111111' })
  @IsUUID('4')
  projectPeriodId: string;

  @ApiProperty({ example: 118 })
  @IsInt()
  @Min(0)
  completedCredits: number;

  @ApiProperty({ example: 110 })
  @IsInt()
  @Min(0)
  requiredCredits: number;

  @ApiProperty({ example: 2.8 })
  @IsNumber()
  @Min(0)
  @Max(4)
  gpa: number;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateUserDto {
  @ApiProperty({ example: 'new.user@example.com' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({ example: 'New User' })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'Password@123' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(8, { message: 'Mật khẩu phải có tối thiểu 8 ký tự' })
  password: string;

  @ApiPropertyOptional({ example: '0912345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ type: [String], description: 'Role IDs to assign to user' })
  @IsOptional()
  @IsArray({ message: 'Danh sách role không hợp lệ' })
  @IsUUID('4', { each: true, message: 'Role ID không hợp lệ' })
  roleIds?: string[];

  @ApiPropertyOptional({ type: CreateStudentProfileDto, description: 'Nhập thủ công hồ sơ học vụ khi tạo tài khoản sinh viên' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateStudentProfileDto)
  studentProfile?: CreateStudentProfileDto;
}
