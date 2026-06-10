import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PublishResultDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
