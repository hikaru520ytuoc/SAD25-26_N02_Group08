import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class ResubmitDefenseRegistrationDto {
  @ApiProperty({ example: 'Xây dựng hệ thống quản lý đồ án tốt nghiệp - bản cập nhật' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  studentNote?: string;

  @ApiProperty({ description: 'File báo cáo mới đã upload' })
  @IsUUID('4')
  reportFileId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  slideFileId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  additionalDocumentFileId?: string;
}
