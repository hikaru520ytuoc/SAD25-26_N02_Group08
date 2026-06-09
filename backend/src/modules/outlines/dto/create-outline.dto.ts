import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOutlineDto {
  @ApiProperty({ example: 'Đề cương hệ thống quản lý đồ án tốt nghiệp' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Mô tả tổng quan mục tiêu, phạm vi và phương pháp thực hiện đề tài.' })
  @IsString()
  @IsNotEmpty()
  summary!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  objectives?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  methodology?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expectedOutput?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timeline?: string;

  @ApiPropertyOptional({ description: 'ID metadata file đã upload bằng /api/files/upload' })
  @IsOptional()
  @IsUUID('4')
  fileDocumentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  submitNote?: string;
}
