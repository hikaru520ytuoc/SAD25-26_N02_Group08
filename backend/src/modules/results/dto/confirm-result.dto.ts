import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FinalResultStatus } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';

export class ConfirmResultDto {
  @ApiProperty({ enum: FinalResultStatus })
  @IsEnum(FinalResultStatus)
  resultStatus!: FinalResultStatus;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  revisionRequired?: boolean;

  @ApiPropertyOptional()
  @ValidateIf((o) => o.resultStatus === FinalResultStatus.PASSED_WITH_REVISION || o.revisionRequired === true)
  @IsString()
  revisionNote?: string;
}
