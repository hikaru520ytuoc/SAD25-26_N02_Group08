import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewerEligibilityStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateReviewerEvaluationDto {
  @ApiProperty()
  @IsUUID('4')
  reviewerAssignmentId!: string;

  @ApiProperty({ example: 'Báo cáo có cấu trúc rõ ràng, đáp ứng yêu cầu phản biện.' })
  @IsString()
  @IsNotEmpty()
  comment!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  strengths?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  weaknesses?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  questionSuggestions?: string;

  @ApiProperty({ enum: ReviewerEligibilityStatus })
  @IsEnum(ReviewerEligibilityStatus)
  eligibilityStatus!: ReviewerEligibilityStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  feedbackToStudent?: string;

  @ApiPropertyOptional({ example: 8, minimum: 0, maximum: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  score?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scoreComment?: string;
}
