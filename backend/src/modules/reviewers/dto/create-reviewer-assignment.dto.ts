import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateReviewerAssignmentDto {
  @ApiProperty()
  @IsUUID('4')
  defenseRegistrationId!: string;

  @ApiProperty()
  @IsUUID('4')
  reviewerId!: string;
}
