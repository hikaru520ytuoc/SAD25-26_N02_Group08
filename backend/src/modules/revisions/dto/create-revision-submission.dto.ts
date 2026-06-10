import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRevisionSubmissionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  reportFileId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
