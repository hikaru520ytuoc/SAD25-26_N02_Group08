import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class SubmitDefenseDocumentDto {
  @ApiProperty()
  @IsUUID()
  reportFileId!: string;

  @ApiProperty()
  @IsUUID()
  slideFileId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  additionalFileId?: string;
}
