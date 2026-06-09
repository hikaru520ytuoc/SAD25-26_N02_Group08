import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class FacultyAssignSupervisorDto {
  @ApiProperty()
  @IsUUID('4')
  supervisorId!: string;
}
