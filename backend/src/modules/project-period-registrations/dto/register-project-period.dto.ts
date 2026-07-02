import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class RegisterProjectPeriodDto {
  @ApiProperty()
  @IsUUID('4', { message: 'Đợt đồ án không hợp lệ' })
  projectPeriodId!: string;
}
