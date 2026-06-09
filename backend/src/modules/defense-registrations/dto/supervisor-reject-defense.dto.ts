import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SupervisorRejectDefenseDto {
  @ApiProperty({ example: 'Báo cáo cần bổ sung kết quả thực nghiệm và chỉnh sửa tài liệu' })
  @IsString()
  @IsNotEmpty()
  feedback!: string;
}
