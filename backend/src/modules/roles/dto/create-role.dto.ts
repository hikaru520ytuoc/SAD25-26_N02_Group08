import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'ADMIN' })
  @IsNotEmpty({ message: 'Mã role không được để trống' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Administrator' })
  @IsNotEmpty({ message: 'Tên role không được để trống' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Quản trị hệ thống' })
  @IsOptional()
  @IsString()
  description?: string;
}
