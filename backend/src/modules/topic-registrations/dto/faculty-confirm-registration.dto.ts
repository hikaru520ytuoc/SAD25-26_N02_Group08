import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FacultyConfirmRegistrationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  facultyNote?: string;
}
