import { ApiPropertyOptional } from '@nestjs/swagger';
import { FileDocumentType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class QueryFileDto {
  @ApiPropertyOptional({ enum: FileDocumentType })
  @IsOptional()
  @IsEnum(FileDocumentType)
  fileType?: FileDocumentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relatedType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relatedId?: string;
}
