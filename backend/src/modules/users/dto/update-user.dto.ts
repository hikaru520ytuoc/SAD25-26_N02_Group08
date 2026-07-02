import { ApiPropertyOptional } from '@nestjs/swagger';
import { AcademicStatus, InternshipStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class UpdateStudentProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  studentCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  className?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { message: 'Ngành học không hợp lệ' })
  majorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  facultyId?: string;

  @ApiPropertyOptional({ enum: InternshipStatus })
  @IsOptional()
  @IsEnum(InternshipStatus)
  internshipStatus?: InternshipStatus;

  @ApiPropertyOptional({ enum: AcademicStatus })
  @IsOptional()
  @IsEnum(AcademicStatus)
  academicStatus?: AcademicStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  accumulatedCredits?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  gpa?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasPrerequisiteDebt?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasTuitionDebt?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasDisciplinaryAction?: boolean;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'updated@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @ApiPropertyOptional({ example: 'Updated User' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'NewPassword@123', description: 'Để trống nếu không đổi mật khẩu' })
  @IsOptional()
  @MinLength(8, { message: 'Mật khẩu phải có tối thiểu 8 ký tự' })
  password?: string;

  @ApiPropertyOptional({ example: '0912345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ type: [String], description: 'Danh sách role được cập nhật trong màn hình sửa tài khoản' })
  @IsOptional()
  @IsArray({ message: 'Danh sách vai trò không hợp lệ' })
  @ArrayMinSize(1, { message: 'Tài khoản phải có ít nhất một vai trò' })
  @IsUUID('4', { each: true, message: 'Vai trò không hợp lệ' })
  roleIds?: string[];

  @ApiPropertyOptional({ type: UpdateStudentProfileDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateStudentProfileDto)
  studentProfile?: UpdateStudentProfileDto;
}
