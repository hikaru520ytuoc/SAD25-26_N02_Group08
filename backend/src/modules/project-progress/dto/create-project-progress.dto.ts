import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateProjectProgressDto {
  @ApiProperty({ example: 'Hoàn thành phân tích yêu cầu' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Đã hoàn thành đặc tả use case và luồng nghiệp vụ chính.' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progressPercent?: number;

  @ApiPropertyOptional({ description: 'ID metadata file đã upload bằng /api/files/upload' })
  @IsOptional()
  @IsUUID('4')
  fileDocumentId?: string;
}
