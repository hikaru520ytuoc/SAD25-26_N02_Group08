import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class RegisterExistingTopicDto {
  @ApiProperty()
  @IsUUID('4')
  topicId!: string;
}
