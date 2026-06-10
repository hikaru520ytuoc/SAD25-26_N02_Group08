import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequestRevisionChangesDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  feedback!: string;
}
