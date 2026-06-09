import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class ProposeNewTopicDto {
  @ApiProperty()
  @IsUUID('4')
  projectPeriodId!: string;

  @ApiProperty({ minLength: 5 })
  @IsString()
  @MinLength(5)
  proposedTitle!: string;

  @ApiProperty({ minLength: 10 })
  @IsString()
  @MinLength(10)
  proposedDescription!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  proposedObjectives?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  proposedExpectedOutput?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  proposedMajor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  requestedSupervisorId?: string;
}
