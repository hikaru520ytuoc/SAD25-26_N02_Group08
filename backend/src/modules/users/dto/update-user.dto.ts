import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

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
}
