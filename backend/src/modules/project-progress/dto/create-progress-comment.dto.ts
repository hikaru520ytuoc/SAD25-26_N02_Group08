import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProgressCommentDto {
  @ApiProperty({ example: 'Cần bổ sung minh chứng cho phần kết quả thử nghiệm.' })
  @IsString()
  @IsNotEmpty()
  comment!: string;
}
