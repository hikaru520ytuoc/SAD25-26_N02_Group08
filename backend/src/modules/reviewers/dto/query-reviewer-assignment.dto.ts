import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewerAssignmentStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class QueryReviewerAssignmentDto {
  @ApiPropertyOptional({ enum: ReviewerAssignmentStatus })
  @IsOptional()
  @IsEnum(ReviewerAssignmentStatus)
  status?: ReviewerAssignmentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  projectPeriodId?: string;
}
