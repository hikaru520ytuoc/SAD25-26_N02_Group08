import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequestArchiveSupplementDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  supplementReason!: string;
}
