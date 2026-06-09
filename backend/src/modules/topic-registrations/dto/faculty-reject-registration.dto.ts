import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class FacultyRejectRegistrationDto {
  @ApiProperty({ minLength: 3 })
  @IsString()
  @MinLength(3)
  rejectedReason!: string;
}
