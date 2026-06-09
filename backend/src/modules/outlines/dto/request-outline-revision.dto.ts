import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequestOutlineRevisionDto {
  @ApiProperty({ example: 'Cần làm rõ phương pháp nghiên cứu và kế hoạch triển khai.' })
  @IsString()
  @IsNotEmpty()
  feedback!: string;
}
