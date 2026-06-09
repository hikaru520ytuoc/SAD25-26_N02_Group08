import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RequestDefenseDocumentSupplementDto {
  @ApiProperty({ example: 'Thiếu bản slide cuối cùng, vui lòng bổ sung.' })
  @IsString()
  @MinLength(3)
  secretaryNote!: string;
}
