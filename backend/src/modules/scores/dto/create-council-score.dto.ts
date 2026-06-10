import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateCouncilScoreDto {
  @ApiProperty()
  @IsUUID()
  defenseScheduleId!: string;

  @ApiProperty()
  @IsUUID()
  councilMemberId!: string;

  @ApiProperty({ minimum: 0, maximum: 10, example: 8.5 })
  @IsNumber()
  @Min(0)
  @Max(10)
  score!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}
