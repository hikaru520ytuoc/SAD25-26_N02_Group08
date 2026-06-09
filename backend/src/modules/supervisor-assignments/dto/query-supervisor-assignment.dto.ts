import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class QuerySupervisorAssignmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  projectPeriodId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  supervisorId?: string;
}
