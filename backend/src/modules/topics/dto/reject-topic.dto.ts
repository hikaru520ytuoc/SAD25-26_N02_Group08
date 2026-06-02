import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RejectTopicDto {
  @ApiProperty({ example: 'Đề tài cần làm rõ mục tiêu và đầu ra dự kiến' })
  @IsString()
  @IsNotEmpty()
  rejectionReason: string;
}
