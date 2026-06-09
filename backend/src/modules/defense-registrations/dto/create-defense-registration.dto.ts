import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDefenseRegistrationDto {
  @ApiProperty({ example: 'Xây dựng hệ thống quản lý đồ án tốt nghiệp' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Tóm tắt báo cáo và phạm vi bảo vệ' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ example: 'Ghi chú của sinh viên khi đăng ký bảo vệ' })
  @IsOptional()
  @IsString()
  studentNote?: string;

  @ApiProperty({ description: 'File báo cáo đã upload qua /api/files/upload' })
  @IsUUID('4')
  reportFileId!: string;

  @ApiPropertyOptional({ description: 'File slide đã upload qua /api/files/upload' })
  @IsOptional()
  @IsUUID('4')
  slideFileId?: string;

  @ApiPropertyOptional({ description: 'Tài liệu bổ sung đã upload qua /api/files/upload' })
  @IsOptional()
  @IsUUID('4')
  additionalDocumentFileId?: string;
}
