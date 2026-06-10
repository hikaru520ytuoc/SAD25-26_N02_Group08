import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class QueryCouncilScoreDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  defenseScheduleId?: string;
}
