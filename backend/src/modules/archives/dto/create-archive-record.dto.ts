import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateArchiveRecordDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  finalResultId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  finalReportFileId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  finalSlideFileId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  sourceCodeFileId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  additionalDocumentFileId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  archiveNote?: string;
}
