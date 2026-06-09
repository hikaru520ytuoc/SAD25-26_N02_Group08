import { PartialType } from '@nestjs/swagger';
import { CreateReviewerEvaluationDto } from './create-reviewer-evaluation.dto';

export class UpdateReviewerEvaluationDto extends PartialType(CreateReviewerEvaluationDto) {}
