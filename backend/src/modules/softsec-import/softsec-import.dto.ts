import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export enum GradeImportKind {
  SUPERVISOR = 'SUPERVISOR',
  REVIEWER = 'REVIEWER',
  COUNCIL = 'COUNCIL',
}

export class PreviewGradesDto {
  @ApiProperty({ description: 'Raw CSV bytes encoded as base64 (up to 52 KiB)' })
  @IsString()
  csvBase64!: string;

  @ApiProperty({ enum: GradeImportKind })
  @IsEnum(GradeImportKind)
  kind!: GradeImportKind;

  @ApiPropertyOptional({ description: 'Explicit project_id alias to existing Topic UUID map. Never guessed.' })
  @IsOptional()
  @IsObject()
  projectMappings?: Record<string, string>;
}

export class ConfirmGradesDto extends PreviewGradesDto {
  @ApiProperty({ description: 'HMAC token returned by a successful preview (expires in 5 min)' })
  @IsString()
  @MaxLength(512)
  previewToken!: string;
}
