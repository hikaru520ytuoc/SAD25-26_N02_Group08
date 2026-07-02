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
  @ApiProperty({ example: 'SV001' })
  @IsNotEmpty({ message: 'Mã sinh viên không được để trống' })
  @IsString()
  studentCode!: string;

  @ApiProperty({ example: 'KTPM01' })
  @IsNotEmpty({ message: 'Lớp không được để trống' })
  @IsString()
  className!: string;

  @ApiProperty({ description: 'ID ngành được seed sẵn trong cơ sở dữ liệu' })
  @IsUUID('4', { message: 'Ngành học không hợp lệ' })
  majorId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  facultyId?: string;

  @ApiProperty({ enum: InternshipStatus })
  @IsEnum(InternshipStatus)
  internshipStatus!: InternshipStatus;

  @ApiProperty({ enum: AcademicStatus })
  @IsEnum(AcademicStatus)
  academicStatus!: AcademicStatus;

  @ApiProperty({ example: 110, description: 'Tổng tín chỉ sinh viên đã tích lũy' })
  @IsInt()
  @Min(0)
  accumulatedCredits!: number;

  @ApiProperty({ example: 2.8 })
  @IsNumber()
  @Min(0)
  @Max(4)
  gpa!: number;

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
}

export class CreateUserDto {
  @ApiProperty({ example: 'new.user@example.com' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @ApiProperty({ example: 'New User' })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: 'Password@123' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(8, { message: 'Mật khẩu phải có tối thiểu 8 ký tự' })
  password!: string;

  @ApiPropertyOptional({ example: '0912345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ type: [String], description: 'Role IDs to assign to user' })
  @IsOptional()
  @IsArray({ message: 'Danh sách role không hợp lệ' })
  @IsUUID('4', { each: true, message: 'Role ID không hợp lệ' })
  roleIds?: string[];

  @ApiPropertyOptional({ type: CreateStudentProfileDto, description: 'Hồ sơ sinh viên và dữ liệu học vụ hiện tại; không gắn với đợt đồ án' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateStudentProfileDto)
  studentProfile?: CreateStudentProfileDto;
}
