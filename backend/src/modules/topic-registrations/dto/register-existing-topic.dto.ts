import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class RegisterExistingTopicDto {
  @ApiProperty()
  @IsUUID('4')
  topicId!: string;

  @ApiProperty()
  @IsUUID('4')
  projectPeriodId!: string;
}
