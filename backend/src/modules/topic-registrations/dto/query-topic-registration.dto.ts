import { ApiPropertyOptional } from '@nestjs/swagger';
import { TopicRegistrationStatus, TopicRegistrationType } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class QueryTopicRegistrationDto {
  @ApiPropertyOptional({ enum: TopicRegistrationStatus })
  @IsOptional()
  @IsEnum(TopicRegistrationStatus)
  status?: TopicRegistrationStatus;

  @ApiPropertyOptional({ enum: TopicRegistrationType })
  @IsOptional()
  @IsEnum(TopicRegistrationType)
  registrationType?: TopicRegistrationType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  projectPeriodId?: string;
}
