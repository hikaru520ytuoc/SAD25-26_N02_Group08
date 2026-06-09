import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewerAssignmentStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class UpdateReviewerAssignmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  reviewerId?: string;

  @ApiPropertyOptional({ enum: ReviewerAssignmentStatus })
  @IsOptional()
  @IsEnum(ReviewerAssignmentStatus)
  status?: ReviewerAssignmentStatus;
}
