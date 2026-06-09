import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateDefenseScheduleDto {
  @ApiProperty()
  @IsUUID()
  defenseRegistrationId!: string;

  @ApiProperty()
  @IsUUID()
  councilId!: string;

  @ApiProperty({ example: 'P.501' })
  @IsString()
  @MinLength(1)
  room!: string;

  @ApiProperty({ example: '2026-01-20' })
  @IsDateString()
  defenseDate!: string;

  @ApiProperty({ example: '2026-01-20T08:00:00.000Z' })
  @IsDateString()
  startTime!: string;

  @ApiProperty({ example: '2026-01-20T08:30:00.000Z' })
  @IsDateString()
  endTime!: string;
}
