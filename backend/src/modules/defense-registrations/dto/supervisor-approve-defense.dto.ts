import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class SupervisorApproveDefenseDto {
  @ApiProperty({ example: 8.5, minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  score!: number;

  @ApiPropertyOptional({ example: 'Hồ sơ đáp ứng điều kiện bảo vệ' })
  @IsOptional()
  @IsString()
  comment?: string;
}
