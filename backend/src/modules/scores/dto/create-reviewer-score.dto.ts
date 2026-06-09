import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateReviewerScoreDto {
  @ApiProperty()
  @IsUUID('4')
  reviewerAssignmentId!: string;

  @ApiProperty({ example: 8, minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  score!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}
