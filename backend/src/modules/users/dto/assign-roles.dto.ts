import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class AssignRolesDto {
  @ApiProperty({ type: [String], description: 'Role IDs to assign to user' })
  @IsArray({ message: 'roleIds phải là một danh sách' })
  @ArrayNotEmpty({ message: 'Cần chọn ít nhất một role' })
  @IsUUID('4', { each: true, message: 'Role ID không hợp lệ' })
  roleIds: string[];
}
